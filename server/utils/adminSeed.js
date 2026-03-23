import bcrypt from 'bcrypt';
import User from "../models/user.js";

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('✅ Admin already exists. Skipping seed.');
            return;
        }

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            console.warn('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env!');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            email: email,
            password: hashedPassword,
            role: 'admin',

        });

        console.log('🚀 Admin successfully created from .env data!');
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    }
};

export default seedAdmin;