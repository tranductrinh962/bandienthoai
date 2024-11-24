const express = require('express');
const router = express.Router();
const { checkLoggedIn, checkCreditCard } = require('../../middleware/auth');
const User = require('../../models/User');
const Order = require('../../models/Order');









//Đường dẫn hiển thị trang tài khoản người dùng
router.get('/account', checkLoggedIn, async (req, res) => {
  try {
    const userId = req.c
    const user = await User.findById(userId).populate({
      path: 'orders',
      options: {
        sort: { createdAt: -1 },
        limit: 2
      }
    });

    res.render('user/account', { currentUser: req.c, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/account/profile-info', checkLoggedIn, async (req, res) => {
  res.render('user/account-profile-info', { currentUser: req.c });

})











//Đường dẫn hiển thị trang địa chỉ giao hàng
router.get('/account/manage-address', checkLoggedIn, (req, res) => {
  let check = ''
  if (req.query.uai) {
    check = req.query.uai
  }
  res.render('user/account-manage-address', { currentUser: req.c, check });
})











//Đường dẫn hiển thị trang địa chỉ thanh toán 
router.get('/account/billing-address', checkLoggedIn, (req, res) => {
  res.render('user/account-billing-address', { currentUser: req.c });
})










//Đường dẫn hiển thị trang thay đổi mật khẩu 
router.get('/account/change-password', checkLoggedIn, (req, res) => {
  res.render('user/account-change-password', { currentUser: req.c });

})














//Đường dẫn hiển thị lịch sử đơn hàng
router.get('/account/order-history', checkLoggedIn, async (req, res) => {
  try {
    const userId = req.c
    const user = await User.findById(userId).populate('orders');
    res.render('user/account-order-history', { currentUser: req.c, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});








//Đường dẫn hiển thị chi tiết đơn hàng
router.get('/account/order-history/:orderid', checkLoggedIn, async (req, res) => {
  try {
    const { orderid } = req.params;
    const order = await Order.findOne({ orderID: orderid }).populate('user', 'firstName lastName username');

    if (!order) {
      return res.status(404).send('Order not found');
    }

    if (order.user._id.toString() !== req.c._id.toString()) {
      return res.status(403).send('Đơn hàng không tồn tại');
    }

    res.render('user/account-order-details', { currentUser: req.c, order });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});




//Đường dẫn in hóa đơn của đơn hàng đã chọn
router.get('/account/order-history/:orderid/invoice', checkLoggedIn, async (req, res) => {
  try {
    const { orderid } = req.params;
    const order = await Order.findOne({ orderID: orderid }).populate('user', 'firstName lastName username');

    if (!order) {
      return res.status(404).send('Order not found');
    }

    if (order.user._id.toString() !== req.c._id.toString()) {
      return res.status(403).send('Đơn hàng không tồn tại');
    }

    res.render('invoice', { currentUser: req.c, order });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});












//Đường dẫn hiển thị trang tạo hình thức thanh toán thẻ tín dụng
router.get('/account/create-payment-method', checkLoggedIn, checkCreditCard, (req, res) => {
  let check = ''
  if (req.query.uai) {
    check = req.query.uai
  }
  res.render('user/account-create-payment-method', { currentUser: req.c, check });
})










//Đường dẫn xác nhận xóa hình thức thanh toán thẻ tín dụng
router.post('/account/delete-payment-method', checkLoggedIn, async (req, res) => {
  try {
    const currentUser = req.c;
    if (!currentUser) {
      return res.status(401).send('Unauthorized');
    }

    currentUser.creditCard = null;

    await currentUser.save();

    res.redirect('/account/payment-methods');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});






//Đường dẫn hiển thị trang hình thức thanh toán thẻ tín dụng
router.get('/account/payment-methods', checkLoggedIn, (req, res) => {
  res.render('user/account-payment-methods', { currentUser: req.c });
})





//------------------------------------------------------------------------------------------------------------------------
module.exports = router; 
