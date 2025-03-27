console.log('✅ calendar.js loaded');

function initCalendar(lunarData) {
  const toggle = document.getElementById('calendar-toggle');
  const calendarDiv = document.getElementById('calendar');

  // 📅 버튼 클릭 시 달력 표시/숨김
  toggle.addEventListener('click', () => {
    const isVisible = calendarDiv.style.display === 'block';
    calendarDiv.style.display = isVisible ? 'none' : 'block';
  });

  // 현재 연도/월로 초기 달력 렌더링
  const today = new Date();
  renderCalendar(today.getFullYear(), today.getMonth() + 1, lunarData);
}

function renderCalendar(year, month, lunarData) {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';

  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const grid = document.createElement('div');
  grid.className = 'calendar-grid';

  // 요일 헤더
  weekdays.forEach(day => {
    const cell = document.createElement('div');
    cell.style.fontWeight = 'bold';
    cell.textContent = day;
    grid.appendChild(cell);
  });

  // 빈 칸 채우기
  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement('div'));
  }

  // 날짜 렌더링
  for (let date = 1; date <= lastDate; date++) {
    const cell = document.createElement('div');
    const solarStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const match = lunarData.find(d => d.solar === solarStr);

    cell.textContent = date;
    cell.style.cursor = 'pointer';

    if (match) {
      cell.addEventListener('click', () => {
        const [ly, lm, ld] = match.lunar.split('-').map(Number);
        document.getElementById('lunar-year').value = ly;
        document.getElementById('lunar-month').value = lm;
        document.getElementById('lunar-day').value = ld;
        document.getElementById('is-leap').checked = match.leap;
        document.getElementById('calendar').style.display = 'none';
        updateConvertedList();
      });
    }

    grid.appendChild(cell);
  }

  calendar.appendChild(grid);
}
