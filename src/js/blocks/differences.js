export const initDifferences = () => {
    const differencesSection = document.querySelector('.differences');
    if (!differencesSection) return;

    const differenceElements = document.querySelectorAll('.difference');
    const images = document.querySelectorAll('.differences__image');
    
    if (differenceElements.length === 0 || images.length === 0) return;

    // Устанавливаем первое изображение активным по умолчанию
    const firstImage = document.querySelector('#difference-image-0');
    if (firstImage) {
        firstImage.classList.add('differences__image--active');
    }

    // Функция для проверки, пересек ли элемент порог 25% от низа экрана
    const checkScrollThreshold = () => {
        const viewportHeight = window.innerHeight;
        const threshold = viewportHeight * 0.45;

        // Скрываем все изображения
        images.forEach(img => {
            img.classList.remove('differences__image--active');
        });

        // Проверяем каждый элемент difference снизу вверх
        // (чтобы показывать последний элемент, который пересек порог)
        let activeImageId = null;
        
        for (let i = differenceElements.length - 1; i >= 0; i--) {
            const element = differenceElements[i];
            const rect = element.getBoundingClientRect();
            
            // Проверяем, пересек ли элемент порог 25% от низа экрана
            // Порог находится на 75% от верха экрана (25% от низа)
            // Элемент считается пересекшим порог, когда его верхняя граница находится на уровне порога или выше
            if (rect.top <= threshold) {
                const imageId = element.getAttribute('data-image-id');
                if (imageId) {
                    activeImageId = imageId;
                    break;
                }
            }
        }

        // Если ни один элемент не пересек порог, показываем первое изображение
        if (!activeImageId) {
            activeImageId = '#difference-image-0';
        }

        // Показываем соответствующее изображение
        const targetImage = document.querySelector(activeImageId);
        if (targetImage) {
            targetImage.classList.add('differences__image--active');
        }
    };

    // Обработчик события прокрутки
    let ticking = false;
    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                checkScrollThreshold();
                ticking = false;
            });
            ticking = true;
        }
    };

    // Инициализация при загрузке
    checkScrollThreshold();

    // Добавляем обработчик прокрутки
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollThreshold, { passive: true });
};
