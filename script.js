let lunarData = [];

window.onload = async function () {
  const res = await fetch('lunar_to_solar.json');
  lunarData = await res.json();

  const lunarYear = document.getElementById('lunar-year');
  const lunarMonth = document.getElementById('lunar-month');
  const lunarDay = document.getElementById('lunar-day');
  const isLeap = document.getElementById('is-leap');
  const solarYear = document.getElementById('solar-year');
  const solarMonth = document.getElementById('solar-month');
  const solarDay = document.getElementById('solar-day');
  const endYearSelect = document.getElementById('end-year');
  const downloadBtn = document.getElementById('download-btn');
  const convertedArea = document.getElementById('converted-list');

  // 연도, 월 초기화
  for (let y = 1881; y <= 2100; y++) {
    lunarYear.innerHTML += `<option value="${y}">${y}</option>`;
    solarYear.innerHTML += `<option value="${y}">${y}</option>`;
  }
  for (let m = 1; m <= 12; m++) {
    lunarMonth.innerHTML += `<option value="${m}">${m}</option>`;
    solarMonth.innerHTML += `<option value="${m}">${m}</option>`;
  }

  lunarYear.addEventListener('change', updateLunarDays);
  lunarMonth.addEventListener('change', updateLunarDays);
  isLeap.addEventListener('change', updateLunarDays);

  function updateLunarDays() {
    const y = parseInt(lunarYear.value);
    const m = parseInt(lunarMonth.value);
    const leap = isLeap.checked;
    if (!y || !m) return;

    const prefix = `${y}-${String(m).padStart(2, '0')}`;
    const days = lunarData
      .filter(d => d.lunar.startsWith(prefix) && d.leap === leap)
      .map(d => parseInt(d.lunar.split('-')[2]));
    const maxDay = days.length > 0 ? Math.max(...days) : 30;

    lunarDay.innerHTML = `<option value="">일</option>`;
    for (let d = 1; d <= maxDay; d++) {
      lunarDay.innerHTML += `<option value="${d}">${d}</option>`;
    }
  }

  lunarYear.addEventListener('change', updateEndYears);
  function updateEndYears() {
    const y = parseInt(lunarYear.value);
    endYearSelect.innerHTML = `<option value="">-- 연도 선택 --</option>`;
    for (let ey = y + 1; ey <= 2100; ey++) {
      endYearSelect.innerHTML += `<option value="${ey}">${ey}</option>`;
    }
  }

  // 입력 이벤트 처리
  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', () => {
      checkInputs();
      syncToSolar();
    });
    el.addEventListener('change', () => {
      checkInputs();
      syncToSolar();
    });
  });

  solarYear.addEventListener('change', syncToLunar);
  solarMonth.addEventListener('change', syncToLunar);
  solarDay.addEventListener('change', syncToLunar);

  function checkInputs() {
    const title = document.getElementById('event-title').value.trim();
    const y = lunarYear.value, m = lunarMonth.value, d = lunarDay.value;
    const endY = endYearSelect.value;
    downloadBtn.disabled = !(title && y && m && d && endY);
  }

  function syncToSolar() {
    const y = lunarYear.value, m = lunarMonth.value, d = lunarDay.value;
    if (!y || !m || !d) return;
    const leap = isLeap.checked;
    const key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const match = lunarData.find(e => e.lunar === key && e.leap === leap);
    if (match) {
      const [sy, sm, sd] = match.solar.split('-');
      solarYear.value = sy;
      solarMonth.value = parseInt(sm);
      solarDay.value = parseInt(sd);
    } else {
      solarYear.value = '';
      solarMonth.value = '';
      solarDay.value = '';
    }
    updateConvertedList();
  }

  function syncToLunar() {
    const sy = solarYear.value, sm = solarMonth.value, sd = solarDay.value;
    if (!sy || !sm || !sd) return;
    const key = `${sy}-${String(sm).padStart(2, '0')}-${String(sd).padStart(2, '0')}`;
    const match = lunarData.find(e => e.solar === key);
    if (match) {
      const [ly, lm, ld] = match.lunar.split('-');
      lunarYear.value = ly;
      lunarMonth.value = parseInt(lm);
      isLeap.checked = match.leap;
      updateLunarDays();
      setTimeout(() => {
        lunarDay.value = parseInt(ld);
        updateConvertedList();
        checkInputs();
      }, 10);
    }
  }

  downloadBtn.addEventListener('click', () => {
    const title = document.getElementById('event-title').value.trim();
    const results = convertedArea.value.trim().split('\n').filter(Boolean);
    const icsText = generateICS(title, results);
    const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.ics`;
    a.click();
  });

  function updateConvertedList() {
    const y = lunarYear.value, m = lunarMonth.value, d = lunarDay.value;
    const endY = parseInt(endYearSelect.value);
    const leap = isLeap.checked;
    const fromY = parseInt(y);
    const results = [];

    for (let year = fromY; year <= endY; year++) {
      const key = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const match = lunarData.find(e => e.lunar === key && e.leap === leap);
      if (match) results.push(match.solar);
    }

    convertedArea.value = results.join('\n');
  }

  function generateICS(title, solarDates) {
    let ics = `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:${title}\nX-WR-TIMEZONE:Asia/Seoul\n`;
    solarDates.forEach(dateStr => {
      const dt = dateStr.replace(/-/g, '');
      ics += `BEGIN:VEVENT\nSUMMARY:${title}\nDTSTART;VALUE=DATE:${dt}\nDTEND;VALUE=DATE:${dt}\nTRANSP:TRANSPARENT\nEND:VEVENT\n`;
    });
    ics += 'END:VCALENDAR';
    return ics;
  }

  initCalendar(lunarData);
};
