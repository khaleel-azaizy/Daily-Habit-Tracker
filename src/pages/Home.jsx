import { useState,useEffect } from "react";
import Calendar from "./Calendar";
import YearlyCalendar from "./YearlyCalendar";
import WeeklyCalendar from "./WeeklyCalendar";

export default function Home() {
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [events, setEvents] = useState([]);
  const [upcomingEvents,setUpcomingevents] = useState([]);
  const [oneTimeEvents,setOneTimeEvents] = useState([]);
  const storedUserId = localStorage.getItem('userId');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentDay, setCurrentDay] = useState(new Date().getDate());
  const [day, setDay] = useState({});
  const [fullYear, setFullYear] = useState(false);
  const [yearButton, setYearButton] = useState(null);
  const [monthButton, setMonthButton] = useState(true);
  const [WeekButton, setWeekButton] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState({
    hour: new Date().getHours().toString().padStart(2, '0'),
    minute: new Date().getMinutes().toString().padStart(2, '0'),
  });
  const [endTime, setEndTime] = useState({
    hour: new Date().getHours().toString().padStart(2, '0'),
    minute: new Date().getMinutes().toString().padStart(2, '0'),
  }); 
  const [error, setError] = useState('');
  const [PermanentEvent, setIsPermanentEvent] = useState('week');
  const [checked, setChecked] = useState(false);
  
  useEffect(() => {
    fetchUnpermanentEvents();
    fetchEvents();
  }, [modal]);

  const fetchUnpermanentEvents =() => {
    fetch(`http://localhost:4000/get-one-time-events/${storedUserId}`,{credentials:'include'}) 
      .then((response) => response.json())
      .then((data) => {
        const sortedEvents = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setOneTimeEvents(sortedEvents);
        
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
      });
  };

  const fetchEvents =() => {
    fetch(`http://localhost:4000/get-events/${storedUserId}`,{credentials:'include'}) 
      .then((response) => response.json())
      .then((data) => {
        const sortedEvents = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        const sortedEventsForTime = sortedEvents.sort((a, b) => {
          const timeA = new Date(`1970-01-01T${a.startTime}:00`);
          const timeB = new Date(`1970-01-01T${b.startTime}:00`);
          return timeA - timeB;
        });
        setEvents(sortedEventsForTime);
        
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
      });
  };
 
  useEffect(() => {
    const currentDate = new Date();
    const newupcomingEvents = oneTimeEvents.filter((event) => new Date(event.date) >= currentDate);
    setUpcomingevents(newupcomingEvents)
  }, [oneTimeEvents]);
  
  const handleClick = () => {
    setModal(false);
    setEndTime('');
    setStartTime('');
    setError('');
    setIsPermanentEvent('week');
    setChecked(false);
    setTitle('');
    setCurrentDay(new Date().getDate());
  };
 const handleDeleteClick = (id) => {
  handleEventRemove(id);
  }
 

  const handleEventRemove = (id) => {
    
     
      fetch(`http://localhost:4000/delete-event/${storedUserId}/${id}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        
      }).then(() => {
        console.log('Event deleted');
        setEvents((prevEvents) => prevEvents.filter(event => event.id !== id));
        fetchUnpermanentEvents();

      }).catch(err => {
        console.error('Error deleting event:', err);
      });
      
    
  };
  
  
  const handleEventDrop = (id, date, month, year,title) => {
    const updatedEvent = {
      id,
      title:title,
      date: formatDate(new Date( year,month,date)),
    };
   

    fetch(`http://localhost:4000/update-event/${storedUserId}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updatedEvent),
    })
      .then((response) => {
        if (response.ok) {
          console.log('Event updated successfully');
          fetchEvents();
          fetchUnpermanentEvents();
        } else {
          console.error('Failed to update event');
        }
      })
      .catch((error) => {
        console.error('Error updating event:', error);
      });
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }

  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  const gotToThisDay = () => {
    setCurrentYear(new Date().getFullYear());
    setCurrentMonth(new Date().getMonth());
    setCurrentDay(new Date().getDate());
  }

  const goToPreviousYear = () => {
    setCurrentYear(currentYear - 1);  
  };
  const goToNextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", {
    month: "long",
  });

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; 
    const day = date.getDate();
  
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;
  
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const handleNewDateSelect = (day) => {
    setDay(day);
    setCurrentDay(day.date);
    setModal(true);
  };

  const handleNewEvent = (e) => {
    e.preventDefault();
    if(startTime===''||endTime===''){
      
    }
    else if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    setError('');
    setModal(false);
    setStartTime('');
    setCurrentDay(new Date().getDate());
    setEndTime('');
    let newEvents = [];
    
    if (checked) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      let current = new Date(start);
      while (current <= end) {
        newEvents.push({
          id: current.getTime().toString() + title,
          title,
          date: formatDate(current),
          startTime: `${startTime}`,
          endTime: `${endTime}`,
          isPermanent: true,
          every: PermanentEvent,
          period: `${startDate}/${endDate}`,
        });

        if (PermanentEvent === 'day') {
          current.setDate(current.getDate() + 1);
        } else if (PermanentEvent === 'week') {
          current.setDate(current.getDate() + 7);
        } else if (PermanentEvent === 'month') {
          current.setMonth(current.getMonth() + 1);
        }
      }
    } else {
      newEvents.push({
        id: new Date(day.year, day.month, day.date).getTime().toString() + title,
        title,
        date: formatDate(new Date(day.year, day.month, currentDay)),
        startTime: `${startTime}`,
        endTime: `${endTime}`,
        isPermanent: false,
      });
    }

    fetch(`http://localhost:4000/add-event/${storedUserId}`, {
      method: 'post',
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify(newEvents),
    }).then((response) => {
      if (response.ok) {
        setTitle('');
        fetchEvents();
      }
    });

    setChecked(false);
    setIsPermanentEvent('week');
  };

  const PresentFullYear = () => {
    setFullYear(true);
    setYearButton(true);
    setMonthButton(false);
    setWeekButton(false);
    setCurrentYear(new Date().getFullYear());
  }
 
  const PresentFullMonth = () => {
    setFullYear(false);
    setMonthButton(true);
    setYearButton(false);
    setWeekButton(false);
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());

  }
  const PresentFullWeek = () => {
    setFullYear(false);
    setWeekButton(true);
    setMonthButton(false);
    setYearButton(false);
    setCurrentMonth(new Date().getMonth());

  }
  const goToPreviousWeek = () => {
    const currentDate = new Date(currentYear, currentMonth, currentDay);
    const previousWeekDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
  
    setCurrentDay(previousWeekDate.getDate());
    setCurrentMonth(previousWeekDate.getMonth());
    setCurrentYear(previousWeekDate.getFullYear());
  };
  
  const goToNextWeek = () => {
    const currentDate = new Date(currentYear, currentMonth, currentDay);
    const nextWeekDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
  
    setCurrentDay(nextWeekDate.getDate());
    setCurrentMonth(nextWeekDate.getMonth());
    setCurrentYear(nextWeekDate.getFullYear());
  };

  const editEvent = (id) => {
   
  }
  return (
    <div className="home">
      
      <div className="home-container">
      <header className="home-header"> 
        <button className={yearButton === true ? 'year-mounth-activebutton' : 'year-mounth-notavtive'} onClick={PresentFullYear}  aria-label="Yearly Calendar">
          <i className="fas fa-calendar-alt"></i>
        </button>
        <button className={monthButton === true ? 'year-mounth-activebutton' : 'year-mounth-notavtive'} onClick={PresentFullMonth} aria-label="Monthly Calendar">
          <i className="fas fa-calendar"></i>
        </button>
        <button className={WeekButton === true ? 'year-mounth-activebutton' : 'year-mounth-notavtive'} onClick={PresentFullWeek} aria-label="Weekly Calendar">
          <i className="fas fa-calendar-week"></i>
        </button>
      </header>
        {monthButton && <div className="calendar-container">
          <div className="calendar-header">
            <div className="back-forward-button-holder">
              <button className="back-button" onClick={goToPreviousMonth}></button>
              <button className="forward-button" onClick={goToNextMonth}></button>
            </div>
            <button onClick={gotToThisDay}>Today</button>
            <h2 className="mounth-year-title">{monthName} {currentYear}</h2>
          </div>
          <Calendar year={currentYear} month={currentMonth} events={events} addNewEvent={handleNewDateSelect} deleteEvent={handleDeleteClick} handleEventDrop={handleEventDrop} editEvent={editEvent} />
        </div>}

        {yearButton && <div className="calendar-container">
          <div className="calendar-header">
            <div className="back-forward-button-holder">
              <button className="back-button" onClick={goToPreviousYear}></button>
              <button className="forward-button" onClick={goToNextYear}></button>
            </div>
            <button onClick={gotToThisDay}>Today</button>
            <h2 className="year-title"> {currentYear}</h2>
            <div className="extra"></div>
          </div>
          <YearlyCalendar year={currentYear} events={events} addNewEvent={handleNewDateSelect} deleteEvent={handleDeleteClick} handleEventDrop={handleEventDrop} editEvent={editEvent}/>
        </div>}

        {WeekButton && <div className="calendar-container">
          <div className="calendar-header">
            <div className="back-forward-button-holder">
              <button className="back-button" onClick={goToPreviousWeek}></button>
              <button className="forward-button" onClick={goToNextWeek}></button>
            </div>
            <button onClick={gotToThisDay}>Today</button>
            <h2>{monthName} {currentYear}</h2>
          </div>
          <WeeklyCalendar currentDay={currentDay} year={currentYear} month={currentMonth} events={events} addNewEvent={handleNewDateSelect} deleteEvent={handleDeleteClick} handleEventDrop={handleEventDrop} editEvent={editEvent}/>
        </div>}
        {!fullYear &&
          <div className="all-events-box">
            <h2>Upcoming Events</h2>
            <div className="all-events">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div className="event-preview" key={event.id}>
                    <div className="event-details">
                      <h3>{event.title}</h3>
                      <h4>{event.date}</h4>
                    </div>
                  </div>
                ))
              ) : (
                <h3 className="no-upcoming-events">No Upcoming Events</h3>
              )}
            </div>
          </div>
        }
      </div>

      {modal && (
        <div className="modal">
          <div className="overlay"></div>
          <form className="modal-content" onSubmit={handleNewEvent}>
            <h2>Event Details</h2>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
            />
            <label htmlFor="startTime">Start Time</label>
            <div className="input-wrapper">
              <input 
                id="startTime"
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <label htmlFor="endTime">End Time</label>
            <div className="input-wrapper">
              <input 
                id="endTime"
                type="time" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className="check-box">
              <label htmlFor="myCheckbox">Make The Event Permanent!</label>
              <input
                type="checkbox"
                id="myCheckbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
            </div>
            {checked && (
              <div className="permanent-event">
                <div className="permanent-event-title">
                  <h4>Every  </h4>
                  <select defaultValue={PermanentEvent} onChange={(e) => setIsPermanentEvent(e.target.value)}>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
                <div className="event-period">
                  <div className="permanent-event-title">
                    <label>From</label>
                    <input 
                      id="startTime"
                      type="date" 
                      value={startDate} 
                      required
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="permanent-event-title">
                    <label>Until </label>
                    <input 
                      id="startTime"
                      type="date" 
                      value={endDate} 
                      required
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            {error && <div className="time-input-error">{error}</div>}
            <div className="modal-button">
              <button onClick={handleClick} className="close-modal">
                Exit
              </button>
              <button type="submit" className="submit-modal">
                Add Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

