import { gsap } from 'gsap';

export const initVideoModal = () => {
    // Создаем модальное окно, если его еще нет
    let modal = document.querySelector('.video-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal__overlay"></div>
            <div class="video-modal__container">
                <button class="video-modal__close" aria-label="Закрыть">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="video-modal__content">
                    <video class="video-modal__video" controls></video>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const overlay = modal.querySelector('.video-modal__overlay');
    const closeBtn = modal.querySelector('.video-modal__close');
    const video = modal.querySelector('.video-modal__video');
    const container = modal.querySelector('.video-modal__container');
    const content = modal.querySelector('.video-modal__content');

    // Устанавливаем начальное состояние для анимации
    gsap.set(modal, { visibility: 'hidden', pointerEvents: 'none' });
    gsap.set(overlay, { opacity: 0, backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' });
    gsap.set(container, { 
        scale: 0.85, 
        opacity: 0
    });
    gsap.set(closeBtn, { opacity: 0, scale: 0, rotation: 180 });
    gsap.set(video, { opacity: 0 });

    let isOpen = false;
    let openTimeline = null;
    let closeTimeline = null;

    // Функция открытия модального окна
    const openModal = (videoSrc) => {
        if (isOpen) return;
        isOpen = true;

        // Убиваем предыдущие анимации
        if (closeTimeline) closeTimeline.kill();
        
        video.src = videoSrc;
        modal.classList.add('video-modal--active');
        
        // Блокируем скролл body
        document.body.style.overflow = 'hidden';
        
        // Создаем timeline для открытия
        openTimeline = gsap.timeline({
            defaults: { ease: 'expo.out' },
            onComplete: () => {
                // Начинаем воспроизведение видео после завершения анимации
                video.play().catch(err => {
                    console.error('Ошибка воспроизведения видео:', err);
                });
            }
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

        // Анимация видео - плавное появление
        openTimeline.to(video, {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out'
        }, 0.7);
    };

    // Функция закрытия модального окна
    const closeModal = () => {
        if (!isOpen) return;
        isOpen = false;

        // Убиваем анимацию открытия
        if (openTimeline) openTimeline.kill();

        // Останавливаем видео
        video.pause();
        video.currentTime = 0;

        // Восстанавливаем скролл body
        document.body.style.overflow = '';

        // Создаем timeline для закрытия
        closeTimeline = gsap.timeline({
            defaults: { ease: 'expo.in' },
            onComplete: () => {
                video.src = '';
                modal.classList.remove('video-modal--active');
                gsap.set(modal, { visibility: 'hidden', pointerEvents: 'none' });
            }
        });

        // Анимация закрытия - быстрое и плавное
        closeTimeline.to(video, {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in'
        }, 0);

        closeTimeline.to(closeBtn, {
            opacity: 0,
            scale: 0,
            rotation: 180,
            duration: 0.2,
            ease: 'power2.in'
        }, 0);

        closeTimeline.to(container, {
            scale: 0.9,
            opacity: 0,
            duration: 0.4,
            ease: 'expo.in'
        }, 0.1);

        closeTimeline.to(overlay, {
            opacity: 0,
            backdropFilter: 'blur(0px)',
            WebkitBackdropFilter: 'blur(0px)',
            duration: 0.4,
            ease: 'power2.in'
        }, 0.1);
    };

    // Обработчики закрытия
    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closeModal();
        }
    });

    // Обработчики кликов на кнопки с data-video-modal-src
    document.addEventListener('click', (e) => {
        const button = e.target.closest('[data-video-modal-src]');
        if (button) {
            e.preventDefault();
            const videoSrc = button.getAttribute('data-video-modal-src');
            if (videoSrc) {
                openModal(videoSrc);
            }
        }
    });
};
