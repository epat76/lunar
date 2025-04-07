let lunarData = [];

// 1. JSON 데이터 불러오기 (상대경로 수정됨)
fetch('./lunar_to_solar_from_1930.json')
  .then(response => {
    if (!response.ok) throw new Error("JSON 파일 로드 실패");
    return response.json();
  })
  .then(data => {
    lunarData = data;
  })
  .catch(err => {
    alert("데이터를 불러오는 데 실패했습니다.");
    console.error(err);
  });

// 2. 이벤트 처리
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
    const match = lunarData.find(d =>
      d.lunar === `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` &&
      d.leap === isLeap
    );

    if (match) {
      const [y, m, d] = match.solar.split('-').map(Number);
      matchingEvents.push({
        year: y,
        month: m,
        day: d,
        title
      });
    }
  }

  if (matchingEvents.length === 0) {
    alert("해당 조건에 맞는 양력 날짜를 찾을 수 없습니다.");
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
