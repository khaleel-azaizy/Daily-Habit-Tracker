import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
  EVENT: 'event',
};

function Calendar({ year, month, events, addNewEvent, deleteEvent, handleEventDrop }) {
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
        <DayCell key={index} day={day} addNewEvent={addNewEvent} deleteEvent={deleteEvent} handleEventDrop={handleEventDrop} />
      ))}
    </div>
  );
}

function DayCell({ day, addNewEvent, deleteEvent, handleEventDrop }) {
  const [, drop] = useDrop({
    accept: ItemTypes.EVENT,
    drop: (item, monitor) => {
      handleEventDrop(item.id, day.date, day.month, day.year,item.title);
    },
  });

  return (
    <div ref={drop} className="calendar-cell" onClick={() => addNewEvent(day)}>
      {day.inCurrentMonth ? (
        <div className="day-number">
          {day.isToday ? (
            <div className="today-number">{day.date}</div>
          ) : (
            <div className="day-number">{day.date}</div>
          )}
        </div>
      ) : (
        <div className="day-number-not-in-the-month">{day.date}</div>
      )}
      <div className="user-events">
        {day.events.map((event, eventIndex) => (
          <Event key={eventIndex} event={event} deleteEvent={deleteEvent} />
        ))}
      </div>
    </div>
  );
}

function Event({ event, deleteEvent }) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.EVENT,
    item: { id: event.id, date: event.date },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="event-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={(e) => {
        e.stopPropagation();
        deleteEvent(event.date, event.id);
      }}
    >
      {event.title}
    </div>
  );
}

export default Calendar;