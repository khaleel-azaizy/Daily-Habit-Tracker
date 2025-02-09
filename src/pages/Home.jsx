import { useState,useEffect } from "react";
import Calendar from "./Calendar";
export default function Home() {
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  
  const [events, setEvents] = useState([]);
  const [upcomingEvents,setUpcomingevents]=useState([]);
  const storedUserId = localStorage.getItem('userId');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentDay, setCurrentDay] = useState(new Date().getDate());
  const [day, setDay] = useState({});
  useEffect(() => {
    
    fetch(`http://localhost:4000/get-events/${storedUserId}`,{credentials:'include'}) 
      .then((response) => response.json()||null)
      .then((data) => {
        const sortedEvents = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(sortedEvents);
        
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
      });
  }, [modal]);
  


  const fetchEvents =() => {
    fetch(`http://localhost:4000/get-events/${storedUserId}`,{credentials:'include'}) 
      .then((response) => response.json())
      .then((data) => {
        const sortedEvents = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(sortedEvents);
        
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
      });
  };
 
  useEffect(() => {
    const currentDate = new Date();
    const upcomingEvents = events.filter((event) => new Date(event.date) >= currentDate);
    setUpcomingevents(upcomingEvents)
  }, [events]);
  
  const handleClick = () => {
    setModal(false);
    setTitle('');
  };


  const handleEventRemove = (date,id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
     
      fetch(`http://localhost:4000/delete-event/${storedUserId}/${id}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        
      }).then(() => {
        console.log('Event deleted');
        setEvents((prevEvents) => prevEvents.filter(event => event.id !== id));

      }).catch(err => {
        console.error('Error deleting event:', err);
      });
      
    
  };
  
  }
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
  }

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
    setModal(false); 
    
    const newEvent = {
      id: new Date(day.year,day.month,day.date).getTime().toString()+ title,
      title,
      date: formatDate(new Date(day.year,day.month, currentDay)),
    };
    fetch(`http://localhost:4000/add-event/${storedUserId}`,{
      method:'post',
      headers:{"Content-Type": "application/json"},
      credentials:'include' ,
      body:JSON.stringify(newEvent)
   }).then((response)=>{
    if(response.ok){
      setTitle(''); 
      fetchEvents();
    }
    
   })

   
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
            <h4>{event.date}</h4>
          </div>
        </div>
      ))}
    </div>

    <div className="calendar-container">
    <div className="calendar-header">
    <button onClick={goToPreviousMonth}>Prev</button>
    <button onClick={goToNextMonth}>Next</button>
    <h2>{monthName} {currentYear}</h2>
    <button onClick={gotToThisDay}>Today</button>
    </div>
   
    <div  className="my-calendar">
    <span className="days">Sun</span>
    <span className="days">Mon</span>
    <span className="days">Tue</span>
    <span className="days">Wed</span>
    <span className="days">Thu</span>
    <span className="days">Fri</span>
    <span className="days">Sat</span>
 
    </div>

    
    <Calendar year={currentYear} month={currentMonth} events={events} addNewEvent={handleNewDateSelect} deleteEvent={handleEventRemove} handleEventDrop={handleEventDrop}/>

      
    </div>
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

        <div className="modal-button">
          <button  onClick={handleClick} className="close-modal">
            Close
          </button>
          <button type="submit" className="submit-modal">
            Submit
          </button>
        </div>
      </form>
    </div>
  )}
 
</div>
  )
}

