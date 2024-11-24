const express = require('express');
const router = express.Router();
const { currentU,inboxLimiter} = require('../../middleware/auth');
const Inbox = require('../../models/Inbox');





//Hiển thị trang lien hệ, hỗ trợ
router.get('/contact-support', currentU, (req, res) => {
    res.render('user/support', { currentUser: req.c });

})




//Đường dẫn xác nhận gửi thư liên hệ, hỗ trợ
router.post('/contact-support',inboxLimiter, currentU, async (req, res) => {
    try {

        let { des, sub, name, email } = req.body;
        // Server-side validation
        const allowedChars = /^[\u00C0-\u024F\u1E00-\u1EFFa-zA-Z0-9\s.,()\-]+$/;

        if (!allowedChars.test(des)) {
            return res.status(400).json({
                message: 'Nội dung tin nhắn chứa kí tự không hợp lệ'
            });
        }

        if (!allowedChars.test(sub)) {
            return res.status(400).json({
                message: 'Tiêu đề tin nhắn chứa kí tự không hợp lệ'
            });
        }

        if (!des || !sub) {
            return res.status(400).json({
                message: 'Tiêu đề hoặc nội dung tin nhắn không được bỏ trống'
            });
        }

        const newInbox = new Inbox({ email, user: name, des, sub });
        await newInbox.save();
        res.render('user/support-success', { currentUser: req.c });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi' });
    }
});



module.exports = router; 