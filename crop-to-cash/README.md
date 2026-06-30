# 🌾 Crop2Cash — MERN Stack Farming Platform

A full-featured MERN stack application empowering farmers with real-time crop prices, weather forecasts, crop advisory, community forum, and direct market connections.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 User Login/Register | Mobile number + password with Telugu/English language support |
| 🔐 Admin Login | Name, mobile, password — separate admin portal |
| 📊 Live Crop Rates | 12+ crops with daily price changes (Rice, Cotton, Chili, etc.) |
| 🌤️ Weather Forecast | 7-day forecast with farming advisories |
| 🌱 Crop Advisor | Soil-type based crop + pesticide suggestions |
| 👥 Community Forum | Post questions, reply, like — category-filtered chat |
| 📋 Admin Requests | Admin posts crop procurement; farmers accept with address |
| 📞 Farmer Connect | Admin sees farmer details + WhatsApp/Call buttons |
| 🌐 Bilingual | Full Telugu & English language toggle |

---

## 📁 Project Structure

```
crop-to-cash/
├── backend/
│   ├── models/          # User, Admin, CropRate, Post, AdminRequest
│   ├── routes/          # auth, crops, community, requests, weather
│   ├── middleware/      # JWT auth middleware
│   ├── server.js        # Express server + MongoDB connection
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/       # Login, Register, Home, Weather, CropAdvisor, Community, Requests, Admin*
│   │   ├── components/  # Navbar
│   │   ├── context/     # AuthContext, LanguageContext
│   │   ├── App.js
│   │   ├── api.js       # Axios instance
│   │   └── index.css    # Global styles
│   └── package.json
└── docker-compose.yml
```

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend
```bash
cd backend
npm install
# Create .env file:
# MONGO_URI=mongodb://localhost:27017/croptocash
# JWT_SECRET=croptocash_secret_2024
# PORT=5000
# WEATHER_API_KEY=your_openweathermap_key (optional)
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

App runs at: http://localhost:3000  
API runs at: http://localhost:5000

---

## 🔐 Default Credentials

| Role | Mobile | Password |
|---|---|---|
| Admin | 9999999999 | admin123 |
| User | Register yourself | — |

---

## 🐳 Docker (Optional)

```bash
docker-compose up --build
```

---

## 🌐 Language Support

- Switch between **English** and **తెలుగు** from navbar dropdown
- Full website translates instantly including crop names, labels, buttons

---

## 📱 Key Flows

### Farmer (User) Flow:
1. Register with mobile, village, district, soil type
2. View live crop rates on home page
3. Check 7-day weather forecast
4. Get crop + pesticide suggestions for your soil
5. Post/reply in community forum
6. Browse admin crop requests → Accept with address

### Admin Flow:
1. Login with admin credentials
2. Post crop procurement requests (crop, quantity, price)
3. View which farmers accepted with their contact details
4. Call or WhatsApp farmer directly
5. Mark requests as completed

---

## 🛠 Tech Stack

- **Frontend**: React 18, React Router 6, Axios, CSS Variables
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Auth**: JWT tokens, bcryptjs
- **Fonts**: Poppins + Noto Sans Telugu
