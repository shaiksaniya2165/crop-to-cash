const express = require('express');
const router = express.Router();
const AdminRequest = require('../models/AdminRequest');
const CropRate = require('../models/CropRate');
const { authUser, authAdmin } = require('../middleware/auth');

// ── Bilingual message helper ──────────────────────────────────────────────────
function biMsg(en, te) {
  return { text: en, textEN: en, textTE: te };
}

// ── ADMIN: Create request ─────────────────────────────────────────────────────
router.post('/', authAdmin, async (req, res) => {
  try {
    const { cropName, price, quantityKg } = req.body;
    const cropRate = await CropRate.findOne({ name: new RegExp(cropName, 'i') });
    const marketRate = cropRate ? cropRate.price / 100 : Number(price);

    const profit = quantityKg ? {
      marketRate,
      offeredPrice: Number(price),
      quantityKg: Number(quantityKg),
      totalRevenue: Number(price) * Number(quantityKg),
      totalMarketValue: marketRate * Number(quantityKg),
      directProfit: (Number(price) - marketRate) * Number(quantityKg),
      profitPercent: (((Number(price) - marketRate) / marketRate) * 100).toFixed(1)
    } : null;

    const newReq = await AdminRequest.create({
      adminId: req.admin.id,
      adminName: req.admin.name,
      adminMobile: req.admin.mobile,
      marketRate,
      profit,
      ...req.body
    });
    res.json(newReq);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PUBLIC: Get all requests ──────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const requests = await AdminRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── USER: Accept a request ────────────────────────────────────────────────────
router.put('/:id/accept', authUser, async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id);
    if (!request || request.status !== 'open') {
      return res.status(400).json({ message: 'Request not available' });
    }
    request.status = 'accepted';
    request.deliveryStage = 'accepted';
    request.acceptedBy = {
      userId: req.user.id,
      userName: req.user.name,
      userMobile: req.body.mobile,
      address: req.body.address,
      village: req.body.village,
      district: req.body.district || '',
      pincode: req.body.pincode || '',
      landmarkNote: req.body.landmarkNote || '',
      acceptedAt: new Date()
    };
    request.stageHistory.push({
      stage: 'accepted',
      updatedBy: req.user.name,
      noteEN: `Farmer ${req.user.name} accepted the request`,
      noteTE: `రైతు ${req.user.name} అభ్యర్థన అంగీకరించారు`,
      note: `Farmer ${req.user.name} accepted`
    });

    const welcomeEN = `Hello ${req.user.name}! 🙏 Thank you for accepting our crop request for ${request.cropName}. We will arrange door pickup from your farm. Our agent will contact you shortly. - ${request.adminName}`;
    const welcomeTE = `నమస్కారం ${req.user.name}! 🙏 ${request.cropNameTE || request.cropName} అభ్యర్థన అంగీకరించినందుకు ధన్యవాదాలు. మేము మీ పొలం నుండి డోర్ పికప్ ఏర్పాటు చేస్తాము. మా ఏజెంట్ త్వరలో మీతో సంప్రదిస్తారు. - ${request.adminName}`;
    request.messages.push({ sender: 'admin', senderName: request.adminName, ...biMsg(welcomeEN, welcomeTE) });

    await request.save();
    res.json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── ADMIN: Update delivery stage ──────────────────────────────────────────────
router.put('/:id/stage', authAdmin, async (req, res) => {
  try {
    const { stage, note, deliveryAgent, deliveryDate } = req.body;
    const request = await AdminRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });

    const statusMap = {
      accepted: 'accepted', pending: 'pending_pickup',
      out_for_delivery: 'out_for_delivery', delivered: 'delivered', completed: 'completed'
    };
    request.deliveryStage = stage;
    request.status = statusMap[stage] || stage;
    if (deliveryAgent) request.deliveryAgent = deliveryAgent;
    if (deliveryDate) request.deliveryDate = new Date(deliveryDate);

    request.stageHistory.push({
      stage,
      updatedBy: req.admin.name,
      note: note || `Stage: ${stage}`,
      noteEN: note || `Stage updated to ${stage}`,
      noteTE: note || `స్టేజ్ ${stage} కి నవీకరించబడింది`
    });

    // Bilingual auto-messages for each stage
    const stageMsgs = {
      pending: biMsg(
        `📦 Your crop pickup is scheduled. Our agent will arrive at ${request.acceptedBy?.village} soon. Please keep the ${request.cropName} ready for collection.`,
        `📦 మీ పంట పికప్ షెడ్యూల్ చేయబడింది. మా ఏజెంట్ ${request.acceptedBy?.village || 'మీ గ్రామం'} కి త్వరలో వస్తారు. ${request.cropNameTE || request.cropName} సిద్ధంగా ఉంచండి.`
      ),
      out_for_delivery: biMsg(
        `🚚 Our agent ${deliveryAgent || 'team'} is on the way to collect your ${request.cropName}. Please be available at your address.`,
        `🚚 మా ఏజెంట్ ${deliveryAgent || 'బృందం'} మీ ${request.cropNameTE || request.cropName} సేకరించడానికి వస్తున్నారు. దయచేసి మీ చిరునామాలో అందుబాటులో ఉండండి.`
      ),
      delivered: biMsg(
        `✅ We have successfully collected your ${request.cropName}! Payment will be processed within 24 hours. Thank you for your trust! 🙏`,
        `✅ మేము మీ ${request.cropNameTE || request.cropName} విజయవంతంగా సేకరించాము! 24 గంటల్లో చెల్లింపు జరుగుతుంది. మీ నమ్మకానికి ధన్యవాదాలు! 🙏`
      ),
      completed: biMsg(
        `🎉 Transaction completed! Your payment for ${request.cropName} has been processed. Thank you for partnering with Crop2Cash! - ${request.adminName}`,
        `🎉 లావాదేవీ పూర్తయింది! ${request.cropNameTE || request.cropName} కు మీ చెల్లింపు జరిగింది. Crop2Cash తో భాగస్వామ్యానికి ధన్యవాదాలు! - ${request.adminName}`
      )
    };

    if (stageMsgs[stage]) {
      request.messages.push({ sender: 'admin', senderName: req.admin.name, ...stageMsgs[stage] });
    }

    await request.save();
    res.json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── ADMIN: Send manual message ────────────────────────────────────────────────
router.post('/:id/message', authAdmin, async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });
    // Admin types in one language — store in both (same text; no auto-translate for manual msgs)
    const msgObj = {
      sender: 'admin',
      senderName: req.admin.name,
      text: req.body.text,
      textEN: req.body.text,
      textTE: req.body.textTE || req.body.text
    };
    request.messages.push(msgObj);
    await request.save();
    res.json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── USER: Send manual message ─────────────────────────────────────────────────
router.post('/:id/user-message', authUser, async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });
    request.messages.push({
      sender: 'user',
      senderName: req.user.name,
      text: req.body.text,
      textEN: req.body.text,
      textTE: req.body.textTE || req.body.text
    });
    await request.save();
    res.json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── ADMIN: Get own requests ───────────────────────────────────────────────────
router.get('/admin/mine', authAdmin, async (req, res) => {
  try {
    const requests = await AdminRequest.find({ adminId: req.admin.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── USER: Get own accepted requests ──────────────────────────────────────────
router.get('/user/mine', authUser, async (req, res) => {
  try {
    const requests = await AdminRequest.find({ 'acceptedBy.userId': req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── ADMIN: Complete ───────────────────────────────────────────────────────────
router.put('/:id/complete', authAdmin, async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id);
    request.status = 'completed';
    request.deliveryStage = 'completed';
    request.stageHistory.push({ stage: 'completed', updatedBy: req.admin.name, note: 'Transaction completed' });
    request.messages.push({
      sender: 'admin',
      senderName: req.admin.name,
      ...biMsg(
        `🎉 Transaction fully completed! Thank you ${request.acceptedBy?.userName} for your partnership. We look forward to working with you again!`,
        `🎉 లావాదేవీ పూర్తిగా పూర్తయింది! ${request.acceptedBy?.userName}, మీ భాగస్వామ్యానికి ధన్యవాదాలు. మళ్ళీ కలిసి పని చేయాలని ఆశిస్తున్నాము!`
      )
    });
    await request.save();
    res.json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── ADMIN: Delete ─────────────────────────────────────────────────────────────
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    await AdminRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
