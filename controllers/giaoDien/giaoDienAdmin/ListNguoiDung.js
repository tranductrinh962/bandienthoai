const express = require('express');
const router = express.Router();
const { isAdmin } = require('../../../middleware/auth');
const User = require('../../../models/User');






// Đường dẫn hiển thị thông tin người dùng để chỉnh sửa
router.get('/settings/users/:userId/edit', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.redirect('/settings')
    }
    res.render('admin/user/edit-user', { user, currentUser: req.session.user, error: null });
  } catch (error) {
    res.status(500).send('Server error');
  }
});






//Đường dẫn để xá nhận chỉnh sửa info người dùng
router.post('/settings/users/:userId/edit', isAdmin, async (req, res) => {
  const { role,isActive } = req.body;
  const {userId} = req.params

  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { role,   isActive }, { new: true });
    res.redirect(`/settings/users/${userId}/edit`);
  } catch (error) {
    res.status(500).send('Server error');
  }
});



module.exports = router; 
