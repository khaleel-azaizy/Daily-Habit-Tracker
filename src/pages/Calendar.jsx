import React from 'react';

function Calendar({ year, month, events, addNewEvent, deleteEvent }) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const numDaysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay();
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const result = [];

  for (let i = 0; i < startDay; i++) {
    const dayNum = prevMonthLastDay - (startDay - 1) + i;
    result.push({
      date: dayNum,
      inCurrentMonth: false,
      month: month - 1 < 0 ? 11 : month - 1,
      year: month - 1 < 0 ? year - 1 : year,
      events: [],
    });
  }

  for (let i = 1; i <= numDaysInMonth; i++) {
    if (i === new Date().getDate() && year === new Date().getFullYear() && month === new Date().getMonth()) {
      result.push({
        date: i,
        inCurrentMonth: true,
        isToday: true,
        month: month,
        year: year,
        events: [],
      });
      continue;
    }
    result.push({
      date: i,
      inCurrentMonth: true,
      month: month,
      year: year,
      events: [],
    });
  }

  while (result.length < 42) {
    result.push({
      date: result.length - (numDaysInMonth + startDay) + 1,
      inCurrentMonth: false,
      month: month + 1 > 11 ? 0 : month + 1,
      year: month + 1 > 11 ? year + 1 : year,
      events: [],
    });
  }

  events.forEach((event) => {
    const eventDate = new Date(event.date);
    const eventDay = eventDate.getDate();
    const eventMonth = eventDate.getMonth();
    const eventYear = eventDate.getFullYear();
    result.forEach((day) => {
      if (day.date === eventDay && day.month === eventMonth && day.year === eventYear) {
        day.events.push(event);
      }
    });
  });

  return (
    <div className="calendar-grid">
      {result.map((day, index) => (
        <div className="calendar-cell" onClick={() => addNewEvent(day)} key={index}>
          {day.inCurrentMonth ? (
            <div className="day-number">
              {day.isToday ? (  <div className="today-number">{day.date}</div> ) : ( <div className="day-number">{day.date}</div>  )}
            </div>  ) : (<div className="day-number-not-in-the-month">{day.date}</div> )}
          <div className="user-events">
            {day.events.map((event, eventIndex) => (
              <div className="event-item" key={eventIndex}onClick={(e) => {
                  e.stopPropagation();
                  deleteEvent(new Date(day.year, day.month, day.date),event.title);}}>{event.title}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Calendar;