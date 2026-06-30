const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['admin', 'user'], required: true },
  senderName: String,
  text: String,     // primary (en)
  textEN: String,   // English version
  textTE: String,   // Telugu version
  createdAt: { type: Date, default: Date.now }
});

const stageHistorySchema = new mongoose.Schema({
  stage: String,
  updatedBy: String,
  note: String,
  noteEN: String,
  noteTE: String,
  timestamp: { type: Date, default: Date.now }
});

const adminRequestSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  adminName: String,
  adminMobile: String,
  cropName: String,
  cropNameTE: String,
  quantity: String,
  quantityKg: Number,
  price: Number,
  marketRate: Number,
  unit: String,
  description: String,
  deliveryType: { type: String, enum: ['door', 'pickup'], default: 'door' },

  // Main status & delivery stage
  status: {
    type: String,
    enum: ['open', 'accepted', 'pending_pickup', 'out_for_delivery', 'delivered', 'completed', 'cancelled'],
    default: 'open'
  },
  deliveryStage: {
    type: String,
    enum: ['', 'accepted', 'pending', 'out_for_delivery', 'delivered', 'completed'],
    default: ''
  },
  stageHistory: [stageHistorySchema],

  acceptedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    userMobile: String,
    address: String,
    village: String,
    district: String,
    pincode: String,
    landmarkNote: String,
    acceptedAt: Date
  },

  // Profit calculation
  profit: {
    marketRate: Number,
    offeredPrice: Number,
    quantityKg: Number,
    totalRevenue: Number,
    totalMarketValue: Number,
    directProfit: Number,
    profitPercent: Number
  },

  // Admin–Farmer messaging
  messages: [messageSchema],

  deliveryDate: Date,
  deliveryAgent: String,
  trackingNote: String,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminRequest', adminRequestSchema);
