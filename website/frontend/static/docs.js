/* =========================================================
   TAN_LANG DOCUMENTATION
   Language + Theme + Animation + Copy + Mobile Menu
   ========================================================= */

const command = "python -m pip install Tan_lang_chatbot";

const typingTarget = document.querySelector("#typingCommand");

let index = 0;


/* =========================================================
   TRANSLATIONS
   ========================================================= */

const translations = {

    /* =====================================================
       SWAHILI
       ===================================================== */

    sw: {
        nav: "Menyu",
        navInstall: "pakua",
        navQuick: "anza haraka",
        navRoom: "Room",
        navLibrary: "Maktaba",
        navChatbot: "Chatbot",
        navIP: "IP Address",
        navCommands: "jinsi ya kutumia",
        navTroubleshooting: "Troubleshooting",
        openChatbot: "Fungua chatbot →",

        contents: "YALIYOMO",

        heroTitle: 'Jenga mawasiliano kwa <span>lugha za Tanzania.</span>',

        heroDescription: "Mwongozo rasmi wa ku-install, kutumia Tan_language, kuendesha Tan_lang_chatbot na kuunganisha vifaa viwili kwa Room Code au IP Address.",

        startInstallation: "Anza Installation",
        quickStart: "Quick Start",

        terminalReady: "✓ Tan_lang_chatbot iko tayari kutumika",

        installTitle: "Installation",

        installDescription: "Tan_language na Tan_lang_chatbot zinaweza kusakinishwa kupitia Python Package Index (PyPI). Tumia Python 3.12 au version inayoungwa mkono na package.",

        libraryInstallTitle: "Library pekee",

        libraryInstallDescription: "Kwa developer anayehitaji translation engine, Python API na CLI bila web chatbot.",

        chatbotInstallTitle: "Web Chatbot",

        chatbotInstallDescription: "Application kamili yenye backend, frontend, translation engine na Room communication.",

        copy: "Copy",
        copyAll: "Copy all",

        important: "Muhimu:",

        installNote: "Usitumie --no-deps. Pip ita-install dependencies zinazohitajika automatically.",


        quickTitle: "Quick Start",

        quickDescription: "Hii ndiyo njia ya haraka ya kusakinisha na kuanzisha Tan_lang_chatbot kwenye computer yako.",

        quickStep1Title: "Start server",

        quickStep1: "Run tan-lang-chatbot kwenye terminal.",

        quickStep2Title: "Open browser",

        localhostTitle: "Kumbuka kuhusu 127.0.0.1:",

        localhostDescription: "127.0.0.1 ni local address ya kifaa chenyewe. Kifaa kingine hakiwezi kutumia 127.0.0.1 ya PC yako kufungua server hiyo.",


        roomTitle: "Room: Kuunganisha Vifaa Viwili",

        roomDescription: "Tan_lang_chatbot inaweza kutumia Room Code kutengeneza nafasi ya pamoja ya mazungumzo. Vifaa viwili vinaweza kuingia kwenye Room moja na kushiriki conversation.",

        doctorDevice: "PC ya Daktari",

        patientDevice: "Simu ya Mgonjwa",

        roomStep1Title: "Hatua ya 1 — Anzisha chatbot",

        roomStep1: "Kwenye PC ambayo itaendesha server, anzisha chatbot:",

        roomStep2Title: "Hatua ya 2 — Tengeneza Room Code",

        roomStep2: "Kwenye chatbot, sehemu ya Room ya mazungumzo, weka code ambayo vifaa vyote vitatumia.",

        roomStep3Title: "Hatua ya 3 — Chagua role",

        deviceOne: "Kifaa cha kwanza",

        deviceTwo: "Kifaa cha pili",

        doctor: "Daktari",

        patient: "Mgonjwa",

        roomStep4Title: "Hatua ya 4 — Unganisha",

        roomStep4: "Kwenye vifaa vyote viwili, tumia Room Code ile ile kisha bonyeza Unganisha.",

        connected: "Imeunganishwa",

        roomImportant: "Muhimu:",

        roomImportantText: "Room Code hutambulisha conversation, lakini kifaa cha pili bado kinahitaji kufikia server ya chatbot kupitia network. Hapo ndipo IP Address connection inahitajika.",


        ipTitle: "Kuunganisha kwa IP Address",

        ipDescription: "Kama chatbot inaendesha kwenye PC moja na unataka simu au PC nyingine kuifikia kupitia Wi-Fi moja, tumia IP Address ya computer inayotumika kama server.",

        localhostCard: "Inatumika ndani ya computer hiyo hiyo.",

        networkIPCard: "Inaweza kutumiwa na kifaa kingine kwenye network inayoruhusu connection.",

        ipStep1Title: "Hatua ya 1 — Tafuta IP Address ya PC",

        ipStep1: "Fungua PowerShell au Command Prompt kwenye PC inayoendesha chatbot.",

        ipAddressNote: "Tafuta sehemu ya IPv4 Address. Mfano unaweza kuwa 192.168.1.10.",

        ipStep2Title: "Hatua ya 2 — Anzisha server kwenye network",

        ipStep2: "Server inapaswa kusikiliza network interface badala ya localhost pekee.",

        hostMeaning: "--host 0.0.0.0:",

        hostMeaningText: "Inafanya server isikilize interfaces za network za computer badala ya kuifunga kwenye 127.0.0.1 pekee.",

        ipStep3Title: "Hatua ya 3 — Fungua chatbot kwenye simu",

        ipStep3: "Kama PC yako ina IP Address 192.168.1.10 na server iko port 8000, kwenye browser ya simu fungua:",

        ipStep4Title: "Hatua ya 4 — Tumia Room Code ile ile",

        ipStep4: "Baada ya simu kufungua chatbot, weka Room Code inayotumiwa na PC. Kwa mfano:",

        sameNetwork: "Network:",

        sameNetworkText: "Kwa local-network setup, hakikisha vifaa vinaweza kufikia PC server kupitia network inayotumika. Wi-Fi moja mara nyingi hutumika kwa setup ya ndani, lakini router/access point inaweza kuwa na client isolation au firewall inayozuia vifaa kuwasiliana.",

        securityTitle: "Security note",

        securityText: "Usifungue server kwenye public internet bila authentication, access control na security configuration inayofaa. Mfano huu ni wa local-network development/testing.",


        libraryTitle: "Tan_language Library",

        libraryDescription: "Tan_language ni Python library inayotoa translation tools bila kuhitaji kuendesha web server. Python import name ni tll.",

        whatItDoes: "Inafanya nini?",

        libraryDoes: "Inasoma dataset iliyobundled na kutafsiri maneno au sentensi bila backend.",


        chatbotTitle: "Tan_lang_chatbot",

        chatbotDescription: "Tan_lang_chatbot ni application kamili yenye backend, frontend, translation system, voice interaction na Room-based communication.",

        featureInstall: "Install once",

        featureInstallText: "Dependencies zinaweza kusakinishwa kupitia pip.",

        featureRun: "Run command",

        featureRoom: "Join Room",

        featureRoomText: "Vifaa vinaweza kutumia Room Code inayofanana.",

        featureVoice: "Voice",

        featureVoiceText: "Mtumiaji anaweza kutumia microphone kulingana na browser na configuration ya application.",

        tokenText: "Local dataset functionality inaweza kufanya kazi bila online AI token. Online AI fallback ikiwashwa inaweza kuhitaji token iliyowekwa kwenye .env.",


        commandsTitle: "Commands Muhimu",

        cmdPython: "Kuangalia Python version",

        cmdInstallLibrary: "Kusakinisha library",

        cmdInstallChatbot: "Kusakinisha chatbot",

        cmdUpdate: "Ku-update chatbot",

        cmdHelp: "Kuona library commands",

        cmdRun: "Kuanzisha chatbot",

        cmdIP: "Kuangalia IP Address",

        cmdHost: "Ku-run server kwenye network interface",


        troubleshootingTitle: "Troubleshooting",

        troublePip: "Pip haisomi command?",

        troublePipText: "Tumia python -m pip badala ya pip. Baada ya installation unaweza kufunga na kufungua Terminal mpya.",

        troubleLocalhost: "Simu haiwezi kufungua 127.0.0.1?",

        troubleLocalhostText: "Hii ni kawaida. 127.0.0.1 ni localhost ya kifaa kinachofungua address hiyo. Tumia IP Address ya PC server, kwa mfano 192.168.1.10:8000.",

        troubleIP: "IP Address haifanyi kazi?",

        troubleIPText: "Hakikisha server imesikiliza 0.0.0.0, vifaa vinaweza kuwasiliana kwenye network, port 8000 haijazuiwa na firewall, na IP Address ni ya PC inayotumia server.",

        troubleRoom: "Vifaa vina IP lakini Room haionyeshi messages?",

        troubleRoomText: "Hakikisha vifaa vimeingia kwenye Room Code inayofanana na backend yako inaruhusu communication ya Room. Pia hakikisha WebSocket/API endpoints zinazotumiwa na application hazizuiwi.",

        troublePort: "Port 8000 tayari inatumika?",

        troublePortText: "Funga server nyingine inayotumia port hiyo au tumia port tofauti, kwa mfano: uvicorn main:app --host 0.0.0.0 --port 8001",

        troubleFirewall: "Windows Firewall inazuia connection?",

        troubleFirewallText: "Angalia Windows Defender Firewall na ruhusu application/server yako kwenye private network ikiwa ni salama kufanya hivyo. Usifungue ports kwa public access bila security configuration.",

        footerDocumentation: "Official Documentation"
    },


    /* =====================================================
       ENGLISH
       ===================================================== */

    en: {
        nav: "Menu",
        navInstall: "Installation",
        navQuick: "Quick Start",
        navRoom: "Room",
        navLibrary: "Library",
        navChatbot: "Chatbot",
        navIP: "IP Address",
        navCommands: "Commands",
        navTroubleshooting: "Troubleshooting",

        openChatbot: "Open chatbot →",

        contents: "CONTENTS",

        heroTitle: 'Build communication with <span>Tanzania’s local languages.</span>',

        heroDescription: "Official guide for installing Tan_language, running Tan_lang_chatbot, and connecting two devices using a Room Code or IP Address.",

        startInstallation: "Start Installation",
        quickStart: "Quick Start",

        terminalReady: "✓ Tan_lang_chatbot is ready to use",

        installTitle: "Installation",

        installDescription: "Tan_language and Tan_lang_chatbot can be installed through the Python Package Index (PyPI). Use Python 3.12 or a version supported by the package.",

        libraryInstallTitle: "Library only",

        libraryInstallDescription: "For developers who need the translation engine, Python API and CLI without the web chatbot.",

        chatbotInstallTitle: "Web Chatbot",

        chatbotInstallDescription: "A complete application with backend, frontend, translation engine and Room communication.",

        copy: "Copy",
        copyAll: "Copy all",

        important: "Important:",

        installNote: "Do not use --no-deps. Pip will automatically install the required dependencies.",


        quickTitle: "Quick Start",

        quickDescription: "The fastest way to install and start Tan_lang_chatbot on your computer.",

        quickStep1Title: "Start server",

        quickStep1: "Run tan-lang-chatbot in the terminal.",

        quickStep2Title: "Open browser",

        localhostTitle: "About 127.0.0.1:",

        localhostDescription: "127.0.0.1 is the local address of the device itself. Another device cannot use your PC's 127.0.0.1 address to access its server.",


        roomTitle: "Room: Connect Two Devices",

        roomDescription: "Tan_lang_chatbot can use a Room Code to create a shared conversation space. Two devices can join the same Room and share the conversation.",

        doctorDevice: "Doctor's PC",

        patientDevice: "Patient's Phone",

        roomStep1Title: "Step 1 — Start the chatbot",

        roomStep1: "On the PC that will run the server, start the chatbot:",

        roomStep2Title: "Step 2 — Create a Room Code",

        roomStep2: "In the chatbot's conversation Room section, enter a code that both devices will use.",

        roomStep3Title: "Step 3 — Select a role",

        deviceOne: "First device",

        deviceTwo: "Second device",

        doctor: "Doctor",

        patient: "Patient",

        roomStep4Title: "Step 4 — Connect",

        roomStep4: "On both devices, use the same Room Code and click Connect.",

        connected: "Connected",

        roomImportant: "Important:",

        roomImportantText: "The Room Code identifies the conversation, but the second device still needs to reach the chatbot server through the network. This is where the IP Address connection is required.",


        ipTitle: "Connect Using an IP Address",

        ipDescription: "If the chatbot is running on one PC and you want another phone or PC to access it over a local network, use the IP Address of the computer running the server.",

        localhostCard: "Used inside the same computer.",

        networkIPCard: "Can be used by another device on a network that permits the connection.",

        ipStep1Title: "Step 1 — Find the PC's IP Address",

        ipStep1: "Open PowerShell or Command Prompt on the PC running the chatbot.",

        ipAddressNote: "Find the IPv4 Address. For example, it may be 192.168.1.10.",

        ipStep2Title: "Step 2 — Start the server on the network",

        ipStep2: "The server should listen on the network interface instead of localhost only.",

        hostMeaning: "--host 0.0.0.0:",

        hostMeaningText: "Makes the server listen on the computer's network interfaces instead of binding only to 127.0.0.1.",

        ipStep3Title: "Step 3 — Open the chatbot on the phone",

        ipStep3: "If your PC has IP Address 192.168.1.10 and the server uses port 8000, open this address in the phone browser:",

        ipStep4Title: "Step 4 — Use the same Room Code",

        ipStep4: "After the phone opens the chatbot, enter the same Room Code used by the PC. For example:",

        sameNetwork: "Network:",

        sameNetworkText: "For a local-network setup, make sure the devices can reach the PC server through the network being used. The devices are often connected to the same Wi-Fi for local setups, but router/access-point client isolation or firewall rules may prevent device-to-device communication.",

        securityTitle: "Security note",

        securityText: "Do not expose the server to the public internet without appropriate authentication, access control and security configuration. This example is intended for local-network development/testing.",


        libraryTitle: "Tan_language Library",

        libraryDescription: "Tan_language is a Python library that provides translation tools without requiring a web server. The Python import name is tll.",

        whatItDoes: "What does it do?",

        libraryDoes: "It reads the bundled dataset and translates words or sentences without a backend.",


        chatbotTitle: "Tan_lang_chatbot",

        chatbotDescription: "Tan_lang_chatbot is a complete application with a backend, frontend, translation system, voice interaction and Room-based communication.",

        featureInstall: "Install once",

        featureInstallText: "Dependencies can be installed through pip.",

        featureRun: "Run command",

        featureRoom: "Join Room",

        featureRoomText: "Devices can use the same Room Code.",

        featureVoice: "Voice",

        featureVoiceText: "Users can use the microphone depending on browser and application configuration.",

        tokenText: "Local dataset functionality can work without an online AI token. Online AI fallback may require a token configured in .env.",


        commandsTitle: "Important Commands",

        cmdPython: "Check Python version",

        cmdInstallLibrary: "Install library",

        cmdInstallChatbot: "Install chatbot",

        cmdUpdate: "Update chatbot",

        cmdHelp: "View library commands",

        cmdRun: "Start chatbot",

        cmdIP: "Check IP Address",

        cmdHost: "Run server on the network interface",


        troubleshootingTitle: "Troubleshooting",

        troublePip: "Pip command is not recognized?",

        troublePipText: "Use python -m pip instead of pip. After installation, close and reopen the Terminal.",

        troubleLocalhost: "Phone cannot open 127.0.0.1?",

        troubleLocalhostText: "This is expected. 127.0.0.1 refers to the device opening the address. Use the PC server's IP Address, for example 192.168.1.10:8000.",

        troubleIP: "IP Address does not work?",

        troubleIPText: "Make sure the server listens on 0.0.0.0, the devices can communicate on the network, port 8000 is not blocked by the firewall, and the IP Address belongs to the PC running the server.",

        troubleRoom: "Devices have an IP connection but Room messages do not appear?",

        troubleRoomText: "Make sure both devices joined the same Room Code and that your backend supports Room communication. Also verify that the WebSocket/API endpoints used by the application are not blocked.",

        troublePort: "Port 8000 is already in use?",

        troublePortText: "Stop another server using that port or use a different port, for example: uvicorn main:app --host 0.0.0.0 --port 8001",

        troubleFirewall: "Is Windows Firewall blocking the connection?",

        troubleFirewallText: "Check Windows Defender Firewall and allow your application/server on the private network if it is safe to do so. Do not expose ports publicly without proper security configuration.",

        footerDocumentation: "Official Documentation"
    }

};


