console.log('✅ calendar.js loaded');

function initCalendar(lunarData) {
  const toggle = document.getElementById('calendar-toggle');
  const calendarDiv = document.getElementById('calendar');

  toggle.addEventListener('click', () => {
    calendarDiv.style.display = calendarDiv.style.display === 'none' ? 'block' : 'none';
  });

  const today = new Date();
  renderCalendar(today.getFullYear(), today.getMonth() + 1, lunarData);
}

function renderCalendar(year, month, lunarData) {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';
  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();

  const weekdays = ['일','월','화','수','목','금','토'];
  const grid = document.createElement('div');
  grid.className = 'calendar-grid';

  weekdays.forEach(d => {
    const cell = document.createElement('div');
    cell.style.fontWeight = 'bold';
    cell.textContent = d;
    grid.appendChild(cell);
  });

  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement('div'));
  }

  for (let date = 1; date <= lastDate; date++) {
    const cell = document.createElement('div');
    const solarStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const match = lunarData.find(d => d.solar === solarStr);
    const lunarText = (match && date % 5 === 0)
      ? `${match.leap ? '(윤)' : ''}${parseInt(match.lunar.split('-')[1])}/${parseInt(match.lunar.split('-')[2])}`
      : '';

    cell.innerHTML = `<div>${date}</div><div style="font-size: 0.7em; color: #666;">${lunarText}</div>`;
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
