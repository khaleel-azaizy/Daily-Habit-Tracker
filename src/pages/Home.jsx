import FullCalendar from "@fullcalendar/react";
import dayGrid from "@fullcalendar/daygrid";
import timeGrid from "@fullcalendar/timegrid";
import interaction from "@fullcalendar/interaction";
import { useState, useRef } from "react";

export default function Home() {
  const calendarRef = useRef(null);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedDateInfo, setSelectedDateInfo] = useState(null); 

  const handleClick = () => {
    setModal(!modal);
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedDateInfo(selectInfo); 
    setModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 

    const calendarApi = selectedDateInfo.view.calendar;
    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        id: `${selectedDateInfo.dateStr}-${title}`,
        title,
        start: selectedDateInfo.startStr,
        end: selectedDateInfo.endStr,
        allDay: selectedDateInfo.allDay,
      });
      setModal(false); 
      setTitle(''); 
    }
  };

  const handleEventRemove = (eventClick) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      eventClick.event.remove();
    }
  };

  
  if (modal) {
    document.body.classList.add('active-modal');
  } else {
    document.body.classList.remove('active-modal');
  }

  return (
    <div className="home">
      <h2>Welcome to Daily Habit</h2>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGrid, timeGrid,interaction]}
        initialView="dayGridMonth"
        selectable={true}
        select={handleDateSelect} 
        eventClick={handleEventRemove}
        height={'90vh'}
      />

      {modal && (
        <div className="modal">
          <div className="overlay"></div>
          <form className="modal-content" onSubmit={handleSubmit}>
            <h2>Enter Event Details</h2>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
            />
            <button type="submit" className="close-modal">Submit</button>
            <button className="close-modal" onClick={handleClick}>Close</button>
          </form>
        </div>
      )}
    </div>
  );
}
