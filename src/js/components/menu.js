import {gsap} from "gsap";
import {SplitText}  from "gsap/SplitText";

export const initMenu = (selector= '.menu') => {
    const menu = document.querySelector(selector);
    if (!menu) return;

    const dropdownItems = document.querySelectorAll('.menu__item--dropdown');

    // Регистрируем плагин
    gsap.registerPlugin(SplitText);

    // Функция для создания анимаций для конкретного элемента
    const createAnimations = (item) => {
        const sublist = item.querySelector('.menu__sub-list');
        const subItems = item.querySelectorAll('.menu__sub-item');
        const subLinks = item.querySelectorAll('.menu__sub-link');

        // Удаляем старые анимации и обработчики
        if (item._animations) {
            item._animations.showTimeline?.kill();
            item._animations.hideTimeline?.kill();

            // Удаляем старые обработчики событий
            item.removeEventListener('mouseenter', item._animations.handleMouseEnter);
            item.removeEventListener('mouseleave', item._animations.handleMouseLeave);
        }

        let splitTextInstances = [];

        // Функция для получения реальной высоты
        const getRealHeight = () => {
            // Сохраняем текущие стили
            const originalDisplay = sublist.style.display;

            // Временно показываем для измерения
            sublist.style.display = 'block';
            sublist.style.visibility = 'hidden';
            sublist.style.position = 'absolute';
            sublist.style.height = 'auto';

            const height = sublist.offsetHeight;

            // Восстанавливаем стили
            sublist.style.display = originalDisplay || '';
            sublist.style.visibility = '';
            sublist.style.position = '';
            sublist.style.height = '0';

            return height;
        };

        const realHeight = getRealHeight();

        // Создаем новые анимации
        const showTimeline = gsap.timeline({
            paused: true,
            onStart: () => {
                // Убедимся, что список видим перед анимацией
                sublist.style.display = 'block';
            }
        });

        showTimeline.to(sublist, {
            duration: 0.4,
            height: realHeight,
            visibility: 'visible',
            ease: 'power2.out'
        });

        const hideTimeline = gsap.timeline({
            paused: true,
            onComplete: () => {
                sublist.style.visibility = 'hidden';
                sublist.style.display = '';
            }
        });

        hideTimeline.to(sublist, {
            duration: 0.3,
            height: 0,
            ease: 'power2.in'
        }, "-=0.1");

        // Обработчики событий
        const handleMouseEnter = () => {
            hideTimeline.kill();
            showTimeline.restart();
        };

        const handleMouseLeave = () => {
            showTimeline.kill();
            hideTimeline.restart();
        };

        // Добавляем обработчики
        item.addEventListener('mouseenter', handleMouseEnter);
        item.addEventListener('mouseleave', handleMouseLeave);

        // Сохраняем данные для последующего обновления
        item._animations = {
            showTimeline,
            hideTimeline,
            handleMouseEnter,
            handleMouseLeave,
            splitTextInstances,
            sublist,
            realHeight
        };

        // Устанавливаем начальное состояние
        gsap.set(sublist, {
            height: 0,
            visibility: 'hidden'
        });
    };

    // Инициализируем анимации для всех элементов
    dropdownItems.forEach(item => {
        createAnimations(item);
    });

    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            dropdownItems.forEach(item => {
                const data = item._animations;

                if (data) {
                    // Убиваем текущие анимации
                    gsap.killTweensOf(data.sublist);

                    // Если есть активная анимация, завершаем её
                    if (data.showTimeline.isActive() || data.hideTimeline.isActive()) {
                        data.sublist.style.height = '0';
                        data.sublist.style.visibility = 'hidden';
                        data.sublist.style.display = '';
                    }

                    // Пересоздаем анимации с новой высотой
                    createAnimations(item);
                }
            });
        }, 250);
    });
};