import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initJourneyRouteScroll() {
    const pinWrap = document.querySelector("[data-journey-route-pin]");
    const track = document.querySelector("[data-journey-route-track]");
    const viewport = pinWrap?.querySelector("[data-journey-route-viewport]");
    if (!pinWrap || !track || !viewport) return;

    const mqDesktop = window.matchMedia("(min-width: 769px)");
    /** @type {ScrollTrigger[]} */
    const stopTriggers = [];
    /** @type {gsap.core.Tween | null} */
    let moveTween = null;

    function getTravelPx() {
        const vw = viewport.clientWidth;
        const slack = Math.max(24, Math.round(vw * 0.04));
        /** Минимум горизонтального «рейса», даже если карточки помещаются в экран (иначе tween с нулём и «не едет»). */
        const minTravel = Math.min(780, Math.max(320, vw * 0.32));
        const fromOverflow = track.scrollWidth - vw + slack;
        return Math.max(minTravel, fromOverflow);
    }

    /** Отрицательный сдвиг трека влево */
    function getMaxX() {
        return -getTravelPx();
    }

    function teardown() {
        stopTriggers.forEach((t) => t.kill());
        stopTriggers.length = 0;

        moveTween?.scrollTrigger?.kill();
        moveTween?.kill();
        moveTween = null;

        gsap.set(track, { clearProps: "transform,x" });
        pinWrap.querySelectorAll("[data-journey-stop-inner]").forEach((el) => {
            gsap.set(el, { clearProps: "opacity,y" });
        });
    }

    function build() {
        teardown();

        if (!mqDesktop.matches || prefersReducedMotion()) {
            pinWrap.querySelectorAll("[data-journey-stop-inner]").forEach((el) => {
                gsap.set(el, { opacity: 1, y: 0 });
            });
            return;
        }

        moveTween = gsap.to(track, {
            x: getMaxX,
            ease: "none",
            scrollTrigger: {
                trigger: pinWrap,
                start: "top top",
                scrub: 0.85,
                pin: true,
                end: () => `+=${Math.max(760, Math.abs(getTravelPx()) * 1.65)}`,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                pinSpacing: true,
            },
        });

        pinWrap.querySelectorAll("[data-journey-stop]").forEach((stop) => {
            const inner = stop.querySelector("[data-journey-stop-inner]");
            if (!(inner instanceof HTMLElement) || !moveTween) return;

            const tl = gsap.fromTo(
                inner,
                { opacity: 0.2, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    ease: "none",
                    scrollTrigger: {
                        trigger: stop,
                        containerAnimation: moveTween,
                        start: "left 93%",
                        end: "left 42%",
                        scrub: true,
                    },
                },
            );
            const st = tl.scrollTrigger;
            if (st) stopTriggers.push(st);
        });

        ScrollTrigger.refresh();
    }

    function scheduleRefresh() {
        ScrollTrigger.refresh();
        requestAnimationFrame(() => ScrollTrigger.refresh());
    }

    build();

    mqDesktop.addEventListener("change", () => {
        build();
        ScrollTrigger.refresh(true);
    });

    if (document.readyState === "complete") {
        queueMicrotask(scheduleRefresh);
    } else {
        window.addEventListener("load", scheduleRefresh, { once: true });
    }

    const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
    });
    resizeObserver.observe(track);
    resizeObserver.observe(viewport);
}
