const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userId:{
        type: objectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items:[{
        _id: false,
        productId: {type: objectId,
                    ref: 'Products',
                    required: true},
        quantity: {type: Number,
                  required: true,
                  min: 1}
    }],
    totalPrice:{
        type:Number,
        required: true
    },
    totalItems:{
        type:Number,
        required: true
    }
},{timestamps: true})

module.exports = mongoose.model('Cart', cartSchema)