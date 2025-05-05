import { useState, useEffect } from "react";

export default function UserNotes() {
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState(false);
  const storedUserId = localStorage.getItem("userId");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newNote = {
      noteId: new Date().getTime().toString(),
      description,
    };

    fetch(`http://localhost:4000/add-note/${storedUserId}`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newNote),
    })
      .then((response) => {
        if (response.ok) {
          response.json();
          setTitle(!title);
        }
      })
      .then((data) => {
        setTitle(!title);
      })
      .catch((error) => {
        console.error("Error fetching notes:", error);
      });
  };

  useEffect(() => {
    fetch(`http://localhost:4000/get-notes/${storedUserId}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        const sortedNotes = data;
        setNotes(sortedNotes);
        setDescription("");
      })
      .catch((error) => {
        console.error("Error fetching notes:", error);
      });
  }, [title]);

  const handleDelete = (noteId) => {
    fetch(`http://localhost:4000/delete-note/${storedUserId}/${noteId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          setTitle(!title);
        } else {
          console.error("Failed to update notes");
        }
      })
      .catch((error) => {
        console.error("Error updating notes:", error);
      });
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const updatedNotes = [...notes];
      [updatedNotes[index - 1], updatedNotes[index]] = [
        updatedNotes[index],
        updatedNotes[index - 1],
      ];
      setNotes(updatedNotes);
    }
   
  };

  const handleMoveDown = (index) => {
    if (index < notes.length - 1) {
      const updatedNotes = [...notes];
      [updatedNotes[index], updatedNotes[index + 1]] = [
        updatedNotes[index + 1],
        updatedNotes[index],
      ];
      setNotes(updatedNotes);
    }
    
  };
  const updateNotesOrder = (updatedNotes) =>{
    if(!updatedNotes) return;
    fetch(`http://localhost:4000/update-notes/${storedUserId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(updatedNotes),
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Failed to update notes order");
        }
      })
      .catch((error) => {
        console.error("Error updating notes order:", error);
      });
  };

  useEffect(() => {
    if(notes.length===0) return;
      updateNotesOrder(notes);
  }, [notes]);
  

  return (
    <div className="user-tasks">
      <h1>
        Notes <i className="fas fa-sticky-note"></i>
      </h1>
      <div className="all-notes">
        {notes.map((note, index) => (
          <div className="notes-preview" key={note.noteId}>
            <div>
              <button
                className="move-button"
                onClick={() => handleMoveUp(index)}
              >
                <i className="fas fa-arrow-up"></i>
              </button>
              <button
                className="move-button"
                onClick={() => handleMoveDown(index)}
              >
                <i className="fas fa-arrow-down"></i>
              </button>
              </div>
              <div className="note-details">
              <h4>{note.description}</h4>
              
              <button
                className="done-button"
                onClick={() => handleDelete(note.noteId)}
              >
              </button>
             
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
  );
}