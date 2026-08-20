document.addEventListener('DOMContentLoaded', () => {
    // Dinamik renk event listener'lari ui.js yerine burada global kuruyoruz
    document.querySelectorAll('input.color-dynamic').forEach(input => {
        input.addEventListener('input', () => applyDynamicColor(input));
    });

    initTabs();
    initOrtalamaMaliyet();
    initSimulator();
    initPlanlayici();
    initKomisyon();
    initTimezone();
    initKeyboardShortcuts();
});
