
const express = require('express');
const router = express.Router();
const Product = require('../../models/product');












//Lấy dữ liệu màu
router.get('/products/:productID/colors', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.productID });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const colors = product.colorVariants.map(variant => variant.color);
    res.json({ colors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});







//Lấy thông tin cấu hình từ màu được chọn
router.get('/products/:productID/:color', async (req, res) => {
  try {

    const product = await Product.findOne({ _id: req.params.productID });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const colorVariant = product.colorVariants.find(variant => variant.color === req.params.color);
    if (!colorVariant) {
      return res.status(404).json({ error: 'Color not found' });
    }


    res.json({ specs: colorVariant.specVariations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});








//Đường dẫn để lấy giá theo cấu hình
router.get('/products/:productID/:color/:specID', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.productID });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });

    }

    const colorVariant = product.colorVariants.find(variant => variant.color === req.params.color);
    if (!colorVariant) {
      return res.status(404).json({ error: 'Color not found' });
    }

    const specVariation = colorVariant.specVariations.find(spec => spec.specID === req.params.specID);

    if (!specVariation) {
      return res.status(404).json({ error: 'Spec not found' });
    }
    res.json({ price: specVariation.price, ram: specVariation.ram, storage: specVariation.storage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;