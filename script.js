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

        if (title && lunarYear && lunarMonth && lunarDay && endYear) {
            for (let year = lunarYear; year <= endYear; year++) {
                const solarDate = lunarToSolar(year, lunarMonth, lunarDay, isLeap);
                if (solarDate) {
                    solarSchedules.push({ year: year, date: solarDate });
                } else {
                    console.warn(`음력 ${year}-${lunarMonth}-${lunarDay} (윤달: ${isLeap}) 변환 실패`);
                }
            }
            displaySolarSchedule(solarSchedules);
            return solarSchedules;
        } else {
            alert('모든 필드를 입력해주세요.');
            return [];
        }
    }

    function displaySolarSchedule(schedules) {
        let displayText = '';
        schedules.forEach(item => {
            const year = item.year;
            const date = item.date;
            displayText += `${year}년 ${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일\n`;
        });
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
            const formattedDate = `${year}${month}${day}T000000Z`;

            icsContent +=
                "BEGIN:VEVENT\n" +
                "UID:" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "\n" +
                "DTSTAMP:" + formattedDate + "\n" +
                "DTSTART:" + formattedDate + "\n" +
                "DTEND:" + formattedDate + "\n" +
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
