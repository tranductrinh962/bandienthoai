
const express = require('express');
const router = express.Router();
const { checkLoggedIn, hasVisitedCart } = require('../../middleware/auth');
const Product = require('../../models/product');
const User = require('../../models/User');
const Order = require('../../models/Order');






//Đường dẫn hiển thị tất cả sản phẩm trong giỏ hàng của người đung
router.get('/cart', checkLoggedIn, async (req, res) => {
  try {
    const userId = req.c;
    const user = await User.findById(userId)
      .populate({
        path: 'cart.product',
        select: 'productID name brand model description image minPrice notExists',
        populate: {
          path: 'colorVariants',
          populate: {
            path: 'specVariations',
            select: 'ram storage price stock'
          }
        }
      });
    // After populating the cart
    user.cart.forEach(item => {
      if (item.product === null) {
        // Assign a placeholder product with an indication message
        item.product = {
          productID: "0",
          name: "Sản phẩm này không tồn tại",
          brand: "",
          model: "",
          description: "",
          image: "/images/default.jpg",
          minPrice: 0,
          notExists: true,
          generalSpecifications: {
            cpu: "",
            camera:
              "",
            battery:
              "",
            display: ""
          },

          colorVariants: [{
            color: "",
            specVariations: [{
              specID: "",
              ram: 0,
              storage: 0,
              price: 0,
              stock: 0
            }],

          }],
          isHot: false,
          lastUpdated: Date.now()
        };
      }
    });
    // Calculate total price for each product in the cart
    user.cart.forEach(item => {
      const selectedSpecVariation = item.product.colorVariants
        .flatMap(colorVariant => colorVariant.specVariations)
        .find(specVariation => specVariation.specID.toString() === item.specID);

      if (selectedSpecVariation) {
        // Check if the actual stock is 0
        if (selectedSpecVariation.stock === 0) {
          item.quantity = 0; // Set the quantity to 0 in the user's cart
        } else {
          // Check if the quantity in the user's cart exceeds the actual stock
          item.quantity = Math.min(item.quantity, selectedSpecVariation.stock);
        }

        item.totalProductsPrice = item.quantity * selectedSpecVariation.price;
      } else {
        item.quantity = 0; // Set the quantity to 0 if the specID is not found
        item.totalProductsPrice = 0;
      }
    });

    // Calculate total price in the cart
    const totalPriceInCart = user.cart.reduce((acc, item) => acc + item.totalProductsPrice, 0);


    // Check if the user's cart is empty
    const isCartEmpty = user.cart.length === 0 || user.cart.every(item => item.product === null || item.quantity === 0);
    user.save();

    res.render('user/cart', { products: user.cart, currentUser: req.c, totalPriceInCart, isCartEmpty });
  } catch (error) {
    console.error('Error fetching user cart:', error);
    res.status(500).send('Internal Server Error');
  }
});











//Đường dẫn thêm sản phẩm vào giỏ hàng theo id sản phẩm
router.post('/add-to-cart/:productId/', checkLoggedIn, async (req, res) => {
  const productId = req.params.productId;
  const specId = req.body.spec;
  const userId = req.c;

  try {
    const product = await Product.findById(productId);
    if (product.outOfStock === 'Hết hàng') {
      return res.render('shop/outOfStock', { error: "Sản phẩm đã hết hàng", lead: "Vui lòng quay lại sau" });
    }


    const user = await User.findById(userId).populate({
      path: 'cart.product',
      select: 'colorVariants',
      populate: {
        path: 'colorVariants.specVariations',
        select: 'specID price stock'
      }
    });


    // Find the selected specVariation based on the specId
    const selectedSpecVariation = product.colorVariants
      .flatMap(colorVariant => colorVariant.specVariations)
      .find(specVariation => specVariation.specID === specId);

    if (!selectedSpecVariation) {
      return res.status(404).send('Specification variation not found');
    }

    // Find the existing cart item with the same product ID and specId
    const cartItem = user.cart.find(item => {
      if (item.product) {
        const specIdMatch = item.product.colorVariants.some(colorVariant =>
          colorVariant.specVariations.some(specVariation => specVariation.specID === specId)
        );
        return item.product._id.toString() === productId && specIdMatch && item.specID === specId;
      }
      return false;
    });
    if (cartItem) {
      if (cartItem.quantity >= selectedSpecVariation.stock) {
        return res.render('shop/outOfStock', { error: "Sản phẩm này không đủ mặt hàng để thêm vào giỏ hàng", lead: "Vui lòng quay lại" });
      }
      else if (cartItem.quantity <= selectedSpecVariation.stock) {
        // If a matching cart item is found, increase quantity
        cartItem.quantity += 1;
        cartItem.totalProductsPrice += selectedSpecVariation.price;
      }
    } else {
      // Otherwise, push a new item into the cart with the selected specVariation
      user.cart.push({
        product: productId,
        quantity: 1,
        specID: specId,
        totalProductsPrice: selectedSpecVariation.price,
        productPreviousUpdate: product.lastUpdated
      });
    }

    await user.save();

    res.render('cart/purchased-done', { currentUser: req.c, productId });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).send('Internal Server Error');
  }
});













