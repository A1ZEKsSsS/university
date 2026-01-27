const nodemailer = require("nodemailer");
const templates = require("./templates")
const User = require("../../models/user");


const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SUPPORT_EMAIL,
        pass: process.env.SUPPORT_EMAIL_PASSWORD
    }
});

const sendMail = async (to, subject = "test", content) => {
    try {
        if (!to) {
            console.log("Email send error: No recipient email provided".red);
            return;
        }

        await mailer.sendMail({
            to,
            from: process.env.SUPPORT_EMAIL,
            subject,
            html: content,
        });

        console.log(`Email to ${to} - ${subject}`.blue);
    }
    catch (error) {
        console.log("Email send error".red, error);
    }
};


const sendVerifyMail = (to, code) => {
    const content = templates.verifyEmailTemplate.replace("{code}", code);
    return sendMail(to, "Welcome to Emissary!", content);
};

const sendWelcomeEmail = (to) => {
    const content = templates.welcomeEmailTemplate;
    return sendMail(to, "Welcome to Emissary!", content);
}

const sendAlreadyRegisteredEmail = (to, email, loginLink) => {
    let content = templates.alreadyRegisteredEmail.replace("{email}", email);
    content = content.replace("{loginLink}", loginLink);
    return sendMail(to, "Emissary - Account Already Registered", content);
}

const sendResetMail = (to, code) => {
    let content = templates.resetEmailTemplate.replace("{code}", code);
    return sendMail(to, "Emissary - Password Reset Request", content);
}

const sendSignInEmail = (to, code) => {
    let content = templates.loginEmailTemplate.replace("{code}", code);
    return sendMail(to, "Emissary - Sign In Code", content);
}

module.exports = {
    sendVerifyMail,
    sendWelcomeEmail,
    sendAlreadyRegisteredEmail,
    sendResetMail,
    sendSignInEmail,
};
