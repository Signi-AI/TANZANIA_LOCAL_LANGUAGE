const tribes = [
    "Sukuma", "Nyamwezi", "Chagga", "Haya", "Hehe", "Nyakyusa", "Gogo", "Makonde", "Yao", "Zaramo",
    "Ha", "Bena", "Fipa", "Luguru", "Kuria", "Iraqw", "Maasai", "Datooga", "Rangi", "Sambaa",
    "Zigua", "Ndebele", "Ngoni", "Bondei", "Mwera", "Matumbi", "Ndendeule", "Bembe", "Jita", "Kerewe",
    "Zanaki", "Kisii", "Kabwa", "Kurya", "Rombo", "Pare", "Shambala", "Mbugwe", "Mambwe", "Safwa",
    "Kingindo", "Kwere", "Vidunda", "Kaguru", "Kutu", "Pogoro", "Ndali", "Wanji", "Bungu", "Sagara"
];

const professionals = [
    { img: "image/doctors.jpg", label: { sw: "AFYA", en: "HEALTH" }, title: { sw: "Daktari ↔ Mgonjwa", en: "Doctor ↔ Patient" }, text: { sw: "Mawasiliano rahisi kati ya mhudumu wa afya na mgonjwa.", en: "Simple communication between health workers and patients." } },
    { img: "image/teachers.jpg", label: { sw: "ELIMU", en: "EDUCATION" }, title: { sw: "Mwalimu ↔ Mwanafunzi", en: "Teacher ↔ Student" }, text: { sw: "Maswali, maelezo na kujifunza kwa lugha inayomfikia mwanafunzi.", en: "Questions, explanations and learning in a language that reaches the student." } },
    { img: "image/social.jpg", label: { sw: "JAMII", en: "COMMUNITY" }, title: { sw: "Wananchi ↔ Huduma", en: "Citizens ↔ Services" }, text: { sw: "Taarifa na huduma za jamii kufikika kwa lugha mbalimbali.", en: "Community information and services available in multiple languages." } },
    { img: "image/recommendation.jpg", label: { sw: "UTAMADUNI", en: "CULTURE" }, title: { sw: "Lugha ↔ Urithi", en: "Language ↔ Heritage" }, text: { sw: "Kukusanya, kuhifadhi na kutumia lugha za asili kwenye teknolojia.", en: "Collecting, preserving and using indigenous languages in technology." } },
    { img: "image/doctors ss.jpg", label: { sw: "USHAURI WA AFYA", en: "HEALTH ADVICE" }, title: { sw: "Mtaalamu ↔ Mgonjwa", en: "Expert ↔ Patient" }, text: { sw: "Mawasiliano ya sauti au maandishi yanayoweza kueleweka.", en: "Voice or text communication that can be understood clearly." } },
    { img: "image/General communication.jpg", label: { sw: "MAZUNGUMZO", en: "CONVERSATION" }, title: { sw: "Jamii ↔ Jamii", en: "Community ↔ Community" }, text: { sw: "Watu hushirikishana taarifa na maarifa kwa lugha wanayoifahamu.", en: "People share information and knowledge in languages they understand." } },
    { img: "image/general.jpg", label: { sw: "BIASHARA", en: "BUSINESS" }, title: { sw: "Mteja ↔ Huduma", en: "Customer ↔ Service" }, text: { sw: "Maagizo na huduma kuwa rahisi na za haraka.", en: "Clear instructions and services that are quick and simple." } },
    { img: "image/safi.jpg", label: { sw: "AI", en: "AI" }, title: { sw: "Mtumiaji ↔ AI", en: "User ↔ AI" }, text: { sw: "Uliza kwa kuandika au kuongea, kisha pata jibu lenye muktadha.", en: "Ask by typing or speaking, then receive a context-aware answer." } }
];

function imageFallback(img) {
    img.onerror = () => {
        img.onerror = null;
        img.src = "image/safi.jpg";
    };
}

function buildTribes() {
    const track = document.getElementById("tribeTrack");
    const items = [...tribes, ...tribes];
    track.innerHTML = items.map((name, i) =>
        `<span class="tribe-chip whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold shadow-sm dark:border-slate-700 dark:bg-slate-900">${name}</span>`
    ).join("");
}

