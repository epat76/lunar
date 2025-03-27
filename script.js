// script.js
let lunarData = [];

window.onload = async function () {
  // JSON 데이터 불러오기
  const res = await fetch('lunar_to_solar.json');
  lunarData = await res.json();

  const lunarInput = document.getElementById('lunar-date');
  const leapInput = document.getElementById('is-leap');
  const endYearSelect = document.getElementById('end-year');
  const downloadBtn = document.getElementById('download-btn');
  const convertedArea = document.getElementById('converted-list');

  // 음력 날짜 변경 시 종료연도 옵션 구성
  lunarInput.addEventListener('change', () => {
    const year = new Date(lunarInput.value).getFullYear();
    endYearSelect.innerHTML = '<option value="">-- 연도 선택 --</option>';
    for (let y = year + 1; y <= 2100; y++) {
      endYearSelect.innerHTML += `<option value="${y}">${y}</option>`;
    }
    checkInputs();
    updateConvertedList();
  });

  // 입력값 유효성 검사
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

  // 다운로드 버튼 클릭
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
  const lunar = document.getElementById('lunar-date').value;
  const endYear = document.getElementById('end-year').value;
  const downloadBtn = document.getElementById('download-btn');

  if (title && lunar && endYear) {
    downloadBtn.disabled = false;
  } else {
    downloadBtn.disabled = true;
  }
}

function updateConvertedList() {
  const lunar = document.getElementById('lunar-date').value;
  const isLeap = document.getElementById('is-leap').checked;
  const endYear = parseInt(document.getElementById('end-year').value);
  const convertedArea = document.getElementById('converted-list');
  const convertedDateLabel = document.getElementById('converted-date-label');

  if (!lunar || !endYear) {
    convertedArea.value = '';
    convertedDateLabel.textContent = '';
    return;
  }

  const [year, month, day] = lunar.split('-').map(Number);
  const results = [];

  for (let y = year; y <= endYear; y++) {
    const targetLunar = `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const match = lunarData.find(d => d.lunar === targetLunar && d.leap === isLeap);
    if (match) results.push(match.solar);
  }

  convertedArea.value = results.join('\n');

  // 변환된 첫 날짜를 표시
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
