function initPlanlayici() {
    const elAlis = document.getElementById('plan-alis');
    const elSermaye = document.getElementById('plan-sermaye');
    const elSermayeLabel = document.getElementById('plan-sermaye-label');
    const elBistKomisyon = document.getElementById('plan-bist-komisyon');
    
    // Nasdaq Fields
    const elKur = document.getElementById('plan-nasdaq-kur');
    const elVergi = document.getElementById('plan-nasdaq-vergi');
    
    const elSatis = document.getElementById('plan-satis');
    const elYuzde = document.getElementById('plan-kar-yuzde');
    const elTutar = document.getElementById('plan-kar-tutar');

    let currentInputType = 'tutar'; 
    let currentMarket = 'yok';

    // Sermaye/Lot Toggle
    const typeBtns = document.querySelectorAll('#sermaye-type-selector .market-btn');
    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentInputType = btn.getAttribute('data-type');
            
            if (currentInputType === 'lot') {
                elSermaye.placeholder = "Örn: 100";
                elSermayeLabel.textContent = "Miktar (Lot - Tam Sayı)";
            } else {
                elSermaye.placeholder = "Örn: 5000";
                elSermayeLabel.textContent = "Tutar / Sermaye";
            }
            onBaseChange();
        });
    });

    // Market Toggle
    const marketBtns = document.querySelectorAll('#plan-market-selector .market-btn');
    const bistFields = document.getElementById('plan-bist-fields');
    const nasdaqFields = document.getElementById('plan-nasdaq-fields');
    const karTutarLabel = document.getElementById('plan-kar-tutar-label');

    const tlElements = [
        'res-plan-kullanilan-tl', 
        'res-plan-kar-tl', 
        'res-plan-toplam-tl',
        'card-plan-vergi'
    ];

    marketBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            marketBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMarket = btn.getAttribute('data-market');
            
            if (currentMarket === 'bist') {
                bistFields.style.display = 'block';
                nasdaqFields.style.display = 'none';
                karTutarLabel.textContent = "Hedef Net Kar (Tutar - TL)";
                tlElements.forEach(id => document.getElementById(id).style.display = 'none');
            } else if (currentMarket === 'nasdaq') {
                bistFields.style.display = 'none';
                nasdaqFields.style.display = 'block';
                karTutarLabel.textContent = "Hedef Net Kar (Tutar - USD)";
                tlElements.forEach(id => document.getElementById(id).style.display = 'block');
            } else {
                bistFields.style.display = 'none';
                nasdaqFields.style.display = 'none';
                karTutarLabel.textContent = "Hedef Net Kar (Tutar)";
                tlElements.forEach(id => document.getElementById(id).style.display = 'none');
            }
            onBaseChange();
        });
    });

    const getLot = () => {
        const alis = parseFloat(elAlis.value) || 0;
        const val = parseFloat(elSermaye.value) || 0;
        if (alis > 0 && val > 0) {
            if (currentInputType === 'tutar') {
                return Math.floor(val / alis);
            } else {
                return Math.floor(val);
            }
        }
        return 0; 
    };

    const getCommissions = (alis, satis, lot) => {
        let buyComm = 0;
        let sellComm = 0;

        if (currentMarket === 'bist') {
            const binde = parseFloat(elBistKomisyon.value) || 0;
            const oran = binde / 1000;
            buyComm = alis * lot * oran;
            sellComm = satis * lot * oran;
        } else if (currentMarket === 'nasdaq') {
            buyComm = 1.5;
            if (alis < 1.0 && lot > 300) buyComm += (lot - 300) * 0.005;

            sellComm = 1.5;
            if (satis < 1.0 && lot > 300) sellComm += (lot - 300) * 0.005;
        }
        return { buyComm, sellComm };
    };

    const getExchangeRates = () => {
        const kur = parseFloat(elKur.value) || 1; // default 1 to avoid div by zero if not entered
        return {
            kurAlis: kur,
            kurSatis: kur
        };
    };

    const getTaxRate = () => {
        return (parseFloat(elVergi.value) || 0) / 100;
    };

    const updateResults = (satisFiyati, lot) => {
        const alis = parseFloat(elAlis.value) || 0;
        const sermaye = parseFloat(elSermaye.value) || 0;
        const { kurAlis, kurSatis } = getExchangeRates();
        const vergiOrani = getTaxRate();
        
        document.getElementById('res-plan-lot').textContent = formatCurrency(lot);
        
        const kullanilanBrut = lot * alis;
        const comms = getCommissions(alis, satisFiyati > 0 ? satisFiyati : alis, lot);
        const kullanilanNet = kullanilanBrut + comms.buyComm;
        
        // Native Currency display (USD or TL)
        document.getElementById('res-plan-kullanilan').textContent = formatCurrency(kullanilanNet) + (currentMarket === 'nasdaq' ? ' $' : '');
        
        const artan = (currentInputType === 'tutar') ? Math.max(0, sermaye - kullanilanNet) : 0;
        document.getElementById('res-plan-artan').textContent = formatCurrency(artan);
        document.getElementById('res-plan-artan-container').style.display = (currentInputType === 'tutar') ? 'block' : 'none';

        if (currentMarket === 'nasdaq') {
            const tlCost = kullanilanNet * kurAlis;
            document.getElementById('res-plan-kullanilan-tl').textContent = `TL Karşılığı: ${formatCurrency(tlCost)} ₺`;
        }

        if (currentMarket !== 'yok') {
            document.getElementById('card-plan-komisyon').style.display = 'block';
            const displayComm = comms.buyComm + (satisFiyati > 0 && lot > 0 ? comms.sellComm : 0);
            document.getElementById('res-plan-komisyon-tutar').textContent = formatCurrency(displayComm) + (currentMarket === 'nasdaq' ? ' $' : '');
        } else {
            document.getElementById('card-plan-komisyon').style.display = 'none';
        }

        if (satisFiyati > 0 && lot > 0) {
            const totalComm = comms.buyComm + comms.sellComm;
            const toplamSatis = satisFiyati * lot;
            const netSatisRevenue = toplamSatis - comms.sellComm;
            
            let finalNetProfit = 0;
            let finalRevenue = 0;
            
            if (currentMarket === 'nasdaq') {
                finalNetProfit = netSatisRevenue - kullanilanNet;
                finalRevenue = netSatisRevenue;

                const tlPreTaxProfit = finalNetProfit * kurSatis;
                let tlTax = 0;
                if (tlPreTaxProfit > 0) tlTax = tlPreTaxProfit * vergiOrani;
                
                document.getElementById('res-plan-vergi-tutar').textContent = formatCurrency(tlTax) + " ₺";
                
                const tlNetProfit = tlPreTaxProfit - tlTax;

                document.getElementById('res-plan-kar-tl').textContent = `Vergisi Düşülmüş TL Kâr: ${formatCurrency(tlNetProfit)} ₺`;
                document.getElementById('res-plan-toplam-tl').textContent = `TL Toplam Dönüş (Vergi Hariç): ${formatCurrency(netSatisRevenue * kurSatis)} ₺`;

            } else {
                finalNetProfit = netSatisRevenue - kullanilanNet;
                finalRevenue = netSatisRevenue;
            }
            
            const resKar = document.getElementById('res-plan-kar');
            resKar.textContent = (finalNetProfit > 0 ? "+" : "") + formatCurrency(finalNetProfit) + (currentMarket === 'nasdaq' ? ' $' : '');
            resKar.className = 'result-value';
            if (finalNetProfit > 0) resKar.classList.add('success');
            else if (finalNetProfit < 0) resKar.classList.add('danger');
            
            document.getElementById('res-plan-toplam').textContent = formatCurrency(finalRevenue) + (currentMarket === 'nasdaq' ? ' $' : '');
        } else {
            document.getElementById('res-plan-kar').textContent = "0,00";
            document.getElementById('res-plan-kar').className = 'result-value';
            document.getElementById('res-plan-toplam').textContent = "0,00";
            if (currentMarket === 'nasdaq') {
                document.getElementById('res-plan-kar-tl').textContent = `TL Net Kâr: 0,00 ₺`;
                document.getElementById('res-plan-toplam-tl').textContent = `TL Toplam Dönüş: 0,00 ₺`;
                document.getElementById('res-plan-vergi-tutar').textContent = `0,00 ₺`;
            }
        }
    };

    const calculateSellPriceForProfit = (targetProfitNative, alis, lot) => {
        let buyComm = 0;
        
        if (currentMarket === 'bist') {
            const binde = parseFloat(elBistKomisyon.value) || 0;
            const k = binde / 1000;
            if (k >= 1) return 0;
            buyComm = alis * lot * k;
            
            return (targetProfitNative + (alis * lot) + buyComm) / (lot * (1 - k));
            
        } else if (currentMarket === 'nasdaq') {
            buyComm = 1.5;
            if (alis < 1.0 && lot > 300) buyComm += (lot - 300) * 0.005;
            
            let sellComm = 1.5;
            let satis = (targetProfitNative + (alis * lot) + buyComm + sellComm) / lot;
            
            if (satis < 1.0 && lot > 300) {
                sellComm = 1.5 + (lot - 300) * 0.005;
                satis = (targetProfitNative + (alis * lot) + buyComm + sellComm) / lot;
            }
            return satis;
        } else {
            return (targetProfitNative + (alis * lot)) / lot;
        }
    };

    elSatis.addEventListener('input', () => {
        const alis = parseFloat(elAlis.value) || 0;
        const satis = parseFloat(elSatis.value);
        const lot = getLot();

        if (alis > 0 && !isNaN(satis)) {
            let buyComm = 0, sellComm = 0;
            if(lot > 0) {
                const comms = getCommissions(alis, satis, lot);
                buyComm = comms.buyComm;
                sellComm = comms.sellComm;
            }

            const netBuyCost = (alis * lot) + buyComm;
            const netSellRev = (satis * lot) - sellComm;
            
            if (netBuyCost > 0) {
                let karTutariNative = netSellRev - netBuyCost;

                const yuzde = (karTutariNative / netBuyCost) * 100;
                
                elYuzde.value = yuzde.toFixed(2);
                applyDynamicColor(elYuzde);
                
                if (lot > 0) {
                    elTutar.value = karTutariNative.toFixed(2);
                    applyDynamicColor(elTutar);
                }
            }
            updateResults(satis, lot);
        }
    });

    elYuzde.addEventListener('input', () => {
        const alis = parseFloat(elAlis.value) || 0;
        const yuzde = parseFloat(elYuzde.value);
        const lot = getLot();

        if (alis > 0 && !isNaN(yuzde) && lot > 0) {
            let buyComm = 0;
            if (currentMarket === 'bist') {
                const binde = parseFloat(elBistKomisyon.value) || 0;
                buyComm = alis * lot * (binde / 1000);
            } else if (currentMarket === 'nasdaq') {
                buyComm = 1.5;
                if (alis < 1.0 && lot > 300) buyComm += (lot - 300) * 0.005;
            }

            const netBuyCost = (alis * lot) + buyComm;
            const hedefNetKarNative = netBuyCost * (yuzde / 100);
            
            const satis = calculateSellPriceForProfit(hedefNetKarNative, alis, lot);
            
            elSatis.value = satis.toFixed(2);
            elTutar.value = hedefNetKarNative.toFixed(2);
            applyDynamicColor(elTutar);
            
            updateResults(satis, lot);
        }
    });

    elTutar.addEventListener('input', () => {
        const alis = parseFloat(elAlis.value) || 0;
        const lot = getLot();
        const karTutari = parseFloat(elTutar.value);

        if (alis > 0 && lot > 0 && !isNaN(karTutari)) {
            const satis = calculateSellPriceForProfit(karTutari, alis, lot);
            elSatis.value = satis.toFixed(2);
            
            const comms = getCommissions(alis, satis, lot);
            const netBuyCost = (alis * lot) + comms.buyComm;
            const yuzde = (karTutari / netBuyCost) * 100;
            
            elYuzde.value = yuzde.toFixed(2);
            applyDynamicColor(elYuzde);
            
            updateResults(satis, lot);
        }
    });

    const triggerRecalculate = () => {
        if (elSatis.value) elSatis.dispatchEvent(new Event('input'));
        else if (elYuzde.value) elYuzde.dispatchEvent(new Event('input'));
        else if (elTutar.value) elTutar.dispatchEvent(new Event('input'));
        else updateResults(0, getLot());
    };

    const onBaseChange = () => {
        triggerRecalculate();
    };

    elAlis.addEventListener('input', onBaseChange);
    elSermaye.addEventListener('input', onBaseChange);
    elBistKomisyon.addEventListener('input', onBaseChange);
    elKur.addEventListener('input', onBaseChange);
    elVergi.addEventListener('input', onBaseChange);
}

