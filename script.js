let lunarData = [];

window.onload = async function () {
  const res = await fetch('lunar_to_solar.json');
  lunarData = await res.json();

  const yearSelect = document.getElementById('lunar-year');
  const monthSelect = document.getElementById('lunar-month');
  const daySelect = document.getElementById('lunar-day');
  const leapInput = document.getElementById('is-leap');
  const endYearSelect = document.getElementById('end-year');
  const downloadBtn = document.getElementById('download-btn');
  const convertedArea = document.getElementById('converted-list');

  for (let y = 1881; y <= 2100; y++) {
    yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
  }

  for (let m = 1; m <= 12; m++) {
    monthSelect.innerHTML += `<option value="${m}">${m}</option>`;
  }

  yearSelect.addEventListener('change', updateDays);
  monthSelect.addEventListener('change', updateDays);
  leapInput.addEventListener('change', updateDays);

  yearSelect.value = new Date().getFullYear();
  monthSelect.value = new Date().getMonth() + 1;
  yearSelect.dispatchEvent(new Event('change'));

  // 종료 연도 옵션 업데이트
  yearSelect.addEventListener('change', () => {
    const year = parseInt(yearSelect.value);
    if (!year) return;
    endYearSelect.innerHTML = '<option value="">-- 연도 선택 --</option>';
    for (let y = year + 1; y <= 2100; y++) {
      endYearSelect.innerHTML += `<option value="${y}">${y}</option>`;
    }
  });

  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', () => {
      checkInputs();
      updateConvertedList();
    });
    el.addEventListener('change', () => {
      checkInputs();
      updateConvertedList();
    });
  });

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

  initCalendar(lunarData);
};

function checkInputs() {
  const title = document.getElementById('event-title').value.trim();
  const year = document.getElementById('lunar-year').value;
  const month = document.getElementById('lunar-month').value;
  const day = document.getElementById('lunar-day').value;
  const endYear = document.getElementById('end-year').value;
  const downloadBtn = document.getElementById('download-btn');
  downloadBtn.disabled = !(title && year && month && day && endYear);
}

function updateDays() {
  const year = parseInt(document.getElementById('lunar-year').value);
  const month = parseInt(document.getElementById('lunar-month').value);
  const isLeap = document.getElementById('is-leap').checked;
  const daySelect = document.getElementById('lunar-day');

  if (!year || !month) return;

  const targetPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const days = lunarData
    .filter(d => d.lunar.startsWith(targetPrefix) && d.leap === isLeap)
    .map(d => parseInt(d.lunar.split('-')[2]));

  const maxDay = days.length > 0 ? Math.max(...days) : 30;
  daySelect.innerHTML = '<option value="">일 선택</option>';
  for (let d = 1; d <= maxDay; d++) {
    daySelect.innerHTML += `<option value="${d}">${d}</option>`;
  }
}

function updateConvertedList() {
  const year = document.getElementById('lunar-year').value;
  const month = document.getElementById('lunar-month').value;
  const day = document.getElementById('lunar-day').value;
  const isLeap = document.getElementById('is-leap').checked;
  const endYear = parseInt(document.getElementById('end-year').value);
  const convertedArea = document.getElementById('converted-list');
  const convertedDateLabel = document.getElementById('converted-date-label');

  if (!year || !month || !day) {
    convertedArea.value = '';
    convertedDateLabel.textContent = '';
    return;
  }

  const results = [];
  const fromY = parseInt(year);
  const toY = isNaN(endYear) ? fromY : endYear;

  for (let y = fromY; y <= toY; y++) {
    const targetLunar = `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const match = lunarData.find(d => d.lunar === targetLunar && d.leap === isLeap);
    if (match) results.push(match.solar);
  }

  convertedArea.value = results.join('\n');

  if (results.length > 0) {
    convertedDateLabel.textContent = `→ 양력 기준: ${results[0]}`;
  } else {
    convertedDateLabel.textContent = '해당 음력 날짜의 양력 변환 결과 없음';
  }
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
