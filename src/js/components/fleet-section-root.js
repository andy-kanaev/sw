/** Корень блока флота: всегда с вкладками и панелями внутри (не случайный [data-fleet] выше по DOM). */
export function resolveFleetSectionRoot() {
    const byId = document.getElementById("fleet");
    if (byId instanceof HTMLElement && byId.querySelector("[data-fleet-panel]")) {
        return byId;
    }
    const section = document.querySelector("section.fleet");
    if (section instanceof HTMLElement && section.querySelector("[data-fleet-panel]")) {
        return section;
    }
    const withAttr = document.querySelector("[data-fleet]");
    if (withAttr instanceof HTMLElement && withAttr.querySelector("[data-fleet-tab]")) {
        return withAttr;
    }
    return null;
}
