(() => {
    const helpDialog = document.getElementById("install-help");
    const closeButtons = document.querySelectorAll("[data-close-install]");
    const platformSections = document.querySelectorAll("[data-install-platform]");
    let installPrompt = null;

    if (!document.querySelector("[data-install-app]")) return;

    const installButtons = () => document.querySelectorAll("[data-install-app]");

    const isStandalone = () => (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );

    const setInstalledState = () => {
        const installed = isStandalone();
        installButtons().forEach((button) => {
            button.hidden = installed;
        });
        return installed;
    };

    const showInstallHelp = () => {
        if (!helpDialog) {
            console.error("Tanlingo install instructions are missing from this page.");
            return;
        }

        const userAgent = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        const platform = isIOS ? "ios" : /Android/i.test(userAgent) ? "android" : "desktop";

        platformSections.forEach((section) => {
            section.hidden = section.dataset.installPlatform !== platform;
        });

        if (typeof helpDialog.showModal === "function") {
            helpDialog.showModal();
        } else {
            helpDialog.setAttribute("open", "");
        }
    };

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        installPrompt = event;
    });

    window.addEventListener("appinstalled", () => {
        installPrompt = null;
        installButtons().forEach((button) => {
            button.hidden = true;
        });
        if (helpDialog?.open) helpDialog.close();
    });

    document.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-install-app]");
        if (!button) return;

        if (!installPrompt) {
            showInstallHelp();
            return;
        }

        const prompt = installPrompt;
        installPrompt = null;
        button.disabled = true;

        try {
            await prompt.prompt();
            const choice = await prompt.userChoice;
            if (choice.outcome === "accepted") {
                installButtons().forEach((installButton) => {
                    installButton.hidden = true;
                });
            }
        } catch (error) {
            console.error("Tanlingo could not open the browser install prompt.", error);
            showInstallHelp();
        } finally {
            button.disabled = false;
        }
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            if (helpDialog?.open) helpDialog.close();
            else helpDialog?.removeAttribute("open");
        });
    });

    helpDialog?.addEventListener("click", (event) => {
        if (event.target === helpDialog) helpDialog.close();
    });

    setInstalledState();
    window.matchMedia("(display-mode: standalone)").addEventListener?.("change", setInstalledState);

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/service-worker.js")
            .catch((error) => {
                console.error("Tanlingo could not register offline support.", error);
            });
    }
})();
