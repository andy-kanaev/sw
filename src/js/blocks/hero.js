import {gsap} from 'gsap';
import {SplitText} from "gsap/SplitText";

const SPLIT_TEXT_OPTIONS = {
    type: 'lines,words,chars',
    linesClass: 'line',
    wordsClass: 'word',
    charsClass: 'char',
}

export const initHero = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const heroContent = hero.querySelector('.hero__content');
    const heroMedia = hero.querySelector('.hero__media');

    const heroSupTitle = hero.querySelector('.hero__suptitle');
    const heroTitle = hero.querySelector('.hero__title');
    const heroSubTitle = hero.querySelector('.hero__subtitle');
    const heroAction = hero.querySelector('.hero__action');
    const heroPlay = hero.querySelector('.hero__play');

    const heroSupTitleSplit = new SplitText(heroSupTitle, SPLIT_TEXT_OPTIONS)

    const heroTitleSplit = new SplitText(heroTitle, SPLIT_TEXT_OPTIONS)

    const heroSubTitleSplit = new SplitText(heroSubTitle, SPLIT_TEXT_OPTIONS)

    const resizeHandler = () => {
        heroMedia.style.height = `${heroContent.getBoundingClientRect().height}px`;
    };

    resizeHandler();

    gsap.set(heroTitleSplit.chars, {y: -heroTitleSplit.chars[0].getBoundingClientRect().height});
    gsap.set(heroSupTitleSplit.chars, {y: heroSupTitleSplit.chars[0].getBoundingClientRect().height});
    gsap.set(heroSubTitleSplit.chars, {y: heroSubTitleSplit.chars[0].getBoundingClientRect().height});
    gsap.set(heroAction, {opacity: 0});
    gsap.set(heroPlay, {opacity: 0});

    gsap.to(heroSupTitleSplit.chars, {y: 0, duration: .5});
    gsap.to(heroTitleSplit.chars, {y: 0, duration: .6, delay: .25});
    gsap.to(heroSubTitleSplit.chars, {y: 0, duration: .5, delay: .3});

    gsap.to(heroAction, {opacity: 1, duration: .5, delay: .5});
    gsap.to(heroPlay, {opacity: 1, duration: .5, delay: .5});

    window.addEventListener("resize", resizeHandler);
}