function generateICS() {
    // 사용자 입력 가져오기
    var eventTitle = document.getElementById("eventTitle").value;
    var startDate = document.getElementById("startDate").value;
    var repeatCount = parseInt(document.getElementById("repeatCount").value);

    // ICS 파일 초기화
    var icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\n";
    
    // 반복 일정 생성
    for (var i = 0; i < repeatCount; i++) {
        var solarDate = convertLunarToSolar(startDate); // 음력을 양력으로 변환
        var startDateFormatted = formatDateForICS(solarDate); // ICS 형식으로 날짜 포맷

        // ICS 이벤트 추가
        icsContent += "BEGIN:VEVENT\n";
        icsContent += "SUMMARY:" + eventTitle + "\n";
        icsContent += "DTSTART:" + startDateFormatted + "\n";
        icsContent += "DTEND:" + startDateFormatted + "\n";
        icsContent += "RRULE:FREQ=YEARLY\n"; // 매년 반복
        icsContent += "END:VEVENT\n";

        // 음력 날짜를 1년 뒤로 이동
        startDate = moveToNextYear(startDate);
    }

    icsContent += "END:VCALENDAR\n";
    
    // 생성된 ICS 파일 다운로드 링크 설정
    var blob = new Blob([icsContent], { type: "text/calendar" });
    var url = URL.createObjectURL(blob);
    var downloadLink = document.getElementById("downloadLink");
    downloadLink.href = url;
    downloadLink.style.display = "block"; // 다운로드 버튼 보이기
}

function convertLunarToSolar(lunarDate) {
    // 여기에 음력 -> 양력 변환 로직을 구현합니다.
    // 예시로 단순히 월과 일을 반환합니다. (여기서는 간단화하기 위해 음력을 양력으로 변환하는 코드를 추가해야 합니다)
    return lunarDate; // 실제 음력 -> 양력 변환 코드가 필요합니다
}

function formatDateForICS(date) {
    // YYYY-MM-DD 형식을 `YYYYMMDD'T'HHMMSS'Z'` 형식으로 변환
    var momentDate = moment(date, "YYYY-MM-DD");
    return momentDate.format("YYYYMMDD") + "T000000Z";
}

function moveToNextYear(date) {
    // 날짜를 1년 뒤로 이동
    var momentDate = moment(date, "YYYY-MM-DD");
    momentDate.add(1, 'year');
    return momentDate.format("YYYY-MM-DD");
}
