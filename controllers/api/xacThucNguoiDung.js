const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { resetPassLimiter } = require('../../middleware/auth');








//Đường dẫn kiểm tra quá trình đăng nhập
router.post('/login', async (req, res) => {
    const { username, password, remember } = req.body;
    let user = await User.findOne({ username });
    if (!user) {
        user = await User.findOne({ email:username });
    }
    const usernameRegex = /^[a-zA-Z0-9@.]+$/;


    if (!usernameRegex.test(username)) {
        console.log(usernameRegex)
        return res.json({ success: false, error: 'Thông tin có chứa ký tự không hợp lệ' });
    }


    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.json({ success: false, error: 'Sai tài khoản hoặc mật khẩu' });
    }
    else if (!user.isActive) {
        return res.json({ success: false, error: 'Tài khoản này đã bị vô hiệu hóa' });
    }
    else {
        user.lastLoginDate = new Date();
        user.save();
        req.session.user = user;

        // Check if "Remember Username" was selected
        if (remember) {
            // Set a cookie with the username, set to expire in 30 days
            res.cookie('username', username, { maxAge: 30 * 24 * 60 * 60 * 1000 });
        } else {
            // Optionally clear the cookie if not selected
            res.clearCookie('username');
        }
        res.json({ success: true });
    }
});








//------------------------------------------------------------------------------------------------------------------------



router.post('/forgot', resetPassLimiter, async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: 'Người dùng này không tồn tại' });
    }

    const token = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 300000;

    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
            clientId: process.env.OAUTH_CLIENTID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN
        }
    });

    const mailOptions = {
        to: user.email,
        from: 'pteverest12@gmail.com',
        subject: 'Đây là mail test',
        text: `Bạn đã nhận được mail này vì đã yêu cầu khôi phục khẩu từ Evérest.\n\n` +
            `Hãy bấm vô link dưới để được khôi phục mật khẩu:\n\n` +
            `http://${req.headers.host}/reset/${token}\n\n` +
            `Nếu không phải là bạn yêu cầu, hãy kiểm tra và bảo mật lại tài khoản.\n`
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.error('Error occurred: ', err); // Log the full error object for debugging
            return res.status(500).json({ message: 'Error sending email', error: err.message });
        }
        res.json({ message: 'Hãy kiểm tra hòm thư mail để khôi phục mật khẩu' });
    });
});







module.exports = router; 
