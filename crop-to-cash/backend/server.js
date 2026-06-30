const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/community', require('./routes/community'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/weather', require('./routes/weather'));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/croptocash';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    // Seed initial data
    await seedData();
  })
  .catch(err => console.log('MongoDB Error:', err));

async function seedData() {
  const User = require('./models/User');
  const Admin = require('./models/Admin');
  const CropRate = require('./models/CropRate');

  // Create default admin
  const adminExists = await Admin.findOne({ mobile: '9999999999' });
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);
    await Admin.create({ name: 'Super Admin', mobile: '9999999999', password: hash });
    console.log('✅ Default admin created (mobile: 9999999999, password: admin123)');
  }

  // Seed crop rates
  const cropsCount = await CropRate.countDocuments();
  if (cropsCount === 0) {
    await CropRate.insertMany([
      { name: 'Rice', nameTE: 'వరి', price: 2200, unit: 'quintal', change: +50, icon: '🌾' },
      { name: 'Wheat', nameTE: 'గోధుమ', price: 2150, unit: 'quintal', change: -30, icon: '🌿' },
      { name: 'Cotton', nameTE: 'పత్తి', price: 6800, unit: 'quintal', change: +120, icon: '☁️' },
      { name: 'Sugarcane', nameTE: 'చెరకు', price: 350, unit: 'quintal', change: +10, icon: '🌱' },
      { name: 'Maize', nameTE: 'మొక్కజొన్న', price: 1900, unit: 'quintal', change: -20, icon: '🌽' },
      { name: 'Groundnut', nameTE: 'వేరుశెనగ', price: 5500, unit: 'quintal', change: +200, icon: '🥜' },
      { name: 'Sunflower', nameTE: 'పొద్దుతిరుగుడు', price: 5800, unit: 'quintal', change: +80, icon: '🌻' },
      { name: 'Soybean', nameTE: 'సోయాబీన్', price: 4200, unit: 'quintal', change: -50, icon: '🫘' },
      { name: 'Tomato', nameTE: 'టమాటా', price: 1200, unit: 'quintal', change: +300, icon: '🍅' },
      { name: 'Onion', nameTE: 'ఉల్లి', price: 1800, unit: 'quintal', change: -100, icon: '🧅' },
      { name: 'Chili', nameTE: 'మిర్చి', price: 8000, unit: 'quintal', change: +500, icon: '🌶️' },
      { name: 'Turmeric', nameTE: 'పసుపు', price: 7500, unit: 'quintal', change: +150, icon: '🟡' },
    ]);
    console.log('✅ Crop rates seeded');
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
