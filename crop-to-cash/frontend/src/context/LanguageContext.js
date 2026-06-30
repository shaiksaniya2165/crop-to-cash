import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Nav
    home: 'Home', community: 'Community', weather: 'Weather', cropSuggest: 'Crop Advisor',
    requests: 'Market Requests', logout: 'Logout', login: 'Login', register: 'Register',
    adminLogin: 'Admin Login', adminPanel: 'Admin Panel',
    // Auth
    mobileNumber: 'Mobile Number', password: 'Password', name: 'Full Name',
    village: 'Village', district: 'District', landType: 'Land Type', signIn: 'Sign In',
    signUp: 'Sign Up', dontHaveAccount: "Don't have an account?", alreadyHaveAccount: 'Already have an account?',
    // Home
    cropRates: 'Live Crop Rates', todayRates: "Today's Market Rates", perQuintal: 'per quintal',
    welcomeTitle: 'Empowering Farmers', welcomeSubtitle: 'Real-time crop prices, weather forecasts & direct market access',
    // Weather
    weatherForecast: 'Weather Forecast', humidity: 'Humidity', wind: 'Wind', rainChance: 'Rain Chance',
    feelsLike: 'Feels Like', pressure: 'Pressure',
    // Crop Suggest
    soilType: 'Soil Type', getSuggestion: 'Get Suggestion', recommendedCrops: 'Recommended Crops',
    suggestedPesticides: 'Suggested Pesticides', farmingTips: 'Farming Tips',
    clay: 'Clay Soil', loamy: 'Loamy Soil', sandy: 'Sandy Soil', red: 'Red Soil', black: 'Black Cotton Soil',
    // Community
    postQuestion: 'Post a Question', yourQuestion: 'Your Question', description: 'Description',
    category: 'Category', submit: 'Submit', reply: 'Reply', like: 'Like', viewReplies: 'View Replies',
    // Requests
    availableRequests: 'Available Crop Requests', quantity: 'Quantity', price: 'Price',
    acceptRequest: 'Accept Request', enterAddress: 'Enter your address', yourMobile: 'Your Mobile',
    confirm: 'Confirm', accepted: 'Accepted', open: 'Open', completed: 'Completed',
    // Admin
    postRequest: 'Post Crop Request', cropName: 'Crop Name', yourRequests: 'Your Requests',
    farmerDetails: 'Farmer Details', address: 'Address', markComplete: 'Mark Complete', delete: 'Delete',
    noRequests: 'No requests yet', adminDashboard: 'Admin Dashboard',
    totalRequests: 'Total Requests', acceptedRequests: 'Accepted Requests', pendingRequests: 'Pending',
    adminName: 'Admin Name',
    pest: 'Pest/Disease', market: 'Market', general: 'General', disease: 'Disease',
    noPostsYet: 'No posts yet. Be the first to ask!',
    postNow: 'Post Now', cancel: 'Cancel',
    language: 'Language',
  },
  te: {
    // Nav
    home: 'హోమ్', community: 'సమాజం', weather: 'వాతావరణం', cropSuggest: 'పంట సలహా',
    requests: 'మార్కెట్ అభ్యర్థనలు', logout: 'లాగ్ అవుట్', login: 'లాగిన్', register: 'నమోదు',
    adminLogin: 'అడ్మిన్ లాగిన్', adminPanel: 'అడ్మిన్ పానెల్',
    // Auth
    mobileNumber: 'మొబైల్ నంబర్', password: 'పాస్‌వర్డ్', name: 'పూర్తి పేరు',
    village: 'గ్రామం', district: 'జిల్లా', landType: 'భూమి రకం', signIn: 'సైన్ ఇన్',
    signUp: 'సైన్ అప్', dontHaveAccount: 'ఖాతా లేదా?', alreadyHaveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
    // Home
    cropRates: 'లైవ్ పంట ధరలు', todayRates: 'నేటి మార్కెట్ ధరలు', perQuintal: 'క్వింటాల్ కు',
    welcomeTitle: 'రైతులను శక్తివంతం చేయడం', welcomeSubtitle: 'రియల్-టైమ్ పంట ధరలు, వాతావరణ అంచనాలు & మార్కెట్ సేవలు',
    // Weather
    weatherForecast: 'వాతావరణ అంచనా', humidity: 'తేమ', wind: 'గాలి', rainChance: 'వర్షం అవకాశం',
    feelsLike: 'అనిపిస్తుంది', pressure: 'పీడనం',
    // Crop Suggest
    soilType: 'నేల రకం', getSuggestion: 'సూచన పొందండి', recommendedCrops: 'సిఫార్సు చేయబడిన పంటలు',
    suggestedPesticides: 'సూచించిన పురుగుమందులు', farmingTips: 'వ్యవసాయ చిట్కాలు',
    clay: 'బంక మట్టి', loamy: 'లోమి మట్టి', sandy: 'ఇసుక మట్టి', red: 'ఎర్ర మట్టి', black: 'నల్ల మట్టి',
    // Community
    postQuestion: 'ప్రశ్న పోస్ట్ చేయండి', yourQuestion: 'మీ ప్రశ్న', description: 'వివరణ',
    category: 'వర్గం', submit: 'సమర్పించు', reply: 'సమాధానం', like: 'లైక్', viewReplies: 'సమాధానాలు చూడండి',
    // Requests
    availableRequests: 'అందుబాటులో ఉన్న పంట అభ్యర్థనలు', quantity: 'పరిమాణం', price: 'ధర',
    acceptRequest: 'అభ్యర్థన అంగీకరించు', enterAddress: 'మీ చిరునామా నమోదు చేయండి', yourMobile: 'మీ మొబైల్',
    confirm: 'నిర్ధారించు', accepted: 'అంగీకరించబడింది', open: 'తెరిచి ఉంది', completed: 'పూర్తయింది',
    // Admin
    postRequest: 'పంట అభ్యర్థన పోస్ట్ చేయండి', cropName: 'పంట పేరు', yourRequests: 'మీ అభ్యర్థనలు',
    farmerDetails: 'రైతు వివరాలు', address: 'చిరునామా', markComplete: 'పూర్తి గుర్తించు', delete: 'తొలగించు',
    noRequests: 'ఇంకా అభ్యర్థనలు లేవు', adminDashboard: 'అడ్మిన్ డాష్‌బోర్డ్',
    totalRequests: 'మొత్తం అభ్యర్థనలు', acceptedRequests: 'అంగీకరించిన అభ్యర్థనలు', pendingRequests: 'పెండింగ్',
    adminName: 'అడ్మిన్ పేరు',
    pest: 'పురుగు/వ్యాధి', market: 'మార్కెట్', general: 'సాధారణ', disease: 'వ్యాధి',
    noPostsYet: 'ఇంకా పోస్టులు లేవు. మొదట అడగండి!',
    postNow: 'ఇప్పుడు పోస్ట్ చేయండి', cancel: 'రద్దు చేయండి',
    language: 'భాష',
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('c2c_lang') || 'en');
  const t = (key) => translations[lang][key] || key;
  const changeLang = (l) => { setLang(l); localStorage.setItem('c2c_lang', l); };
  return (
    <LanguageContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() { return useContext(LanguageContext); }
