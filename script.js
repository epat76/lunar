// script.js
let lunarData = [];

window.onload = async function () {
  // JSON 데이터 불러오기
  const res = await fetch('lunar_to_solar.json');
  lunarData = await res.json();

  const yearSelect = document.getElementById('lunar-year');
  const monthSelect = document.getElementById('lunar-month');
  const daySelect = document.getElementById('lunar-day');
  const leapInput = document.getElementById('is-leap');
  const endYearSelect = document.getElementById('end-year');
  const downloadBtn = document.getElementById('download-btn');
  const convertedArea = document.getElementById('converted-list');
  const convertedDateLabel = document.getElementById('converted-date-label');

  // 연도 선택 구성
  for (let y = 1881; y <= 2100; y++) {
    yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
  }

  // 월 선택 구성
  for (let m = 1; m <= 12; m++) {
    monthSelect.innerHTML += `<option value="${m.toString().padStart(2, '0')}">${m}</option>`;
  }

  // 연도 또는 월이 변경되면 해당 월의 말일을 계산해 일 선택 구성
  function updateDayOptions() {
    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    if (!year || !month) return;

    const lunarMonthString = getLunarMonthString(year);
    const monthCode = lunarMonthString[month - 1];
    const lastDay = (monthCode === '2' || monthCode === '4') ? 30 : 29;

    daySelect.innerHTML = '<option value="">일 선택</option>';
    for (let d = 1; d <= lastDay; d++) {
      daySelect.innerHTML += `<option value="${d.toString().padStart(2, '0')}">${d}</option>`;
    }
  }

  yearSelect.addEventListener('change', () => {
    updateDayOptions();
    updateEndYearOptions();
    checkInputs();
    updateConvertedList();
  });

  monthSelect.addEventListener('change', () => {
    updateDayOptions();
    checkInputs();
    updateConvertedList();
  });

  daySelect.addEventListener('change', () => {
    checkInputs();
    updateConvertedList();
  });

  leapInput.addEventListener('change', () => {
    checkInputs();
    updateConvertedList();
  });

  endYearSelect.addEventListener('change', () => {
    checkInputs();
    updateConvertedList();
  });

  function updateEndYearOptions() {
    const startYear = parseInt(yearSelect.value);
    if (!startYear) return;

    endYearSelect.innerHTML = '<option value="">-- 연도 선택 --</option>';
    for (let y = startYear + 1; y <= 2100; y++) {
      endYearSelect.innerHTML += `<option value="${y}">${y}</option>`;
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
};

function checkInputs() {
  const title = document.getElementById('event-title').value.trim();
  const year = document.getElementById('lunar-year').value;
  const month = document.getElementById('lunar-month').value;
  const day = document.getElementById('lunar-day').value;
  const endYear = document.getElementById('end-year').value;
  const downloadBtn = document.getElementById('download-btn');

  if (title && year && month && day && endYear) {
    downloadBtn.disabled = false;
  } else {
    downloadBtn.disabled = true;
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

  if (!year || !month || !day || !endYear) {
    convertedArea.value = '';
    convertedDateLabel.textContent = '';
    return;
  }

  const results = [];
  for (let y = parseInt(year); y <= endYear; y++) {
    const targetLunar = `${y}-${month}-${day}`;
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

function getLunarMonthString(year) {
  const baseYear = 1881;
  const index = year - baseYear;
  // 예시 문자열 리턴 (실제로는 LunarMonthTable에서 가져와야 함)
  // 이 함수는 실제 lunarMonthTable을 import해서 구현해야 함
  return '1212121221220'; // 예시 리턴
}
