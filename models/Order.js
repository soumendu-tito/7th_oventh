const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    name: String,
    address: String,
    phone: String
  },
  items: [
    {
      _id: String,
      name: String,
      price: Number,
      qty: Number
    }
  ],
  total: Number,
  createdAt: Date
});

module.exports = mongoose.model('Order', orderSchema);
