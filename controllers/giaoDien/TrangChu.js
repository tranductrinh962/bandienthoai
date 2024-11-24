const express = require('express');
const router = express.Router()
const Product = require('../../models/product');
const Brand = require('../../models/Brand');
const { currentU } = require('../../middleware/auth');




router.get('/', currentU, async (req, res) => {
  try {
    // Fetch the brand documents for each brand name
    const samsungBrand = await Brand.findOne({ brand: 'Samsung' });
    const vivoBrand = await Brand.findOne({ brand: 'Vivo' });
    const iphoneBrand = await Brand.findOne({ brand: 'iPhone' });
    const xiaomiBrand = await Brand.findOne({ brand: 'Xiaomi' });
    let s = ''
    let i = ''
    let u = ''
    let i14 = ''
    let i15 = ''

    const s24 = await Product.findOne({ name: 'Samsung Galaxy S24 Ultra 5G' });
    const ultra14 = await Product.findOne({ name: 'Xiaomi 14 Ultra 5G' });
    const ip15 = await Product.findOne({ name: 'iPhone 15' });
    const ip14 = await Product.findOne({ name: 'iPhone 14 Pro Max' });
    const ip15pro = await Product.findOne({ name: 'iPhone 15 Pro' });
    if (s24) {
      s = s24._id
    }
    if (ultra14) {
      u = ultra14._id
    }
    if (ip15) {
      i = ip15._id
    }
    if (ip14) {
      i14 = ip14._id
    }
    if (ip15pro) {
      i15 = ip15pro._id
    }

    // Initialize empty arrays for products
    let samsung = [];
    let vivo = [];
    let iphone = [];
    let xiaomi = [];

    // Fetch the products using the brand IDs if the brands are found
    if (samsungBrand) {
      samsung = await Product.find({ productBrand: samsungBrand._id, outOfStock: { $ne: "Hết hàng" } }).sort({ customersPurchased: -1 }).limit(3);
    }
    if (vivoBrand) {
      vivo = await Product.find({ productBrand: vivoBrand._id, outOfStock: { $ne: "Hết hàng" } }).sort({ customersPurchased: -1 }).limit(3);
    }
    if (iphoneBrand) {
      iphone = await Product.find({ productBrand: iphoneBrand._id, outOfStock: { $ne: "Hết hàng" } }).sort({ customersPurchased: -1 }).limit(3);
    }
    if (xiaomiBrand) {
      xiaomi = await Product.find({ productBrand: xiaomiBrand._id, outOfStock: { $ne: "Hết hàng" } }).sort({ customersPurchased: -1 }).limit(3);
    }

    // Fetch and limit the newest products
    const newestProducts = await Product.find({
      outOfStock: { $ne: "Hết hàng" }
    }).sort({ releaseDate: -1 }).limit(4);

    const randomProducts = await Product.aggregate([
      { $match: { outOfStock: { $ne: "Hết hàng" } } },
      { $sample: { size: 8 } }
    ]);

    res.render('main', {
      currentUser: req.c,
      samsung,
      vivo,
      iphone,
      xiaomi,
      newestProducts,
      randomProducts, s24: s, ultra14: u, ip15: i, i14, i15
    });
  } catch (error) {
    res.status(500).send('Error fetching products: ' + error.message);
  }
});



module.exports = router;
