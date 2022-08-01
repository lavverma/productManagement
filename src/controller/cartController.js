const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const { isValidRequest, isValidId } = require("../validator/validation");

const addToCart = async function (req, res) {
  try {
    let userId = req.user._id;
    if (!isValidRequest(req.body)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter valid input" });
    }
    let { cartId, productId, quantity } = req.body;
    let cart = {totalPrice:0, items:[]};

    if (!productId) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Product Id is mandatory to add the product",
        });
    }
    if (!isValidId(productId)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "Enter valid format of product id as of objectId",
        });
    }
    if (!quantity) {
      return res
        .status(400)
        .send({
          status: false,
          message: "atleast one quantity of product is required",
        });
    }
    if (!/^[1-9]+$/.test(quantity)) {
      return res
      .status(400)
      .send({status: false, message: "Atleast one quantity should be there"});
  }
    const productExist = await productModel.findOne({
      _id: productId,
      isDeleted: false
    });
    if (!productExist) {
      return res
        .status(404)
        .send({ status: false, message: "Product not found" });
    }

    let cartExist = await cartModel.findOne({ userId: userId});
    //=====================================================TO CREATE CART=====================================================
    if (!cartExist) {
        cart.userId = userId;
        // console.log(req.body);
       
        cart.items.push({
            productId: productId,
            quantity: quantity,
        });
        cart.totalPrice = cart.totalPrice + productExist.price*quantity;
        cart.totalItems = 1;
        const createCart = await cartModel.create(cart);
        return res
        .status(201)
        .send({ status: true, message: "Successful", data: createCart });
    }
    

    //=====================================================TO ADD PRODUCT TO CART=====================================================
    
      if(cartId){
        if(!isValidId(cartId)){
          return res
            .status(400)
            .send({ status: false, message: "Enter valid cartId format as generated by mongo db" })
        }else if(cartExist._id.toString() != cartId){
          return res
            .status(400)
            .send({ status: false, message: "CartId is not for the user requesting" })
        }
      }
      let flag =0
      for(j=0; j<cartExist.items.length; j++){
        let id = cartExist.items[j].productId
        if(id == productId){
            cartExist.items[j].quantity += quantity
            flag =1
        }
      }
      if(flag == 0){
        cartExist.items.push({productId: productId, quantity: quantity})
        cartExist.totalItems += 1
      }
     
        cartExist.totalPrice += productExist.price*quantity 
      const updateCart = await cartModel.findOneAndUpdate({userId: userId},{$set: cartExist},{new: true})
      return res
      .status(200)
      .send({ status: true, message: "Successful", data: updateCart });
  }

  catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: error.message });
  }
}


const updateCart  = async function(req, res){
  try{
    let userId = req.user._id
    if(!isValidRequest(req.body)){
      return res
        .status(400)
        .send({ status: false, message: "Enter valid input" });
    }
    let {cartId, productId, removeProduct} = req.body
    if(!cartId){
      return res
        .status(400)
        .send({ status: false, message: "cartId is required to update the cart" });
    }
    if(!isValidId(cartId)){
      return res
        .status(400)
        .send({ status: false, message: "Enter valid cartId one that is geenrated by mongodb" });
    }
    let cartExist = await cartModel.findOne({_id: cartId, totalItems:{$gt:0}})
    if(!cartExist){
      return res
        .status(404)
        .send({ status: false, message: "No product exist in cart" })
    }

    let cartUserId = cartExist.userId.toString()
    if(cartUserId != userId){
      return res
        .status(400)
        .send({ status: false, message: "This cart is not for the same user whose Id is given" })
    }
    if(!productId){
      return res
        .status(400)
        .send({ status: false, message: "Product Id is required to remove the product" })
    }
    if(!isValidId(productId)){
      return res
        .status(400)
        .send({ status: false, message: "Enter valid productId as generated by mongodb" })
    }
    if(!removeProduct){
      return res
        .status(400)
        .send({ status: false, message: "quantity is required to remove the product" })
    }
    if(!([1,0].includes(removeProduct))){
      return res
        .status(400)
        .send({ status: false, message: "either whole product when 0 or only one quantity can be deleted when 1" })
    }
    let flag =0
    for(i=0; i<cartExist.items.length; i++){
      let eleProductId = cartExist.items[i].productId.toString()
      if(eleProductId == productId){
        flag =1
        const product = await productModel.findOne({_id: productId})
        if(removeProduct == 0){
          //totalPrice update
          cartExist.totalPrice = cartExist.totalPrice - cartExist.items[i]. quantity * product.price
          //totalItems update
          cartExist.totalItems  = -1
          //deleting whole product
          cartExist.items.splice(i,1)
        }else if(removeProduct == 1){
          cartExist.totalPrice = cartExist.totalPrice - product.price
          cartExist.items[i].quantity--
          if(cartExist.items[i].quantity == 0){
            //totalItems update
            cartExist.totalItems  -= 1
            //deleting whole product
            cartExist.items.splice(i,1)
            // return res
            //   .status(200)
            //   .send({ status: true, message: "Cart has one product thus deleted" })
          }
        }
      }
    }
      if(flag == 0){
        return res
          .status(400)
          .send({ status: false, message: "Product does not exist in the cart" })
      }
      const cart = await cartModel.findOneAndUpdate({_id: cartId},{$set:cartExist},{new: true})
      return res
        .status(200)
        .send({ status: true, message: "Successful", data: cart }) 
  }
  catch(error){
    return res
        .status(500)
        .send({status: false, message: error.message})
  }
}

const getCart =  async function(req, res){
  try{
      userId = req.user._id
      const getData = await cartModel.findOne({userId : userId, totalItems:{$gt: 0}})
      if(!getData){
        return res
          .status(404)
          .send({ status: false, message: "No product found in the cart" })
      }
      return res
          .status(200)
          .send({ status: true, message: "Successful", data: getData })
  }
  catch(error){
    return res
        .status(500)
        .send({status: false, message: error.message})
  }
}

const deleteCart = async function(req, res){
  try{
      let userId = req.user._id
      let data ={userId: userId, totalItems:0, totalPrice:0, items:[]}

      const delCart = await cartModel.findOneAndUpdate({userId: userId, totalItems:{$gt: 0}},{$set: data},{new: true})
      if(!delCart){
        return res
          .status(400)
          .send({ status: false, message: "No cart found for this user or no product exist in the cart" })
      }
      return res
          .status(200)
          .send({ status: true, message: "Cart deleted Successfully" })

  }
  catch(error){
    return res
        .status(500)
        .send({status: false, message: error.message})
  }
}
module.exports = { addToCart,
                  updateCart,
                  getCart,
                  deleteCart}