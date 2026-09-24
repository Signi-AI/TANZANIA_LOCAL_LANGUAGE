/* LocalLang Tanzania AI — language selector, slow language slider and UI translation */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const languages = [
  ["Kisukuma","Mawasiliano ya Kisukuma na Kiswahili kwa mazungumzo, tafsiri na mazoezi ya lugha."],
  ["Kiha","Msaada wa mawasiliano ya Kiha na Kiswahili katika mazingira ya kila siku."],
  ["Nyakyusa","Mawasiliano ya Nyakyusa, tafsiri na muktadha wa mtumiaji."],
  ["Kichaga","Maktaba ya Kichaga kwa mawasiliano, kujifunza na tafsiri."],
  ["Kihehe","Mawasiliano ya Kihehe na Kiswahili kwa matumizi ya jamii."],
  ["Kihaya","Msaada wa Kihaya kwa mazungumzo na huduma za lugha."],
  ["Kinyamwezi","Mawasiliano ya Kinyamwezi na lugha lengwa kupitia mfumo wa AI."],
  ["Kigogo","Msaada wa Kigogo kwa mazungumzo ya kawaida na huduma."],
  ["Kimakonde","Mawasiliano ya Kimakonde na Kiswahili."],
  ["Kiyao","Msaada wa Kiyao kwa mazungumzo na kujifunza."],
  ["Kizaramo","Mawasiliano ya Kizaramo katika mazingira ya jamii."],
  ["Kingoni","Msaada wa Kingoni na Kiswahili."],
  ["Kibena","Maktaba ya Kibena kwa mawasiliano."],
  ["Kijita","Msaada wa Kijita na Kiswahili."],
  ["Kikurya","Mawasiliano ya Kikurya na tafsiri."],
  ["Kimeru","Msaada wa Kimeru kwa mawasiliano."],
  ["Kipare","Mawasiliano ya Kipare na Kiswahili."],
  ["Kishambaa","Msaada wa Kishambaa katika mazungumzo."],
  ["Kizigua","Mawasiliano ya Kizigua na Kiswahili."],
  ["Kirangi","Msaada wa Kirangi katika mawasiliano."],
  ["Kiiraqw","Maktaba ya Kiiraqw kwa mawasiliano."],
  ["Kimaasai","Msaada wa mawasiliano ya Kimaasai."],
  ["Kisandawe","Mawasiliano ya Kisandawe na Kiswahili."],
  ["Kinyaturu","Msaada wa Kinyaturu kwa mazungumzo."],
  ["Kihadzabe","Msaada wa lugha ya Hadzabe katika utafiti na uhifadhi."],
  ["Kinyiramba","Mawasiliano ya Kinyiramba na Kiswahili."],
  ["Kifipa","Msaada wa Kifipa kwa mawasiliano."],
  ["Kimatengo","Mawasiliano ya Kimatengo na Kiswahili."],
  ["Kisangu","Msaada wa Kisangu katika mazungumzo."],
  ["Kibungu","Mawasiliano ya Kibungu na Kiswahili."],
  ["Kisambaa","Msaada wa Kisambaa katika mawasiliano."],
  ["Kihehe cha Iringa","Muktadha wa Kihehe katika jamii na mawasiliano."],
  ["Kinyakyusa","Msaada wa Nyakyusa kwa mazungumzo na tafsiri."]
];

