import { resolveFleetSectionRoot } from "./fleet-section-root.js";

/** @param {HTMLElement} root @param {string} tabId */
function activateFleetTab(root, tabId) {
    const tabs = root.querySelectorAll("[data-fleet-tab]");
    const panels = root.querySelectorAll(".fleet__panel");

    tabs.forEach((tab) => {
        const id = tab.getAttribute("data-fleet-tab") ?? "";
        const selected = id === tabId;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
        const panelId = panel.getAttribute("data-fleet-panel") ?? "";
        panel.hidden = panelId !== tabId;
    });
}

/** @param {HTMLElement} root */
function getTabButtons(root) {
    return Array.from(
        root.querySelectorAll(".fleet__tab[data-fleet-tab], button.fleet__tab, button[data-fleet-tab]"),
    );
}

export function initFleetTabs() {
    const root = resolveFleetSectionRoot();
    if (!root) return;

    const tablist = root.querySelector(".fleet__tablist,[role=\"tablist\"]");
    /** Делегирование клика: не зависит от обёрток и вложенности текста во вкладке */
    root.addEventListener("click", (e) => {
        const trigger = /** @type {HTMLElement | null} */ (e.target)?.closest(
            ".fleet__tab[data-fleet-tab], button[data-fleet-tab]",
        );
        if (!trigger || !root.contains(trigger)) return;
        const id = trigger.getAttribute("data-fleet-tab") ?? "";
        if (!id) return;
        activateFleetTab(root, id);
    });

    if (tablist) {
        tablist.addEventListener("keydown", (e) => {
            const key = e.key;
            if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "Home" && key !== "End") {
                return;
            }

            const tabs = getTabButtons(root);
            const focusIdx = tabs.indexOf(/** @type {HTMLElement} */ (document.activeElement));
            if (focusIdx < 0) return;

            e.preventDefault();
            let next = focusIdx;

            if (key === "Home") next = 0;
            else if (key === "End") next = tabs.length - 1;
            else if (key === "ArrowRight") next = (focusIdx + 1) % tabs.length;
            else if (key === "ArrowLeft") next = (focusIdx - 1 + tabs.length) % tabs.length;

            const nextTab = tabs[next];
            if (nextTab) {
                const id = nextTab.getAttribute("data-fleet-tab") ?? "";
                activateFleetTab(root, id);
                nextTab.focus();
            }
        });
    }
}
