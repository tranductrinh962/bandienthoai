const express = require('express');
const router = express.Router();
const Smartphone = require('../../../models/product.js');
const Brand = require('../../../models/Brand.js');
const { isNotNormalUser, isAdmin } = require('../../../middleware/auth.js');




//Đường dẫn để lấy thông tin thương hiệu
router.post('/settings/listbrands', isNotNormalUser, async (req, res) => {
    try {
        const { page = 1, limit = 8, search, } = req.body;
        let query = {};


        if (search) {
            query.brand = { $regex: new RegExp(search, 'i') };
        }


        const brands = await Brand.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const totalCount = await Brand.countDocuments(query);

        res.json({
            brands,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});








//Đường dẫn để lấy thông tin thương hiệu
router.post('/settings/brands', isNotNormalUser, async (req, res) => {
    try {
        const brands = await Brand.find()
        res.json(brands);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});








//xác nhận dữ liệu tạo thương hiệu
router.post('/settings/createbrand', async (req, res) => {
    try {
        const { brand } = req.body;


        const existingBrand = await Brand.findOne({ brand });
        if (existingBrand) {
            return res.status(400).json({ success: false, message: `Thương hiệu ${brand} đã tồn tại` });
        }

        // Create a new brand
        const newBrand = new Brand({ brand });
        await newBrand.save();

        res.status(200).json({ success: true, message: 'Thêm thương hiệu thành công' });
    } catch (error) {
        console.error('Error creating brand:', error);

        if (error.code === 11000) {

            res.status(400).json({ success: false, message: 'Brand name must be unique.' });
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
});





router.post('/brands', isNotNormalUser, async (req, res) => {
    try {
        const brands = await Brand.find();
        res.json(brands);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching brands' });
    }
});









//Đường dẫn xóa thương hiệu
router.delete('/settings/brand/:id', isAdmin, async (req, res) => {
    const brandId = req.params.id;

    try {
        // Check if there are any products associated with this brand
        const productsWithBrand = await Smartphone.countDocuments({ productBrand: brandId });

        if (productsWithBrand > 0) {
            return res.json({
                success: false,
                message: `Xóa thất bại. Có ${productsWithBrand} sản phẩm đang được liên kết tới thương hiệu này.`,
            });
        }

        // If no products are found, proceed with deleting the brand
        const deletedBrand = await Brand.findByIdAndDelete(brandId);

        if (!deletedBrand) {
            return res.json({
                success: false,
                message: 'Thương hiệu không tồn tại',
            });
        }

        res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});






// Đường dẫn để lấy dữ liệu thương hiệu, chuyền vào input
router.post('/settings/brandinfo',isNotNormalUser, async (req, res) => {
    try {
      const brand = await Brand.findOne({ _id: req.body.id })
      if (!brand) {
        return res.status(404).send('Brand not found');
      }
  
      res.json(brand);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });








  //Đường dẫn để cập nhật tên thường hiệu
router.post('/settings/brandinfo/:brandId/',isAdmin,async (req, res) => {
    try {
      const { brandId } = req.params;
      const { Brandname } = req.body;
  
      // Check if the brand name already exists for another brand
      const existingBrand = await Brand.findOne({ brand: Brandname, _id: { $ne: brandId } });
      if (existingBrand) {
        return res.json({ success: false, error: 'Thương hiệu đã tồn tại' });
      }
  
      const getBrand = await Brand.findOne({ _id: brandId });
      if (!getBrand) {
        return res.json({ success: false });
      }
  
      getBrand.brand = Brandname;
      const updatedBrand = await getBrand.save();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });





  module.exports = router;







