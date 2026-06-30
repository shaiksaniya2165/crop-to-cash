const express = require('express');
const router = express.Router();
const CropRate = require('../models/CropRate');
const { authAdmin } = require('../middleware/auth');

// Get all crop rates
router.get('/rates', async (req, res) => {
  try {
    const crops = await CropRate.find();
    res.json(crops);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update crop rate (admin)
router.put('/rates/:id', authAdmin, async (req, res) => {
  try {
    const crop = await CropRate.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true });
    res.json(crop);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Crop suggestion based on land type
router.post('/suggest', async (req, res) => {
  const { landType, season, soilType } = req.body;
  const suggestions = {
    'clay': { crops: ['Rice', 'Wheat', 'Sugarcane'], pesticides: ['Chlorpyrifos', 'Imidacloprid', 'Mancozeb'] },
    'loamy': { crops: ['Cotton', 'Maize', 'Groundnut', 'Sunflower'], pesticides: ['Thiamethoxam', 'Cypermethrin', 'Propiconazole'] },
    'sandy': { crops: ['Groundnut', 'Onion', 'Chili', 'Turmeric'], pesticides: ['Lambda-cyhalothrin', 'Carbendazim', 'Tricyclazole'] },
    'red': { crops: ['Cotton', 'Chili', 'Sunflower', 'Maize'], pesticides: ['Acephate', 'Profenofos', 'Hexaconazole'] },
    'black': { crops: ['Cotton', 'Sugarcane', 'Wheat', 'Soybean'], pesticides: ['Quinalphos', 'Endosulfan', 'Copper oxychloride'] },
  };
  const result = suggestions[soilType?.toLowerCase()] || suggestions['loamy'];
  res.json({
    recommendedCrops: result.crops,
    pesticides: result.pesticides,
    tips: [
      'Test soil pH before sowing',
      'Use drip irrigation to save water',
      'Apply organic compost for better yield',
      'Monitor weather forecast regularly'
    ]
  });
});

module.exports = router;
