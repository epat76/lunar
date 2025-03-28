console.log('✅ calendar.js loaded');

function initCalendar(lunarData) {
  const calendarDiv = document.getElementById('calendar');
  const toggleLunar = document.getElementById('calendar-toggle-lunar');
  const toggleSolar = document.getElementById('calendar-toggle-solar');
  let targetMode = 'lunar';

  toggleLunar.addEventListener('click', () => {
    targetMode = 'lunar';
    renderCalendar(new Date(), lunarData);
    const inputRow = document.getElementById('lunar-input-row');
    inputRow.insertAdjacentElement('afterend', calendarDiv);
    calendarDiv.style.display = 'block';
  });

  toggleSolar.addEventListener('click', () => {
    targetMode = 'solar';
    renderCalendar(new Date(), lunarData);
    const inputRow = document.getElementById('solar-input-row');
    inputRow.insertAdjacentElement('afterend', calendarDiv);
    calendarDiv.style.display = 'block';
  });

  function handleDateClick(solarStr) {
    if (targetMode === 'solar') {
      const [y, m, d] = solarStr.split('-');
      document.getElementById('solar-year').value = y;
      document.getElementById('solar-month').value = parseInt(m);
      document.getElementById('solar-day').value = parseInt(d);
      document.getElementById('calendar').style.display = 'none';
      document.getElementById('solar-day').dispatchEvent(new Event('change'));
    } else {
      const match = lunarData.find(e => e.solar === solarStr);
      if (match) {
        const [y, m, d] = match.lunar.split('-');
        document.getElementById('lunar-year').value = y;
        document.getElementById('lunar-month').value = parseInt(m);
        document.getElementById('lunar-day').value = parseInt(d);
        document.getElementById('is-leap').checked = match.leap;
        document.getElementById('calendar').style.display = 'none';
        document.getElementById('lunar-day').dispatchEvent(new Event('change'));
      }
    }
  }

  function renderCalendar(dateObj, lunarData) {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();

    const weekdays = ['일','월','화','수','목','금','토'];
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    weekdays.forEach(day => {
      const cell = document.createElement('div');
      cell.className = 'header';
      cell.textContent = day;
      grid.appendChild(cell);
    });

    for (let i = 0; i < firstDay; i++) {
      grid.appendChild(document.createElement('div'));
    }

    for (let d = 1; d <= lastDate; d++) {
      const solarStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cell = document.createElement('div');
      const match = lunarData.find(e => e.solar === solarStr);
      const lunarDisplay = match ? `${parseInt(match.lunar.split('-')[2])}` + (match.leap ? ' (윤)' : '') : '';

      cell.innerHTML = `<div>${d}</div><div style="font-size:11px;color:#ccc;">${lunarDisplay}</div>`;
      cell.addEventListener('click', () => handleDateClick(solarStr));
      grid.appendChild(cell);
    }

    calendarDiv.innerHTML = '';
    calendarDiv.appendChild(grid);
  }
}
