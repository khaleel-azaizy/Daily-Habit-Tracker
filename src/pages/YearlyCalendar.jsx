import Calendar from "./Calendar";

const YearlyCalendar = ({year,events,addNewEvent,deleteEvent,handleEventDrop }) => {
    
const FullYear = [];
for(let i = 0; i < 12; i++){
  FullYear.push(i);
}
const monthName = ['January','February','March','April','May','June','July','August','September','October','November','December'];


  return (
    <div className="yearly-calendar">
     {FullYear.map((month) => (
        <div className="yearly-calendar-header">
        <h2>{monthName[month]}</h2>
       <Calendar key={month} year={year} month={month} events={events} addNewEvent={addNewEvent} deleteEvent={deleteEvent} handleEventDrop={handleEventDrop}/>
     </div>
     ))}
    </div>
  );
}

export default YearlyCalendar;