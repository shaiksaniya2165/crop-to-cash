const mongoose = require('mongoose');

const cropRateSchema = new mongoose.Schema({
  name: String,
  nameTE: String,
  price: Number,
  unit: String,
  change: Number,
  icon: String,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CropRate', cropRateSchema);
