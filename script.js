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

  // 연/월 옵션 채우기
  for (let y = 1881; y <= 2100; y++) {
    lunarYear.innerHTML += `<option value="${y}">${y}</option>`;
    solarYear.innerHTML += `<option value="${y}">${y}</option>`;
  }
  for (let m = 1; m <= 12; m++) {
    lunarMonth.innerHTML += `<option value="${m}">${m}</option>`;
    solarMonth.innerHTML += `<option value="${m}">${m}</option>`;
  }

  // ✅ 오늘 날짜로 양력 자동 세팅
  const today = new Date();
  const sy = today.getFullYear();
  const sm = today.getMonth() + 1;
  const sd = today.getDate();
  solarYear.value = sy;
  solarMonth.value = sm;
  updateSolarDays();
  solarDay.value = sd;

  // ✅ 오늘 양력을 기준으로 음력 자동 설정
  syncToLunar();
  updateLunarDays();

  // ✅ 일정 종료 연도도 초기화
  updateEndYears();

  lunarYear.addEventListener('change', () => {
    updateEndYears();
    updateLunarDays();
  });
  lunarMonth.addEventListener('change', updateLunarDays);
  isLeap.addEventListener('change', updateLunarDays);

  function updateEndYears() {
    const start = parseInt(lunarYear.value);
    endYearSelect.innerHTML = `<option value="">연도 선택</option>`;
    for (let y = start + 1; y <= 2100; y++) {
      endYearSelect.innerHTML += `<option value="${y}">${y}</option>`;
    }
  }

  function updateSolarDays() {
    const y = parseInt(solarYear.value);
    const m = parseInt(solarMonth.value);
    if (!y || !m) return;

    const last = new Date(y, m, 0).getDate();
    const current = parseInt(solarDay.value);

    solarDay.innerHTML = `<option value="">일</option>`;
    for (let d = 1; d <= last; d++) {
      solarDay.innerHTML += `<option value="${d}" ${d === current ? 'selected' : ''}>${d}</option>`;
    }

    if (current && current <= last) {
      solarDay.value = current;
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
    const current = parseInt(lunarDay.value);

    lunarDay.innerHTML = `<option value="">일</option>`;
    for (let d = 1; d <= maxDay; d++) {
      lunarDay.innerHTML += `<option value="${d}" ${d === current ? 'selected' : ''}>${d}</option>`;
    }

    if (current && current <= maxDay) {
      lunarDay.value = current;
    }
  }

  solarYear.addEventListener('change', updateSolarDays);
  solarMonth.addEventListener('change', updateSolarDays);

  // 이벤트 감지
  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', () => {
      syncToSolar(); // 음력 → 양력
      syncToLunar(); // 양력 → 음력
      updateConvertedList();
      checkInputs();
    });
  });

  function syncToSolar() {
    const y = lunarYear.value, m = lunarMonth.value, d = lunarDay.value;
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
    const key = `${sy}-${String(sm).padStart(2, '0')}-${String(sd).padStart(2, '0')}`;
    const match = lunarData.find(e => e.solar === key);
    if (match) {
      const [ly, lm, ld] = match.lunar.split('-');
      lunarYear.value = ly;
      lunarMonth.value = parseInt(lm);
      isLeap.checked = match.leap;
      updateLunarDays();
      lunarDay.value = parseInt(ld);
      updateEndYears(); // ✅ 자동 선택 시에도 종료연도 반영
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

    const results = [];
    for (let year = parseInt(y); year <= endY; year++) {
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
