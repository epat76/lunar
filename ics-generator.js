// 음력 날짜를 입력하면 자동으로 양력 날짜를 계산하여 표시하는 함수
function updateSolarDate() {
    var lunarDate = document.getElementById("startDate").value;

    // 유효한 날짜 형식인지 체크 (yyyy-mm-dd 형식)
    if (isValidLunarDate(lunarDate)) {
        // 음력 날짜 -> 양력 날짜 변환
        var solarDate = convertLunarToSolar(lunarDate);
        document.getElementById("solarDate").value = solarDate; // 양력 날짜 업데이트
    } else {
        document.getElementById("solarDate").value = "올바른 음력 날짜를 입력하세요"; // 유효하지 않은 날짜
    }
}

// 음력 날짜가 유효한지 확인하는 함수 (yyyy-mm-dd 형식)
function isValidLunarDate(date) {
    var regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date); // yyyy-mm-dd 형식일 경우 true 반환
}

// 음력 날짜를 양력 날짜로 변환하는 함수
function convertLunarToSolar(lunarDate) {
    // 실제 음력 -> 양력 변환 로직을 여기에 구현해야 합니다.
    // 여기서는 단순히 음력 날짜를 그대로 양력 날짜로 반환합니다.
    return lunarDate; // 실제 음력 -> 양력 변환 코드가 필요합니다.
}

// 입력 값이 변경될 때마다 모든 항목이 입력되었는지 확인
function checkInputs() {
    var eventTitle = document.getElementById("eventTitle").value;
    var startDate = document.getElementById("startDate").value;
    var repeatCount = document.getElementById("repeatCount").value;

    // 모든 입력 값이 올바르게 입력되었으면 버튼 활성화
    if (eventTitle && startDate && repeatCount && repeatCount >= 1 && repeatCount <= 25) {
        document.getElementById("generateBtn").disabled = false;
    } else {
        document.getElementById("generateBtn").disabled = true;
    }
}

// ICS 파일 생성 함수
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