const translations = {
  sw: {
    navHome:"Mwanzo",navHow:"Jinsi inavyofanya kazi",navUsers:"Wataalamu",navFeatures:"Features",navPurpose:"Faida",navDocs:"Documentation",start:"Anza kutumia →",
    eyebrow:"AKILI BANDIA KWA LUGHA ZA TANZANIA",heroDescription:"LocalLang Tanzania AI inaleta tafsiri, mazungumzo na teknolojia ya lugha karibu na jamii za Tanzania.",try:"Jaribu mfumo →",learn:"Jinsi inavyofanya kazi",statLanguages:"Lugha zinazolengwa",statContexts:"Miktadha ya matumizi",statAccess:"Upatikanaji unaolengwa",heritage:"UTAMADUNI · LUGHA · TEKNOLOJIA",chooseLanguage:"Chagua lugha",
    howEyebrow:"JINSI INAVYOFANYA KAZI",howTitle:"Kutoka <span>lugha</span> hadi maana.",howIntro:"Mfumo hupokea ujumbe, hutambua lugha na muktadha, huchakata taarifa, kisha hutoa jibu linaloeleweka.",step1Title:"Mtumiaji anaongea",step1Text:"Anaandika au kuzungumza kwa lugha anayochagua.",step2Title:"AI inaelewa",step2Text:"NLP hutambua maneno, muktadha na mahitaji ya mazungumzo.",step3Title:"Inatafsiri",step3Text:"Mfumo huunganisha lugha ya chanzo na lugha lengwa.",step4Title:"Jibu linatoka",step4Text:"Mtumiaji hupata jibu kwa lugha na muktadha unaofaa.",
    usersEyebrow:"WATAALAMU NA WATUMIAJI",usersTitle:"AI kwa maisha <span>halisi.</span>",usersIntro:"Teknolojia inaweza kubadilika kulingana na mazingira ya mtumiaji.",health:"AFYA",healthTitle:"Daktari ↔ Mgonjwa",healthText:"Mawasiliano rahisi kati ya mhudumu wa afya na mgonjwa kwa lugha anayoielewa.",education:"ELIMU",educationTitle:"Mwalimu ↔ Mwanafunzi",educationText:"Maswali, maelezo na kujifunza kwa lugha inayomfikia mwanafunzi.",community:"JAMII",communityTitle:"Wananchi ↔ Huduma",communityText:"Taarifa na huduma za jamii kufikika kwa lugha mbalimbali.",culture:"UTAMADUNI",cultureTitle:"Lugha ↔ Urithi",cultureText:"Kukusanya, kuhifadhi na kutumia lugha za asili kwenye teknolojia.",
    featuresEyebrow:"VIPENGELE",featuresTitle:"Kila kitu kwa <span>lugha yako.</span>",featuresIntro:"Muundo umejengwa ukiweka lugha, sauti, tafsiri na uzoefu wa mtumiaji mbele.",f1Title:"Lugha nyingi",f1Text:"Chagua lugha ya Tanzania na ubadilishe kichwa cha mfumo papo hapo.",f2Title:"Sauti",f2Text:"Andika, ongea, rekodi na sikiliza majibu kwa uzoefu wa mawasiliano wa asili.",f3Title:"Muktadha wa AI",f3Text:"Afya, elimu, jamii na mazungumzo ya kawaida vinaweza kutenganishwa.",f4Title:"API tayari",f4Text:"Inaweza kuunganishwa na FastAPI, database na model ya lugha ya mradi.",f5Title:"Maktaba ya lugha",f5Text:"Msamiati, sentensi, tafsiri na metadata vinaweza kukusanywa kwa ajili ya training.",f6Title:"Usalama na udhibiti",f6Text:"Muundo unaweza kuongezewa authentication, roles na ruhusa za API.",
    purposeEyebrow:"LENGO LA MRADI",purposeTitle:"Teknolojia isimuache <span>mtanzania nyuma.</span>",purposeText:"LocalLang Tanzania AI inalenga kupunguza kikwazo cha lugha katika afya, elimu, huduma za jamii, biashara, utafiti na uhifadhi wa lugha.",p1Title:"Afya",p1Text:"Mawasiliano bora kati ya mgonjwa na mhudumu.",p2Title:"Elimu",p2Text:"Maarifa yanayofikika kwa lugha mbalimbali.",p3Title:"Uhifadhi",p3Text:"Kulinda maneno, sauti na maarifa ya jamii.",p4Title:"Teknolojia",p4Text:"API na data kwa waendelezaji wa kizazi kijacho.",footer:"Akili Bandia kwa lugha za Tanzania · Umoja kupitia teknolojia · 2026"
  },
  en: {
    navHome:"Home",navHow:"How it works",navUsers:"Professionals",navFeatures:"Features",navPurpose:"Benefits",navDocs:"Documentation",start:"Start using →",
    eyebrow:"ARTIFICIAL INTELLIGENCE FOR TANZANIAN LANGUAGES",heroDescription:"LocalLang Tanzania AI brings translation, conversation and language technology closer to communities across Tanzania.",try:"Try the system →",learn:"How it works",statLanguages:"Targeted languages",statContexts:"Use contexts",statAccess:"Target availability",heritage:"CULTURE · LANGUAGE · TECHNOLOGY",chooseLanguage:"Choose a language",
    howEyebrow:"HOW IT WORKS",howTitle:"From <span>language</span> to meaning.",howIntro:"The system receives a message, identifies language and context, processes the information, then returns an understandable response.",step1Title:"User speaks",step1Text:"The user writes or speaks in the selected language.",step2Title:"AI understands",step2Text:"NLP identifies words, context and conversation needs.",step3Title:"It translates",step3Text:"The system connects the source language with the target language.",step4Title:"Answer returns",step4Text:"The user receives a response in the appropriate language and context.",
    usersEyebrow:"PROFESSIONALS AND USERS",usersTitle:"AI for <span>real life.</span>",usersIntro:"The technology can adapt to the user's environment.",health:"HEALTH",healthTitle:"Doctor ↔ Patient",healthText:"Simple communication between health workers and patients in a language they understand.",education:"EDUCATION",educationTitle:"Teacher ↔ Student",educationText:"Questions, explanations and learning in a language that reaches the student.",community:"COMMUNITY",communityTitle:"Citizens ↔ Services",communityText:"Community information and services accessible in multiple languages.",culture:"CULTURE",cultureTitle:"Language ↔ Heritage",cultureText:"Collecting, preserving and using local languages in technology.",
    featuresEyebrow:"FEATURES",featuresTitle:"Everything in <span>your language.</span>",featuresIntro:"The design puts language, voice, translation and user experience first.",f1Title:"Many languages",f1Text:"Choose a Tanzanian language and change the system heading instantly.",f2Title:"Voice",f2Text:"Write, speak, record and listen to responses for a natural communication experience.",f3Title:"AI context",f3Text:"Health, education, community and general conversation can be separated.",f4Title:"API ready",f4Text:"It can connect to FastAPI, a database and the project's language model.",f5Title:"Language library",f5Text:"Vocabulary, sentences, translations and metadata can be collected for training.",f6Title:"Security and control",f6Text:"The system can be extended with authentication, roles and API permissions.",
    purposeEyebrow:"PROJECT GOAL",purposeTitle:"Technology should leave <span>no Tanzanian behind.</span>",purposeText:"LocalLang Tanzania AI aims to reduce the language barrier in health, education, community services, business, research and language preservation.",p1Title:"Health",p1Text:"Better communication between patients and providers.",p2Title:"Education",p2Text:"Knowledge accessible in multiple languages.",p3Title:"Preservation",p3Text:"Protecting community words, voices and knowledge.",p4Title:"Technology",p4Text:"API and data for next-generation developers.",footer:"Artificial intelligence for Tanzanian languages · Unity through technology · 2026"
  }
};

