const express = require('express');
const router = express.Router();
const Smartphone = require('../../../models/product.js');
const Brand = require('../../../models/Brand.js');
const Order = require('../../../models/Order.js');
const { upload, processImage, multerErrorHandlingMiddleware } = require('../../../middleware/upload.js');
const { isNVKH, isAdmin, currentU,isNVBH } = require('../../../middleware/auth.js');
const path = require('path');
const fs = require('fs');






//Đường dẫn hiện hóa đơn
router.get('/invoice/:orderid', currentU,isNVBH, async (req, res) => {
  try {
    const { orderid } = req.params;
    const order = await Order.findOne({ orderID: orderid }).populate('user', 'firstName lastName username');

    if (!order) {
      return res.status(404).send('Order not found');
    }


    res.render('invoice-admin', { currentUser: req.c, order });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});





//Đường dẫn hiện chi tiết sản phẩm
router.get('/settings/products/:productID', isNVKH, currentU, async (req, res) => {
  const { productID } = req.params;
  const product = await Smartphone.findOne({ _id: productID }).populate('productBrand', 'brand');
  if (!product) {
    return res.status(404).send('Product not found');
  }
  const colorCount = product.colorVariants.length;
  const firstColorVariants = product.colorVariants[0];
  const specVariationsCount = firstColorVariants.specVariations.length;

  res.render('admin/product/details', { specVariationsCount, product, colorCount, currentUser: req.c });
});













//Xác nhận chọn Sale cho sản phẩm
router.post('/settings/products/sale/:productID', isAdmin, async (req, res) => {
  const { productID } = req.params;
  const { sale, isHot } = req.body;


  try {
    let smartphone = await Smartphone.findOne({ _id: productID });
    if (!smartphone) {
      return res.status(404).json({ error: 'Smartphone not found' });
    }

    // Update the discount field
    if (sale && (sale >= 0 || sale <= 100)) {
      smartphone.discount = sale;
    }

    smartphone.isHot = isHot
    smartphone.lastUpdated = new Date();

    await smartphone.save();

    res.redirect(`/settings/products/${productID}`);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while applying the discount', details: error.message });
  }
});











//xóa màu sản phẩm
router.post('/settings/products/delete-color/:productId/:color', isAdmin, async (req, res) => {
  const { color, productId } = req.params;
  try {
    const smartphone = await Smartphone.findById(productId);

    if (!smartphone) {
      return res.status(404).send('Smartphone not found.');
    }

    const colorIndex = smartphone.colorVariants.findIndex(variant => variant.color === color);

    if (colorIndex === -1) {
      return res.status(404).send('Color not found in smartphone.');
    }
    smartphone.colorVariants.splice(colorIndex, 1);
    smartphone.lastUpdated = new Date();

    await smartphone.save();

    res.redirect(`/settings/products/${productId}`);

  } catch (error) {
    res.status(500).send(error.message);
  }
});










//xóa cấu hình sản phẩm
router.post('/settings/products/delete-spec/:productId/:ram/:storage', isAdmin, async (req, res) => {
  const { ram, storage, productId } = req.params;
  const ramIn = parseInt(ram)
  const storageIn = parseInt(storage)
  try {
    const smartphone = await Smartphone.findOne({ _id: productId });

    if (!smartphone) {
      return res.status(404).send('Smartphone not found.');
    }



    smartphone.colorVariants.forEach(colorVariant => {
      const index = colorVariant.specVariations.findIndex(spec => spec.ram === ramIn && spec.storage === storageIn);
      if (index !== -1) {
        colorVariant.specVariations.splice(index, 1);
      }
    });
    smartphone.lastUpdated = new Date();

    await smartphone.save();

    res.redirect(`/settings/products/${productId}`);

  } catch (error) {
    res.status(500).send(error.message);
  }
});








// sửa cấu hình sản phẩm
router.post('/settings/products/update-spec/:productId/:ram/:storage', isAdmin, async (req, res) => {
  const { ram, storage, productId } = req.params;
  const { nRam, nStorage } = req.body;
  const parsedRam = parseInt(nRam);
  const parsedStorage = parseInt(nStorage);

  if (parseInt(ram) === parsedRam && parseInt(storage) === parsedStorage) {
    return res.redirect(`/settings/products/${productId}`);
  }
  try {
    const smartphone = await Smartphone.findOne({ _id: productId });

    if (!smartphone) {
      return res.status(404).send('Smartphone not found.');
    }


    const isDuplicate = smartphone.colorVariants.some(variant =>
      variant.specVariations.some(spec => spec.ram === parsedRam && spec.storage === parsedStorage)
    );

    if (isDuplicate) {

      return res.json({ error: 'Cấu hình này đã tồn tại.' });
    }


    smartphone.colorVariants.forEach(colorVariant => {
      const spec = colorVariant.specVariations.find(spec => spec.ram === parseInt(ram) && spec.storage === parseInt(storage));
      if (spec) {
        spec.ram = parseInt(nRam);
        spec.storage = parseInt(nStorage);
      }
    });
    smartphone.lastUpdated = new Date();
    await smartphone.save();

    res.redirect(`/settings/products/${productId}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
}
);







// sửa sl giá sản phẩm
router.post('/settings/products/update-priceStock/:productId/:specID', isNVKH, currentU, async (req, res) => {
  const { productId, specID } = req.params;
  const { nprice, nstock } = req.body;

  try {
    const smartphone = await Smartphone.findOne({ _id: productId });
    if (!smartphone) {
      return res.status(404).send({ message: 'Smartphone not found' });
    }
    let isUpdated = false;

    smartphone.colorVariants.forEach((variant) => {
      variant.specVariations.forEach((spec) => {
        if (spec.specID === specID) {
          spec.stock = parseInt(nstock);

          if (req.c.role === "Admin") {
            if (spec.defaultPrice) {
              spec.defaultPrice = parseInt(nprice);
            }
            else {
              spec.price = parseInt(nprice);
            }
          }
          isUpdated = true;
        }
      });
    });

    if (!isUpdated) {
      return res.status(404).send({ message: 'SpecID not found' });
    }

    smartphone.lastUpdated = new Date();
    await smartphone.save();
    res.redirect(`/settings/products/${productId}`);
  } catch (error) {
    res.status(500).send({ message: 'Error updating spec', error: error.message });
  }
});






// hiện bảng chỉnh sửa thông tin sản phẩm
router.get('/settings/products/:productID/update', isAdmin, currentU, async (req, res) => {
  const { productID } = req.params;
  try {
    const product = await Smartphone.findOne({ _id: productID });
    const brands = await Brand.find();
    res.render('admin/product/productEdit', { product, brands,currentUser: req.c });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});






//Đường dẫn xác nhận sửa thông tin sản phẩm
router.post('/settings/products/:productID/update', isAdmin, upload.single('image'), multerErrorHandlingMiddleware, async (req, res) => {
  try {
    const { productID } = req.params;
    const { name, os, brand, model, description, generalSpecifications = {} } = req.body;

    const smartphone = await Smartphone.findOne({ _id: productID });
    if (!smartphone) {
      return res.status(404).json({ error: 'Smartphone not found' });
    }

    const { os: oldOs = '', name: oldName = '', brand: oldBrand = '', model: oldModel = '', description: oldDescription = '', generalSpecifications: oldGeneralSpecifications = {} } = smartphone;

    if (req.file) {
      const { originalname, buffer, mimetype, size } = req.file;

      // Validate image size and type
      if (size > 5 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'Image size should not exceed 5MB.' });
      }

      if (!['image/jpeg', 'image/png'].includes(mimetype)) {
        return res.status(400).json({ success: false, message: 'Invalid file type. Only JPG and PNG are allowed.' });
      }

      try {
        // Delete the old image file if it exists and the file path is valid
        if (smartphone.image) {
          const oldImagePath = path.join(__dirname, '..', 'uploads', smartphone.image);
          try {
            fs.unlinkSync(oldImagePath);
          } catch (err) {
            if (err.code === 'ENOENT') {
              // File not found, continue without throwing an error
              console.log('Old image file not found, continuing...');
            } else {
              // Handle other errors
              return res.status(500).json({ error: 'Internal server error' });
            }
          }
        }

        // Process and save the new image
        const filename = Date.now() + path.extname(originalname);
        await processImage(buffer, filename);
        const imageUrl = `${filename}`;

        // Update the product with the new image
        smartphone.image = imageUrl;
      } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    smartphone.name = name || oldName;
    smartphone.os = os || oldOs;
    smartphone.productBrand = brand || oldBrand;
    smartphone.model = model || oldModel;
    smartphone.description = description || oldDescription;
    smartphone.generalSpecifications.cpu = generalSpecifications.cpu || oldGeneralSpecifications?.cpu;
    smartphone.generalSpecifications.camera.primary = generalSpecifications.camera?.primary || oldGeneralSpecifications?.camera?.primary;
    smartphone.generalSpecifications.camera.secondary = generalSpecifications.camera?.secondary || oldGeneralSpecifications?.camera?.secondary;
    smartphone.generalSpecifications.battery = generalSpecifications.battery || oldGeneralSpecifications?.battery;
    smartphone.generalSpecifications.display = generalSpecifications.display || oldGeneralSpecifications?.display;
    smartphone.lastUpdated = new Date();
    await smartphone.save();
    res.redirect(`/settings/products/${productID}`);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});






module.exports = router;
