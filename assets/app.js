
import './stimulus_bootstrap.js';
import './styles/app.css';
import './styles/pages/loading.css';
import './styles/pages/chose-avatar.css';
// import './styles/pages/vitrine.css';

const app = document.querySelector('#fsac-app');
const bar = app.querySelector('[data-loading-bar]');
const percent = app.querySelector('[data-loading-percent]');
const avatar = app.querySelector('.avatar-image');
const buttons = app.querySelectorAll('[data-select-avatar]');
const html = document.documentElement;

let timer;
let transitioning = false;

// NAVIGATION ENTRE LES COMPOSANTS
function show(stage) {
    if (transitioning) return;

    const current = app.querySelector('[data-stage]:not([hidden])');
    const next = app.querySelector(`[data-stage="${stage}"]`);

    if (!next || (current === next && stage !== 'loading')) return;

    clearInterval(timer);

    // TRANSITION AVATAR → VITRINE
    if (
        current?.dataset.stage === 'avatar' &&
        stage === 'vitrine' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
        transitioning = true;
        next.hidden = false;

        current.classList.remove('stage-enter');
        current.classList.add('stage-leave');

        next.classList.remove('stage-enter');
        void next.offsetWidth;
        next.classList.add('stage-enter');

        const end = e => {
            if (e.target !== current) return;

            current.hidden = true;
            current.classList.remove('stage-leave');
            current.removeEventListener('animationend', end);
            transitioning = false;
        };

        current.addEventListener('animationend', end);
        return;
    }

    // NAVIGATION NORMALE
    app.querySelectorAll('[data-stage]').forEach(el => {
        el.hidden = el !== next;
        el.classList.remove('stage-leave');
    });

    next.classList.remove('stage-enter');
    void next.offsetWidth;
    next.classList.add('stage-enter');

    // LOADING
    if (stage !== 'loading') return;

    bar.value = 0;
    percent.textContent = '0%';

    timer = setInterval(() => {
        bar.value++;
        percent.textContent = `${bar.value}%`;

        if (bar.value >= 100) show('avatar');
    }, 30);
}

// INTERACTIONS
document.addEventListener('click', e => {

    // Navigation entre les sections
    const go = e.target.closest('[data-go]');
    if (go) {
        e.preventDefault();
        show(go.dataset.go);
    }

    // Mode sombre / clair
    const theme = e.target.closest('[data-theme-toggle]');
    if (theme) {
        html.dataset.theme = html.dataset.theme === 'dark'
            ? 'light'
            : 'dark';
    }

    // Choix d'avatar
    const button = e.target.closest('[data-select-avatar]');

    if (!button || !avatar || avatar.classList.contains('is-changing')) return;
    if (button.getAttribute('aria-pressed') === 'true') return;

    avatar.classList.add('is-changing');

    setTimeout(() => {
        const woman = button.dataset.selectAvatar === 'woman';

        avatar.src = woman
            ? avatar.dataset.womanSrc
            : avatar.dataset.manSrc;

        avatar.alt = woman
            ? 'Avatar étudiante FSAC'
            : 'Avatar étudiant FSAC';

        buttons.forEach(b => {
            b.setAttribute('aria-pressed', String(b === button));
        });

        avatar.classList.remove('is-changing');
    }, 150);
});

// DÉMARRAGE
show('loading');
