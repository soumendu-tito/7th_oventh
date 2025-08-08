const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  compare_price: { type: Number, required: false },
  isBestSeller: { type: Boolean, required: false },
  image: { type: String, required: true },
  
},{timestamps: true });

module.exports = mongoose.model("Product", productSchema);