// Kiểm tra toàn bộ sản phẩm từ hệ thống trước khi vào trang thanh toán
router.get('/cart/checkout', checkLoggedIn, hasVisitedCart, async (req, res) => {
  try {
    if (req.session.cartVisited) {
      req.session.cartVisited = false
    }


    const userId = req.c

    const user = await User.findById(userId)
      .populate({
        path: 'cart.product',
        select: 'productID name brand model description image minPrice',
        populate: {
          path: 'colorVariants',
          populate: {
            path: 'specVariations',
            select: 'ram storage price stock'
          }
        }
      });

    // Check if the cart is empty or all products are null
    const allProductsNull = user.cart.every(item => item.product === null);
    if (user.cart.length === 0 || allProductsNull) {
      return res.redirect('/cart'); // Redirect to /cart if cart is empty or all products are null
    }



    // Remove cart items with null products or out-of-stock specifications
    user.cart = user.cart.filter(item => {
      if (item.product === null) {
        return false; // Remove items with null products
      }

      const selectedSpecVariation = item.product.colorVariants
        .flatMap(colorVariant => colorVariant.specVariations)
        .find(specVariation => specVariation.specID.toString() === item.specID);

      return selectedSpecVariation && selectedSpecVariation.stock > 0; // Keep items with in-stock specifications
    });

    // Calculate total price for each product in the cart
    user.cart.forEach(item => {
      const selectedSpecVariation = item.product.colorVariants
        .flatMap(colorVariant => colorVariant.specVariations)
        .find(specVariation => specVariation.specID.toString() === item.specID);
      if (selectedSpecVariation) {
        item.totalProductsPrice = item.quantity * selectedSpecVariation.price;
      } else {
        item.totalProductsPrice = 0;
      }
    });


    // Calculate total price in the cart
    const totalPriceInCart = user.cart.reduce((acc, item) => acc + item.totalProductsPrice, 0);
    res.render('user/payment', { products: user.cart, currentUser: req.c, totalPriceInCart });
  } catch (error) {
    console.error('Error rendering payment page:', error);
    res.status(500).send('Internal Server Error');
  }
});








// Kiểm tra toàn bộ sản phẩm từ hệ thống trước khi xác nhận thanh toán
router.post('/cart/checkout/:cod', checkLoggedIn, async (req, res) => {
  try {
    const userId = req.c;
    const codValue = req.params.cod;
    let paymentMethod;

    if (codValue) {
      if (codValue === "cod") {
        paymentMethod = 'Ship COD';
      } else if (codValue === "cc") {
        paymentMethod = 'Thẻ tín dụng';
      } else {
        return res.render('shop/outOfStock', { error: "Hình thức thanh toán không hợp lệ", lead: "Vui lòng thử lại" });
      }
    }



    // Find the user and populate the cart
    const user = await User.findById(userId).populate('cart.product');
    let isCartUpdated = false;
    for (const cartItem of user.cart) {
      if (cartItem.product !== null) {
        const product = cartItem.product;
        if (cartItem.productPreviousUpdate.getTime() !== product.lastUpdated.getTime()) {
          cartItem.productPreviousUpdate = product.lastUpdated;
          isCartUpdated = true;
        }
      }
    }
    if (isCartUpdated) {
      await user.save();
      return res.render('cart/order-unsuccessful', { currentUser: req.c });
    }




    // Filter out null products from the cart
    const cartItems = user.cart.filter(item => item.product !== null);

    if (cartItems.length === 0) {
      return res.render('shop/outOfStock', { error: "Có vẻ giỏ hàng của bạn đang trống", lead: "Vui lòng thử lại" });
    }

    // Create a new order
    const orderItems = [];
    for (const item of cartItems) {
      const product = item.product;
      const specID = item.specID;
      const quantity = item.quantity;

      // Find the specific color variant and spec variation
      const colorVariant = product.colorVariants.find(variant =>
        variant.specVariations && variant.specVariations.some(spec => spec.specID === specID)
      );

      // Skip this item if colorVariant or specVariation is null
      if (!colorVariant) {
        continue;
      }

      const specVariation = colorVariant.specVariations.find(spec => spec.specID === specID);

      // Skip this item if specVariation is null
      if (!specVariation) {
        continue;
      }
      if (!specVariation.stock) {
        continue
      }
      if (specVariation) {
        if (item.quantity > specVariation.stock || specVariation.stock === 0) {
          return res.render('cart/order-unsuccessful', { currentUser: req.c });
        }
      }

      // Reduce the stock
      specVariation.stock -= quantity;
      product.customersPurchased += quantity;

      // Collect order item details
      orderItems.push({
        product: product.name,
        color: colorVariant.color,
        ram: specVariation.ram,
        storage: specVariation.storage,
        quantity: quantity,
        price: specVariation.price,
        priceAll: item.totalProductsPrice,
      });

      // Save the updated product with reduced stock
      await product.save();
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'No valid items in cart to checkout' });
    }

    // Create the order object
    const order = new Order({
      user: userId,
      items: orderItems,
      quantityAll: user.productQuantity,
      totalCost: user.totalPriceInCrat,
      shippingAddress: user.shippingAddress,
      billingAddress: user.billingAddress,
      paymentMethod
    });

    // Clear the cart and related fields
    user.orders.push(order._id);
    user.cart = [];
    user.totalPriceInCrat = 0;
    user.productQuantity = 0;

    // Save the user and order
    await user.save();
    await order.save();

    res.render('cart/order-completed', { currentUser: req.c });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});










module.exports = router; 