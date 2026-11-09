
import './stimulus_bootstrap.js';
import './styles/app.css';
import './styles/pages/loading.css';

// Barre de chargement
const bar = document.querySelector('[data-loading-bar]');
const percent = document.querySelector('[data-loading-percent]');

if (bar && percent) {
    const timer = setInterval(() => {
        bar.value += 1;
        percent.textContent = `${bar.value}%`;

        if (bar.value >= 100) clearInterval(timer);
    }, 30);
}

// Thème clair / sombre
document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
});