function buildProfessionals(lang = 'sw') {
    const track = document.getElementById("proTrack");
    const cards = [...professionals, ...professionals];
    track.innerHTML = cards.map((entry) => `
    <article class="w-[290px] shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:w-[340px]">
      <img src="${entry.img}" class="h-56 w-full object-cover" alt="${entry.title[lang]}" onerror="this.onerror=null;this.src='image/safi.jpg'">
      <div class="p-6">
        <div class="text-[10px] font-black tracking-[.18em] text-slate-400">${entry.label[lang]}</div>
        <h3 class="mt-2 text-xl font-extrabold">${entry.title[lang]}</h3>
        <p class="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-300">${entry.text[lang]}</p>
      </div>
    </article>
  `).join("");
}

function setupTheme() {
    const btn = document.getElementById("themeBtn");
    const book = document.getElementById("themeBook");
    const saved = localStorage.getItem("locallang-theme");
    document.documentElement.classList.toggle("dark", saved === "dark");
    updateIcon();
    btn.addEventListener("click", () => {
        book.classList.remove("is-opening");
        void book.offsetWidth;
        book.classList.add("is-opening");
        document.documentElement.classList.toggle("dark");
        localStorage.setItem("locallang-theme",
            document.documentElement.classList.contains("dark") ? "dark" : "light");
        updateIcon();
        window.setTimeout(() => book.classList.remove("is-opening"), 760);
    });

    function updateIcon() {
        const isDark = document.documentElement.classList.contains("dark");
        btn.textContent = isDark ? "☀" : "☾";
        btn.setAttribute("aria-pressed", String(isDark));
        btn.setAttribute("aria-label", isDark ? "Washa light mode" : "Washa dark mode");
    }

    window.addEventListener("storage", (event) => {
        if (event.key !== "locallang-theme") return;
        document.documentElement.classList.toggle("dark", event.newValue === "dark");
        updateIcon();
    });
}

function setupMobileMenu() {
    const button = document.getElementById("mobileMenu");
    const nav = document.getElementById("mobileNav");
    button.addEventListener("click", () => nav.classList.toggle("hidden"));
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.add("hidden")));
}

function setupReveal() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

let currentLanguage = 'sw';

