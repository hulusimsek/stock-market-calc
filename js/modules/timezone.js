function initTimezone() {
    const yonBtn = document.getElementById('tz-yon-btn');
    const inputDate = document.getElementById('tz-date');
    const inputTime = document.getElementById('tz-time');
    
    // Set default values to current local time
    const now = new Date();
    // YYYY-MM-DD
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    inputDate.value = `${y}-${m}-${d}`;
    
    // HH:MM
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    inputTime.value = `${h}:${min}`;

    let direction = 'tr2us'; // tr2us | us2tr
    
    yonBtn.addEventListener('click', () => {
        if (direction === 'tr2us') {
            direction = 'us2tr';
            yonBtn.innerHTML = 'ABD (NASDAQ) <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg> Türkiye (BIST)';
            document.getElementById('tz-source-label').textContent = 'Amerika (New York) Tarih ve Saati';
            document.getElementById('tz-target-title').textContent = 'Türkiye Karşılığı';
        } else {
            direction = 'tr2us';
            yonBtn.innerHTML = 'Türkiye (BIST) <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg> ABD (NASDAQ)';
            document.getElementById('tz-source-label').textContent = 'Türkiye Tarih ve Saati';
            document.getElementById('tz-target-title').textContent = 'Amerika (New York) Karşılığı';
        }
        calculateTimezone();
    });

    const getNYOffset = (dateString) => {
        try {
            // Check noon UTC to determine offset for that specific day safely
            const testDate = new Date(`${dateString}T12:00:00Z`);
            const nyTimeStr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hourCycle: 'h23' }).format(testDate);
            const nyHour = parseInt(nyTimeStr, 10);
            return nyHour - 12; // Will be -4 (EDT) or -5 (EST)
        } catch(e) {
            return -5; // Default fallback
        }
    };

    const calculateTimezone = () => {
        const dateVal = inputDate.value;
        const timeVal = inputTime.value;
        
        if (!dateVal || !timeVal) return;

        const nyOffsetNum = getNYOffset(dateVal); // -4 or -5
        const trOffsetNum = 3;
        
        const isDST = nyOffsetNum === -4;
        const diffHours = trOffsetNum - nyOffsetNum; // 7 or 8
        
        // Update Badge
        const badgeEl = document.getElementById('tz-badge');
        if (isDST) {
            badgeEl.innerHTML = `☀️ Amerika şu an Yaz Saatinde (Fark: ${diffHours} Saat)`;
            badgeEl.className = 'alert-info success-bg';
        } else {
            badgeEl.innerHTML = `❄️ Amerika şu an Kış Saatinde (Fark: ${diffHours} Saat)`;
            badgeEl.className = 'alert-info info-bg';
        }

        let sourceDateObj;
        
        if (direction === 'tr2us') {
            // Input is TR time
            sourceDateObj = new Date(`${dateVal}T${timeVal}:00+03:00`);
        } else {
            // Input is US time
            const offsetStr = nyOffsetNum === -4 ? '-04:00' : '-05:00';
            sourceDateObj = new Date(`${dateVal}T${timeVal}:00${offsetStr}`);
        }

        // Output formatting
        const targetTimeZone = direction === 'tr2us' ? 'America/New_York' : 'Europe/Istanbul';
        
        const dateFormatter = new Intl.DateTimeFormat('tr-TR', { 
            timeZone: targetTimeZone, 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });
        
        const timeFormatter = new Intl.DateTimeFormat('tr-TR', { 
            timeZone: targetTimeZone, 
            hour: '2-digit', 
            minute: '2-digit',
            hourCycle: 'h23'
        });

        document.getElementById('res-tz-date').textContent = dateFormatter.format(sourceDateObj);
        document.getElementById('res-tz-time').textContent = timeFormatter.format(sourceDateObj);

        // Check NASDAQ Market Status for the resulting US time
        // NASDAQ standard hours: 09:30 - 16:00 NY time, Mon-Fri
        
        let nyTimeObj = direction === 'tr2us' ? sourceDateObj : sourceDateObj; 
        // Actually, we just need to get the NY Day and NY Time from the date object
        const nyDayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short' }).format(sourceDateObj);
        const nyHourStr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', hourCycle: 'h23' }).format(sourceDateObj);
        const nyMinStr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', minute: '2-digit' }).format(sourceDateObj);
        
        const nyHour = parseInt(nyHourStr, 10);
        const nyMin = parseInt(nyMinStr, 10);
        const timeDec = nyHour + (nyMin / 60);

        const isWeekend = nyDayStr === 'Sat' || nyDayStr === 'Sun';
        let statusHtml = '';

        if (isWeekend) {
            statusHtml = '<span class="text-danger">Piyasa Kapalı (Hafta Sonu)</span>';
        } else if (timeDec >= 9.5 && timeDec < 16.0) {
            statusHtml = '<span class="text-success">🟢 Piyasa Açık (Standart İşlem Saatleri)</span>';
        } else if (timeDec >= 4.0 && timeDec < 9.5) {
            statusHtml = '<span style="color: #f39c12;">🟡 Piyasa Öncesi (Pre-market) Açık</span>';
        } else if (timeDec >= 16.0 && timeDec < 20.0) {
            statusHtml = '<span style="color: #f39c12;">🟡 Piyasa Sonrası (After-hours) Açık</span>';
        } else {
            statusHtml = '<span class="text-danger">🔴 Piyasa Tamamen Kapalı</span>';
        }

        document.getElementById('res-tz-status').innerHTML = statusHtml;
    };

    inputDate.addEventListener('input', calculateTimezone);
    inputTime.addEventListener('input', calculateTimezone);
    
    // Initial calculation
    calculateTimezone();
}
