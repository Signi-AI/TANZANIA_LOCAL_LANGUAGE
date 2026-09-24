/* LocalLang AI — frontend logic (vanilla JS)
 * Talks to the FastAPI backend at /api/*.
 * Voice input uses the Web Speech API; voice output uses speechSynthesis.
 */

const API = window.LOCALLANG_API || "";
let roomSocket = null;
let roomConnected = false;
const activityTimers = {};

const I18N = {
    sw: {
        tagline: "Mtafsiri wa lugha za asili za Tanzania",
        subtitle: "Mtu yeyote anaongea lugha za asili za Tanzania — mwingine anaelewa na kuona tafsiri ya haraka kwa lugha aliyoichagua.",
        patient: "Mgonjwa",
        doctor: "Daktari",
        patientLang: "Lugha ya mgonjwa",
        uiLang: "Lugha ya tovuti",
        deviceCommunication: "Mawasiliano ya vifaa viwili",
        conversationRoom: "Room ya mazungumzo",
        roomHint: "Tumia code hii kwenye simu na PC zote zilizo kwenye Wi-Fi moja.",
        roomCode: "Code ya room",
        screenRole: "Aina ya screen",
        clientScreen: "Screen ya mteja",
        staffScreen: "Screen ya muhudumu",
        connect: "Unganisha",
        conversationLanguage: "Lugha ya mazungumzo",
        gender: "Jinsia",
        auto: "Auto",
        female: "Female",
        male: "Male",
        microphone: "Maikrofoni",
        recording: "Inarekodi",
        stopRecording: "Simamisha kurekodi",
        light: "Mwanga",
        dark: "Giza",
        conversationViews: "Muonekano wa mazungumzo",
        patientView: "Muonekano wa mgonjwa",
        doctorView: "Muonekano wa daktari",
        disconnected: "Haijaunganishwa",
        connecting: "Inaunganisha…",
        roomReady: "Room {room} iko tayari",
        connectionFailed: "Imeshindikana kuunganisha",
        roleTaken: "Role hii tayari inatumika kwenye room hii.",
        voice: "Sauti (soma kwa sauti)",
        tapToSpeak: "Bonyeza kuongea",
        speakNow: "Ongea sasa…",
        typeHere: "Andika hapa…",
        send: "Tuma",
        clear: "Futa mazungumzo",
        copy: "Nakili",
        copied: "Imenakiliwa",
        detected: "Lugha iliyotambuliwa",
        dialect: "Lahaja",
        category: "Kundi",
        example: "Mfano",
        confidence: "Uhakika",
        output: "Output",
        translation: "Tafsiri",
        high: "Juu",
        medium: "Wastani",
        low: "Chini",
        notFound: "Haikupatikana kwenye dataset",
        compare: "Linganisha lugha",
        compareHint: "Andika neno kisha uone jinsi linavyosemwa kwa lugha zote.",
        empty: "Mazungumzo yataonekana hapa. Anza kwa kubonyeza maikrofoni.",
        verify: "Hakiki na mzawa",
        noSpeech: "Kivinjari chako hakina utambuzi wa sauti — tumia maandishi.",
        roles: {
            Mgonjwa: "Mgonjwa",
            Mteja: "Mteja",
            Muhudumu: "Muhudumu",
            Muuguzi: "Muuguzi",
            Daktari: "Daktari",
            Muhubiri: "Muhubiri",
            Muumini: "Muumini",
            Mwalimu: "Mwalimu",
            Msaidizi: "Msaidizi",
            Custom: "Maalum",
        },
        languages: {
            Ruhaya: "Kihaya / Ruhaya",
            Sukuma: "Kisukuma",
            Kinyakyusa: "Kinyakyusa",
            Kichaga: "Kichaga",
            Kihehe: "Kihehe",
            Kiha: "Kiha",
            Kijita: "Kijita",
            Kizaramo: "Kizaramo",
            Kimasai: "Kimasai",
            Kifipa: "Kifipa",
            Kiswahili: "Kiswahili",
            English: "Kiingereza",
            French: "Kifaransa",
        },
    },
    en: {
        tagline: "Tanzanian local language translator",
        subtitle: "Anyone can speak a local Tanzanian language — the other participant instantly reads and hears the translation in their chosen language.",
        patient: "Patient",
        doctor: "Doctor",
        patientLang: "Patient language",
        uiLang: "Site language",
        deviceCommunication: "Two-device communication",
        conversationRoom: "Conversation room",
        roomHint: "Use this code on the phone and PC connected to the same Wi-Fi.",
        roomCode: "Room code",
        screenRole: "Screen role",
        clientScreen: "Client screen",
        staffScreen: "Staff screen",
        connect: "Connect",
        conversationLanguage: "Conversation language",
        gender: "Gender",
        auto: "Auto",
        female: "Female",
        male: "Male",
        microphone: "Microphone",
        recording: "Recording",
        stopRecording: "Stop recording",
        light: "Light",
        dark: "Dark",
        conversationViews: "Conversation views",
        patientView: "Patient view",
        doctorView: "Doctor view",
        disconnected: "Disconnected",
        connecting: "Connecting…",
        roomReady: "Room {room} is ready",
        connectionFailed: "Connection failed",
        roleTaken: "This role is already in use in this room.",
        voice: "Voice (read aloud)",
        tapToSpeak: "Tap to speak",
        speakNow: "Speak now…",
        typeHere: "Type here…",
        send: "Send",
        clear: "Clear conversation",
        copy: "Copy",
        copied: "Copied",
        detected: "Detected language",
        dialect: "Dialect",
        category: "Category",
        example: "Example",
        confidence: "Confidence",
        output: "Output",
        translation: "Translation",
        high: "High",
        medium: "Medium",
        low: "Low",
        notFound: "Not found in dataset",
        compare: "Compare languages",
        compareHint: "Type a word and see how it is said across the languages.",
        empty: "The conversation will appear here. Start by tapping the microphone.",
        verify: "Verify with a native speaker",
        noSpeech: "Your browser has no speech recognition — please type instead.",
        roles: {
            Mgonjwa: "Patient",
            Mteja: "Client",
            Muhudumu: "Attendant",
            Muuguzi: "Nurse",
            Daktari: "Doctor",
            Muhubiri: "Preacher",
            Muumini: "Believer",
            Mwalimu: "Teacher",
            Msaidizi: "Assistant",
            Custom: "Custom",
        },
        languages: {
            Ruhaya: "Ruhaya (Kihaya)",
            Sukuma: "Sukuma",
            Kinyakyusa: "Kinyakyusa",
            Kichaga: "Chaga",
            Kihehe: "Kihehe",
            Kiha: "Kiha",
            Kijita: "Kijita",
            Kizaramo: "Kizaramo",
            Kimasai: "Maasai",
            Kifipa: "Kifipa",
            Kiswahili: "Swahili",
            English: "English",
            French: "French",
        },
            // Role labels and language display names used in selects and chips
            roles: {
                Mgonjwa: "Patient",
                Mteja: "Client",
                Muhudumu: "Attendant",
                Muuguzi: "Nurse",
                Daktari: "Doctor",
                Muhubiri: "Preacher",
                Muumini: "Believer",
                Mwalimu: "Teacher",
                Msaidizi: "Assistant",
                Custom: "Custom",
            },
            languages: {
                Ruhaya: "Ruhaya (Kihaya)",
                Sukuma: "Sukuma",
                Kinyakyusa: "Kinyakyusa",
                Kichaga: "Chaga",
                Kihehe: "Kihehe",
                Kiha: "Kiha",
                Kijita: "Kijita",
                Kizaramo: "Kizaramo",
                Kimasai: "Maasai",
                Kifipa: "Kifipa",
                Kiswahili: "Swahili",
                English: "English",
                French: "French",
            },
        },
};