/* =========================================================
   LANGUAGE SYSTEM
   ========================================================= */

function applyLanguage(language) {

    const dictionary = translations[language];

    if (!dictionary) return;

    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach((element) => {

        const key = element.dataset.i18n;

        if (!(key in dictionary)) return;

        element.innerHTML = dictionary[key];

    });


    document.querySelectorAll("[data-i18n-ph]").forEach((element) => {

        const key = element.dataset.i18nPh;

        if (dictionary[key]) {
            element.placeholder = dictionary[key];
        }

    });


    document.querySelectorAll(".lang-btn").forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.lang === language
        );

    });


    localStorage.setItem(
        "tan-lang-docs-language",
        language
    );

}


/* Load saved language */

const savedLanguage =
    localStorage.getItem("tan-lang-docs-language") || "sw";

applyLanguage(savedLanguage);


/* Language buttons */

document.querySelectorAll(".lang-btn").forEach((button) => {

    button.addEventListener("click", () => {

        applyLanguage(button.dataset.lang);

    });

});


/* =========================================================
   DARK / LIGHT MODE
   ========================================================= */

const themeToggle =
    document.querySelector("#docsThemeToggle");


function applyDocsTheme(theme) {

    const light = theme === "light";

    document.body.classList.toggle(
        "docs-light",
        light
    );


    if (themeToggle) {

        const icon =
            themeToggle.querySelector(".theme-icon");

        const label =
            themeToggle.querySelector(".theme-label");


        if (icon) {
            icon.textContent = light ? "☾" : "☼";
        }


        if (label) {

            const currentLanguage =
                document.documentElement.lang || "sw";

            label.textContent =
                light ?
                (currentLanguage === "sw" ? "Giza" : "Dark") :
                (currentLanguage === "sw" ? "Mwanga" : "Light");

        }


        themeToggle.setAttribute(
            "aria-label",
            light ?
            "Switch to dark mode" :
            "Switch to light mode"
        );

    }


    localStorage.setItem(
        "tan-lang-docs-theme",
        theme
    );

}


