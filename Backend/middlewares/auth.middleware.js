const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blackListToken.model');


// ✅ USER AUTH MIDDLEWARE
module.exports.authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check blacklist
        const isBlacklisted = await blackListTokenModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ FIXED: use decoded.id
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;

        next();

    } catch (err) {
        console.error("AuthUser Error:", err.message);
        res.status(401).json({ message: 'Unauthorized' });
    }
};



// ✅ CAPTAIN AUTH MIDDLEWARE
module.exports.authCaptain = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check blacklist
        const isBlacklisted = await blackListTokenModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ FIXED: use decoded.id
        const captain = await captainModel.findById(decoded.id);

        if (!captain) {
            return res.status(401).json({ message: 'Captain not found' });
        }

        req.captain = captain;

        next();

    } catch (err) {
        console.error("AuthCaptain Error:", err.message);
        res.status(401).json({ message: 'Unauthorized' });
    }
};