function initKomisyon() {
    let currentMarket = 'bist';
    const marketBtns = document.querySelectorAll('#tab-komisyon .market-btn');
    const bistFields = document.getElementById('bist-fields');
    const nasdaqFields = document.getElementById('nasdaq-fields');

    marketBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            marketBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMarket = btn.getAttribute('data-market');
            
            if (currentMarket === 'bist') {
                bistFields.style.display = 'block';
                nasdaqFields.style.display = 'none';
            } else {
                bistFields.style.display = 'none';
                nasdaqFields.style.display = 'block';
            }
            calculate();
        });
    });

    const elAlis = document.getElementById('bb-alis-fiyat');
    const elLot = document.getElementById('bb-lot');
    const elBistKomisyon = document.getElementById('bb-bist-komisyon');

    const calculate = () => {
        const alis = parseFloat(elAlis.value) || 0;
        const lot = Math.floor(parseFloat(elLot.value) || 0);
        
        let totalKomisyon = 0;
        let basaBasSatis = 0;

        if (alis === 0 || lot === 0) {
            document.getElementById('res-bb-fiyat').textContent = "0,00";
            document.getElementById('res-bb-komisyon-tutar').textContent = "0,00";
            return;
        }

        if (currentMarket === 'bist') {
            const binde = parseFloat(elBistKomisyon.value) || 0;
            const oran = binde / 1000;
            const alisTutar = alis * lot;
            const alisKomisyonu = alisTutar * oran;
            
            if (oran >= 1) return; 

            basaBasSatis = (alisTutar + alisKomisyonu) / (lot * (1 - oran));
            const satisKomisyonu = (basaBasSatis * lot) * oran;
            totalKomisyon = alisKomisyonu + satisKomisyonu;

        } else if (currentMarket === 'nasdaq') {
            let alisKomisyonu = 1.5;
            if (alis < 1.0 && lot > 300) alisKomisyonu += (lot - 300) * 0,005;

            let satisKomisyonu = alisKomisyonu; 
            
            basaBasSatis = ( (alis * lot) + alisKomisyonu + satisKomisyonu ) / lot;

            if (basaBasSatis >= 1.0 && lot > 300 && alis < 1.0) {
                satisKomisyonu = 1.5;
                basaBasSatis = ( (alis * lot) + alisKomisyonu + satisKomisyonu ) / lot;
            } 
            else if (basaBasSatis < 1.0 && lot > 300 && alis >= 1.0) {
                satisKomisyonu = 1.5 + ((lot - 300) * 0,005);
                basaBasSatis = ( (alis * lot) + alisKomisyonu + satisKomisyonu ) / lot;
            }
            totalKomisyon = alisKomisyonu + satisKomisyonu;
        }

        document.getElementById('res-bb-fiyat').textContent = formatCurrency(basaBasSatis);
        document.getElementById('res-bb-komisyon-tutar').textContent = formatCurrency(totalKomisyon);
    };

    [elAlis, elLot, elBistKomisyon].forEach(el => el.addEventListener('input', calculate));
}