function setupLanguageSelector() {
    const select = document.getElementById("uiLanguage");
    const savedLanguage = localStorage.getItem("locallang-ui");
    if (savedLanguage === "sw" || savedLanguage === "en") {
        select.value = savedLanguage;
    }
    const translations = {
        sw: {
            "nav.home": "Mwanzo",
            "nav.maktaba": "Maktaba",
            "nav.languages": "Lugha",
            "nav.how": "Jinsi inavyofanya kazi",
            "nav.professionals": "Wataalamu",
            "nav.features": "Vipengele",
            "nav.maelezo": "Maelezo",
            "nav.start": "Anza kutumia →",
            "hero.kicker": "AI kwa lugha za Tanzania",
            "hero.title1": "Tafsiri na zungumza",
            "hero.title2": "lugha za Tanzania.",
            "hero.description": "Tanlingo hurahisisha mawasiliano kwa lugha za Tanzania.",
            "hero.ctaPrimary": "Jaribu mfumo →",
            "hero.ctaSecondary": "Jinsi inavyofanya kazi",
            "hero.stat1": "Lugha / makabila",
            "hero.stat2": "Miktadha ya matumizi",
            "hero.stat3": "Tafsiri & mawasiliano",
            "languages.title": "Chagua / gundua lugha za Tanzania",
            "how.kicker": "Jinsi inavyofanya kazi",
            "how.title1": "Kutoka",
            "how.title2": "lugha",
            "how.title3": "hadi maana.",
            "how.description": "Mfumo hupokea ujumbe, hutambua lugha na muktadha, huchakata taarifa, kisha hutoa jibu linaloeleweka.",
            "how.card1.title": "Mtumiaji anaongea",
            "how.card1.text": "Anaandika au kuzungumza kwa lugha anayochagua.",
            "how.card2.title": "AI inaelewa",
            "how.card2.text": "NLP hutambua maneno, muktadha na mahitaji ya mazungumzo.",
            "how.card3.title": "Inatafsiri",
            "how.card3.text": "Lugha ya chanzo huunganishwa na lugha lengwa.",
            "how.card4.title": "Jibu linatoka",
            "how.card4.text": "Mtumiaji hupata jibu kwa lugha na muktadha unaofaa.",
            "professionals.kicker": "Wataalamu & maisha halisi",
            "professionals.title1": "AI kwa maisha",
            "professionals.title2": "halisi.",
            "professionals.description": "Mifano ya mawasiliano yanayoweza kubadilika kulingana na mazingira ya mtumiaji.",
            "features.kicker": "Vipengele",
            "features.title1": "Kila kitu kwa",
            "features.title2": "lugha yako.",
            "features.description": "Muundo wa kuanzia kwa translation, voice, conversation, language data na API.",
            "features.card1.title": "Lugha nyingi",
            "features.card1.text": "Chagua lugha za Tanzania na uendelee kupanua mfumo.",
            "features.card2.title": "Sauti",
            "features.card2.text": "Andika, ongea, sikiliza na jenga uzoefu wa mawasiliano wa asili.",
            "features.card3.title": "Muktadha wa AI",
            "features.card3.text": "Afya, elimu, jamii na mazungumzo ya kawaida vinaweza kutenganishwa.",
            "features.card4.title": "API tayari",
            "features.card4.text": "Inaweza kuunganishwa na FastAPI, database na language model.",
            "features.card5.title": "Maktaba ya lugha",
            "features.card5.text": "Msamiati, sentensi, tafsiri na metadata vinaweza kukusanywa.",
            "features.card6.title": "Usalama",
            "features.card6.text": "Muundo unaweza kuongezewa authentication, roles na ruhusa za API.",
            "project.kicker": "Lengo la mradi",
            "project.title1": "Teknolojia isimuache",
            "project.title2": "Mtanzania nyuma.",
            "project.description": "Kupunguza kikwazo cha lugha katika afya, elimu, huduma za jamii, biashara, utafiti na uhifadhi wa lugha.",
            "project.item1.title": "01 · Afya",
            "project.item1.text": "Mawasiliano bora kati ya mgonjwa na mhudumu.",
            "project.item2.title": "02 · Elimu",
            "project.item2.text": "Maarifa yanayofikika kwa lugha mbalimbali.",
            "project.item3.title": "03 · Uhifadhi",
            "project.item3.text": "Kulinda maneno, sauti na maarifa ya jamii.",
            "project.item4.title": "04 · Teknolojia",
            "project.item4.text": "API na data kwa waendelezaji wa kizazi kijacho.",
            "footer.description": "Teknolojia ya lugha inayounganisha watu, inalinda urithi wa lugha, na kurahisisha upatikanaji wa maarifa Tanzania.",
            "footer.focus": "Tunacholenga",
            "footer.focusText": "Lugha · Jamii · Elimu · Afya · Ubunifu",
            "footer.github": "Akaunti za GitHub",
            "footer.connect": "Tupate mtandaoni",
            "footer.motto": "Akili bandia kwa lugha za Tanzania · Umoja kupitia teknolojia"
        },
        en: {
            "nav.home": "Home",
            "nav.maktaba": "Library",
            "nav.languages": "Languages",
            "nav.how": "How it works",
            "nav.professionals": "Professionals",
            "nav.features": "Features",
            "nav.maelezo": "Documentation",
            "nav.start": "Start using →",
            "hero.kicker": "AI for Tanzanian languages",
            "hero.title1": "Translate and speak",
            "hero.title2": "Tanzanian languages.",
            "hero.description": "Tanlingo makes communication in Tanzanian languages easier.",
            "hero.ctaPrimary": "Try the system →",
            "hero.ctaSecondary": "How it works",
            "hero.stat1": "Languages / tribes",
            "hero.stat2": "Use cases",
            "hero.stat3": "Translation & communication",
            "languages.title": "Choose / discover Tanzanian languages",
            "how.kicker": "How it works",
            "how.title1": "From",
            "how.title2": "language",
            "how.title3": "to meaning.",
            "how.description": "The system receives messages, identifies language and context, processes information, and returns a clear answer.",
            "how.card1.title": "User speaks",
            "how.card1.text": "The user writes or speaks in their chosen language.",
            "how.card2.title": "AI understands",
            "how.card2.text": "NLP recognizes words, context, and conversation needs.",
            "how.card3.title": "It translates",
            "how.card3.text": "A source language connects with a target language.",
            "how.card4.title": "Response is delivered",
            "how.card4.text": "The user receives a response in a suitable language and context.",
            "professionals.kicker": "Professionals & real life",
            "professionals.title1": "AI for real",
            "professionals.title2": "life.",
            "professionals.description": "Examples of communication that can adapt to the user's environment.",
            "features.kicker": "Features",
            "features.title1": "Everything for",
            "features.title2": "your language.",
            "features.description": "A foundation for translation, voice, conversation, language data and APIs.",
            "features.card1.title": "Many languages",
            "features.card1.text": "Choose Tanzanian languages and expand the system.",
            "features.card2.title": "Voice",
            "features.card2.text": "Write, speak, listen and build meaningful local communication.",
            "features.card3.title": "AI context",
            "features.card3.text": "Health, education, communities and everyday conversation can be separated.",
            "features.card4.title": "API ready",
            "features.card4.text": "Can connect to FastAPI, databases and language models.",
            "features.card5.title": "Language library",
            "features.card5.text": "Vocabulary, sentences, translations and metadata can be collected.",
            "features.card6.title": "Security",
            "features.card6.text": "The system can be extended with authentication, roles and API permissions.",
            "project.kicker": "Project goal",
            "project.title1": "Technology that does not leave",
            "project.title2": "Tanzania behind.",
            "project.description": "Reducing language barriers in health, education, community services, business, research and language preservation.",
            "project.item1.title": "01 · Health",
            "project.item1.text": "Better communication between patient and provider.",
            "project.item2.title": "02 · Education",
            "project.item2.text": "Knowledge available in many languages.",
            "project.item3.title": "03 · Preservation",
            "project.item3.text": "Protecting words, voices and community knowledge.",
            "project.item4.title": "04 · Technology",
            "project.item4.text": "API and data for future builders.",
            "footer.description": "Language technology that connects people, protects linguistic heritage, and makes knowledge more accessible across Tanzania.",
            "footer.focus": "Our focus",
            "footer.focusText": "Languages · Communities · Education · Health · Innovation",
            "footer.github": "GitHub accounts",
            "footer.connect": "Connect with us",
            "footer.motto": "AI for Tanzanian languages · Unity through technology"
        }
    };

    const translatePage = (lang) => {
        const dictionary = translations[lang] || translations.sw;
        currentLanguage = lang;
        document.documentElement.lang = lang;
        document.querySelectorAll("[data-i18n]").forEach((element) => {
            if (dictionary[element.dataset.i18n]) {
                element.textContent = dictionary[element.dataset.i18n];
            }
        });
        buildProfessionals(currentLanguage);
    };

    select.addEventListener("change", () => {
        localStorage.setItem("locallang-ui", select.value);
        translatePage(select.value);
    });

    window.addEventListener("storage", (event) => {
        if (event.key !== "locallang-ui" || (event.newValue !== "sw" && event.newValue !== "en")) return;
        select.value = event.newValue;
        translatePage(event.newValue);
    });

    translatePage(select.value || "sw");
}

document.addEventListener("DOMContentLoaded", () => {
    buildTribes();
    buildProfessionals();
    setupTheme();
    setupMobileMenu();
    setupReveal();
    setupLanguageSelector();
    document.querySelectorAll("img").forEach(imageFallback);
});
document.addEventListener("DOMContentLoaded", () => {

    const mobileMenu = document.getElementById("mobileMenu");
    const mobileNav = document.getElementById("mobileNav");

    if (!mobileMenu || !mobileNav) return;

    mobileMenu.addEventListener("click", () => {

        const isOpen = !mobileNav.classList.contains("hidden");

        mobileNav.classList.toggle("hidden");

        mobileMenu.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );

        // Change icon
        mobileMenu.textContent = isOpen ? "☰" : "✕";
    });


    // Close menu after clicking a link
    mobileNav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            mobileNav.classList.add("hidden");

            mobileMenu.textContent = "☰";

            mobileMenu.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

});