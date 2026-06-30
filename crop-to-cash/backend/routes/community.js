const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { authUser } = require('../middleware/auth');

// ── Bilingual auto-reply pool ────────────────────────────────────────────────
// Each reply has BOTH en and te text stored together
const AUTO_REPLIES = {
  pest: [
    {
      name: 'Raju Reddy', nameTE: 'రాజు రెడ్డి', village: 'Tenali', villageTE: 'తెనాలి',
      textEN: 'I faced the same problem last season. Try spraying Chlorpyrifos 2ml per litre water in the early morning. It worked very well for me on cotton crop.',
      textTE: 'నేను గత సీజన్‌లో ఇదే సమస్య ఎదుర్కొన్నాను. క్లోర్‌పైరిఫాస్ 2ml లీటరు నీటిలో కలిపి తెల్లవారుజామున పిచికారీ చేయండి. పత్తి పంటలో చాలా బాగా పనిచేసింది.'
    },
    {
      name: 'Suresh Babu', nameTE: 'సురేష్ బాబు', village: 'Ongole', villageTE: 'ఒంగోలు',
      textEN: 'Check for waterlogging near roots — that attracts pests. Use yellow sticky traps for whitefly control. My father taught me this old method and it really works!',
      textTE: 'వేర్ల దగ్గర నీరు నిలవడం ఉంటే పురుగులు వస్తాయి. తెల్లదోమ నియంత్రణకు పసుపు రంగు అంటుకునే ఉచ్చులు ఉపయోగించండి. మా నాన్న నేర్పిన పాత పద్ధతి — చాలా పనిచేస్తుంది!'
    },
    {
      name: 'Venkat Rao', nameTE: 'వెంకట్ రావు', village: 'Nandyal', villageTE: 'నంద్యాల',
      textEN: 'Contact your local agriculture officer at Rythu Bharosa Kendra. They give free pesticide recommendations and even spray kits. Better to get expert advice for heavy infestation.',
      textTE: 'స్థానిక వ్యవసాయ అధికారిని (రైతు భరోసా కేంద్రం) సంప్రదించండి. ఉచిత పురుగుమందు సిఫారసులు మరియు స్ప్రే కిట్‌లు కూడా ఇస్తారు.'
    },
  ],
  disease: [
    {
      name: 'Krishna Murthy', nameTE: 'కృష్ణ మూర్తి', village: 'Gudivada', villageTE: 'గుడివాడ',
      textEN: 'This looks like fungal infection. Spray Mancozeb or Carbendazim fungicide. Also remove affected leaves and burn them away from the field to stop spreading.',
      textTE: 'ఇది శిలీంద్ర సంక్రమణలా కనిపిస్తుంది. మాంకోజెబ్ లేదా కార్బెండజిమ్ పిచికారీ చేయండి. ప్రభావిత ఆకులను తొలగించి తగలబెట్టండి.'
    },
    {
      name: 'Narayana Das', nameTE: 'నారాయణ దాస్', village: 'Eluru', villageTE: 'ఏలూరు',
      textEN: 'Make sure your irrigation schedule is correct — overwatering causes most leaf diseases. I use drip irrigation now and disease reduced by 70% in my paddy field!',
      textTE: 'నీటిపారుదల షెడ్యూల్ సరిగా ఉందో చూసుకోండి — అధిక నీరు చాలా ఆకు వ్యాధులకు కారణం. నేను డ్రిప్ ఇరిగేషన్ ఉపయోగిస్తున్నాను — వ్యాధి 70% తగ్గింది!'
    },
    {
      name: 'Prakash Naidu', nameTE: 'ప్రకాష్ నాయుడు', village: 'Machilipatnam', villageTE: 'మచిలీపట్నం',
      textEN: 'Try organic solution — mix 100g baking soda in 10 litres water and spray. Good for early stage fungal issues without spending much money.',
      textTE: '100g బేకింగ్ సోడా 10 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి. తక్కువ ఖర్చులో ప్రారంభ దశ శిలీంద్ర సమస్యలకు మంచిది.'
    },
  ],
  weather: [
    {
      name: 'Srinivas Rao', nameTE: 'శ్రీనివాస్ రావు', village: 'Kakinada', villageTE: 'కాకినాడ',
      textEN: 'When heavy rain is forecast, make proper drainage channels in your field. I lost my groundnut crop 3 years ago due to waterlogging. Prepare drainage first now.',
      textTE: 'భారీ వర్షం అంచనా ఉన్నప్పుడు పొలంలో మంచి డ్రైనేజీ కాలువలు తవ్వండి. 3 సంవత్సరాల క్రితం నీటి మూలంగా నా వేరుశెనగ పంట పోయింది. ముందే సిద్ధం చేసుకోండి.'
    },
    {
      name: 'Bhaskar Reddy', nameTE: 'భాస్కర్ రెడ్డి', village: 'Rajam', villageTE: 'రాజాం',
      textEN: 'Keep checking the Meghdoot app by ICAR — it gives crop-specific weather advisory. Also register with Rythu Bharosa Kendra to get SMS alerts for your district.',
      textTE: 'ICAR మేఘదూత్ యాప్ చెక్ చేయండి — పంట-నిర్దిష్ట వాతావరణ సలహా ఇస్తుంది. రైతు భరోసా కేంద్రంలో నమోదు చేసుకుంటే SMS హెచ్చరికలు వస్తాయి.'
    },
    {
      name: 'Anand Kumar', nameTE: 'ఆనంద్ కుమార్', village: 'Vizianagaram', villageTE: 'విజయనగరం',
      textEN: 'For summer crop protection, use shade nets (50%) during peak heat. I use them for tomatoes and chili — yield improved a lot. Available for ₹15/sqm.',
      textTE: 'వేసవి పంట రక్షణకు 50% షేడ్ నెట్‌లు ఉపయోగించండి. నేను టమాటా, మిర్చికి వాడతాను — దిగుబడి చాలా పెరిగింది. ₹15/చ.మీ కు దొరుకుతాయి.'
    },
  ],
  market: [
    {
      name: 'Rajesh Varma', nameTE: 'రాజేష్ వర్మ', village: 'Chirala', villageTE: 'చిరాల',
      textEN: 'Always compare prices in at least 3 mandis before selling. Last month I got ₹800 more per quintal for cotton by going to Vijayawada mandi. Transport cost ₹200 — still good profit!',
      textTE: 'అమ్మే ముందు కనీసం 3 మండీలలో ధరలు పోల్చండి. గత నెల విజయవాడ మండీలో పత్తికి క్వింటాల్‌కు ₹800 ఎక్కువ వచ్చింది. రవాణా ₹200 పోయినా లాభమే!'
    },
    {
      name: 'Mohan Rao', nameTE: 'మోహన్ రావు', village: 'Bhimavaram', villageTE: 'భీమవరం',
      textEN: 'Join the farmer WhatsApp groups for your district — daily mandi prices are shared there. Also try e-NAM (National Agriculture Market) online platform for better prices.',
      textTE: 'మీ జిల్లా రైతుల WhatsApp గ్రూప్‌లలో చేరండి — రోజువారీ మండీ ధరలు షేర్ అవుతాయి. e-NAM ప్లాట్‌ఫారమ్ కూడా బాగుంటుంది.'
    },
    {
      name: 'Suryanarayana', nameTE: 'సూర్యనారాయణ', village: 'Palakol', villageTE: 'పాలకొల్లు',
      textEN: 'For bulk selling, contact FPOs (Farmer Producer Organisations) in your area. They negotiate better prices collectively. Our FPO got us 15% better rate for rice last year.',
      textTE: 'వ్యాపారం కోసం FPO (రైతు ఉత్పత్తిదారుల సంస్థ)ని సంప్రదించండి. సామూహికంగా మెరుగైన ధరలు చర్చించుకుంటారు. మా FPO గత సంవత్సరం వడ్లకు 15% అధిక ధర తెచ్చింది.'
    },
  ],
  general: [
    {
      name: 'Laxman Rao', nameTE: 'లక్ష్మణ్ రావు', village: 'Narasapur', villageTE: 'నరసాపురం',
      textEN: 'Great question! My tip after 20 years of farming: always maintain a farm diary — write what you planted, when you sprayed, how much you harvested. Patterns help every season.',
      textTE: 'మంచి ప్రశ్న! 20 సంవత్సరాల తర్వాత నా సూచన: పొలం డైరీ నిర్వహించండి — ఏం నాటారు, ఎప్పుడు పిచికారీ చేశారు, ఎంత పండించారో రాయండి. నమూనాలు ప్రతి సీజన్ మెరుగుపరుస్తాయి.'
    },
    {
      name: 'Hanumantha Rao', nameTE: 'హనుమంత రావు', village: 'Tanuku', villageTE: 'తణుకు',
      textEN: 'Try soil testing every 2 years at Rythu Seva Kendra. Knowing your soil NPK helps spend less on fertilizers and get better yield. I saved ₹4000/acre after soil testing!',
      textTE: 'రైతు సేవా కేంద్రం నుండి 2 సంవత్సరాలకోసారి మట్టి పరీక్ష చేయించుకోండి. NPK తెలిసిన తర్వాత ఎరువులపై తక్కువ ఖర్చు అవుతుంది. నేను ఎకరాకు ₹4000 ఆదా చేశాను!'
    },
    {
      name: 'Venkateswara', nameTE: 'వెంకటేశ్వర', village: 'Amalapuram', villageTE: 'అమలాపురం',
      textEN: 'Connect with the Krishi Vigyan Kendra (KVK) in your district. They provide free training, demo plots, and free seed kits for new crop varieties. Very helpful for small farmers.',
      textTE: 'మీ జిల్లాలో కృషి విజ్ఞాన కేంద్రం (KVK)తో కనెక్ట్ అవ్వండి. ఉచిత శిక్షణ, డెమో ప్లాట్లు మరియు కొత్త వంగడాల సీడ్ కిట్‌లు ఇస్తారు. చిన్న రైతులకు చాలా ఉపయోగం.'
    },
  ]
};

