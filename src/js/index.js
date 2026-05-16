import "normalize.css";
import "../scss/index.scss";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import { initMenu } from "./components/menu.js";
import { initMobileMenu } from "./components/mobile-menu.js";
import { initHero } from "./blocks/hero.js";
import { initVideoModal } from "./components/video-modal.js";
import { initAdvantage } from "./blocks/advantage.js";
import { initTextModal } from "./components/text-modal.js";
import { initCurtains } from "./blocks/curtains.js";
import { initScrollerText } from "./components/scroller-text.js";
import { initDifferences } from "./blocks/differences.js";
import { initMarqueeScrollDirection } from "./components/marqueeScrollDirection.js";
import { initMap } from "./components/map.js";
import { initFleetTabs } from "./components/fleet-tabs.js";
import { initFleetModal } from "./components/fleet-modal.js";
import { initJourneyRouteScroll } from "./blocks/journey-route.js";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);


function bindLocationNavToMap(mapControls) {
    const section = document.getElementById('locations-map');
    if (!mapControls?.openLocationById || !section) return;

    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-map-location-id]');
        if (!link) return;
        e.preventDefault();
        const id = Number(link.dataset.mapLocationId);
        if (!Number.isFinite(id)) return;
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        mapControls.openLocationById(id);
    });
}


// const smoother = ScrollSmoother.create({
//     smooth: 1.4,
//     effects: false,
//     smoothTouch: 0.1,
// });


// // Легковесный плавный скролл, который не ломает position: sticky
// class SmoothScroll {
//     constructor() {
//         this.isScrolling = false;
//         this.scrollTarget = 0;
//         this.currentScroll = 0;
//         this.smoothness = 0.08;
//         this.init();
//     }

//     init() {
//         // Плавный скролл для якорных ссылок
//         document.addEventListener('click', (e) => {
//             const anchor = e.target.closest('a[href^="#"]');
//             if (!anchor) return;
            
//             const targetId = anchor.getAttribute('href');
//             if (targetId === '#' || targetId === '#top') return;
            
//             const targetElement = document.querySelector(targetId);
//             if (!targetElement) return;
            
//             e.preventDefault();
//             this.scrollTo(targetElement);
//         });

//         // Плавный скролл при программном вызове scrollTo
//         const originalScrollTo = window.scrollTo;
//         window.scrollTo = (...args) => {
//             if (args.length === 1 && typeof args[0] === 'object' && args[0].behavior === 'smooth') {
//                 this.scrollToPosition(args[0].top || 0);
//             } else if (args.length === 2 && args[1] === 'smooth') {
//                 this.scrollToPosition(args[0] || 0);
//             } else {
//                 originalScrollTo.apply(window, args);
//             }
//         };
//     }

//     scrollTo(element) {
//         const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
//         this.scrollToPosition(targetPosition);
//     }

//     scrollToPosition(target) {
//         this.scrollTarget = Math.max(0, Math.min(target, document.documentElement.scrollHeight - window.innerHeight));
        
//         if (!this.isScrolling) {
//             this.currentScroll = window.pageYOffset;
//             this.isScrolling = true;
//             this.animate();
//         }
//     }

//     animate() {
//         if (!this.isScrolling) return;
        
//         this.currentScroll += (this.scrollTarget - this.currentScroll) * this.smoothness;
        
//         if (Math.abs(this.scrollTarget - this.currentScroll) < 1) {
//             window.scrollTo(0, this.scrollTarget);
//             this.isScrolling = false;
//         } else {
//             window.scrollTo(0, this.currentScroll);
//             requestAnimationFrame(() => this.animate());
//         }
//     }
// }

// // Инициализация плавного скролла
// const smoothScroll = new SmoothScroll();



document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initMenu('.menu');
        initMobileMenu();
        initHero();
        initVideoModal();
        initTextModal();
        initAdvantage();
        initCurtains();
        initScrollerText();
        initDifferences();
        initFleetTabs();
        initFleetModal();
        initJourneyRouteScroll();
        initMarqueeScrollDirection();
        void initMap().then((mapControls) => bindLocationNavToMap(mapControls));
    }, 300)
})