const state = {
    ui: localStorage.getItem("ll_ui") || "sw",
    patientLang: localStorage.getItem("ll_lang") || "Ruhaya",
    sideLanguages: {
        patient: localStorage.getItem("ll_lang_patient") || localStorage.getItem("ll_lang") || "Ruhaya",
        doctor: localStorage.getItem("ll_lang_doctor") || "Kiswahili",
    },
    sideRoles: {
        patient: localStorage.getItem("ll_role_patient") || "Mgonjwa",
        doctor: localStorage.getItem("ll_role_doctor") || "Daktari",
    },
    voice: localStorage.getItem("ll_voice") !== "off",
    listening: null,
    recognition: null,
    connectedRoomRole: null,
    defaultGender: localStorage.getItem("ll_gender") || "auto",
    genders: {
        patient: localStorage.getItem("ll_gender_patient") || "auto",
        doctor: localStorage.getItem("ll_gender_doctor") || "auto",
    },
    theme: localStorage.getItem('ll_theme') || 'light',
};

const t = (key) => I18N[state.ui][key] || key;
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function getSideLanguage(side) {
    return state.sideLanguages[side] || (side === "doctor" ? "Kiswahili" : "Ruhaya");
}

function getSideRole(side) {
    return state.sideRoles[side] || (side === "doctor" ? "Daktari" : "Mgonjwa");
}

function translateRole(role) {
    const rolesMap = (I18N[state.ui] && I18N[state.ui].roles) || {};
    return rolesMap[role] || role;
}

function translateLanguage(lang) {
    const langsMap = (I18N[state.ui] && I18N[state.ui].languages) || {};
    return langsMap[lang] || lang;
}

function updateScreenRoleLabels() {
    const screenRole = document.querySelector("#screen-role");

    const patientRole = translateRole(getSideRole("patient"));
    const doctorRole = translateRole(getSideRole("doctor"));
    const patientComposerRole = document.querySelector("#patient-composer-role");
    const doctorComposerRole = document.querySelector("#doctor-composer-role");
    const patientComposerLang = document.querySelector("#patient-composer-lang");
    const doctorComposerLang = document.querySelector("#doctor-composer-lang");
    if (patientComposerRole) patientComposerRole.textContent = patientRole;
    if (doctorComposerRole) doctorComposerRole.textContent = doctorRole;
    if (patientComposerLang) patientComposerLang.textContent = translateLanguage(getSideLanguage("patient"));
    if (doctorComposerLang) doctorComposerLang.textContent = translateLanguage(getSideLanguage("doctor"));

    if (!screenRole) return;
    const prefix = state.ui === "en" ? "Screen:" : "Screen ya";

    const patientOption = screenRole.querySelector('option[value="patient"]');
    const doctorOption = screenRole.querySelector('option[value="doctor"]');
    if (patientOption) patientOption.textContent = `${prefix} ${patientRole}`;
    if (doctorOption) doctorOption.textContent = `${prefix} ${doctorRole}`;
}

function updateConversationViewLabels() {
    const conversationView = document.querySelector("#view-main strong");
    if (conversationView) conversationView.textContent = t("conversationViews");
}

function getActiveScreenSide() {
    return document.querySelector("#screen-role")?.value || "patient";
}

function updateActiveScreenPanel() {
    const activeSide = getActiveScreenSide();
    document.querySelectorAll("[data-role], [data-composer]").forEach((section) => {
        const role = section.dataset.role || section.dataset.composer;
        const visible = role === activeSide;
        section.hidden = !visible;
        section.setAttribute("aria-hidden", String(!visible));
    });
}

