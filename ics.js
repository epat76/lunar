// ICS 생성 라이브러리
function ICS() {
  let calendarEvents = [];
  const calendarStart = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//lunar-to-solar//ics generator//EN'
  ].join('\n');

  const calendarEnd = 'END:VCALENDAR';

  const toDateString = (date) => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const generateEvent = (title, description, location, start, end, options = {}) => {
    const uid = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const startDate = options.allDay ? start.replace(/-/g, '') : toDateString(start);
    const endDate = options.allDay ? end.replace(/-/g, '') : toDateString(end);

    const lines = [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      options.allDay ? `DTSTART;VALUE=DATE:${startDate}` : `DTSTART:${startDate}`,
      options.allDay ? `DTEND;VALUE=DATE:${endDate}` : `DTEND:${endDate}`,
      'END:VEVENT'
    ];

    return lines.join('\n');
  };

  return {
    addEvent: (title, description, location, start, end, options = {}) => {
      calendarEvents.push(generateEvent(title, description, location, start, end, options));
      return true;
    },
    buildBlob: () => {
      const calendar = [calendarStart].concat(calendarEvents).concat(calendarEnd).join('\n');
      return new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
    }
  };
}
