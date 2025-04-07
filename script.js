let lunarData = [];

// 1. JSON 데이터 불러오기
fetch('lunar_to_solar_from_1930.json')
  .then(response => response.json())
  .then(data => {
    lunarData = data;
  })
  .catch(err => {
    alert("데이터를 불러오는 데 실패했습니다.");
    console.error(err);
  });

// 2. ICS 생성기 초기화 (ics.js 라이브러리 필요)
document.getElementById('generate').addEventListener('click', () => {
  const title = document.getElementById('title').value.trim();
  const lunarDate = document.getElementById('lunar-date').value;
  const isLeap = document.getElementById('leap-month').checked;
  const endYear = parseInt(document.getElementById('end-year').value);

  if (!title || !lunarDate || isNaN(endYear)) {
    alert("모든 항목을 입력해주세요.");
    return;
  }

  const [baseYear, month, day] = lunarDate.split('-').map(str => parseInt(str));

  const matchingEvents = [];

  for (let year = baseYear; year <= endYear; year++) {
    const target = lunarData.find(d =>
      d.lunar === `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` &&
      d.leap === isLeap
    );

    if (target) {
      matchingEvents.push({
        year: parseInt(target.solar.split('-')[0]),
        month: parseInt(target.solar.split('-')[1]),
        day: parseInt(target.solar.split('-')[2]),
        title
      });
    }
  }

  if (matchingEvents.length === 0) {
    alert("해당 조건에 맞는 변환 결과가 없습니다.");
    return;
  }

  const cal = new ICS();

  matchingEvents.forEach(ev => {
    const dateStr = `${ev.year}-${String(ev.month).padStart(2, '0')}-${String(ev.day).padStart(2, '0')}`;
    cal.addEvent(
      ev.title,
      '',
      '',
      dateStr,
      dateStr,
      { allDay: true }
    );
  });

  const blob = cal.buildBlob();
  const url = URL.createObjectURL(blob);
  const link = document.getElementById('download-link');
  link.href = url;
  link.style.display = 'block';
});
