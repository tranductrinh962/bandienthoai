
const express = require('express');
const router = express.Router();
const Product = require('../../models/product');
const Brand = require('../../models/Brand');

const mongoose = require('mongoose');
const { currentU } = require('../../middleware/auth');






//Đường dấn hiển thị tất cả sản phẩm kèm theo các loại bộ lọc cần thiết
router.get('/products', currentU, async (req, res) => {
  try {
    const { sortPrice, search = '', ajax, colors = [], brands = [], page = 1 } = req.query;
    let { min = '', max = '' } = req.query;

    const limit = 9;
    const pageNum = parseInt(page);
    const currentPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;

    let ProductsQuery = Product.find({ outOfStock: { $ne: 'Hết hàng' } });

    if (search) {
      ProductsQuery = ProductsQuery.where('name').regex(new RegExp(search, 'i'));
    }

    if (brands.length > 0) {
      const brandDocs = await Brand.find({ brand: { $in: brands } });
      const brandIds = brandDocs.map(brand => brand._id);
      ProductsQuery = ProductsQuery.where('productBrand').in(brandIds);
    }



    if (colors.length > 0) {
      ProductsQuery = ProductsQuery.where('colorVariants.color').in(colors);
    }

    if (sortPrice) {
      let sortMethod = {};

      if (sortPrice === "asc") {
        sortMethod.minPrice = 1;
      } else if (sortPrice === "desc") {
        sortMethod.minPrice = -1;
      } else if (sortPrice === "hot") {
        sortMethod.isHot = -1;
      }
      else if (sortPrice === "buy") {
        sortMethod.customersPurchased = -1;
      }

      ProductsQuery = ProductsQuery.sort(sortMethod);
    } else {
      ProductsQuery = ProductsQuery.sort({ isHot: -1 });
    }




    if ((min && max) && (min >= 1 && max >= 1) && ((min <= max))) {
      ProductsQuery = ProductsQuery.where('minPrice').gte(min).lte(max);
    } else if (min > max) {
      min = ''
      max = ''
    }

    const inStockProducts = await ProductsQuery.exec();
    const outOfStockProducts = await Product.find({ outOfStock: 'Hết hàng' }).exec();
    const products = [...inStockProducts, ...outOfStockProducts];

    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);

    if (ajax === 'true') {
      const maxProducts = 5;
      const limitedProducts = products.slice(0, maxProducts);
      return res.json(limitedProducts);
    }

    const [colorsList] = await Promise.all([
      Product.aggregate([
        { $unwind: '$colorVariants' },
        { $group: { _id: '$colorVariants.color', count: { $sum: 1 } } }
      ])
    ]);

    const brandsList = await Brand.find({});

    const queryParams = new URLSearchParams(req.query);


    // Handle the brands
    if (Array.isArray(req.query.brands)) {
      queryParams.delete('brands');  // Remove existing 'brands' to avoid duplication
      req.query.brands.forEach(brand => {
        queryParams.append('brands', brand);  // Add each brand separately
      });
    } else if (req.query.brands) {
      queryParams.delete('brands');
      queryParams.append('brands', req.query.brands);
    }

    // Handle the colors
    if (Array.isArray(req.query.colors)) {
      queryParams.delete('colors');  // Remove existing 'colors' to avoid duplication
      req.query.colors.forEach(color => {
        queryParams.append('colors', color);  // Add each color separately
      });
    } else if (req.query.colors) {
      queryParams.delete('colors');
      queryParams.append('colors', req.query.colors);
    }

    // Handle pagination without affecting the `brands`
    if (req.query.page) {
      queryParams.set('page', req.query.page);  // Set page query param
    } else {
      queryParams.set('page', 1);  // Default to page 1 if no page param exists
    }





    queryParams.delete('page'); // Remove 'page' param to handle pagination links correctly

    res.render('shop/listTest', {
      Listcolors: colorsList,
      Listbrands: brandsList,
      products: products.slice((currentPage - 1) * limit, currentPage * limit),
      selectedColor: colors,
      searchQuery: search,
      selectedBrand: brands,
      sortPrice,
      totalPages,
      page: currentPage,
      queryParams: queryParams.toString(), // Pass cleaned query string
      currentUser: req.c,
      min, max
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});








router.get('/products/:productID', currentU, async (req, res) => {
  const { productID } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productID)) {
    return res.render('shop/outOfStock', { error: "Sản phẩm không tồn tại", lead: "Vui lòng quay lại" });
  }
  const product = await Product.findOne({ _id: productID }).populate('productBrand', 'brand')

  if (!product) {
    return res.redirect("/product")
  }

  if (product.outOfStock === 'Hết hàng') {
    return res.render('shop/outOfStock', { error: "Sản phẩm đã hết hàng", lead: "Vui lòng quay lại sau" });
  }
  const randomProducts = await Product.aggregate([{ $sample: { size: 4 } }]);

  res.render('shop/product', { product, randomProducts, currentUser: req.c });
});










module.exports = router;