/* Load saved theme */

const savedTheme =
    localStorage.getItem("tan-lang-docs-theme") || "dark";

applyDocsTheme(savedTheme);


/* Theme button */

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            const nextTheme =
                document.body.classList.contains("docs-light") ?
                "dark" :
                "light";

            applyDocsTheme(nextTheme);

        }
    );

}


/* Update theme button language when SW/EN changes */

const originalApplyLanguage = applyLanguage;

applyLanguage = function(language) {

    originalApplyLanguage(language);

    const currentTheme =
        document.body.classList.contains("docs-light") ?
        "light" :
        "dark";

    applyDocsTheme(currentTheme);

};


/* =========================================================
   TERMINAL TYPING ANIMATION
   ========================================================= */

function typeCommand() {

    if (!typingTarget) return;

    typingTarget.textContent =
        command.slice(0, index);

    index += 1;


    if (index <= command.length) {

        window.setTimeout(
            typeCommand,
            52
        );

    } else {

        window.setTimeout(
            () => {

                index = 0;

                typeCommand();

            },
            2800
        );

    }

}


typeCommand();


/* =========================================================
   SECTION ANIMATION
   ========================================================= */

document.body.classList.add(
    "docs-animated"
);


const animatedSections =
    document.querySelectorAll(
        ".docs-section"
    );