function applyI18n() {
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
    $$("[data-i18n-aria]").forEach((el) => (el.setAttribute("aria-label", t(el.dataset.i18nAria))));
    $$("[data-ui]").forEach((b) => b.classList.toggle("active", b.dataset.ui === state.ui));
    document.documentElement.lang = state.ui;

    // Roles and languages translations for selects and chips
    const rolesMap = (I18N[state.ui] && I18N[state.ui].roles) || {};
    const langsMap = (I18N[state.ui] && I18N[state.ui].languages) || {};

    // Translate role-select option labels
    document.querySelectorAll('.role-select').forEach((sel) => {
        Array.from(sel.options).forEach((opt) => {
            if (rolesMap[opt.value]) opt.textContent = rolesMap[opt.value];
        });
        // ensure the select keeps the previously selected value
        const current = sel.value;
        sel.value = current;
    });

    // Translate language-select options
    document.querySelectorAll('.lang-select').forEach((sel) => {
        Array.from(sel.options).forEach((opt) => {
            if (langsMap[opt.value]) opt.textContent = langsMap[opt.value];
        });
        const current = sel.value;
        sel.value = current;
    });

    // Translate chips (language buttons)
    document.querySelectorAll('#lang-chips .chip').forEach((btn) => {
        const key = btn.dataset.lang;
        if (langsMap[key]) btn.textContent = langsMap[key];
    });

    const patientLang = getSideLanguage("patient");
    const patientLabel = document.querySelector("#patient-lang-label");
    if (patientLabel) patientLabel.textContent = translateLanguage(patientLang);
    const doctorLabel = document.querySelector("#doctor-lang-label");
    if (doctorLabel) doctorLabel.textContent = translateLanguage(getSideLanguage("doctor"));
    const patientRole = document.querySelector("#patient-role-select");
    if (patientRole) patientRole.value = getSideRole("patient");
    const doctorRole = document.querySelector("#doctor-role-select");
    if (doctorRole) doctorRole.value = getSideRole("doctor");
    updateScreenRoleLabels();
    updateConversationViewLabels();
    updateActiveScreenPanel();
    const patientLanguageSelect = document.querySelector("#patient-language-select");
    if (patientLanguageSelect) patientLanguageSelect.value = patientLang;
    const doctorLanguageSelect = document.querySelector("#doctor-language-select");
    if (doctorLanguageSelect) doctorLanguageSelect.value = getSideLanguage("doctor");

    const empty = document.querySelector("#empty-main");
    if (empty) empty.textContent = t("empty");

    ["patient", "doctor"].forEach((side) => {
        const gender = document.querySelector(`#${side}-gender`);
        if (!gender) return;
        const value = state.genders[side] || "auto";
        gender.textContent = t(value === "auto" ? "auto" : value);
    });
}

/* ------------------------------------------------------------------ speech */
function getSpeechLocaleForSide(side) {
    const targetLanguage = getSideLanguage(side === "doctor" ? "doctor" : "patient");
    const localLanguages = new Set([
        "Kiswahili",
        "Ruhaya",
        "Sukuma",
        "Kinyakyusa",
        "Kichaga",
        "Kihehe",
        "Kiha",
        "Kijita",
        "Kizaramo",
        "Kimasai",
        "Kifipa",
    ]);
    if (localLanguages.has(targetLanguage)) return "sw-TZ";

    const localeMap = {
        English: "en-US",
        French: "fr-FR",
    };
    return localeMap[targetLanguage] || "sw-TZ";
}

function pickSpeechVoice(locale) {
    if (!("speechSynthesis" in window)) return null;
    const voices = speechSynthesis.getVoices && speechSynthesis.getVoices();
    if (!voices || !voices.length) return null;
    const target = locale.toLowerCase();
    const preferred = [
        locale,
        locale.split("-")[0],
        "sw-tz",
        "sw",
        "en-us",
    ];
    for (const candidate of preferred) {
        const match = voices.find((v) => v.lang && v.lang.toLowerCase() === candidate.toLowerCase());
        if (match) return match;
    }
    return voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(target.split("-")[0])) || voices[0];
}

function speak(text, side = null) {
    if (!state.voice || !text || !("speechSynthesis" in window)) return;
    const locale = getSpeechLocaleForSide(side || "doctor");
    const trySpeak = () => {
        try {
            if (speechSynthesis && speechSynthesis.pause) {
                if (speechSynthesis.paused) speechSynthesis.resume();
            }
            speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            const voice = pickSpeechVoice(locale);
            u.lang = locale;
            if (voice) u.voice = voice;
            u.rate = 0.95;
            let gender = state.defaultGender;
            if (side && state.genders && state.genders[side]) {
                gender = state.genders[side];
            }
            if (gender === "female") {
                u.pitch = 1.25;
                u.rate = 0.98;
            } else if (gender === "male") {
                u.pitch = 0.82;
                u.rate = 0.9;
            } else {
                u.pitch = 1.0;
            }
            speechSynthesis.speak(u);
        } catch (e) {
            console.debug('speech synthesis failed', e);
        }
    };
    const voices = speechSynthesis.getVoices && speechSynthesis.getVoices();
    if (!voices || !voices.length) {
        const onReady = () => {
            speechSynthesis.onvoiceschanged = null;
            trySpeak();
        };
        speechSynthesis.onvoiceschanged = onReady;
        setTimeout(() => {
            if (speechSynthesis.onvoiceschanged) {
                speechSynthesis.onvoiceschanged = null;
                trySpeak();
            }
        }, 600);
        trySpeak();
        return;
    }
    trySpeak();
}

