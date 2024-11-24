const express = require('express');
const router = express.Router();
const { checkLoggedIn, validateProfileInfo, validateAddressInfo, validatePaymentMethod, registerLimiter, checkCreditCard } = require('../../middleware/auth');
const User = require('../../models/User');
const Order = require('../../models/Order');
const bcrypt = require('bcryptjs');









//Đường dẫn xác nhận cập nhật thông tin người dùng
router.post('/account/profile-info', checkLoggedIn, validateProfileInfo, async (req, res) => {
  try {
    const { firstName, lastName, birthDate, gender, phoneNumber } = req.body;
    const currentUser = await User.findById(req.c);

    currentUser.firstName = firstName;
    currentUser.lastName = lastName;
    currentUser.birthDate = birthDate;
    currentUser.gender = gender;
    currentUser.phoneNumber = phoneNumber;

    await currentUser.save();

    res.json({ success: "true" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Lỗi khi cập nhật dữ liệu' });
  }
});











//Đường dẫn xác nhận cập nhật địa chỉ giao hàng
router.post('/account/manage-address', checkLoggedIn, validateAddressInfo, async (req, res) => {


  try {
    const {
      fullName,
      phoneNumber,
      country,
      city,
      district,
      address
    } = req.body;

    const currentUser = await User.findById(req.c);

    currentUser.shippingAddress = {
      fullName,
      phoneNumber,
      country,
      city,
      district,
      address
    };

    await currentUser.save();

    let redic = ''
    if (req.query.uai === "t") {
      redic = req.query.uai
    }

    res.json({ success: "true", redic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Lỗi khi cập nhật dữ liệu' });
  }
});











//Đường dẫn xác nhận cập nhật địa chỉ thanh toán 
router.post('/account/billing-address', checkLoggedIn, validateAddressInfo, async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      country,
      city,
      district,
      address
    } = req.body;

    const currentUser = await User.findById(req.c);

    currentUser.billingAddress = {
      fullName,
      phoneNumber,
      country,
      city,
      district,
      address,
    };

    await currentUser.save();

    res.json({ success: "true" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Lỗi khi cập nhật dữ liệu' });
  }
});










//Đường dẫn xác nhận cập nhật mật khẩu 
router.post('/account/change-password', checkLoggedIn, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.c;

    const user = await User.findById(userId);
    // Check if the current password is correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
    }
    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Mật khẩu mới và nhập lại mật khẩu phải giống nhau' });
    }
    // Update the user's password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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





//Đường dẫn xác nhận thêm hình thức thanh toán thẻ tín dụng
router.post('/account/create-payment-method/', checkLoggedIn, validatePaymentMethod, checkCreditCard, async (req, res) => {
  try {
    let { cardNumber, cardholder, expirationDate } = req.body;
    const currentUser = req.c;

    if (!currentUser) {
      return res.status(401).send('Unauthorized');
    }

    // Remove any non-digit characters from the expiration date
    const cleanedExpirationDate = expirationDate.replace(/\D/g, '');

    // Split the cleaned expiration date into month and year
    const expirationMonth = parseInt(cleanedExpirationDate.slice(0, 2));
    const expirationYear = parseInt(cleanedExpirationDate.slice(2)) + 2000;

    let lastFourDigits;

    // Remove any non-digit characters from the card number
    const cleanedCardNumber = cardNumber.replace(/\D/g, '');

    // Extract the last four digits, or the full number if it's shorter than four digits
    if (cleanedCardNumber.length >= 4) {
      lastFourDigits = parseInt(cleanedCardNumber.slice(-4));
    } else {
      lastFourDigits = parseInt(cleanedCardNumber);
    }

    currentUser.creditCard = {
      cardNumber: lastFourDigits,
      cardholder,
      expirationMonth,
      expirationYear,
    };
    let redic = ''
    if (req.query.uai === "t") {
      redic = req.query.uai
    }

    await currentUser.save();
    res.json({ success: "true", redic });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Lỗi khi cập nhật dữ liệu' });
  }
});








//------------------------------------------------------------------------------------------------------------------------
module.exports = router; 
