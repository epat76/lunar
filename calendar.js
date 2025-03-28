console.log('✅ calendar.js loaded');

function initCalendar(lunarData) {
  const calendarDiv = document.getElementById('calendar');
  const toggleLunar = document.getElementById('calendar-toggle-lunar');
  const toggleSolar = document.getElementById('calendar-toggle-solar');
  let targetMode = 'lunar'; // 클릭 위치에 따라 'lunar' 또는 'solar'

  // 📅 버튼 클릭 시 달력 토글
  toggleLunar.addEventListener('click', () => {
    targetMode = 'lunar';
    calendarDiv.style.display = calendarDiv.style.display === 'block' ? 'none' : 'block';
    renderCalendar(new Date(), lunarData);
  });

  toggleSolar.addEventListener('click', () => {
    targetMode = 'solar';
    calendarDiv.style.display = calendarDiv.style.display === 'block' ? 'none' : 'block';
    renderCalendar(new Date(), lunarData);
  });

  // 날짜 클릭 후 자동 반영
  function handleDateClick(solarStr) {
    if (targetMode === 'solar') {
      document.getElementById('solar-date').value = solarStr;
      document.getElementById('calendar').style.display = 'none';
      document.getElementById('solar-date').dispatchEvent(new Event('change'));
    } else if (targetMode === 'lunar') {
      const match = lunarData.find(e => e.solar === solarStr);
      if (match) {
        const [ly, lm, ld] = match.lunar.split('-');
        document.getElementById('lunar-year').value = ly;
        document.getElementById('lunar-month').value = parseInt(lm);
        document.getElementById('is-leap').checked = match.leap;

        // 일자 동기화 후 반영
        setTimeout(() => {
          document.getElementById('lunar-day').value = parseInt(ld);
          document.getElementById('calendar').style.display = 'none';
          document.getElementById('lunar-year').dispatchEvent(new Event('change'));
        }, 10);
      }
    }
  }

  // 달력 렌더링
  function renderCalendar(dateObj, lunarData) {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();

    const weekdays = ['일','월','화','수','목','금','토'];
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    // 요일 헤더
    weekdays.forEach(day => {
      const cell = document.createElement('div');
      cell.className = 'header';
      cell.textContent = day;
      grid.appendChild(cell);
    });

    // 빈 셀
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.textContent = '';
      grid.appendChild(empty);
    }

    // 날짜 셀
    for (let d = 1; d <= lastDate; d++) {
      const cell = document.createElement('div');
      const solarStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cell.textContent = d;

      const match = lunarData.find(e => e.solar === solarStr);
      if (match) {
        cell.addEventListener('click', () => handleDateClick(solarStr));
      }

      grid.appendChild(cell);
    }

    // 갱신
    calendarDiv.innerHTML = '';
    calendarDiv.appendChild(grid);
  }
}