/* -------------------------------------------------------- gender detection (client-side, free)
   Records a short audio sample from the user's microphone, estimates
   the fundamental frequency (F0) using autocorrelation, and returns
   'male' | 'female' | null. Runs fully in the browser (no external services).
*/
async function detectGenderFromMic(durationMs = 800) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return null;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        const stopped = new Promise((resolve) => (mediaRecorder.onstop = resolve));
        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), durationMs);
        await stopped;
        const blob = new Blob(chunks, { type: "audio/webm" });
        const arrayBuffer = await blob.arrayBuffer();
        const audioCtx = new(window.AudioContext || window.webkitAudioContext)();
        const buffer = await audioCtx.decodeAudioData(arrayBuffer);
        // Take first channel
        const data = buffer.getChannelData(0);
        const sampleRate = buffer.sampleRate;
        const f0 = autoCorrelate(data, sampleRate);
        // cleanup
        stream.getTracks().forEach((t) => t.stop());
        audioCtx.close();
        if (!f0 || f0 <= 0) return null;
        // crude threshold: below ~170Hz -> likely male, above -> likely female
        return f0 < 170 ? "male" : "female";
    } catch (e) {
        console.debug("Gender detection failed:", e);
        return null;
    }
}

// Autocorrelation pitch detection (adapted for browser use)
function autoCorrelate(buf, sampleRate) {
    // Implementation inspired by Chris Wilson's example
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
        const val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1; // too quiet

    let r1 = 0,
        r2 = SIZE - 1,
        thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++)
        if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++)
        if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    buf = buf.slice(r1, r2);
    const newSize = buf.length;

    const c = new Array(newSize).fill(0);
    for (let i = 0; i < newSize; i++)
        for (let j = 0; j < newSize - i; j++) c[i] = c[i] + buf[j] * buf[j + i];
    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1,
        maxpos = -1;
    for (let i = d; i < newSize; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    let T0 = maxpos;
    const x1 = c[T0 - 1],
        x2 = c[T0],
        x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
    return sampleRate / T0;
}

function startMic(side) {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const live = $(`#live-${side}`);
    if (!Ctor) {
        live.textContent = t("noSpeech");
        return;
    }
    if (state.listening) {
        state.recognition && state.recognition.stop();
        return;
    }
    const rec = new Ctor();

    // Use Kiswahili or English for speech recognition
    // (Web Speech API doesn't support local Tanzanian languages directly)
    const speakerLanguage = getSideLanguage(side);
    let recLang = "sw-TZ";
    if (speakerLanguage === "English" || speakerLanguage === "English") recLang = "en-US";
    if (speakerLanguage === "French" || speakerLanguage === "French") recLang = "fr-FR";

    rec.lang = recLang;
    rec.interimResults = true;
    rec.continuous = true; // Allow continuous speech (more robust)
    rec.maxAlternatives = 1;

    let finalText = "";
    let lastLiveText = "";
    let recognitionTimeout = null;
    let submitted = false;

    const btn = document.querySelector(`[data-mic="${side}"]`);
    state.listening = side;
    state.recognition = rec;
    sendActivity("recording");
    if (btn) {
        btn.classList.add("listening");
        btn.textContent = "⏹️";
        btn.setAttribute("aria-label", t("stopRecording"));
        btn.title = t("stopRecording");
    }
    live.textContent = t("speakNow");

    // Auto-detect gender for voice synthesis
    if (!state.genders[side] || state.genders[side] === "auto") {
        detectGenderFromMic(400).then((g) => {
            if (g && state.listening === side) {
                state.genders[side] = g;
                localStorage.setItem(`ll_gender_${side}`, g);
                const lab = document.getElementById(`${side}-gender`);
                const sel = document.getElementById(`${side}-gender-select`);
                if (lab) lab.textContent = g === 'male' ? 'Male' : 'Female';
                if (sel) sel.value = g;
            }
        }).catch((e) => console.debug('gender detect err', e));
    }

    rec.onstart = () => {
        console.debug('[speech] started for', side);
        // Clear any existing timeout
        if (recognitionTimeout) clearTimeout(recognitionTimeout);
    };

    rec.onresult = (e) => {
        console.debug('[speech] result, resultIndex=', e.resultIndex, 'final=', e.results[e.results.length - 1].isFinal);
        let interim = "";

        for (let i = e.resultIndex; i < e.results.length; i++) {
            const chunk = e.results[i][0].transcript;
            console.debug('[speech] chunk i=', i, 'transcript=', chunk, 'isFinal=', e.results[i].isFinal);

            if (e.results[i].isFinal) {
                finalText += chunk + " ";
            } else {
                interim += chunk;
            }
        }

        const combined = (finalText + interim).trim();
        lastLiveText = combined;

        if (combined) {
            live.textContent = combined;
            try {
                const inputEl = document.querySelector(`#input-${side}`);
                if (inputEl) {
                    inputEl.value = combined;
                    inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
                }
            } catch (err) {
                console.debug('live input update failed', err);
            }
        }

        // If we got a final result and interim is empty, we're done
        if (e.results[e.results.length - 1].isFinal && !interim) {
            console.debug('[speech] got final result, stopping mic');
            if (recognitionTimeout) clearTimeout(recognitionTimeout);
            recognitionTimeout = setTimeout(() => {
                rec.stop();
            }, 500);
        } else {
            // Reset timeout if still getting results
            if (recognitionTimeout) clearTimeout(recognitionTimeout);
            recognitionTimeout = setTimeout(() => {
                console.debug('[speech] timeout after 5s no final result, stopping');
                rec.stop();
            }, 5000);
        }
    };

    rec.onerror = (event) => {
        console.debug('speech recognition error', event.error, event.message);
        if (event.error === 'not-allowed') {
            live.textContent = 'Mic permission blocked — allow microphone access and try again.';
        } else if (event.error === 'no-speech') {
            live.textContent = 'No voice detected. Please speak again.';
        } else if (event.error === 'network') {
            live.textContent = 'Network error. Check your connection.';
        } else {
            live.textContent = 'Speech recognition failed. Please try again.';
        }
        stopMic(side);
    };

    rec.onend = () => {
        console.debug('[speech] ended for', side, 'finalText=', finalText);
        if (recognitionTimeout) clearTimeout(recognitionTimeout);
        stopMic(side);

        const finalSubmission = (finalText || lastLiveText).replace(/\s+/g, " ").trim();
        if (finalSubmission && !submitted) {
            submitted = true;
            console.debug('[speech] submitting:', finalSubmission);
            submit(side, finalSubmission);
        }
    };

    if ("speechSynthesis" in window) speechSynthesis.cancel();
    try {
        rec.start();
        console.debug('[speech] started recognition for', side, 'lang=', rec.lang);
    } catch (err) {
        console.debug('speech recognition start failed', err);
        live.textContent = 'Could not start the microphone. Please try again.';
        stopMic(side);
    }
}

