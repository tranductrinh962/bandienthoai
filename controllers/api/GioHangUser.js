
const express = require('express');
const router = express.Router();
const { checkLoggedIn } = require('../../middleware/auth');

const User = require('../../models/User');












//Đường dẫn cập nhật số lượng sản phẩm 
router.put('/cart/update-quantity/:productId/:specID/:quantityInput', checkLoggedIn, async (req, res) => {
  try {
    const { productId, specID, quantityInput } = req.params;
    const userId = req.c;
    const user = await User.findById(userId).populate('cart.product');



    const cartItem = user.cart.find(item => {
      if (item.product) {
        return item.product._id.toString() === productId && item.specID === specID;
      }
    });

   

    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    const product = cartItem.product;



    // Check if the color variant exists
    const colorVariant = product.colorVariants.find(variant => 
      variant.specVariations.some(spec => spec.specID === specID)
    );
   

    if (!colorVariant) {
      return res.json({
        quantity: 0,
        productPrice: 0,
        totalProductsPrice: 0,
        getTotalPriceOfProduct: user.totalPriceInCrat
      });;
    }
    
    const specVariation = colorVariant.specVariations.find(spec => spec.specID === specID);

    

    if (!specVariation) {
      return res.status(404).json({ error: 'Spec variation not found' });
    }


    const quantity = parseInt(quantityInput);
    if (quantity < 1 && !specVariation.stock === 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }


    // Check if the quantity exceeds the available stock
    if (quantity > specVariation.stock) {
      cartItem.quantity = specVariation.stock;
      cartItem.totalProductsPrice = specVariation.price * specVariation.stock;
    } else if (specVariation.stock === 0) {
      cartItem.quantity = 0
      cartItem.totalProductsPrice = 0
    }
    else {
      cartItem.quantity = quantity;
      cartItem.totalProductsPrice = specVariation.price * quantity;
    }


    await user.save();

    res.json({
      quantity: cartItem.quantity,
      productPrice: specVariation.price,
      totalProductsPrice: cartItem.totalProductsPrice,
      getTotalPriceOfProduct: user.totalPriceInCrat
    });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});









//Đường dẫn xóa sản phẩm
router.delete('/cart/remove-one/:productId', checkLoggedIn, async (req, res) => {
  const productId = req.params.productId;
  const userId = req.c

  try {
    const user = await User.findById(userId).populate('cart.product');

    // Find the cart item with the specified productId
    const cartItem = user.cart.find(item => item._id.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    user.cart = user.cart.filter(item => item !== cartItem);

    await user.save();

    res.json({
      getTotalPriceOfProduct: user.totalPriceInCrat
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});










//Đường dẫn cập nhật số lượng sản phẩm khi ấn Enter
router.put('/cart/enter-update-quantity/:productId/:specID/:inputValue', checkLoggedIn, async (req, res) => {
  try {
    const { productId, specID, inputValue } = req.params;
    const userId = req.c
    const user = await User.findById(userId).populate('cart.product');

    const product = user.cart.find(item => {
      if (item.product) {
        return item.product._id.toString() === productId && item.specID === specID;
      }
    });

    const specVariation = product.product.colorVariants
      .flatMap(variant => variant.specVariations)
      .find(spec => spec.specID === specID);

    if (!specVariation) {
      return res.status(404).json({ error: 'Spec variation not found' });
    }

    let quantity = parseInt(inputValue);
    if (isNaN(quantity) || quantity < 1) {
      quantity = 1
    }

    // Check if the quantity exceeds the available stock
    if (quantity > specVariation.stock) {
      product.quantity = specVariation.stock;
      product.totalProductsPrice = specVariation.price * specVariation.stock;
    }
    else {
      product.quantity = quantity;
      product.totalProductsPrice = specVariation.price * quantity;
    }


    await user.save();

    res.json({
      quantity: product.quantity,
      totalProductsPrice: product.totalProductsPrice,
      getTotalPriceOfProduct: user.totalPriceInCrat
    });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});









//Kiểm tra toàn bộ sản phẩm từ hệ thống trước khi vào thanh toán
router.post('/cart/', checkLoggedIn, async (req, res) => {
  try {
    const userId = req.c;


    if (userId.shippingAddress === null && userId.billingAddress === null) {
      return res.json({ message: 'Để thanh toán, bạn cần cập nhật địa chỉ giao hàng và địa chỉ thanh toán',is:"address" });
    }

    // Check if the user's cart is empty
    const userCheckEmpty = await User.findById(userId)
    const isCartEmpty = userCheckEmpty.cart.every(item => item.product === null || item.quantity === 0);
    if (isCartEmpty) {
      return res.json({ message: 'Giỏ hàng trống', isCartEmpty: true });
    }

    const userCheck = await User.findById(userId).populate('cart.product');
    let isCartUpdated = false;
    for (const cartItem of userCheck.cart) {
      if (cartItem.product !== null) {
        const product = cartItem.product;
        if (cartItem.productPreviousUpdate.getTime() !== product.lastUpdated.getTime()) {
          cartItem.productPreviousUpdate = product.lastUpdated;
          isCartUpdated = true;
        }
      }
    }
    if (isCartUpdated) {
      await userCheck.save();
      return res.json({ message: 'Sản phẩm dã được cập nhât, hãy tải lại trang để tiếp tục', isCartUpdated: true });
    }
    req.session.cartVisited = true
    return res.json({ data: {} });
  } catch (error) {
    console.error('Error rendering payment page:', error);
    res.status(500).send('Internal Server Error');
  }
});











module.exports = router; 