let selectedLanguage = "Kisukuma";
let uiLanguage = localStorage.getItem("locallang-ui") || "sw";

function buildLanguageSlider(){
  const track = $("#tribeTrack");
  const doubled = [...languages,...languages];
  track.innerHTML = doubled.map(([name],i)=>`<button class="tribe-pill ${i===0?"active":""}" data-language="${name}"><span>🇹🇿</span> ${name}</button>`).join("");
  $$(".tribe-pill").forEach(btn=>btn.addEventListener("click",()=>chooseLanguage(btn.dataset.language)));
}

function chooseLanguage(name){
  selectedLanguage = languages.some(x=>x[0]===name) ? name : languages[0][0];
  $$(".tribe-pill").forEach(btn=>btn.classList.toggle("active",btn.dataset.language===selectedLanguage));
  updateHeroHeading();
}

function updateHeroHeading(){
  const h = $("#mainHeading");
  if(uiLanguage === "en") h.innerHTML = `AI that speaks and translates <span>${selectedLanguage}.</span>`;
  else h.innerHTML = `Teknolojia inayozungumza na kutafsiri <span>${selectedLanguage}.</span>`;
  document.title = `LocalLang Tanzania AI — ${selectedLanguage}`;
}

function applyUILanguage(lang){
  uiLanguage = lang;
  localStorage.setItem("locallang-ui",lang);
  document.documentElement.lang = lang;
  $("#uiLanguage").value = lang;
  const dict = translations[lang];
  $$('[data-i18n]').forEach(el=>{
    const key = el.dataset.i18n;
    if(dict[key] !== undefined) el.innerHTML = dict[key];
  });
  updateHeroHeading();
}

$("#uiLanguage").addEventListener("change", e=>applyUILanguage(e.target.value));

const mobileMenu = $("#mobileMenu");
mobileMenu.addEventListener("click",()=>$("#siteNav").classList.toggle("open"));
$$("#siteNav a").forEach(a=>a.addEventListener("click",()=>$("#siteNav").classList.remove("open")));

// Reveal animation without hiding content if JS is unavailable.
const revealItems = $$(".reveal");
if("IntersectionObserver" in window){
  revealItems.forEach(el=>el.classList.add("ready"));
  const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}
  }),{threshold:.12});
  revealItems.forEach(el=>observer.observe(el));
}

buildLanguageSlider();
applyUILanguage(uiLanguage);
chooseLanguage(selectedLanguage);
