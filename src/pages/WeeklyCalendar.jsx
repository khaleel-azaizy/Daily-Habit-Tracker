import './WeeklyCalendar.css';
import React, { useState, useEffect } from 'react';
import { Event } from './Calendar';

const WeeklyCalendar = ({ currentDay, year, month, events, addNewEvent, deleteEvent }) => {
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    calculateWeekDays();
  }, [currentDay, year, month, events]); 

  const calculateWeekDays = () => {
    const currentDate = new Date(year, month, currentDay);
    const currentDayOfWeek = currentDate.getDay();

    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(firstDayOfWeek);
      day.setDate(firstDayOfWeek.getDate() + i);
      days.push({
        date: day.getDate(),
        month: day.getMonth(),
        year: day.getFullYear(),
        events: [],
      });
    }

    events.forEach((event) => {
      const eventDate = new Date(event.date);
      days.forEach((day) => {
        if (
          eventDate.getDate() === day.date &&
          eventDate.getMonth() === day.month &&
          eventDate.getFullYear() === day.year
        ) {
          day.events.push(event);
        }
      });
    });

    setWeekDays(days);
  };

  return (
    <div className="full-weekly-calendar">
      <div className="my-calendar">
        <span className="days">Sun</span>
        <span className="days">Mon</span>
        <span className="days">Tue</span>
        <span className="days">Wed</span>
        <span className="days">Thu</span>
        <span className="days">Fri</span>
        <span className="days">Sat</span>
      </div>
      <div className="weekly-calendar">
        <div className="time-slots">
          <p className="time-slot">0:00</p>
          {Array.from({ length: 23 }, (_, i) => (
            <div key={i + 1} className="time-slot">
              {i + 1}:00
            </div>
          ))}
        </div>
        <div className="week-grid">
          {weekDays.map((day, index) => (
            <div key={index} className="day-column">
              <div
                className={
                  (day.date === new Date().getDate()  && day.month === new Date().getMonth())
                    ? 'weekly-today-number'
                    : 'day-header'
                }
                onClick={() => {
                  addNewEvent(day);
                  calculateWeekDays(); 
                }}
              >
                {day.date} / {day.month + 1}
              </div>

              {day.events.map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  className="day-events"
                  style={{
                    gridRow:
                      parseFloat(event.startTime) +
                      2 +
                      '/' +
                      (parseFloat(event.endTime) + 2),
                  }}
                >
                  <Event
                    event={event}
                    deleteEvent={(eventToDelete) => {
                      deleteEvent(eventToDelete);
                      calculateWeekDays(); 
                    }}
                    addNewEvent={addNewEvent}
                    startTime={event.startTime}
                    endTime={event.endTime}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;