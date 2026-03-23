import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { capitalize } from "../utils/helpers.js";
import User from "../models/user.js";
import Graph from "../models/graph.js";
import {
    sendVerifyMail,
    sendWelcomeEmail,
    sendAlreadyRegisteredEmail,
    sendResetMail,
    sendSignInEmail,
} from "../services/mailer/index.js";
import Cache from "../services/cache.js";

const generateToken = (user, type) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            type,
        },
        process.env.JWT_SECRET
    );
};

const generateCode = () => {
    return Math.random().toString(10).substring(2, 8);
};

const signIn = async (req, res) => {
    const { type } = req.params;
    const { email, password } = req.body;

    let user;

    user = await User.findOne({ email }, "+password").lean();


    if (!user) {
        return res.status(400).send({ error: `${capitalize(type)} not found` });
    }

    if (!user.password) {
        return res
            .status(400)
            .send({ error: "Auth is allowed only through Google for you" });
    }

    const isValidPass = await bcrypt.compare(password, user.password);
    if (!isValidPass) {
        return res.status(400).send({ error: "Invalid password" });
    }

    const token = generateToken(user, type);

    res.send({
        token,
    });
};



const signInEmailCode = async (req, res) => {
    const { email } = req.body;
    const type = req.params.type;

    const user = await User.findOne({ email }).lean();

    if (!user) {
        return res.status(400).send({ error: `${capitalize(type)} not found` });
    }


    const code = generateCode();
    Cache.set(`email-${email}`, code, 1800);
    await sendSignInEmail(email, code);

    res.send({ message: "Verification code sent!" });
}

const confirmSignInEmail = async (req, res) => {
    const { email, code } = req.body;

    const saved = Cache.get(`email-${email}`);

    const codeString = Array.isArray(code) ? code.join('') : code;

    if (saved && codeString === saved) {
        Cache.del(`email-${email}`);
        const user = await User.findOne({ email }).lean();

        if (!user) {
            return res.status(400).send({ error: "User not found" });
        }

        const token = generateToken(user, type);

        res.send({
            token,
        });
    } else {
        res.status(403).send({ error: "Code is expired (30min) or invalid" });
    }
}

const signUpVerifySend = async (req, res) => {
    const email = req.body.email;

    const code = generateCode();
    Cache.set(`email-${email}`, code, 1800);
    await sendVerifyMail(email, code);

    res.send({ message: "Verification code sent!" });
};

const signUpVerifyEnter = async (req, res) => {
    const email = req.body.email;
    const code = req.body.code;

    const saved = Cache.get(`email-${email}`);

    if (saved && code === saved) {
        Cache.del(`email-${email}`);
        res.send({ message: "Verified" });
    } else {
        res.status(403).send({ error: "Code is expired (30min) or invalid" });
    }
};

const signUp = async (req, res) => {
    const { type } = req.params;
    const { email, password } =
        req.body;

    const user_exists = await User.exists({ email });

    if (user_exists) {
        return res.status(200).send({
            message: "Registration initiated. Please check your email."
        });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt)

    const data = {
        email,
        password: password_hash,
    };

    const user = await User.create(data);

    const token = generateToken(user, type);
    res.send({ token });
};


const signUpValidate = async (req, res) => {
    const { type } = req.params;
    const { email } = req.body;

    const user_exists = await User.exists({ email });

    if (user_exists) {
        await sendAlreadyRegisteredEmail(email);
        return res.send({ valid: true });
    }

    const code = generateCode();
    Cache.set(`email-${email}`, code, 1800);

    await sendWelcomeEmail(email, code);

    res.send({ valid: true });
};

const resetPasswordStart = async (req, res) => {
    const { type } = req.params;
    const { email } = req.body;

    const user = await User.findOne({ email }, "+email +password");
    if (!user) {
        return res.status(404).send({ error: `${capitalize(type)} not found` });
    }


    if (user && !user.password) {

        return res
            .status(403)
            .send({ error: "Your account is linked to Google Auth" });
    }

    const code = generateCode();
    Cache.set(`reset-${email}`, { code, type }, 1800);

    await sendResetMail(email, code);

    res.send({ message: "Password reset email sended" });
};

const resetPasswordConfirm = async (req, res) => {
    const { email, code, password } = req.body;
    const saved = Cache.get(`reset-${email}`);

    if (!saved) {
        return res
            .status(426)
            .send({ error: "Verification code is expired. Try again" });
    }

    if (saved.code != code) {

        return res
            .status(422)
            .send({ error: "Verification code is invalid. Try again" });
    }

    const user = await User.findOne({ email }, "email password");

    if (!user) {

        return res.status(404).send({ error: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    user.password = hash;

    await user.save();

    Cache.del(`reset-${email}`);

    res.send({ message: "Password successfully reset" });
};

const ensureAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user?.id).select('role').lean();
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: admin only' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'name email phone role').sort({ email: 1 }).lean();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const toDelete = await User.findById(userId);

        if (!toDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.user?.id === userId) {
            return res.status(400).json({ message: 'Cannot delete self' });
        }

        await Graph.deleteMany({ user: userId });
        await User.deleteOne({ _id: userId });

        res.status(200).json({ message: 'User and linked graphs deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const userInfo = async (req, res) => {
    const { id, type } = req.user;

    const user = await User.findOne(
        { _id: id },
        "name email"
    ).lean();

    if (!user) {
        return res.status(401).send({ error: "User not found" });
    }

    const response = {
        ...user,
        type,
    };
    res.send(response);
};

export default {
    signIn,
    signInEmailCode,
    confirmSignInEmail,
    signUpVerifySend,
    signUpVerifyEnter,
    signUp,
    signUpValidate,
    resetPasswordStart,
    resetPasswordConfirm,
    getUsers,
    deleteUser,
    ensureAdmin,
    userInfo,
};