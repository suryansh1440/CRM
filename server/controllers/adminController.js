import generateToken from '../utils/generateToken.js';

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
export const authAdmin = async (req, res) => {
    const { email, password } = req.body;

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@crm.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        generateToken(res, 'admin');

        res.status(200).json({
            success: true,
            message: 'Logged in successfully'
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
};

// @desc    Logout admin / clear cookie
// @route   POST /api/admin/logout
// @access  Public
export const logoutAdmin = async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Check auth status
// @route   GET /api/admin/check
// @access  Private
export const checkAuth = async (req, res) => {
    res.status(200).json({ success: true, message: 'Authenticated' });
};