function stopMic(side) {
    state.listening = null;
    state.recognition = null;
    const btn = document.querySelector(`[data-mic="${side}"]`);
    if (btn) {
        btn.classList.remove("listening");
        btn.textContent = "🎙️";
        btn.setAttribute("aria-label", t("microphone"));
        btn.title = t("microphone");
    }
    $(`#live-${side}`).textContent = t("tapToSpeak");
    sendActivity("idle");
}

function sendActivity(status) {
    if (!roomConnected || !roomSocket || roomSocket.readyState !== WebSocket.OPEN) return;
    roomSocket.send(JSON.stringify({ type: "activity", status }));
}

function setConversationStarted(started) {
    const workspace = document.querySelector(".translation-workspace");
    if (workspace) workspace.classList.toggle("conversation-started", started);
}

function setActivityIndicator(side, status) {
    const conversationBox = $("#conversation-main");
    if (!conversationBox) return;
    const id = `activity-${side}`;
    const existing = document.getElementById(id);
    if (status === "idle") {
        if (existing) existing.remove();
        return;
    }
    const label = status === "recording" ? "anarekodi" : "anaandika";
    const bubble = existing || document.createElement("div");
    bubble.id = id;
    bubble.className = `bubble activity-bubble ${side}`;
    bubble.innerHTML = `
        <div class="meta">
            <strong class="${side}">${escapeHtml(translateRole(getSideRole(side)))}</strong>
        </div>
        <p class="activity-label">${label}<span class="typing-dots"><i></i><i></i><i></i></span></p>
    `;
    if (!existing) conversationBox.appendChild(bubble);
    conversationBox.scrollTop = conversationBox.scrollHeight;
}

function setRoomStatus(label, connected) {
    const status = document.querySelector("#room-status");
    if (!status) return;
    status.textContent = label;
    status.classList.toggle("online", connected);
    status.classList.toggle("offline", !connected);
}

function updateAvailableRoles(roles) {
    const roleInput = document.querySelector("#screen-role");
    if (!roleInput || !roles) return;
    const connectedRole = state.connectedRoomRole;
    const currentRole = roleInput.value;
    const currentRoleUnavailable = Boolean(roles[currentRole]) && currentRole !== connectedRole;

    Array.from(roleInput.options).forEach((option) => {
        const occupied = Boolean(roles[option.value]);
        option.disabled = occupied && option.value !== connectedRole;
        option.title = occupied ? t("roleTaken") : "";
    });

    if (currentRoleUnavailable) {
        const nextRole = Array.from(roleInput.options).find(
            (option) => !roles[option.value],
        );
        if (nextRole) {
            roleInput.value = nextRole.value;
            updateActiveScreenPanel();
        }
    }
}

async function refreshAvailableRoles(room) {
    try {
        const response = await fetch(`${API}/api/rooms/${encodeURIComponent(room)}/roles`);
        if (!response.ok) return null;
        const data = await response.json();
        updateAvailableRoles(data.roles);
        return data.roles;
    } catch (error) {
        console.debug("Room role availability check failed", error);
        return null;
    }
}

async function connectRoom() {
    const roomInput = document.querySelector("#room-code");
    const roleInput = document.querySelector("#screen-role");
    if (!roomInput || !roleInput) return;
    const room = roomInput.value.trim().toUpperCase();
    if (!room) return;
    const roles = await refreshAvailableRoles(room);
    if (roles && roles[roleInput.value]) {
        setRoomStatus(t("roleTaken"), false);
        return;
    }
    if (roomSocket) roomSocket.close();
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    roomSocket = new WebSocket(`${protocol}://${window.location.host}/ws/${encodeURIComponent(room)}/${roleInput.value}`);
    setRoomStatus(t("connecting"), false);
    roomSocket.onopen = () => {
        roomConnected = true;
        state.connectedRoomRole = roleInput.value;
        setRoomStatus(t("roomReady").replace("{room}", room), true);
    };
    roomSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "error" && data.code === "role_taken") {
            setRoomStatus(t("roleTaken"), false);
            updateAvailableRoles({ [data.role]: true });
            return;
        }
        if (data.type === "presence") {
            updateAvailableRoles(data.roles);
            return;
        }
        if (data.type === "activity") {
            setActivityIndicator(data.role, data.status);
            return;
        }
        if (data.type === "message") {
            setActivityIndicator(data.role, "idle");
            renderBubble(data.role, data.text, data, false);
            if (data.translation && data.role !== roleInput.value) {
                speak(data.translation, roleInput.value);
            }
        }
    };
    roomSocket.onclose = () => {
        roomConnected = false;
        state.connectedRoomRole = null;
        setRoomStatus(t("disconnected"), false);
    };
    roomSocket.onerror = () => setRoomStatus(t("connectionFailed"), false);
}

