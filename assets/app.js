
import './stimulus_bootstrap.js';
import './styles/app.css';
import './styles/pages/loading.css';
import './styles/pages/chose-avatar.css';
import './styles/pages/vitrine.css';

/* =========================================================
   CONFIGURATION
========================================================= */

const app = document.querySelector('#fsac-app');

if (app) {
    const html = document.documentElement;

    const stages = [...app.querySelectorAll('[data-stage]')];

    const loadingStage = app.querySelector('[data-stage="loading"]');
    const avatarStage  = app.querySelector('[data-stage="avatar"]');
    const vitrineStage = app.querySelector('[data-stage="vitrine"]');

    const bar = app.querySelector('[data-loading-bar]');
    const percent = app.querySelector('[data-loading-percent]');

    const avatar = app.querySelector('.avatar-image');
    const avatarButtons = app.querySelectorAll('[data-select-avatar]');

    const mobileMenu = app.querySelector('.mobile-menu');

    let loadingTimer = null;
    let avatarTimer = null;
    let transitionTimer = null;

    let transitioning = false;
    let currentStage = 'loading';

    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;


/* =========================================================
   1. UTILITAIRES
========================================================= */

    function stopLoading() {
        clearInterval(loadingTimer);
        loadingTimer = null;
    }

    function closeMenu() {
        if (!mobileMenu) return;

        mobileMenu.hidden = true;
        document.body.style.overflow = '';
    }

    function openMenu() {
        if (!mobileMenu) return;

        mobileMenu.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function updateThemeButton() {
        const isDark = html.dataset.theme === 'dark';

        document.querySelectorAll('[data-theme-toggle]').forEach(button => {
            button.setAttribute(
                'aria-label',
                isDark ? 'Passer en mode clair' : 'Passer en mode sombre'
            );
        });
    }

    function toggleTheme() {
        html.dataset.theme = html.dataset.theme === 'dark'
            ? 'light'
            : 'dark';

        updateThemeButton();
    }


/* =========================================================
   2. CHARGEMENT
   Compatible loader SVG seul ou barre + pourcentage
========================================================= */

    function startLoading() {
        stopLoading();

        let progress = 0;

        if (bar) bar.value = 0;
        if (percent) percent.textContent = '0%';

        if (loadingStage) {
            loadingStage.style.setProperty('--loading-progress', '0%');
        }

        if (reducedMotion) {
            showStage('avatar');
            return;
        }

        loadingTimer = setInterval(() => {
            progress++;

            if (bar) {
                bar.value = progress;
            }

            if (percent) {
                percent.textContent = `${progress}%`;
            }

            if (loadingStage) {
                loadingStage.style.setProperty(
                    '--loading-progress',
                    `${progress}%`
                );
            }

            if (progress >= 100) {
                stopLoading();
                showStage('avatar');
            }
        }, 30);
    }


/* =========================================================
   3. NAVIGATION ENTRE LES 3 ÉTAPES
========================================================= */

    function showStage(stageName) {
        if (transitioning) return;

        const nextStage = app.querySelector(
            `[data-stage="${stageName}"]`
        );

        if (!nextStage) {
            console.warn(`Étape introuvable : ${stageName}`);
            return;
        }

        if (currentStage === stageName) {
            if (stageName === 'loading') {
                startLoading();
            }
            return;
        }

        stopLoading();
        closeMenu();

        const current = app.querySelector('[data-stage]:not([hidden])');

        clearTimeout(transitionTimer);

        /* Transition Avatar -> Vitrine */

        if (
            current &&
            current.dataset.stage === 'avatar' &&
            stageName === 'vitrine' &&
            !reducedMotion
        ) {
            transitioning = true;

            nextStage.hidden = false;

            current.classList.remove('stage-enter', 'stage-leave');
            nextStage.classList.remove('stage-enter', 'stage-leave');

            current.classList.add('stage-leave');
            nextStage.classList.add('stage-enter');

            currentStage = stageName;

            const finishTransition = () => {
                current.hidden = true;
                current.classList.remove('stage-leave');

                nextStage.classList.remove('stage-enter');

                transitioning = false;

                current.removeEventListener(
                    'animationend',
                    onAnimationEnd
                );
            };

            const onAnimationEnd = event => {
                if (event.target !== current) return;
                finishTransition();
            };

            current.addEventListener('animationend', onAnimationEnd);

            // Sécurité si l'animation CSS n'existe pas
            transitionTimer = setTimeout(finishTransition, 1000);

            return;
        }

        /* Navigation normale */

        stages.forEach(section => {
            section.hidden = section !== nextStage;
            section.classList.remove('stage-leave', 'stage-enter');
        });

        currentStage = stageName;

        if (!reducedMotion) {
            nextStage.classList.add('stage-enter');

            nextStage.addEventListener('animationend', () => {
                nextStage.classList.remove('stage-enter');
            }, { once: true });
        }

        if (stageName === 'loading') {
            startLoading();
        }
    }


/* =========================================================
   4. CHOIX DE L'AVATAR
========================================================= */

    function selectAvatar(button) {
        if (!avatar) return;

        if (avatar.classList.contains('is-changing')) return;

        const avatarType = button.dataset.selectAvatar;

        if (avatarType !== 'man' && avatarType !== 'woman') return;

        if (button.getAttribute('aria-pressed') === 'true') return;

        avatar.classList.add('is-changing');

        clearTimeout(avatarTimer);

        avatarTimer = setTimeout(() => {
            const isWoman = avatarType === 'woman';

            const newSrc = isWoman
                ? avatar.dataset.womanSrc
                : avatar.dataset.manSrc;

            if (newSrc) {
                avatar.src = newSrc;
            }

            avatar.alt = isWoman
                ? 'Avatar étudiante FSAC'
                : 'Avatar étudiant FSAC';

            avatarButtons.forEach(btn => {
                btn.setAttribute(
                    'aria-pressed',
                    String(btn === button)
                );
            });

            avatar.classList.remove('is-changing');
        }, reducedMotion ? 0 : 150);
    }


/* =========================================================
   5. INTERACTIONS
   Gestion centralisée des clics
========================================================= */

    document.addEventListener('click', event => {

        /* Ouverture du menu mobile */

        const menuToggle = event.target.closest('.menu-toggle');

        if (menuToggle) {
            event.preventDefault();
            openMenu();
            return;
        }

        /* Fermeture du menu */

        const menuClose = event.target.closest('.menu-close');

        if (menuClose) {
            event.preventDefault();
            closeMenu();
            return;
        }

        /* Fermeture en cliquant sur le backdrop */

        if (
            mobileMenu &&
            !mobileMenu.hidden &&
            event.target === mobileMenu
        ) {
            closeMenu();
            return;
        }

        /* Navigation par data-go */

        const navigation = event.target.closest('[data-go]');

        if (navigation) {
            event.preventDefault();

            const destination = navigation.dataset.go;

            showStage(destination);
            return;
        }

        /* Mode sombre / clair */

        const themeButton = event.target.closest('[data-theme-toggle]');

        if (themeButton) {
            event.preventDefault();
            toggleTheme();
            return;
        }

        /* Sélection de l'avatar */

        const avatarButton = event.target.closest('[data-select-avatar]');

        if (avatarButton) {
            selectAvatar(avatarButton);
        }
    });


/* =========================================================
   6. FERMETURE AVEC ESCAPE
========================================================= */

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && mobileMenu && !mobileMenu.hidden) {
            closeMenu();
        }
    });


/* =========================================================
   7. INITIALISATION
========================================================= */

    updateThemeButton();

    stages.forEach(section => {
        section.hidden = section.dataset.stage !== 'loading';
    });

    currentStage = 'loading';

    startLoading();
}
