var models = require('../config/constants').models
let mongoose = require('mongoose')
let ObjectId = mongoose.Schema.ObjectId

var schema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    resalePrice: { type: Number },
    tag: [{ type: String }],
    sku: { type: String },
    created: { type: Number, default: Date.now() },
    listId: { type: ObjectId, ref: models.list.name},
});


module.exports = mongoose.model(models.all.name, schema);