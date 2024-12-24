import { useState,useEffect } from "react";
import styled from 'styled-components';
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
      setTitle(!title);
      fetch(`http://localhost:4000/add-note/${storedUserId}`, {
        method:'post',
        headers:{"Content-Type": "application/json"},
        body:JSON.stringify(newNote)
      })
      .then((response) => response.json())
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

      const StyledWrapper = styled.div`
      button {
       width: 5em;
       height: 3em;
       border-radius: 30em;
       font-size: 15px;
       font-family: inherit;
       border: none;
       position: relative;
       overflow: hidden;
       z-index: 1;
       
      }
    
      button::before {
       content: '';
       width: 0;
       height: 3em;
       border-radius: 30em;
       position: absolute;
       top: 0;
       left: 0;
       background-image: linear-gradient(to right,rgba(15, 142, 216, 0.61) 0%,rgb(71, 172, 249) 100%);
       transition: .5s ease;
       display: block;
       z-index: -1;
      }
    
      button:hover::before {
       width: 9em;
      }`;

    return(
        <div className="user-tasks">
           <div className="all-notes">
       {notes.map((note) => (
        <div className="notes-preview" key={note.noteId}>
          <div className="note-details">
            <h4>{note.description}</h4>
            <StyledWrapper>
            <button  onClick={() => handleDelete(note.noteId)}> done!</button>
          </StyledWrapper>
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