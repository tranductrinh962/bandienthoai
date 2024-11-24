const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const User = require('../../models/User');
const { isAuthenticated, validateRegistration,validateResetPassword, registerLimiter,currentU } = require('../../middleware/auth');






//Đường dẫn hiển thị trang đăng nhập
router.get('/login', isAuthenticated, (req, res) => {
    const rememberedUsername = req.cookies.username || '';
    res.render('auth/login', { rememberedUsername, currentUser: req.session.user });


})



//Đường dẫn hiển thị trang khôi phục mật khẩu
router.get('/forget', currentU,(req, res) => {
    const rememberedUsername = req.cookies.username || '';
    res.render('auth/forgotPass', { rememberedUsername, currentUser: req.c });


})









// Đường dẫn hiển thị trang khôi phục mật khẩu
router.get('/reset/:token',currentU, async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
       return res.redirect('/')
    }

    res.render('auth/reset', { token: req.params.token,currentUser:req.c });
});





// Đường dẫn xác nhận khôi phục mật khẩu
router.post('/reset/:token', validateResetPassword,async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Khôi phục mật khẩu thất bại, hãy thử lại',success:false  });
    }

    const {password, passwordRepeat} = req.body
    if (password !== passwordRepeat){
        return res.status(400).json({ message: 'Mật khẩu không trùng nhau, hãy thử lại',success:false });
    }


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessage = errors.array().map(error => error.msg).join(', ');
        return res.status(400).json({ message: errorMessage ,success:false });
    }

    user.password = password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ message: 'Mật khẩu khôi phục thành công. Quay về trang đăng nhập trong 4 giây',success:true  });
});












//Đường dẫn xác nhận đăng xuất
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        currentUser = null
        res.redirect('/');
    });
});



//------------------------------------------------------------------------------------------------------------------------

//Đường dẫn hiển thị trang đăng kí
router.get('/register', isAuthenticated, (req, res) => {
    res.render('auth/register', { currentUser: req.session.user, alreadyExistUser: null, alreadyExistEmail: null })
})








//Đường dẫn xác nhận đăng kí tài khoản
router.post('/register', isAuthenticated, registerLimiter, validateRegistration, async (req, res) => {
    try {
        const { username, password, firstName, lastName, phoneNumber, email } = req.body;

        let alreadyExistUser = null
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            alreadyExistUser = `Tài khoản ${existingUser.username} đã tồn tại`;
        }


        let alreadyExistEmail = null
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            alreadyExistEmail = `Địa chỉ Email ${existingEmail.email} này đã tồn tại`;

        }
        const errors = validationResult(req);
        if (!errors.isEmpty() || existingEmail || existingUser) {

            return res.render('auth/register', { alreadyExistUser, alreadyExistEmail, errors: errors.array(), currentUser: req.session.user });
        }
        // Create new user
        const newUser = new User({ username, password, firstName, lastName, phoneNumber, email });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Error registering user:', error);

        res.status(500).send('Internal Server Error');

    }
});







module.exports = router; 
