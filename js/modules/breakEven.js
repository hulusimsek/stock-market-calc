function initKomisyon() {
    let currentMarket = 'bist';
    
    const marketBtns = document.querySelectorAll('#tab-komisyon .market-btn[data-market]');
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

    const btnAlis = document.getElementById('btn-komisyon-alis');
    const btnSatis = document.getElementById('btn-komisyon-satis');
    
    [btnAlis, btnSatis].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                if (btn.classList.contains('active')) {
                    btn.innerHTML = '✓ ' + btn.textContent.replace('✓ ', '');
                } else {
                    btn.innerHTML = btn.textContent.replace('✓ ', '');
                }
                calculate();
            });
        }
    });

    const elAlis = document.getElementById('bb-alis-fiyat');
    const elLot = document.getElementById('bb-lot');
    const elBistKomisyon = document.getElementById('bb-bist-komisyon');

    const calculate = () => {
        const alis = parseFloat(elAlis.value) || 0;
        const lot = Math.floor(parseFloat(elLot.value) || 0);
        
        let totalKomisyon = 0;
        let basaBasSatis = 0;
        let netAlis = 0;
        let netSatis = 0;

        const includeAlis = btnAlis ? btnAlis.classList.contains('active') : true;
        const includeSatis = btnSatis ? btnSatis.classList.contains('active') : true;

        if (alis === 0 || lot === 0) {
            document.getElementById('res-bb-fiyat').textContent = "0,00";
            document.getElementById('res-bb-komisyon-tutar').textContent = "0,00";
            if (document.getElementById('res-bb-net-alis')) document.getElementById('res-bb-net-alis').textContent = "0,00";
            if (document.getElementById('res-bb-net-satis')) document.getElementById('res-bb-net-satis').textContent = "0,00";
            return;
        }

        const alisTutar = alis * lot;
        let alisKomisyonu = 0;
        let satisKomisyonu = 0;

        if (currentMarket === 'bist') {
            const binde = parseFloat(elBistKomisyon.value) || 0;
            const oran = binde / 1000;
            
            alisKomisyonu = includeAlis ? alisTutar * oran : 0;
            
            if (oran >= 1) return; 

            if (includeSatis) {
                basaBasSatis = (alisTutar + alisKomisyonu) / (lot * (1 - oran));
                satisKomisyonu = (basaBasSatis * lot) * oran;
            } else {
                basaBasSatis = (alisTutar + alisKomisyonu) / lot;
                satisKomisyonu = 0;
            }

        } else if (currentMarket === 'nasdaq') {
            let baseAlisKomisyonu = 1.5;
            if (alis < 1.0 && lot > 300) baseAlisKomisyonu += (lot - 300) * 0.005;

            alisKomisyonu = includeAlis ? baseAlisKomisyonu : 0;
            satisKomisyonu = includeSatis ? baseAlisKomisyonu : 0; 
            
            if (includeSatis) {
                basaBasSatis = ( alisTutar + alisKomisyonu + satisKomisyonu ) / lot;

                if (basaBasSatis >= 1.0 && lot > 300 && alis < 1.0) {
                    satisKomisyonu = includeSatis ? 1.5 : 0;
                    basaBasSatis = ( alisTutar + alisKomisyonu + satisKomisyonu ) / lot;
                } 
                else if (basaBasSatis < 1.0 && lot > 300 && alis >= 1.0) {
                    satisKomisyonu = includeSatis ? 1.5 + ((lot - 300) * 0.005) : 0;
                    basaBasSatis = ( alisTutar + alisKomisyonu + satisKomisyonu ) / lot;
                }
            } else {
                basaBasSatis = ( alisTutar + alisKomisyonu ) / lot;
                satisKomisyonu = 0;
            }
        }

        totalKomisyon = alisKomisyonu + satisKomisyonu;
        netAlis = alisTutar + alisKomisyonu;
        netSatis = (basaBasSatis * lot) - satisKomisyonu;

        const titleEl = document.getElementById('res-bb-komisyon-title');
        if (titleEl) {
            if (includeAlis && includeSatis) titleEl.textContent = "Ödenen Toplam Komisyon (Alış + Satış)";
            else if (includeAlis) titleEl.textContent = "Ödenen Komisyon (Sadece Alış)";
            else if (includeSatis) titleEl.textContent = "Ödenen Komisyon (Sadece Satış)";
            else titleEl.textContent = "Ödenen Komisyon (Seçilmedi)";
        }

        document.getElementById('res-bb-fiyat').textContent = formatPrice(basaBasSatis) + (currentMarket === 'nasdaq' ? ' $' : '');
        document.getElementById('res-bb-komisyon-tutar').textContent = formatCurrency(totalKomisyon) + (currentMarket === 'nasdaq' ? ' $' : '');
        
        if (document.getElementById('res-bb-net-alis')) {
            document.getElementById('res-bb-net-alis').textContent = formatCurrency(netAlis) + (currentMarket === 'nasdaq' ? ' $' : '');
        }
        if (document.getElementById('res-bb-net-satis')) {
            document.getElementById('res-bb-net-satis').textContent = formatCurrency(netSatis) + (currentMarket === 'nasdaq' ? ' $' : '');
        }
    };

    [elAlis, elLot, elBistKomisyon].forEach(el => el.addEventListener('input', calculate));
}
