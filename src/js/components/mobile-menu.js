import gsap from 'gsap';

export const initMobileMenu = () => {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (!hamburger || !mobileMenu) return;

    // Получаем все элементы меню для анимации
    const menuItems = mobileMenu.querySelectorAll('.mobile-menu__item');
    const phoneLink = mobileMenu.querySelector('.mobile-menu__phone');
    const button = mobileMenu.querySelector('.mobile-menu__button');
    const dropdownLinks = mobileMenu.querySelectorAll('.mobile-menu__item--dropdown .mobile-menu__link');

    // Инициализация меню - скрываем все элементы
    gsap.set(mobileMenu, { xPercent: -100 });
    gsap.set([...menuItems, phoneLink, button], {
        opacity: 0,
        y: 20
    });

    // Анимация открытия меню
    const openMenu = () => {
        const tl = gsap.timeline();

        // Сначала выезжает меню
        tl.to(mobileMenu, {
            xPercent: 0,
            duration: 0.5,
            ease: "power2.out"
        })
            // Затем появляются элементы по очереди
            .to(menuItems, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.2")
            // Контакты появляются после меню
            .to([phoneLink, button], {
                opacity: 1,
                y: 0,
                duration: 0.3,
                stagger: 0.1,
                ease: "power2.out"
            }, "-=0.1");

        hamburger.classList.add('hamburger--active');
        mobileMenu.classList.add('mobile-menu--active');
        document.body.style.overflow = 'hidden';
    };

    // Анимация закрытия меню
    const closeMenu = () => {
        const tl = gsap.timeline();

        // Сначала скрываем контакты
        tl.to([phoneLink, button], {
            opacity: 0,
            y: 20,
            duration: 0.2,
            ease: "power2.in"
        })
            // Затем скрываем пункты меню в обратном порядке
            .to([...menuItems].reverse(), {
                opacity: 0,
                y: 20,
                duration: 0.2,
                stagger: 0.05,
                ease: "power2.in"
            }, "-=0.1")
            // В конце уезжает меню
            .to(mobileMenu, {
                xPercent: -100,
                duration: 0.4,
                ease: "power2.in"
            });

        hamburger.classList.remove('hamburger--active');
        mobileMenu.classList.remove('mobile-menu--active');
        document.body.style.overflow = '';

        // Закрываем все открытые подменю при закрытии меню
        closeAllSubmenus();
    };

    // Функции для работы с подменю
    const closeAllSubmenus = () => {
        const subItems = mobileMenu.querySelectorAll('.mobile-menu__sub-item');
        const subLists = mobileMenu.querySelectorAll('.mobile-menu__sub-list');

        gsap.set(subItems, { height: 0 });
        gsap.set(subLists, { height: 0 });

        // Убираем активный класс у всех dropdown-элементов
        mobileMenu.querySelectorAll('.mobile-menu__item--dropdown').forEach(item => {
            item.classList.remove('mobile-menu__item--open');
        });
    };

    const toggleSubmenu = (dropdownItem) => {
        const subList = dropdownItem.querySelector('.mobile-menu__sub-list');
        const subItems = dropdownItem.querySelectorAll('.mobile-menu__sub-item');
        const isOpen = dropdownItem.classList.contains('mobile-menu__item--open');

        if (isOpen) {
            // Закрываем подменю
            const tl = gsap.timeline();

            // Анимация высоты подэлементов
            tl.to(subItems, {
                height: 0,
                duration: 0.3,
                stagger: -0.1,
                ease: "power2.in"
            })
                // Анимация высоты контейнера
                .to(subList, {
                    height: 0,
                    duration: 0.3,
                    ease: "power2.in"
                }, "-=0.2");

            dropdownItem.classList.remove('mobile-menu__item--open');
        } else {
            // Закрываем все остальные подменю
            const allDropdowns = mobileMenu.querySelectorAll('.mobile-menu__item--dropdown');
            allDropdowns.forEach(item => {
                if (item !== dropdownItem && item.classList.contains('mobile-menu__item--open')) {
                    const otherSubList = item.querySelector('.mobile-menu__sub-list');
                    const otherSubItems = item.querySelectorAll('.mobile-menu__sub-item');

                    gsap.to(otherSubItems, {
                        height: 0,
                        duration: 0.3,
                        stagger: -0.1,
                        ease: "power2.in"
                    });
                    gsap.to(otherSubList, {
                        height: 0,
                        duration: 0.3,
                        ease: "power2.in"
                    });
                    item.classList.remove('mobile-menu__item--open');
                }
            });

            // Открываем текущее подменю
            const tl = gsap.timeline();

            // Сначала вычисляем высоту подэлементов
            let totalHeight = 0;
            subItems.forEach(item => {
                const subLink = item.querySelector('.mobile-menu__sub-link');
                totalHeight += subLink.offsetHeight;
            });

            // Анимация высоты контейнера
            tl.to(subList, {
                height: totalHeight,
                duration: 0.4,
                ease: "power2.out"
            })
                // Анимация высоты подэлементов с задержкой
                .to(subItems, {
                    height: (i) => {
                        const subLink = subItems[i].querySelector('.mobile-menu__sub-link');
                        return subLink.offsetHeight;
                    },
                    duration: 0.3,
                    stagger: 0.1,
                    ease: "power2.out"
                }, "-=0.2");

            dropdownItem.classList.add('mobile-menu__item--open');
        }
    };

    hamburger.addEventListener('click', () => {
        if (mobileMenu.classList.contains('mobile-menu--active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdownItem = link.closest('.mobile-menu__item--dropdown');
            toggleSubmenu(dropdownItem);
        });
    });

    mobileMenu.querySelectorAll('.mobile-menu__link[href], .mobile-menu__sub-link').forEach(link => {
        if (!link.closest('.mobile-menu__item--dropdown') || link.classList.contains('mobile-menu__sub-link')) {
            link.addEventListener('click', () => {
                closeMenu();
            });
        }
    });

    if (button) {
        button.addEventListener('click', () => {
            closeMenu();
        });
    }

    document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('mobile-menu--active') &&
            !mobileMenu.contains(e.target) &&
            !hamburger.contains(e.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('mobile-menu--active')) {
            closeMenu();
        }
    });
};