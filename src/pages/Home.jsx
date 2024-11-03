import FullCalendar from "@fullcalendar/react";
import dayGrid from "@fullcalendar/daygrid";
import timeGrid from "@fullcalendar/timegrid";
import interaction from "@fullcalendar/interaction";
import { useState, useRef,useEffect } from "react";

export default function Home() {
  const calendarRef = useRef(null);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedDateInfo, setSelectedDateInfo] = useState(null); 
  const [events, setEvents] = useState([]);
  const [upcomingEvents,setUpcomingevents]=useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/get-events') 
      .then((response) => response.json())
      .then((data) => {
        const sortedEvents = data.sort((a, b) => new Date(a.start) - new Date(b.start));
        setEvents(sortedEvents);
        
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
      });
  }, []);
 
  useEffect(() => {
    const currentDate = new Date();
    const upcomingEvents = events.filter((event) => new Date(event.start) >= currentDate);
    setUpcomingevents(upcomingEvents)
  }, [events]);
  
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
    const newEvent = {
      id: new Date().getTime().toString(),
      title,
      start: selectedDateInfo.startStr,
      end: selectedDateInfo.endStr,
      allDay: selectedDateInfo.allDay,
    };
  
      calendarApi.addEvent(newEvent);

      fetch('http://localhost:4000/add-event',{
        method:'post',
        headers:{"Content-Type": "application/json"},
        body:JSON.stringify(newEvent)
     }).then(()=>{
        console.log('new event added');
        setEvents((prevEvents) => [...prevEvents, newEvent]);
        
     })

      setModal(false); 
      setTitle(''); 
    }
  };

  const handleEventRemove = (eventClick) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const eventId = eventClick.event.id;

      fetch(`http://localhost:4000/delete-event/${eventId}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify(eventClick.event)
      }).then(() => {
        console.log('Event deleted');
      }).catch(err => {
        console.error('Error deleting event:', err);
      });
      eventClick.event.remove();
  };
  
  }

  const handleEventDrop = (info) => {
   
    const updatedEvent = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      allDay: info.event.allDay,
    };

    fetch(`http://localhost:4000/update-event/${info.event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedEvent),
    })
      .then((response) => {
        if (response.ok) {
          console.log('Event updated successfully');
          
        } else {
          console.error('Failed to update event');
        }
      })
      .catch((error) => {
        console.error('Error updating event:', error);
      });
  };


  if (modal) {
    document.body.classList.add('active-modal');
  } else {
    document.body.classList.remove('active-modal');
  }

  return (
    <div className="home">
 
  <div className="home-container">
    <div className="all-events">
      <h2>upcoming Events</h2>
      {upcomingEvents.map((event) => (
        <div className="event-preview" key={event.id}>
          <div className="event-details">
            <h3>{event.title}</h3>
            <h4>{event.start}</h4>
          </div>
        </div>
      ))}
    </div>

    <div className="calendar-container">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGrid, timeGrid, interaction]}
        initialView="dayGridMonth"
        selectable={true}
        editable={true}
        eventDrop={handleEventDrop}
        select={handleDateSelect}
        eventClick={handleEventRemove}
        height={"90vh"}
        events={events}
      />
    </div>
  </div>

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
        <div className="modal-button">
          <button type="submit" className="submit-modal">
            Submit
          </button>
          <button className="close-modal" onClick={handleClick}>
            Close
          </button>
        </div>
      </form>
    </div>
  )}
</div>
  )
}
