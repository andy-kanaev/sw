import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const initAdvantage = () => {
    const advantages = document.querySelector('.advantages');
    if (!advantages) return;

    const contentElement = document.querySelector('.advantages__content');
    if (!contentElement) return;

    const advantageElements = document.querySelectorAll('.advantage');
    if (advantageElements.length === 0) return;


    gsap.utils.toArray(".advantage").forEach((item, index) => {
        const topOffset = 10 + index * 6.7;
        // Устанавливаем top через inline стиль для sticky элементов
        // Процентные значения работают относительно viewport для sticky
        item.style.top = `${topOffset}%`;
        if (window.innerWidth > 960) {
            gsap.to(item, {
                scale: 0.65,
                ease: "none",
                scrollTrigger: {
                  trigger: ".advantages__content",
                  start: "top 10%",
                  end: "bottom 10%",
                  scrub: true,
                }
              });
        }
        
      });

}