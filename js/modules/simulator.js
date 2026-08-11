function initSimulator() {
    const elRef = document.getElementById('sim-referans');
    const elRefYuzde = document.getElementById('sim-referans-yuzde');
    const elHedef = document.getElementById('sim-hedef-fiyat');
    const elHedefYuzde = document.getElementById('sim-hedef-yuzde');
    const elMaliyet = document.getElementById('sim-maliyet');
    const elLot = document.getElementById('sim-lot');

    const getOpeningPrice = () => {
        const ref = parseFloat(elRef.value) || 0;
        const refYuzde = parseFloat(elRefYuzde.value) || 0;
        if (ref > 0) {
            return ref / (1 + (refYuzde / 100));
        }
        return 0;
    };

    const updatePortfolio = (targetPrice) => {
        const maliyet = parseFloat(elMaliyet.value) || 0;
        const lot = Math.floor(parseFloat(elLot.value) || 0);
        
        if (maliyet > 0 && lot > 0 && targetPrice > 0) {
            const karZarar = (targetPrice - maliyet) * lot;
            const yuzde = ((targetPrice - maliyet) / maliyet) * 100;
            
            const prefix = karZarar > 0 ? "+" : "";
            const resEl = document.getElementById('res-sim-kar-zarar');
            resEl.textContent = `${prefix}${formatCurrency(karZarar)}`;
            document.getElementById('res-sim-kar-yuzde').textContent = `Maliyetinize Göre: ${prefix}%${formatCurrency(yuzde)}`;
            
            resEl.className = 'result-value';
            if(karZarar > 0) resEl.classList.add('success');
            else if(karZarar < 0) resEl.classList.add('danger');
            
        } else {
            document.getElementById('res-sim-kar-zarar').textContent = "0,00";
            document.getElementById('res-sim-kar-yuzde').textContent = "-";
            document.getElementById('res-sim-kar-zarar').className = "result-value";
        }
    };

    elHedef.addEventListener('input', () => {
        const openPrice = getOpeningPrice();
        const hedef = parseFloat(elHedef.value);
        if (openPrice > 0 && !isNaN(hedef)) {
            const yuzde = ((hedef - openPrice) / openPrice) * 100;
            elHedefYuzde.value = yuzde.toFixed(2);
            applyDynamicColor(elHedefYuzde);
            updatePortfolio(hedef);
        }
    });

    elHedefYuzde.addEventListener('input', () => {
        const openPrice = getOpeningPrice();
        const yuzde = parseFloat(elHedefYuzde.value);
        if (openPrice > 0 && !isNaN(yuzde)) {
            const hedef = openPrice * (1 + (yuzde / 100));
            elHedef.value = hedef.toFixed(2);
            updatePortfolio(hedef);
        }
    });

    const onBaseChange = () => {
        if(document.activeElement === elHedef) elHedef.dispatchEvent(new Event('input'));
        else if (document.activeElement === elHedefYuzde) elHedefYuzde.dispatchEvent(new Event('input'));
        else {
            if (elHedefYuzde.value) elHedefYuzde.dispatchEvent(new Event('input'));
            else if (elHedef.value) elHedef.dispatchEvent(new Event('input'));
            else updatePortfolio(0);
        }
    };

    elRef.addEventListener('input', onBaseChange);
    elRefYuzde.addEventListener('input', onBaseChange);
    elMaliyet.addEventListener('input', onBaseChange);
    elLot.addEventListener('input', onBaseChange);
}

