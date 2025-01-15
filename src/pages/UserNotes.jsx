import { useState,useEffect } from "react";
export default function UserNotes(){

    const [description, setDescription] = useState('');
    const [notes, setNotes]=useState([]);
    const [title, setTitle] = useState(false);
    const storedUserId = localStorage.getItem('userId');
    const handleSubmit = (e) => {
      e.preventDefault(); 
      const newNote = {
        noteId: new Date().getTime().toString(), 
        description
      };
     
      fetch(`http://localhost:4000/add-note/${storedUserId}`, {
        method:'post',
        headers:{"Content-Type": "application/json"},
        body:JSON.stringify(newNote)
      })
      .then((response) =>{ 
        if(response.ok){
        response.json();
        setTitle(!title);
        }
      })
      .then((data) => {
        const sortedNotes = data.sort();
        setNotes(sortedNotes);
       
      })
      .catch((error) => {
        console.error('Error fetching notes:', error);
      });
    }
    
    const handleDelete = (noteId) => {
      fetch(`http://localhost:4000/delete-note/${storedUserId}/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        
      })
        .then((response) => {
          if (response.ok) {
            console.log('notes updated successfully');
            setTitle(!title);
            
          } else {
            console.error('Failed to update notes');
          }
        })
        .catch((error) => {
          console.error('Error updating notes:', error);
        });
    }

     useEffect(() => {
        
        fetch(`http://localhost:4000/get-notes/${storedUserId}`) 
          .then((response) => response.json())
          .then((data) => {
            const sortedNotes = data.sort();
            setNotes(sortedNotes);
            setDescription('');
          })
          .catch((error) => {
            console.error('Error fetching notes:', error);
          });
      }, [title]);

    
    return(
        <div className="user-tasks">
           <div className="all-notes">
       {notes.map((note) => (
        <div className="notes-preview" key={note.noteId}>
          <div className="note-details">
            <h4>{note.description}</h4>
           
            <button className="done-button"  onClick={() => handleDelete(note.noteId)}></button>
          
          </div>
        </div>
      ))}
    </div>



       
      <form className="note-content" onSubmit={handleSubmit}>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add New Note"
        />
          <button type="submit" className="add-note">
            Add
          </button>
      </form>

        </div>
    )
    }