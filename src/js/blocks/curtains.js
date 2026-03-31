import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const initCurtains = () => {
    if (window.innerWidth <= 960) return;

    const curtains = document.querySelectorAll('.curtains');

    curtains.forEach(curtain => {
        const curtainsLeft = curtain.querySelector('.curtains__left');
        const curtainsRight = curtain.querySelector('.curtains__right');
        const curtainsDecoration = curtain.querySelector('.curtains__decoration');

        gsap.set(curtainsDecoration, {scale: 0.90});
        gsap.set(curtainsLeft, {x: '0'});
        gsap.set(curtainsRight, {x: '0'});

        ScrollTrigger.create({
            trigger: curtain,
            start: 'top top',
            end: '+=1500vh',
            pin: true,
            markers: true,
            anticipatePin: true
        });

        gsap.to(curtainsDecoration, {
            scale: 1,
            scrollTrigger: {
                trigger: curtain,
                start: 'top bottom',
                end: 'top top+=20%',
                scrub: true,
            }
        });

        gsap.to(curtainsLeft, {
            x: '-50vw',
            scrollTrigger: {
                trigger: curtainsDecoration,
                start: 'top top',
                end: '+=200vh',
                scrub: true,
            }
        });

        gsap.to(curtainsRight, {
            x: '50vw',
            scrollTrigger: {
                trigger: curtainsDecoration,
                start: 'top top',
                end: '+=200vh',
                scrub: true,
            }
        });
    });
}