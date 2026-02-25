import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            // Decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded; // Will contain admin info
            next();
        } catch (error) {
            res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};
