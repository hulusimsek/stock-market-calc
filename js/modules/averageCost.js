function initOrtalamaMaliyet() {
    const btnAdd = document.getElementById('btn-add-alim');
    const listContainer = document.getElementById('alim-listesi');
    
    let currentMarket = 'yok';
    const marketBtns = document.querySelectorAll('#avg-market-selector .market-btn');
    const bistFields = document.getElementById('avg-bist-fields');
    const elBistKomisyon = document.getElementById('avg-bist-komisyon');

    marketBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            marketBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMarket = btn.getAttribute('data-market');
            
            if (currentMarket === 'bist') {
                bistFields.style.display = 'block';
            } else {
                bistFields.style.display = 'none';
            }
            calculate();
        });
    });

    if (elBistKomisyon) {
        elBistKomisyon.addEventListener('input', calculate);
    }

    function calculate() {
        const rows = document.querySelectorAll('.alim-satir');
        let totalLot = 0;
        let totalCost = 0;
        let totalComm = 0;

        rows.forEach(row => {
            let miktar = Math.floor(parseFloat(row.querySelector('.input-miktar').value) || 0);
            const fiyat = parseFloat(row.querySelector('.input-fiyat').value) || 0;
            const elTutar = row.querySelector('.input-tutar');

            if (miktar > 0 && fiyat > 0) {
                const rowTutar = miktar * fiyat;
                let rowComm = 0;

                if (currentMarket === 'bist') {
                    const binde = parseFloat(elBistKomisyon.value) || 0;
                    rowComm = rowTutar * (binde / 1000);
                } else if (currentMarket === 'nasdaq') {
                    rowComm = 1.5;
                    if (fiyat < 1.0 && miktar > 300) {
                        rowComm += (miktar - 300) * 0.005;
                    }
                }

                totalComm += rowComm;
                totalLot += miktar;
                totalCost += (rowTutar + rowComm);

                if (elTutar) elTutar.value = formatCurrency(rowTutar);
            } else {
                if (elTutar) elTutar.value = "0,00";
            }
        });

        if (currentMarket !== 'yok') {
            document.getElementById('card-avg-komisyon').style.display = 'block';
            document.getElementById('res-avg-komisyon-tutar').textContent = formatCurrency(totalComm) + (currentMarket === 'nasdaq' ? ' $' : '');
        } else {
            document.getElementById('card-avg-komisyon').style.display = 'none';
        }

        const avgPrice = totalLot > 0 ? (totalCost / totalLot) : 0;
        document.getElementById('res-ortalama-fiyat').textContent = formatCurrency(avgPrice) + (currentMarket === 'nasdaq' ? ' $' : '');
        document.getElementById('res-toplam-lot').textContent = formatCurrency(totalLot);
        document.getElementById('res-toplam-tutar').textContent = formatCurrency(totalCost) + (currentMarket === 'nasdaq' ? ' $' : '');
    };

    const attachListeners = (row) => {
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => input.addEventListener('input', calculate));
        const btnRemove = row.querySelector('.btn-remove');
        if (btnRemove) {
            btnRemove.addEventListener('click', () => {
                if (document.querySelectorAll('.alim-satir').length > 1) {
                    row.remove();
                    calculate();
                }
            });
        }
    };

    btnAdd.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'alim-satir';
        row.innerHTML = `
            <div class="form-group">
                <label>Miktar (Lot - Tam Sayı)</label>
                <input type="number" class="input-miktar" min="1" step="1" placeholder="Örn: 100">
            </div>
            <div class="form-group">
                <label>Fiyat</label>
                <input type="number" class="input-fiyat" min="0" step="any" placeholder="Örn: 45,50">
            </div>
            <div class="form-group">
                <label>Alış Tutarı</label>
                <input type="text" class="input-tutar" readonly placeholder="0,00" style="background: transparent; border: 1px dashed var(--border); color: var(--text-secondary); cursor: default;">
            </div>
            <button class="btn-icon btn-remove" tabindex="-1" title="Sil" style="margin-bottom: 6px;">×</button>
        `;
        listContainer.appendChild(row);
        attachListeners(row);
        row.querySelector('.input-miktar').focus();
    });

    attachListeners(document.querySelector('.alim-satir'));
}
