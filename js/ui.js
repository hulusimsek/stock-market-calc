function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            const firstInput = document.querySelector(`#${targetId} input`);
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 50);
            }
        });
    });
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
            e.preventDefault();
            const btns = document.querySelectorAll('.tab-btn');
            const targetBtn = btns[parseInt(e.key) - 1];
            if (targetBtn) targetBtn.click();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
            const tab1 = document.getElementById('tab-ortalama');
            if (tab1.classList.contains('active')) {
                e.preventDefault();
                document.getElementById('btn-add-alim').click();
            }
        }
    });
}
