import { gsap } from 'gsap';

export const initTextModal = () => {
    // Создаем модальное окно, если его еще нет
    let modal = document.querySelector('.text-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'text-modal';
        modal.innerHTML = `
            <div class="text-modal__overlay"></div>
            <div class="text-modal__container">
                <button class="text-modal__close" aria-label="Закрыть">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="text-modal__content">
                    <h4 class="text-modal__title"></h4>
                    <div class="text-modal__text"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const overlay = modal.querySelector('.text-modal__overlay');
    const closeBtn = modal.querySelector('.text-modal__close');
    const container = modal.querySelector('.text-modal__container');
    const title = modal.querySelector('.text-modal__title');
    const text = modal.querySelector('.text-modal__text');

    // Устанавливаем начальное состояние для анимации
    gsap.set(modal, { visibility: 'hidden', pointerEvents: 'none' });
    gsap.set(overlay, { opacity: 0, backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' });
    gsap.set(container, { 
        scale: 0.85, 
        opacity: 0
    });
    gsap.set(closeBtn, { opacity: 0, scale: 0, rotation: 180 });
    gsap.set([title, text], { opacity: 0, y: 20 });

    let isOpen = false;
    let openTimeline = null;
    let closeTimeline = null;

    // Функция открытия модального окна
    const openModal = (contentElement) => {
        // Проверяем размер экрана - модалка открывается только на экранах <= 960px
        if (window.innerWidth > 960) return;
        if (isOpen) return;
        isOpen = true;

        // Убиваем предыдущие анимации
        if (closeTimeline) closeTimeline.kill();
        
        // Получаем заголовок и содержимое
        const titleElement = contentElement.closest('.advantage__right').querySelector('.advantage__title');
        const content = contentElement.innerHTML;
        
        // Убираем слово "Читать" из заголовка для модалки
        const titleText = titleElement ? titleElement.textContent.replace(/Читать\s*/i, '').trim() : 'True Story';
        title.textContent = titleText;
        text.innerHTML = content;
        
        modal.classList.add('text-modal--active');
        
        // Блокируем скролл body
        document.body.style.overflow = 'hidden';
        
        // Создаем timeline для открытия
        openTimeline = gsap.timeline({
            defaults: { ease: 'expo.out' }
        });

        // Показываем модальное окно
        openTimeline.set(modal, { visibility: 'visible', pointerEvents: 'auto' });

        // Анимация overlay - плавное появление с blur
        openTimeline.to(overlay, {
            opacity: 1,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            duration: 0.8,
            ease: 'power1.out'
        }, 0);

        // Анимация контейнера - масштабирование с плавным появлением
        openTimeline.to(container, {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: 'expo.out'
        }, 0.2);

        // Анимация кнопки закрытия - появляется с задержкой
        openTimeline.to(closeBtn, {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.5,
            ease: 'back.out(2)'
        }, 0.6);

        // Анимация контента - плавное появление
        openTimeline.to([title, text], {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, 0.8);
    };

    // Функция закрытия модального окна
    const closeModal = () => {
        if (!isOpen) return;
        isOpen = false;

        // Убиваем предыдущие анимации
        if (openTimeline) openTimeline.kill();
        
        modal.classList.remove('text-modal--active');
        
        // Разблокируем скролл body
        document.body.style.overflow = '';
        
        // Создаем timeline для закрытия
        closeTimeline = gsap.timeline({
            defaults: { ease: 'expo.in' },
            onComplete: () => {
                gsap.set(modal, { visibility: 'hidden', pointerEvents: 'none' });
            }
        });

        // Анимация контента - исчезновение
        closeTimeline.to([title, text], {
            opacity: 0,
            y: -20,
            duration: 0.3,
            ease: 'power2.in'
        }, 0);

        // Анимация кнопки закрытия
        closeTimeline.to(closeBtn, {
            opacity: 0,
            scale: 0,
            rotation: 180,
            duration: 0.3,
            ease: 'back.in(2)'
        }, 0.1);

        // Анимация контейнера
        closeTimeline.to(container, {
            scale: 0.85,
            opacity: 0,
            duration: 0.5,
            ease: 'expo.in'
        }, 0.2);

        // Анимация overlay
        closeTimeline.to(overlay, {
            opacity: 0,
            backdropFilter: 'blur(0px)',
            WebkitBackdropFilter: 'blur(0px)',
            duration: 0.5,
            ease: 'power1.in'
        }, 0.2);
    };

    // Обработчики событий
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal();
    });

    overlay.addEventListener('click', () => {
        closeModal();
    });

    // Обработка кликов на заголовки "Читать True Story"
    // Модалка открывается только на экранах <= 960px
    document.addEventListener('click', (e) => {
        // Проверяем размер экрана перед обработкой клика
        if (window.innerWidth > 960) return;
        
        const titleElement = e.target.closest('[data-read-modal]');
        if (titleElement) {
            e.preventDefault();
            const advantageRight = titleElement.closest('.advantage__right');
            if (advantageRight) {
                const contentElement = advantageRight.querySelector('.advantage__content');
                if (contentElement) {
                    openModal(contentElement);
                }
            }
        }
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closeModal();
        }
    });
};
