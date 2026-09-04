export interface TranslationDictionary {
  appTitle: string;
  appSubtitle: string;
  home: string;
  assistant: string;
  classifier: string;
  tkdl: string;
  abs: string;
  whatif: string;
  passport: string;
  architecture: string;
  indiaRegime: string;
  internationalRegime: string;
  lawVersion: string;
  language: string;
  askPlaceholder: string;
  launchQuery: string;
  exploreArch: string;
  exportPdf: string;
}

export const TRANSLATIONS: Record<string, TranslationDictionary> = {
  en: {
    appTitle: 'IP-SAKTI Sahayak',
    appSubtitle: 'Source-Cited Legal & Regulatory Decision Assistant',
    home: 'Home',
    assistant: 'AI Assistant & RAG',
    classifier: 'Product Classifier',
    tkdl: 'TKDL Overlap Radar',
    abs: 'ABS Biodiversity Checker',
    whatif: 'What-If Simulator',
    passport: 'IP Readiness Passport',
    architecture: 'Architecture Blueprint',
    indiaRegime: 'India Regime',
    internationalRegime: 'International (EU/US/WIPO)',
    lawVersion: 'Law Version:',
    language: 'Language:',
    askPlaceholder: 'Ask about ANY Ayurvedic formulation, patentability, ABS clearance, TKDL prior-art, or export regulatory requirements...',
    launchQuery: 'Launch Query Engine',
    exploreArch: 'Explore 5-Layer Architecture',
    exportPdf: 'Export Official Passport PDF',
  },
  hi: {
    appTitle: 'आईपी-शक्ति सहायक',
    appSubtitle: 'स्रोतों द्वारा प्रमाणित कानूनी और विनियामक निर्णय सहायक',
    home: 'मुख्य पृष्ठ',
    assistant: 'एआई सहायक और आरएजी',
    classifier: 'उत्पाद वर्गीकरण',
    tkdl: 'टीकेडीएल पूर्व-ज्ञान रडार',
    abs: 'जैव विविधता अनुपालन जाँच',
    whatif: 'व्हाट-इफ सिम्युलेटर',
    passport: 'आईपी तैयारी पासपोर्ट',
    architecture: 'आर्किटेक्चर ब्लूप्रिंट',
    indiaRegime: 'भारतीय कानून',
    internationalRegime: 'अंतर्राष्ट्रीय (यूरोपीय संघ/अमेरिका/विपो)',
    lawVersion: 'कानून संस्करण:',
    language: 'भाषा:',
    askPlaceholder: 'किसी भी आयुर्वेदिक औषधि, पेटेंट योग्यता, एनबीए मंजूरी, या टीकेडीएल पूर्व-ज्ञान के बारे में पूछें...',
    launchQuery: 'खोज इंजन शुरू करें',
    exploreArch: '5-स्तरीय आर्किटेक्चर देखें',
    exportPdf: 'आधिकारिक पासपोर्ट पीडीएफ डाउनलोड करें',
  },
  sa: {
    appTitle: 'आईपी-शक्ति सहायकः',
    appSubtitle: 'प्रमाणित-विधि-नियामक-निर्णय-सहायकः',
    home: 'मुख्यद्वारम्',
    assistant: 'एआई सहायकः',
    classifier: 'उत्पाद वर्गीकरणम्',
    tkdl: 'पारम्परिकज्ञान-रडारः',
    abs: 'जैवविविधता-अनुपालनम्',
    whatif: 'सम्भावना-सिम्युलेटरः',
    passport: 'आईपी सज्जता पत्रम्',
    architecture: 'तन्त्र-संरचना',
    indiaRegime: 'भारतीयविधिः',
    internationalRegime: 'अन्तर्राष्ट्रीयविधिः',
    lawVersion: 'विधि-संस्करणम्:',
    language: 'भाषा:',
    askPlaceholder: 'आयुर्वेदीय-औषधस्य पेटेंट-योग्यतां पारम्परिकज्ञानं वा पृच्छतु...',
    launchQuery: 'अन्वेषणं प्रारभताम्',
    exploreArch: 'संरचनां पश्यतु',
    exportPdf: 'पासपोर्ट-पत्रं डाउनलोड् करोतु',
  },
  ta: {
    appTitle: 'ஐபி-சக்தி உதவியாளர்',
    appSubtitle: 'ஆயுர்வேத அறிவுசார் சொத்து மற்றும் ஒழுங்குமுறை உதவியாளர்',
    home: 'முகப்பு',
    assistant: 'ஏஐ உதவியாளர்',
    classifier: 'தயாரிப்பு வகைப்பாடு',
    tkdl: 'பாரம்பரிய அறிவு ரேடார்',
    abs: 'பல்லுயிர் இணக்கம்',
    whatif: 'சாத்தியக்கூறு சிமுலேட்டர்',
    passport: 'ஐபி தயார்நிலை பாஸ்போர்ட்',
    architecture: 'கட்டமைப்பு வரைபடம்',
    indiaRegime: 'இந்திய சட்டங்கள்',
    internationalRegime: 'சர்வதேச சட்டங்கள்',
    lawVersion: 'சட்ட பதிப்பு:',
    language: 'மொழி:',
    askPlaceholder: 'ஆயுர்வேத தயாரிப்பு, காப்புரிமை தகுதி அல்லது பல்லுயிர் ஒப்புதல் பற்றி கேட்கவும்...',
    launchQuery: 'தேடலைத் தொடங்குக',
    exploreArch: 'கட்டமைப்பைப் பார்க்கவும்',
    exportPdf: 'பாஸ்போர்ட் PDF பதிவிறக்குக',
  }
};
