document.addEventListener('DOMContentLoaded', function() {
    const eventTitleInput = document.getElementById('event-title');
    const lunarYearInput = document.getElementById('lunar-year');
    const lunarMonthInput = document.getElementById('lunar-month');
    const lunarDayInput = document.getElementById('lunar-day');
    const isLeapCheckbox = document.getElementById('is-leap');
    const endYearInput = document.getElementById('end-year');
    const solarScheduleTextarea = document.getElementById('solar-schedule');
    const downloadIcsButton = document.getElementById('download-ics');

    let lunarSolarData = []; // 데이터를 저장할 변수

    // lunar.json 파일 로드
    fetch('lunar.json')
        .then(response => response.json())
        .then(data => {
            lunarSolarData = data;
        })
        .catch(error => {
            console.error('lunar.json 파일을 불러오는 데 실패했습니다:', error);
            alert('음력/양력 변환 데이터를 불러오는 데 실패했습니다. 페이지를 다시 로드해주세요.');
        });

    function lunarToSolar(year, month, day, isLeap) {
        const lunarDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const found = lunarSolarData.find(item =>
            item.lunar === lunarDateString && item.leap === isLeap
        );
        return found ? new Date(found.solar + 'T00:00:00') : null;
    }

    function generateSolarSchedule() {
        const title = eventTitleInput.value.trim();
        const lunarYear = parseInt(lunarYearInput.value);
        const lunarMonth = parseInt(lunarMonthInput.value);
        const lunarDay = parseInt(lunarDayInput.value);
        const isLeap = isLeapCheckbox.checked;
        const endYear = parseInt(endYearInput.value);
        let solarSchedules = [];
        let errorMessage = '';

        if (title && !isNaN(lunarYear) && !isNaN(lunarMonth) && !isNaN(lunarDay) && !isNaN(endYear)) {
            for (let year = lunarYear; year <= endYear; year++) {
                const solarDate = lunarToSolar(year, lunarMonth, lunarDay, isLeap);
                if (solarDate) {
                    solarSchedules.push({ year: year, date: solarDate });
                } else {
                    console.warn(`음력 ${year}-${lunarMonth}-${lunarDay} (윤달: ${isLeap}) 변환 실패`);
                    errorMessage += `${year}년 음력 ${lunarMonth}월 ${lunarDay}일 (윤달: ${isLeap ? '있음' : '없음'})에 해당하는 양력 날짜를 찾을 수 없습니다.\n`;
                }
            }
            displaySolarSchedule(solarSchedules, errorMessage);
            return solarSchedules;
        } else {
            alert('모든 필드를 올바르게 입력해주세요.');
            return [];
        }
    }

    function displaySolarSchedule(schedules, errorMessage) {
        let displayText = '';
        if (schedules.length > 0) {
            schedules.forEach(item => {
                const date = item.date;
                displayText += `${item.year}년 ${date.getMonth() + 1}월 ${date.getDate()}일\n`;
            });
        }
        if (errorMessage) {
            displayText += '\n' + errorMessage;
        }
        solarScheduleTextarea.value = displayText;
    }

function generateIcsFile(schedules, title) {
    if (!title) {
        title = '반복 일정';
    }
    let icsContent =
        "BEGIN:VCALENDAR\n" +
        "VERSION:2.0\n" +
        "PRODID:-//Your Company//Your Product//EN\n" +
        "CALSCALE:GREGORIAN\n";

    schedules.forEach(item => {
        const date = item.date;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedStartDate = `${year}${month}${day}`;

        // 하루 종일 일정의 종료일은 시작일 다음 날
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        const endYear = nextDay.getFullYear();
        const endMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
        const endDay = String(nextDay.getDate()).padStart(2, '0');
        const formattedEndDate = `${endYear}${endMonth}${endDay}`;

        icsContent +=
            "BEGIN:VEVENT\n" +
            "UID:" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "\n" +
            "DTSTAMP:" + formattedStartDate + "T000000Z\n" + // 타임존 정보 추가 (UTC)
            "DTSTART;VALUE=DATE:" + formattedStartDate + "\n" +
            "DTEND;VALUE=DATE:" + formattedEndDate + "\n" +
            "SUMMARY:" + title + "\n" +
            "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/ /g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

    downloadIcsButton.addEventListener('click', function() {
        const schedules = generateSolarSchedule();
        if (schedules.length > 0) {
            generateIcsFile(schedules, eventTitleInput.value.trim());
        } else {
            alert('변환된 일정이 없습니다.');
        }
    });
});
