const express = require('express');
const router = express.Router();
const Product = require('../../../models/product');
const Order = require('../../../models/Order');
const User = require('../../../models/User');
const {  isNotNormalUser } = require('../../../middleware/auth');





router.get('/settings/dashboard', isNotNormalUser, async (req, res) => {
  try {
    const products = await Product.find();
    res.render('admin/dashboard', { products, currentUser: req.session.user });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});







router.get('/settings/', isNotNormalUser, async (req, res) => {
  res.redirect(`/settings/dashboard`);
});

module.exports = router;