function getAutoReplies(category) {
  const pool = AUTO_REPLIES[category] || AUTO_REPLIES.general;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const count = Math.floor(Math.random() * 2) + 2; // 2 or 3
  return shuffled.slice(0, count);
}

// ── Routes ───────────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create post — auto-adds bilingual replies
router.post('/', authUser, async (req, res) => {
  try {
    const category = req.body.category || 'general';

    const post = await Post.create({
      userId: req.user.id,
      userName: req.user.name,
      village: req.body.village || '',
      title: req.body.title,
      titleEN: req.body.title,
      titleTE: req.body.titleTE || req.body.title,
      content: req.body.content,
      contentEN: req.body.content,
      contentTE: req.body.contentTE || req.body.content,
      category,
      likes: Math.floor(Math.random() * 5)
    });

    // Add bilingual auto-replies
    const autoReplies = getAutoReplies(category);
    for (let i = 0; i < autoReplies.length; i++) {
      const r = autoReplies[i];
      const offsetMs = (i + 1) * (Math.floor(Math.random() * 120000) + 60000);
      post.replies.push({
        userId: null,
        userName: r.name,
        userNameTE: r.nameTE,
        village: r.village,
        villageTE: r.villageTE,
        text: r.textEN,
        textEN: r.textEN,
        textTE: r.textTE,
        isAutoReply: true,
        createdAt: new Date(Date.now() + offsetMs)
      });
    }
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Manual reply — stores both languages if provided
router.post('/:id/reply', authUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.replies.push({
      userId: req.user.id,
      userName: req.user.name,
      text: req.body.text,
      textEN: req.body.text,
      textTE: req.body.textTE || req.body.text,
      isAutoReply: false
    });
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