if ("IntersectionObserver" in window) {

    const sectionObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting)
                        return;


                    entry.target.classList.add(
                        "docs-visible"
                    );


                    observer.unobserve(
                        entry.target
                    );

                });

            }, {
                threshold: 0.12
            }
        );


    animatedSections.forEach(
        (section, position) => {

            section.style.transitionDelay =
                `${Math.min(position * 70, 350)}ms`;

            sectionObserver.observe(section);

        }
    );

} else {

    animatedSections.forEach(
        (section) => {

            section.classList.add(
                "docs-visible"
            );

        }
    );

}


/* =========================================================
   COPY BUTTONS
   ========================================================= */

document.querySelectorAll(
    "[data-copy]"
).forEach((button) => {

    button.addEventListener(
        "click",
        async() => {

            const text =
                button.dataset.copy;


            try {

                await navigator.clipboard.writeText(
                    text
                );


                const original =
                    button.textContent;


                button.textContent =
                    "Copied!";


                window.setTimeout(
                    () => {

                        button.textContent =
                            original;

                    },
                    1400
                );


            } catch (error) {

                console.error(
                    "Copy failed:",
                    error
                );

            }

        }
    );

});


/* =========================================================
   MOBILE MENU
   ========================================================= */

const menu =
    document.querySelector("#docsMenu");

const nav =
    document.querySelector("#docsNav");


if (menu && nav) {

    menu.addEventListener(
        "click",
        () => {

            nav.classList.toggle(
                "open"
            );

        }
    );


    nav.querySelectorAll("a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    nav.classList.remove(
                        "open"
                    );

                }
            );

        });

}