/* --------------------------------------------------------------- translate */
async function submit(side, text) {
    console.debug('[submit] side=', side, 'text=', text);
    if (!text.trim()) return;
    setConversationStarted(true);
    sendActivity("idle");
    const source = getSideLanguage(side);
    const target = getSideLanguage(side === "patient" ? "doctor" : "patient");
    if (roomConnected && roomSocket && roomSocket.readyState === WebSocket.OPEN) {
        roomSocket.send(JSON.stringify({
            type: "message",
            text,
            source_language: source,
            target_language: target,
        }));
        return;
    }
    // Show the local message while the single-device conversation is loading.
    renderBubble(side, text, null, true);
    try {
        const res = await fetch(`${API}/api/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, source_language: source, target_language: target }),
        });
        console.debug('[submit] fetch completed', res.status);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        console.debug('[submit] data=', data);
        // remove matching pending placeholders (by original text)
        document.querySelectorAll('.bubble.pending .orig').forEach(o => {
            if (o.textContent === text) {
                const p = o.closest('.bubble');
                p && p.remove();
            }
        });
        renderBubble(side, text, data, false);
        if (data.translation) {
            const targetSide = side === 'patient' ? 'doctor' : 'patient';
            speak(data.translation, targetSide);
        }
    } catch (err) {
        console.debug('[submit] error', err);
        document.querySelectorAll('.bubble.pending .orig').forEach(o => {
            if (o.textContent === text) {
                const p = o.closest('.bubble');
                p && p.remove();
            }
        });
        renderBubble(side, text, { message: String(err), confidence: "low" }, false);
    }
}

function renderBubble(side, text, data, pending, existing) {
    const conversationBox = $("#conversation-main");
    if (!conversationBox) return null;
    setConversationStarted(true);
    const placeholder = conversationBox.querySelector(".center");
    if (placeholder) placeholder.remove();
    const roomMessage = roomConnected;
    const isRemoteMessage = roomMessage && side !== getActiveScreenSide();

    // Build the original message bubble (for the side that spoke)
    const buildOriginalEl = () => {
        const el = document.createElement("div");
        el.className = `bubble ${side}`;
        const speaker = translateRole(getSideRole(side));
        if (pending) el.classList.add("pending");

        el.innerHTML = `<div class="meta"><strong class="${side}">${speaker}</strong><span class="message-label">${t("output")}</span></div>
            <p class="orig">${escapeHtml(text)}</p>`;
        return el;
    };

    // Build the translation bubble (for the other side)
    const buildTranslationEl = () => {
            const el = document.createElement("div");
            el.className = `bubble ${side}`; // Use original speaker's side for styling
            const conf = (data && data.confidence) || "low";
            const body = pending ?
                `<p class="trans">…</p>` :
                data && data.translation ?
                `<p class="trans">${escapeHtml(data.translation)}</p>` :
                `<p class="warn">${escapeHtml((data && data.message) || t("notFound"))}</p>`;
            if (pending) el.classList.add("pending");
        const actions = data && data.translation
            ? `<div class="actions"><button class="ghost" data-copy>${t("copy")}</button><button class="ghost" data-speak>🔊</button></div>`
            : "";

        const speaker = translateRole(getSideRole(side));
        el.innerHTML = `<div class="meta"><strong class="${side}">${speaker}</strong><span class="badge ${conf}">${t("translation")}: ${t(conf)}</span></div>
            ${body}${actions}`;
        return el;
    };

    if (isRemoteMessage) {
        if (data && data.translation) {
            const elTrans = buildTranslationEl();
            conversationBox.appendChild(elTrans);
            conversationBox.scrollTop = conversationBox.scrollHeight;

            const copyBtn = elTrans.querySelector("[data-copy]");
            if (copyBtn) {
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(data.translation || "");
                    copyBtn.textContent = t("copied");
                    setTimeout(() => (copyBtn.textContent = t("copy")), 1500);
                };
            }
            const speakBtn = elTrans.querySelector("[data-speak]");
            if (speakBtn) {
                speakBtn.onclick = () => speak(data.translation || "", getActiveScreenSide());
            }
        }
        return null;
    }

    const elOrig = buildOriginalEl();
    conversationBox.appendChild(elOrig);
    conversationBox.scrollTop = conversationBox.scrollHeight;

    // Keep the original and its reply together in the single conversation view.
    if (data && data.translation && !roomMessage) {
        const elTrans = buildTranslationEl();
        conversationBox.appendChild(elTrans);
        conversationBox.scrollTop = conversationBox.scrollHeight;

        const copyBtn = elTrans.querySelector("[data-copy]");
        if (copyBtn) {
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(data.translation || "");
                copyBtn.textContent = t("copied");
                setTimeout(() => (copyBtn.textContent = t("copy")), 1500);
            };
        }
        const speakBtn = elTrans.querySelector("[data-speak]");
        if (speakBtn) {
            speakBtn.onclick = () => {
                speak(data.translation || "", side === "patient" ? "doctor" : "patient");
            };
        }
    }

    return null;
}
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

function seedConversationSample() {
  const samples = Array.isArray(window.sampleSet) ? window.sampleSet : [];

  samples.forEach(({ box, role, text, translation, confidence }) => {
    if (!box || box.querySelector(".bubble")) return;
    const bubble = document.createElement("div");
    bubble.className = `bubble ${role}`;
    bubble.innerHTML = `
      <div class="meta">
        <strong class="${role}">${getSideRole(role)}</strong>
        <span class="badge ${confidence}">${t("confidence")}: ${t(confidence)}</span>
      </div>
      <p class="orig">${escapeHtml(text)}</p>
      <p class="trans">${escapeHtml(translation)}</p>
    `;
    box.innerHTML = "";
    box.appendChild(bubble);
  });
}

/* ------------------------------------------------------------------ events */
$$("[data-mic]").forEach((btn) => (btn.onclick = () => startMic(btn.dataset.mic)));
$$("[data-send]").forEach((btn) => {
  const side = btn.dataset.send;
  const input = $(`#input-${side}`);
  btn.onclick = () => {
    submit(side, input.value);
    input.value = "";
  };
  input.onkeydown = (e) => {
    if (e.key === "Enter") btn.click();
  };
  input.oninput = () => {
    const hasText = input.value.trim().length > 0;
    if (hasText) setConversationStarted(true);
    if (activityTimers[side]) clearTimeout(activityTimers[side]);
    sendActivity(hasText ? "typing" : "idle");
    if (hasText) {
        activityTimers[side] = setTimeout(() => sendActivity("idle"), 1400);
    }
  };
});

$$("[data-ui]").forEach((btn) => {
  btn.onclick = () => {
    state.ui = btn.dataset.ui;
    localStorage.setItem("ll_ui", state.ui);
    applyI18n();
  };
});

$$(".chip").forEach((chip) => {
  chip.onclick = () => {
    const lang = chip.dataset.lang;
    state.patientLang = lang;
    state.sideLanguages.patient = lang;
    localStorage.setItem("ll_lang", state.patientLang);
    localStorage.setItem("ll_lang_patient", lang);
    $$(".chip").forEach((c) => c.classList.toggle("active", c === chip));
    applyI18n();
  };
});

const patientLanguageSelect = document.getElementById("patient-language-select");
if (patientLanguageSelect) {
  patientLanguageSelect.value = getSideLanguage("patient");
  patientLanguageSelect.onchange = () => {
    const lang = patientLanguageSelect.value;
    state.patientLang = lang;
    state.sideLanguages.patient = lang;
    localStorage.setItem("ll_lang", lang);
    localStorage.setItem("ll_lang_patient", lang);
    $$(".chip").forEach((c) => c.classList.toggle("active", c.dataset.lang === lang));
    applyI18n();
  };
}

const doctorLanguageSelect = document.getElementById("doctor-language-select");
if (doctorLanguageSelect) {
  doctorLanguageSelect.value = getSideLanguage("doctor");
  doctorLanguageSelect.onchange = () => {
    const lang = doctorLanguageSelect.value;
    state.sideLanguages.doctor = lang;
    localStorage.setItem("ll_lang_doctor", lang);
    applyI18n();
  };
}

const patientRoleSelect = document.getElementById("patient-role-select");
if (patientRoleSelect) {
  patientRoleSelect.value = getSideRole("patient");
  patientRoleSelect.onchange = () => {
    state.sideRoles.patient = patientRoleSelect.value;
    localStorage.setItem("ll_role_patient", patientRoleSelect.value);
    applyI18n();
  };
}

const doctorRoleSelect = document.getElementById("doctor-role-select");
if (doctorRoleSelect) {
  doctorRoleSelect.value = getSideRole("doctor");
  doctorRoleSelect.onchange = () => {
    state.sideRoles.doctor = doctorRoleSelect.value;
    localStorage.setItem("ll_role_doctor", doctorRoleSelect.value);
    applyI18n();
  };
}

$("#voice-toggle").onclick = () => {
  state.voice = !state.voice;
  localStorage.setItem("ll_voice", state.voice ? "on" : "off");
  $("#voice-toggle").classList.toggle("on", state.voice);
};

// Gender toggle buttons (Auto / Female / Male)
const genderButtons = document.querySelectorAll('#gender-toggle .gender');
if (genderButtons) {
  genderButtons.forEach((b) => {
    b.classList.toggle('active', b.dataset.gender === state.defaultGender);
    b.onclick = () => {
      const g = b.dataset.gender;
      state.defaultGender = g;
      localStorage.setItem('ll_gender', g);
      genderButtons.forEach((bb) => bb.classList.toggle('active', bb === b));
    };
  });
}

// Per-side gender selects (patient / doctor)
const patientGenderSelect = document.getElementById('patient-gender-select');
if (patientGenderSelect) {
  patientGenderSelect.value = state.genders.patient || 'auto';
  const lab = document.getElementById('patient-gender');
  if (lab) lab.textContent = t(patientGenderSelect.value === 'auto' ? 'auto' : patientGenderSelect.value);
  patientGenderSelect.onchange = () => {
    const v = patientGenderSelect.value;
    state.genders.patient = v;
    localStorage.setItem('ll_gender_patient', v);
    if (lab) lab.textContent = t(v === 'auto' ? 'auto' : v);
  };
}
const doctorGenderSelect = document.getElementById('doctor-gender-select');
if (doctorGenderSelect) {
  doctorGenderSelect.value = state.genders.doctor || 'auto';
  const lab2 = document.getElementById('doctor-gender');
  if (lab2) lab2.textContent = t(doctorGenderSelect.value === 'auto' ? 'auto' : doctorGenderSelect.value);
  doctorGenderSelect.onchange = () => {
    const v = doctorGenderSelect.value;
    state.genders.doctor = v;
    localStorage.setItem('ll_gender_doctor', v);
    if (lab2) lab2.textContent = t(v === 'auto' ? 'auto' : v);
  };
}

$("#clear").onclick = () => {
  const el = document.querySelector("#conversation-main");
  if (el) el.innerHTML = `<p class="muted center">${t("empty")}</p>`;
  document.querySelectorAll("[data-composer] input").forEach((input) => {
    input.value = "";
  });
  setConversationStarted(false);
};

const translationWorkspace = document.querySelector(".translation-workspace");
setConversationStarted(Boolean(document.querySelector("#conversation-main .bubble")));
const settingsToggleButtons = document.querySelectorAll(".settings-heading, .settings-reopen");
if (translationWorkspace && settingsToggleButtons.length) {
    const setSettingsCollapsed = (collapsed) => {
        translationWorkspace.classList.toggle("settings-collapsed", collapsed);
        settingsToggleButtons.forEach((button) => {
            button.setAttribute("aria-expanded", String(!collapsed));
        });
    };
    settingsToggleButtons.forEach((button) => {
        button.onclick = () => {
            setSettingsCollapsed(!translationWorkspace.classList.contains("settings-collapsed"));
        };
    });
}

const roomConnectButton = document.querySelector("#room-connect");
if (roomConnectButton) roomConnectButton.onclick = connectRoom;
const screenRoleSelect = document.querySelector("#screen-role");
if (screenRoleSelect) {
    screenRoleSelect.onchange = () => {
        updateActiveScreenPanel();
        if (state.listening && state.listening !== screenRoleSelect.value) {
            stopMic(state.listening);
        }
        if (roomSocket) {
            roomSocket.close();
            roomSocket = null;
            roomConnected = false;
            setRoomStatus(t("disconnected"), false);
        }
    };
    screenRoleSelect.onfocus = () => {
        const room = document.querySelector("#room-code")?.value.trim().toUpperCase();
        if (room) refreshAvailableRoles(room);
    };
}
setInterval(() => {
    const room = document.querySelector("#room-code")?.value.trim().toUpperCase();
    if (room) refreshAvailableRoles(room);
}, 3000);

$("#compare-btn").onclick = async () => {
  const text = $("#compare-input").value.trim();
  if (!text) return;
  const res = await fetch(`${API}/api/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, source_language: "auto" }),
  });
  const data = await res.json();
  const langsMap = (I18N[state.ui] && I18N[state.ui].languages) || {};
  const rows = data.languages
    .map(
      (r) => {
        const label = langsMap[r.language] || (r.language === "Ruhaya" ? "Kihaya / Ruhaya" : r.language);
        return `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${
          r.translation ? escapeHtml(r.translation) : t("notFound")
        }</td></tr>`;
      },
    )
    .join("");
  const kiswahiliLabel = langsMap['Kiswahili'] || 'Kiswahili';
  $("#compare-result").innerHTML = `<table><tr><td><strong>${escapeHtml(kiswahiliLabel)}</strong></td><td>${
    data.kiswahili ? escapeHtml(data.kiswahili) : "—"
  }</td></tr>${rows}</table>`;
};

// restore saved settings
$$(".chip").forEach((c) => c.classList.toggle("active", c.dataset.lang === state.patientLang));
$("#voice-toggle").classList.toggle("on", state.voice);
applyI18n();
const conversationMain = document.querySelector("#conversation-main");
if (conversationMain) conversationMain.innerHTML = `<p class="muted center">${t("empty")}</p>`;
seedConversationSample();

// theme toggle handlers (per-view light/dark)
Array.from(document.querySelectorAll('.theme-toggle .small')).forEach(btn => {
  btn.onclick = () => {
    const view = btn.dataset.view;
    const theme = btn.dataset.theme;
    const root = document.getElementById(`view-${view}`);
    if (!root) return;
    root.dataset.theme = theme;
    localStorage.setItem(`ll_view_theme_${view}`, theme);
    // update active state
    Array.from(root.querySelectorAll('.theme-toggle .small')).forEach(b => b.classList.toggle('active', b === btn));
  };
});

document.querySelectorAll('.view[data-theme]').forEach(root => {
  const view = root.id.replace(/^view-/, "");
  const savedTheme = localStorage.getItem(`ll_view_theme_${view}`);
  if (!savedTheme) return;
  root.dataset.theme = savedTheme;
  root.querySelectorAll('.theme-toggle .small').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === savedTheme);
  });
});

// global theme toggle (applies to whole page)
function applyTheme(theme) {
  console.debug('[theme] applyTheme()', theme);
  document.body.setAttribute('data-theme', theme);
  state.theme = theme;
  localStorage.setItem('ll_theme', theme);
  const lightBtn = document.getElementById('global-theme-light');
  const darkBtn = document.getElementById('global-theme-dark');
  if (lightBtn && darkBtn) {
    lightBtn.classList.toggle('active', theme === 'light');
    darkBtn.classList.toggle('active', theme === 'dark');
  }
}

const gLight = document.getElementById('global-theme-light');
const gDark = document.getElementById('global-theme-dark');
if (gLight) gLight.onclick = () => { console.debug('[theme] clicked light'); applyTheme('light'); };
if (gDark) gDark.onclick = () => { console.debug('[theme] clicked dark'); applyTheme('dark'); };

// apply saved theme on load
console.debug('[theme] initial state.theme=', state.theme);
applyTheme(state.theme);

// signal that main app script initialized successfully
window.LL_APP_INIT = true;