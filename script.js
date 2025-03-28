let lunarData = [];

window.onload = async function () {
  // JSON 로드
  const res = await fetch('lunar_to_solar.json');
  lunarData = await res.json();

  // 요소 선택
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

  // 초기화
  for (let y = 1881; y <= 2100; y++) {
    lunarYear.innerHTML += `<option value="${y}">${y}</option>`;
    solarYear.innerHTML += `<option value="${y}">${y}</option>`;
  }
  for (let m = 1; m <= 12; m++) {
    lunarMonth.innerHTML += `<option value="${m}">${m}</option>`;
    solarMonth.innerHTML += `<option value="${m}">${m}</option>`;
  }

  // 양력 일자 자동 채움
  function updateSolarDays() {
    const year = parseInt(solarYear.value);
    const month = parseInt(solarMonth.value);
    if (!year || !month) return;

    const lastDay = new Date(year, month, 0).getDate();
    solarDay.innerHTML = `<option value="">일</option>`;
    for (let d = 1; d <= lastDay; d++) {
      solarDay.innerHTML += `<option value="${d}">${d}</option>`;
    }
  }

  // 음력 일자 자동 채움
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

  // 종료연도 자동 구성
  lunarYear.addEventListener('change', () => {
    const start = parseInt(lunarYear.value);
    endYearSelect.innerHTML = `<option value="">-- 연도 선택 --</option>`;
    for (let y = start + 1; y <= 2100; y++) {
      endYearSelect.innerHTML += `<option value="${y}">${y}</option>`;
    }
  });

  // 자동 계산 이벤트
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

  // 양력 날짜 드롭다운 변경 시 일자 자동 채움
  solarYear.addEventListener('change', updateSolarDays);
  solarMonth.addEventListener('change', updateSolarDays);

  // 양력 → 음력 동기화
  solarYear.addEventListener('change', syncToLunar);
  solarMonth.addEventListener('change', syncToLunar);
  solarDay.addEventListener('change', syncToLunar);

  function checkInputs() {
    const title = document.getElementById('event-title').value.trim();
    const y = lunarYear.value, m = lunarMonth.value, d = lunarDay.value;
    const endY = endYearSelect.value;
    downloadBtn.disabled = !(title && y && m && d && endY);
  }

  // 음력 → 양력 동기화
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
      updateSolarDays(); // 드롭다운 일자 채움
      solarDay.value = parseInt(sd);
    }

    updateConvertedList();
  }

  // 양력 → 음력 동기화
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

  // 반복 일정 생성
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

  // ICS 생성
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

  function generateICS(title, solarDates) {
    let ics = `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:${title}\nX-WR-TIMEZONE:Asia/Seoul\n`;
    solarDates.forEach(dateStr => {
      const dt = dateStr.replace(/-/g, '');
      ics += `BEGIN:VEVENT\nSUMMARY:${title}\nDTSTART;VALUE=DATE:${dt}\nDTEND;VALUE=DATE:${dt}\nTRANSP:TRANSPARENT\nEND:VEVENT\n`;
    });
    ics += 'END:VCALENDAR';
    return ics;
  }

  // 달력 초기화
  initCalendar(lunarData);
};
