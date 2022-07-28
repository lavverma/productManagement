const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userId:{
        type:objectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items:[{
        productId: {type: objectId,
                    ref: 'Product',
                    required: true},
        quantity: {type: Number,
                  required: true,
                  minLength: 1}
      }],
})