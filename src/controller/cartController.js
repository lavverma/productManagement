const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const {isValidRequest, isValidId} = require('../validator/validation')


const addToCart = async function(req, res){
    try{
        let userId = req.user._id
        let cartExist = await cartModel.findOne({userId: userId, items: null})
        if(!isValidRequest(req.body)){
            return res
                    .status(400)
                    .send({status: false, message: "Enter valid input"})
        }
        let data = req.body;
        let items = []
        if(!cartExist){
            let cart = {};
            cart.userId = userId
            // cart.totalItems = 0;
            cart.totalPrice = 0;
            // cart.items = [{productId, quantity}];
            if(!data.items){
                return res
                    .status(400)
                    .send({status: false, message: "Items are required to create a cart"})
            }
            if(!Array.isArray(data.items)){
                return res
                    .status(400)
                    .send({status: false, message: "Items should have productId and quantity of product in array"})
            }
            console.log(data.items)
            for(i=0; i<data.items.length; i++){
                if(!data.items[i].productId){
                    return res
                        .status(400)
                        .send({status: false, message: "Product Id is mandatory to add the product"})

                }
                if(!isValidId(data.items[i].productId)){
                    return res
                        .status(400)
                        .send({status: false, message: "Enter valid format of product id as of objectId"})
                }
                if(!data.items[i].quantity){
                    return res
                        .status(400)
                        .send({status: false, message: "atleast one quantity is necessary"})
                }
                
                const productExist = await productModel.findOne({_id: data.items[i].productId, isDeleted: false})
                if(!productExist){
                    return res
                        .status(404)
                        .send({status: false, message: "Product not found"})
                }
                // items[i].productId = items[i].productId
                if(!/^[1-9]+$/.test(data.items[i].quantity)){
                    return res
                        .status(400)
                        .send({status: false, message: "Atleast one quantity should be there"})
                }
                // cart.items[i] = [items[i].quantity]
                items.push({productId: data.items[i].productId, quantity: data.items[i].quantity})
                cart.totalPrice = cart.totalPrice + productExist.price        
            }
            cart.items = items
            cart.totalItems =  data.items.length
            const createCart = await cartModel.create(cart)
            return res
                .status(201)
                .send({status: true, message: "Successful", data: createCart})
        }
        if(!cartId){
            return res
                .status(400)
                .send({status: false, message: "Cart already exists, So cart Id is required"})
        }
        if(!isValidId(cartId) || (cartExist._id.toString() != cartId)){
            return res
                .status(400)
                .send({status: false, message: "CartId is not Valid"})
            }
        if(!items){
            return res
                .status(400)
                .send({status: false, message: "Items are required"})
        }
        if(!Array.isArray(items)){
            return res
                .status(400)
                .send({status: false, message: "Items should have productId and quantity of product in array"})
        }
        for(i=0; i<items.length; i++){
            if(!items[i].productId){
                return res
                    .status(400)
                    .send({status: false, message: "Product Id is mandatory to add the product"})

            }
            if(!isValidId(productId)){
                return res
                    .status(400)
                    .send({status: false, message: "Enter valid format of product id as of objectId"})
            }
            if(!items[i].quantity){
                return res
                    .status(400)
                    .send({status: false, message: "atleast one quantity is necessary"})
            }
            const productExist = await productModel.findOne({_id: productId, isDeleted: false})
                if(!productExist){
                    return res
                        .status(404)
                        .send({status: false, message: "Product not found"})
            }
            if(cartExist.items[i].productId.toString() == productId){
                cartExist.items[i].quantity += quantity
            }else{
            cartExist.items.push({productId: productId, quantity: quantity})
            }
            cartExist.totalPrice += productExist.price
        }
        cartExist.totalItems += items.length
        const updateCart = await cartModel.findOneAndUpdate({_id: cartId},{$set: cartExist}, {new: true})
        return res
                .status(200)
                .send({status: true, message: "Successful", data: updateCart})
    }
    catch(error){
        console.log(error)
        return res
            .status(500)
            .send({status: false, message: error.message})
    }
}

module.exports = {addToCart}