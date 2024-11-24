const express = require('express');
const router = express.Router();
const Smartphone = require('../../../models/product.js');
const Brand = require('../../../models/Brand.js');
const { upload, processImage, multerErrorHandlingMiddleware } = require('../../../middleware/upload.js');
const {   isNotNormalUser, isAdmin } = require('../../../middleware/auth.js');
const path = require('path');







// Đường dẫn để lấy sản phẩm với phân trang, lọc, và tìm kiếm
router.post('/settings/products', isNotNormalUser, async (req, res) => {
  try {
    const { page = 1, limit = 8, dateSort = -1, search, brand, statusSort, saleSort, hotSort } = req.body;
    let query = {};
    const dateSortNumber = Number(dateSort)

    // Construct the query based on search and category parameters
    if (search) {
      query.name = { $regex: new RegExp(search, 'i') };
    }

    if (brand) {
      const brandDoc = await Brand.findOne({ brand });
      if (brandDoc) {
        query.productBrand = brandDoc._id;
      } else {
        query.productBrand = null;  
      }
    }

    if (saleSort) {
      if (saleSort === "1") {
        query.discount = { $gt: 0 }
      }
      else {
        query.discount = { $eq: 0 }
      }
    }


    if (hotSort) {
      if (hotSort === "1") {
        query.isHot = true
      }
      else {
        query.isHot = false
      }
    }


    if (statusSort) {
      if (statusSort === "2") {
        query.outOfStock = 'Còn hàng'
      }
      else if (statusSort === "1") {
        query.outOfStock = 'Thiếu hàng'
      }
      else if (statusSort === "0") {
        query.outOfStock = 'Hết hàng'
      }

    }



    const products = await Smartphone.find(query)
      .populate('productBrand', 'brand')
      .sort({ createdAt: dateSortNumber })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();


    const totalCount = await Smartphone.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});







//Đường dẫn xác nhận xóa sản phẩm
router.delete('/settings/product/:id', isAdmin, async (req, res) => {
  const productId = req.params.id;

  try {
    await Smartphone.findByIdAndDelete(productId);
    res.json({ success: true, message: 'Brand deleted successfully!' });
  } catch (error) {
    res.json({ success: false, message: 'Failed to delete brand.' });
  }
});






//Đường dẫn để xác minh và tạo sản phẩm
router.post('/settings/products/create', isAdmin, upload.single('image'), multerErrorHandlingMiddleware, async (req, res) => {
  try {

    const existingProduct = await Smartphone.findOne({ name: req.body.name });
    const selectedBrand = req.body.brand;

    const brand = await Brand.findById(selectedBrand);
    if (!brand) {
      return res.status(400).json({ success: false, message: 'Thương hiệu không tồn tại.' });
    }

    if (existingProduct) {
      return res.status(400).json({ success: false, message: 'Sản phẩm này đã tồn tại.' });
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      const { originalname, buffer, mimetype, size } = req.file;


      if (size > 5 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'Image size should not exceed 5MB.' });
      }

      if (!['image/jpeg', 'image/png'].includes(mimetype)) {
        return res.status(400).json({ success: false, message: 'Invalid file type. Only JPG and PNG are allowed.' });
      }


      const filename = Date.now() + path.extname(originalname);
      await processImage(buffer, filename);
      imageUrl = `${filename}`;
    }

    const newProduct = new Smartphone({
      ...req.body,
      productBrand: brand,
      image: imageUrl
    });

    await newProduct.save();
    res.status(200).json({ success: true, message: 'Tạo sản phẩm thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});












//thêm màu sản phẩm
router.post('/settings/products/add-color/:productID', isAdmin, async (req, res) => {
  const { productID } = req.params;
  const { color } = req.body;
  const { colorHex } = req.body;

  try {
    let smartphone = await Smartphone.findOne({ _id: productID });
    if (!smartphone) {
      return res.status(404).json({ error: 'Smartphone not found' });
    }

    const isColorExists = smartphone.colorVariants.some(variant => variant.color === color);
    if (isColorExists) {
      return res.json({ error: 'Màu này đã tồn tại.' });
    }

    const newSpecVariations = smartphone.colorVariants[0] ? smartphone.colorVariants[0].specVariations.map(spec => ({ ...spec, specID: undefined })) : [];
    smartphone.colorVariants.push({ color,colorHex, specVariations: newSpecVariations });
    smartphone.lastUpdated = new Date();
    await smartphone.save();
    res.json({ message: 'Color added successfully' });
  } catch (error) {
    console.error('Failed to add color:', error);
    res.status(500).json({ error: 'Server error' });
  }
});








// thêm cấu hình sản phẩm
router.post('/settings/products/addSpec/:productID', isAdmin, async (req, res) => {
  const { productID } = req.params;
  const { ram, storage } = req.body;
  const ramIn = parseInt(ram)
  const storageIn = parseInt(storage)
  try {


    let smartphone = await Smartphone.findOne({ _id: productID });
    if (!smartphone) {
      return res.status(404).json({ error: 'Smartphone not found' });
    }
    const isDuplicate = smartphone.colorVariants.some(variant =>
      variant.specVariations.some(spec => spec.ram === ramIn && spec.storage === storageIn)
    );

    if (isDuplicate) {

      return res.json({ error: 'Cấu hình này đã tồn tại.' });
    }

    smartphone.colorVariants.forEach(variant => {
      variant.specVariations.push({ ram, storage });
    });
    smartphone.lastUpdated = new Date();
    await smartphone.save();

    res.json({ message: 'Color added successfully' });
  } catch (error) {
    console.error('Failed to add spec:', error);
    res.status(500).json({ error: 'Server error' });
  }
});













module.exports = router;
