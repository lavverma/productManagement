const orderModel = require('../models/orderModel')
const {  isValidRequest, isValidId } = require('../validator/validation')
const cartModel = require('../models/cartModel')

//=====================================================CREATE ORDER=====================================================
const createorder = async function(req, res){
    try{
        let userId = req.user._id

        //Validation of Request Body
        if(!isValidRequest(req.body)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid Input"})
        }
        let {cartId, cancellable, totalQuantity} = req.body
        let total = 0

        //Validation of cartId
        if(!cartId){
            return res
                .status(400)
                .send({status: false, message:"Cart Id is required to place an order"})
        }
        if(!isValidId(cartId)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid CartId as in objectId format of mongodb"})
        }

        //Searching for cart before placing the order
        const cartExist = await cartModel.findOne({_id: cartId}).select({_id:0,__v:0})
        if(!cartExist){
            return res
                .status(404)
                .send({status: false, message:"Cart not found"})
        }
        if(cartExist.totalItems == 0){
            return res
                .status(400)
                .send({status: false, message:"No product exist in the cart to place an order"})
        }
        if(cartExist.userId.toString() != userId){
            return res
                .status(400)
                .send({status: false, message:"Cart is not for the user logged in"})
        }
        //creating the deep copy of cart data found
        let order =JSON.parse(JSON.stringify(cartExist))
        console.log(order)
        if(totalQuantity == undefined){
            for(i=0;i<cartExist.items.length; i++){
                total += cartExist.items[i].quantity
            } 
            order.totalQuantity = total
        }

        //Validation of cancellable key if given
        if(cancellable != undefined){
           let value = cancellable.toString()
            if(!(["true", "false"].includes(value))){
                return res
                .status(400)
                .send({status: false, message:"Cancellable can either be true or false"})
            }
            order.cancellable = cancellable
        }
        const orderData = await orderModel.create(order)
        let data ={userId: userId, totalItems:0, totalPrice:0, items:[]}
        await cartModel.findByIdAndUpdate(cartId,{$set:data})
        return res
                .status(201)
                .send({status: true, message:"Order Placed", data: orderData})
    }
    catch(error){
        console.log(error)
        return res
            .status(500)
            .send({status: false, message: error.message})
    }
}

const updateOrder = async function(req, res){
    try{
        let userId = req.user._id

        //Validation of request body
        if(!isValidRequest(req.body)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid Input"})
        }
        //Destructuring the keys from body into distinct variables
        let {orderId, status} = req.body
        let set = ["completed", "cancelled"]

        let cart = await cartModel.findOne({userId: userId})
        if(!cart){
            return res
                .status(404)
                .send({status: false, message:"Cart dosen't exist for this user"})
        }
        //Validation of orderId
        if(!orderId){
            return res
                .status(400)
                .send({status: false, message:"order Id se required"})
        }
        if(!isValidId(orderId)){
            return res
                .status(400)
                .send({status: false, message:"Enter valid format of orderId as in objectId generated by mongodb"})
        }

        //Searching for an existing order
        const orderPlaced = await orderModel.findOne({_id: orderId})
        if(!orderPlaced){
            return res
            .status(404)
            .send({status: false, message:`Order not found`})
        }
        if(orderPlaced.userId.toString() != userId){
            return res
                .status(400)
                .send({status: false, message:`Order hasn't been created for the user - ${userId}`})
        }

        //Validation of status key
        if(!status){
            return res
                .status(400)
                .send({status: false, message:"Status is required to update the status"})
        }
        if(!(set.includes(status))){
            return res
                .status(400)
                .send({status: false, message:`Status should only be ${set} `})
        }

        //checking if the order data already have the order cancelled
        if(orderPlaced.status == set[1]){
            return res
                    .status(400)
                    .send({status: false, message:"This order has already been cancelled"})
        }
        if(orderPlaced.status == set[0]){
            return res
                .status(400)
                .send({status: false, message:"Order had already been completed"})
        }
        
        //Checking if the order data have cancellable true or false and changing status accordingly
        if(status == set[1]){
            if(orderPlaced.cancellable.toString() != "true"){
                return res
                    .status(400)
                    .send({status: false, message:"This order is not cancellable"})
            }
            
        }
        
        const updatedStatus  = await orderModel.findByIdAndUpdate(orderId,{$set:{status: status}},{new: true})
        return res
                .status(200)
                .send({status: true, message:"Status Updated Successfully", data: updatedStatus})
    }
    catch(error){
        console.log(error)
        return res
            .status(500)
            .send({status: false, message: error.message})
    }
}

module.exports = {createorder, updateOrder}