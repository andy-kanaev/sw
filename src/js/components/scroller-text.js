import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

export const initScrollerText = () => {
    if (window.innerWidth <= 960) return;

    const scrollerTextElements = document.querySelectorAll('.scroller-text[data-scroller]');
    if (scrollerTextElements.length === 0) return;

    scrollerTextElements.forEach((element) => {
        const scrollerValue = element.getAttribute('data-scroller');
        if (!scrollerValue) return;

        const scrollerStart = element.getAttribute('data-scroller-start');
        const startValue = scrollerStart ? `top top-=${scrollerStart}` : 'top top';

        // Получаем начальное значение opacity (по умолчанию 0)
        const opacityStartAttr = element.getAttribute('data-scroller-opacity-start');
        const opacityStart = opacityStartAttr ? parseFloat(opacityStartAttr) : 0;

        const textElements = element.querySelectorAll('.scroller-text__text');
        if (textElements.length === 0) return;

        const allChars = [];

        textElements.forEach((textEl) => {
            const split = new SplitText(textEl, {
                type: 'words,chars',
                wordsClass: 'scroller-text__word',
                charsClass: 'scroller-text__char'
            });

            const chars = split.chars;
            if (chars && chars.length > 0) {
                // Обрабатываем пробелы, чтобы они не ломали перенос слов
                chars.forEach((char) => {
                    if (char.textContent === ' ') {
                        // Пробелы должны быть видимыми, но не ломать перенос
                        char.style.whiteSpace = 'normal';
                        char.setAttribute('data-char', ' ');
                    }
                });
                allChars.push(...chars);
            }
        });

        if (allChars.length === 0) return;

        // Устанавливаем начальное значение opacity
        gsap.set(allChars, { opacity: opacityStart });

        ScrollTrigger.create({
            trigger: element,
            start: startValue,
            end: `+=${scrollerValue}`,
            scrub: true,
            onUpdate: (self) => {
                const scrollProgress = self.progress; // от 0 до 1

                allChars.forEach((char, index) => {
                    // Вычисляем позицию буквы в диапазоне от 0 до 1
                    // Распределяем буквы равномерно по всему диапазону скролла
                    const charPosition = index / (allChars.length - 1 || 1);
                    
                    // Каждая буква появляется последовательно
                    // Используем диапазон для плавного появления каждой буквы
                    const charRange = 0.1; // Каждая буква появляется за 10% общего прогресса
                    const charStart = Math.max(0, charPosition - charRange);
                    const charEnd = Math.min(1, charPosition + charRange);
                    
                    let charOpacity = opacityStart;
                    
                    if (scrollProgress <= charStart) {
                        charOpacity = opacityStart;
                    } else if (scrollProgress >= charEnd) {
                        charOpacity = 1;
                    } else {
                        // Плавное появление между charStart и charEnd
                        // Интерполируем от начального opacity до 1
                        const localProgress = (scrollProgress - charStart) / (charEnd - charStart);
                        charOpacity = opacityStart + (1 - opacityStart) * localProgress;
                    }
                    
                    gsap.set(char, { opacity: charOpacity });
                });
            }
        });
    });
};
