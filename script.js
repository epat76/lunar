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

  for (let y = 1881; y <= 2100; y++) {
    lunarYear.innerHTML += `<option value="${y}">${y}</option>`;
    solarYear.innerHTML += `<option value="${y}">${y}</option>`;
  }
  for (let m = 1; m <= 12; m++) {
    lunarMonth.innerHTML += `<option value="${m}">${m}</option>`;
    solarMonth.innerHTML += `<option value="${m}">${m}</option>`;
  }

  lunarYear.addEventListener('change', () => {
    updateEndYears();
    updateLunarDays();
  });
  lunarMonth.addEventListener('change', updateLunarDays);
  isLeap.addEventListener('change', updateLunarDays);

  function updateEndYears() {
    const start = parseInt(lunarYear.value);
    endYearSelect.innerHTML = `<option value="">연도 선택</option>`; // ✅ 수정됨
    for (let y = start + 1; y <= 2100; y++) {
      endYearSelect.innerHTML += `<option value="${y}">${y}</option>`;
    }
  }

  function updateSolarDays() {
    const y = parseInt(solarYear.value);
    const m = parseInt(solarMonth.value);
    if (!y || !m) return;

    const lastDay = new Date(y, m, 0).getDate();
    const currentDay = solarDay.value;

    solarDay.innerHTML = `<option value="">일</option>`;
    for (let d = 1; d <= lastDay; d++) {
      solarDay.innerHTML += `<option value="${d}" ${d == currentDay ? 'selected' : ''}>${d}</option>`;
    }

    if (currentDay && currentDay <= lastDay) {
      solarDay.value = currentDay;
    }
  }

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
    const currentDay = lunarDay.value;

    lunarDay.innerHTML = `<option value="">일</option>`;
    for (let d = 1; d <= maxDay; d++) {
      lunarDay.innerHTML += `<option value="${d}" ${d == currentDay ? 'selected' : ''}>${d}</option>`;
    }

    if (currentDay && currentDay <= maxDay) {
      lunarDay.value = currentDay;
      // ❌ dispatchEvent 제거로 무한 루프 방지
    }
  }

  solarYear.addEventListener('change', updateSolarDays);
  solarMonth.addEventListener('change', updateSolarDays);

  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', () => {
      syncToSolar();
      syncToLunar();
      updateConvertedList();
      checkInputs();
    });
  });

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
      updateSolarDays();
      solarDay.value = parseInt(sd);
    }
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
      lunarDay.value = parseInt(ld);
    }
  }

  function updateConvertedList() {
    const y = lunarYear.value, m = lunarMonth.value, d = lunarDay.value;
    const leap = isLeap.checked;
    const endY = parseInt(endYearSelect.value);
    if (!y || !m || !d || !endY) {
      convertedArea.value = '';
      return;
    }

    const fromY = parseInt(y);
    const results = [];
    for (let year = fromY; year <= endY; year++) {
      const key = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const match = lunarData.find(e => e.lunar === key && e.leap === leap);
      if (match) results.push(match.solar);
    }

    convertedArea.value = results.join('\n');
  }

  function checkInputs() {
    const title = document.getElementById('event-title').value.trim();
    const y = lunarYear.value, m = lunarMonth.value, d = lunarDay.value;
    const endY = endYearSelect.value;
    downloadBtn.disabled = !(title && y && m && d && endY);
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

  function generateICS(title, dates) {
    let ics = `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:${title}\nX-WR-TIMEZONE:Asia/Seoul\n`;
    dates.forEach(dateStr => {
      const dt = dateStr.replace(/-/g, '');
      ics += `BEGIN:VEVENT\nSUMMARY:${title}\nDTSTART;VALUE=DATE:${dt}\nDTEND;VALUE=DATE:${dt}\nTRANSP:TRANSPARENT\nEND:VEVENT\n`;
    });
    ics += 'END:VCALENDAR';
    return ics;
  }
};
