const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide both email and password' });
        }

        const admin = await User.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (admin.role !== 'admin' && admin.isAdmin !== true) {
            return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
        }

        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const payload = {
            id: admin._id,
            type: 'admin',
            role: admin.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_super_secret_key',
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: 'Admin login successful',
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Error in adminLogin:', error);
        return res.status(500).json({ error: 'Internal server error during login' });
    }
};

module.exports = {
    adminLogin
};