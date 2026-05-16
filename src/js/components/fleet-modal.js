import { resolveFleetSectionRoot } from "./fleet-section-root.js";

import gsap from "gsap";

const FLEET_MODAL_TRUNC = 128;

/** @param {HTMLElement} article */
function buildFleetCard(article) {
    const figure = article.querySelector(".fleet-model__media");
    const body = article.querySelector(".fleet-model__body");

    if (!figure || !body) return false;

    const nameEl = body.querySelector(".fleet-model__name");
    const titleText = nameEl?.textContent?.trim() ?? "";
    nameEl?.remove();

    let teaserRaw = "";
    const textEl = body.querySelector(".fleet-model__text");
    if (textEl?.textContent) {
        teaserRaw = textEl.textContent.trim().replace(/\s+/g, " ");
        if (teaserRaw.length > FLEET_MODAL_TRUNC) {
            teaserRaw = `${teaserRaw.slice(0, FLEET_MODAL_TRUNC - 1)}…`;
        }
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fleet-model__card";
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute(
        "aria-label",
        titleText ? `Подробнее: ${titleText}` : "Подробнее о судне",
    );

    const peek = document.createElement("div");
    peek.className = "fleet-model__peek";

    const nameSpan = document.createElement("span");
    nameSpan.className = "fleet-model__card-title";
    nameSpan.textContent = titleText;

    const teaserSpan = document.createElement("span");
    teaserSpan.className = "fleet-model__teaser";
    teaserSpan.textContent = teaserRaw;

    const cta = document.createElement("span");
    cta.className = "fleet-model__cta";
    cta.innerHTML =
        'Подробнее <span class="fleet-model__cta-arrow" aria-hidden="true">→</span>';

    peek.append(nameSpan, teaserSpan, cta);
    btn.append(figure, peek);

    const detail = document.createElement("div");
    detail.className = "fleet-model__detail";
    detail.hidden = true;

    const detailInner = document.createElement("div");
    detailInner.className = "fleet-model__detail-inner";

    while (body.firstChild) {
        detailInner.appendChild(body.firstChild);
    }
    body.remove();
    detail.appendChild(detailInner);

    article.replaceChildren(btn, detail);
    article.dataset.fleetModelReady = "1";
    return true;
}

/** @param {HTMLElement | null} root */
function hydrateFleetCards(root) {
    if (!root) return;
    root.querySelectorAll(".fleet-model:not([data-fleet-model-ready])").forEach((article) => {
        buildFleetCard(article);
    });
}

/** @returns {HTMLElement} */
function ensureFleetModalEl() {
    let modal = document.querySelector(".fleet-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.className = "fleet-modal";
    modal.innerHTML = `
        <div class="fleet-modal__overlay"></div>
        <div class="fleet-modal__container" role="dialog" aria-modal="true" aria-labelledby="fleet-modal-title">
            <button type="button" class="fleet-modal__close" aria-label="Закрыть окно о судне">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <div class="fleet-modal__sheet">
                <figure class="fleet-modal__figure" hidden></figure>
                <div class="fleet-modal__content">
                    <h2 id="fleet-modal-title" class="fleet-modal__title"></h2>
                    <div class="fleet-modal__body"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

export function initFleetModal() {
    const fleetRoot = resolveFleetSectionRoot();
    hydrateFleetCards(fleetRoot);

    const modal = ensureFleetModalEl();
    const overlay = modal.querySelector(".fleet-modal__overlay");
    const closeBtn = modal.querySelector(".fleet-modal__close");
    const sheet = modal.querySelector(".fleet-modal__sheet");
    const figureWrap = modal.querySelector(".fleet-modal__figure");
    const titleEl = modal.querySelector(".fleet-modal__title");
    const bodySlot = modal.querySelector(".fleet-modal__body");

    gsap.set(modal, { visibility: "hidden", pointerEvents: "none" });
    gsap.set(overlay, {
        opacity: 0,
        backdropFilter: "blur(0px)",
        WebkitBackdropFilter: "blur(0px)",
    });
    gsap.set(sheet, {
        scale: 0.88,
        opacity: 0,
        yPercent: 4,
    });
    gsap.set(closeBtn, { opacity: 0, scale: 0, rotation: 180 });
    gsap.set([titleEl, bodySlot], { opacity: 0, y: 18 });

    let isOpen = false;
    /** @type {gsap.core.Timeline | null} */
    let openTimeline = null;
    /** @type {gsap.core.Timeline | null} */
    let closeTimeline = null;
    /** @type {HTMLElement | null} */
    let opener = null;

    const closeFleetModal = () => {
        if (!isOpen) return;
        const openerBtn = opener;
        isOpen = false;

        if (openTimeline) openTimeline.kill();

        if (openerBtn) {
            openerBtn.classList.remove("fleet-model__card--open");
            openerBtn.setAttribute("aria-expanded", "false");
        }
        opener = null;

        modal.classList.remove("fleet-modal--active");
        document.body.style.overflow = "";

        closeTimeline = gsap.timeline({
            defaults: { ease: "expo.in" },
            onComplete: () => {
                gsap.set(modal, { visibility: "hidden", pointerEvents: "none" });
                figureWrap.innerHTML = "";
                figureWrap.hidden = true;
                bodySlot.innerHTML = "";
                titleEl.textContent = "";
                openerBtn?.focus({ preventScroll: true });
            },
        });

        closeTimeline.to([titleEl, bodySlot], { opacity: 0, y: -16, duration: 0.28 }, 0);
        closeTimeline.to(closeBtn, { opacity: 0, scale: 0, rotation: 180, duration: 0.28, ease: "back.in(2)" }, 0.08);
        closeTimeline.to(
            sheet,
            { scale: 0.92, opacity: 0, yPercent: -2, duration: 0.5, ease: "expo.in" },
            0.12,
        );
        closeTimeline.to(
            overlay,
            {
                opacity: 0,
                backdropFilter: "blur(0px)",
                WebkitBackdropFilter: "blur(0px)",
                duration: 0.45,
                ease: "power1.in",
            },
            0.12,
        );
    };

    /**
     * @param {HTMLElement} article
     * @param {HTMLButtonElement} cardBtn
     */
    const openFleetModalFromCard = (article, cardBtn) => {
        if (openTimeline) openTimeline.kill();
        if (closeTimeline) closeTimeline.kill();
        gsap.killTweensOf([overlay, sheet, closeBtn, titleEl, bodySlot]);

        const detailInner = article.querySelector(".fleet-model__detail-inner");

        const titlePreview = article.querySelector(".fleet-model__card-title");
        const img = article.querySelector(".fleet-model__image");

        if (!detailInner || !titleEl || !bodySlot || !overlay || !sheet) return;

        if (closeTimeline) closeTimeline.kill();

        isOpen = true;
        opener = cardBtn;

        cardBtn.classList.add("fleet-model__card--open");
        cardBtn.setAttribute("aria-expanded", "true");

        titleEl.textContent = titlePreview?.textContent?.trim() ?? "";

        figureWrap.innerHTML = "";
        if (img instanceof HTMLImageElement) {
            const clone = img.cloneNode(true);
            figureWrap.appendChild(clone);
            figureWrap.hidden = false;
        } else {
            figureWrap.hidden = true;
        }

        bodySlot.innerHTML = detailInner.innerHTML;

        modal.classList.add("fleet-modal--active");
        document.body.style.overflow = "hidden";

        gsap.set([titleEl, bodySlot], { opacity: 0, y: 18 });
        gsap.set(closeBtn, { opacity: 0, scale: 0, rotation: 180 });

        openTimeline = gsap.timeline({ defaults: { ease: "expo.out" } });
        openTimeline.set(modal, { visibility: "visible", pointerEvents: "auto" });
        openTimeline.to(
            overlay,
            {
                opacity: 1,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                duration: 0.75,
                ease: "power1.out",
            },
            0,
        );
        openTimeline.to(
            sheet,
            {
                scale: 1,
                opacity: 1,
                yPercent: 0,
                duration: 0.92,
                ease: "expo.out",
            },
            0.18,
        );
        openTimeline.to(closeBtn, { opacity: 1, scale: 1, rotation: 0, duration: 0.48, ease: "back.out(2)" }, 0.52);
        openTimeline.to([titleEl, bodySlot], { opacity: 1, y: 0, duration: 0.52, ease: "power2.out" }, 0.58);
    };

    if (fleetRoot) {
        fleetRoot.addEventListener("click", (e) => {
            const cardBtn = e.target.closest(".fleet-model__card");
            if (!(cardBtn instanceof HTMLButtonElement)) return;

            const article = cardBtn.closest(".fleet-model");
            if (!(article instanceof HTMLElement)) return;

            openFleetModalFromCard(article, cardBtn);
        });
    }

    closeBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        closeFleetModal();
    });
    overlay?.addEventListener("click", closeFleetModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen) {
            closeFleetModal();
        }
    });

    document.body.addEventListener("click", (e) => {
        const link = e.target.closest(".fleet-modal a[data-map-location-id]");
        if (!link || !isOpen) return;
        closeFleetModal();
    });
}
