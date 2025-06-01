import  { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './UserNotes.css';
import VoiceAssistant from "./VoiceAssistant";

export default function UserNotes() {
  const { folderId } = useParams(); 
  const [folderName, setFolderName] = useState('');
  const [notes, setNotes] = useState([]);
  const [description, setDescription] = useState('');
  const [editIdx, setEditIdx] = useState(null); 
  const [editValue, setEditValue] = useState('');



  
  useEffect(() => {
    if (!folderId) return;
    fetch('http://localhost:4000/get-folders', { credentials: 'include' })
      .then(res => res.json())
      .then(folders => {
        if (Array.isArray(folders)) {
          const f = folders.find(f => f.folderId === folderId);
          setFolderName(f?.name || '');
        }
      })
      .catch(console.error);
  }, [folderId]);


  const loadNotes = () => {
    fetch(`http://localhost:4000/folders/${folderId}/notes`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotes(data);
        else setNotes([]);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (folderId) loadNotes();
  }, [folderId]);

 
  const handleSubmit = e => {
    e.preventDefault();
    const text = description.trim();
    if (!text) return;

    fetch(`http://localhost:4000/folders/addnote/${folderId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noteId: Date.now().toString(),
        description: text,
      }),
    })
      .then(res => {
        if (res.ok) {
          setDescription('');
          loadNotes();
        } else {
          console.error('Add note failed', res.status);
        }
      })
      .catch(console.error);
  };

  
  const handleDelete = noteId => {
    fetch(
      `http://localhost:4000/folders/${folderId}/notes/${noteId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    )
      .then(res => {
        if (res.ok) loadNotes();
        else console.error('Delete note failed', res.status);
      })
      .catch(console.error);
  };

  const moveUp = index => {
    if (index === 0) return;
    const copy = [...notes];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    setNotes(copy);
  };
  const moveDown = index => {
    if (index === notes.length - 1) return;
    const copy = [...notes];
    [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
    setNotes(copy);
  };

  useEffect(() => {
    if (!folderId || notes.length === 0) return;
    fetch(`http://localhost:4000/folders/${folderId}/notes`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notes),
    }).catch(console.error);
  }, [notes, folderId]);

 const handleEdit = idx => {
    setEditIdx(idx);
    setEditValue(notes[idx].description);
  };
  const handleEditSave = async idx => {
    const note = notes[idx];
    const newDesc = editValue.trim();
    if (!newDesc || newDesc === note.description) {
      setEditIdx(null);
      return;
    }
    const res = await fetch(`http://localhost:4000/folders/${folderId}/notes/${note.noteId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: newDesc }),
    });
    if (res.ok) {
      loadNotes();
      setEditIdx(null);
    } else {
      alert('Failed to update note');
    }
  };
  const handleEditCancel = () => {
    setEditIdx(null);
    setEditValue('');
  };

const handleAddNote = ( description ) => {
  if ( !description) {
    return console.error("Missing folderId or description");
  }

  const noteId = Date.now().toString(); 

  fetch(`http://localhost:4000/folders/addnote/${folderId}`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ noteId, description }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.error("Add note error:", data.error);
      } else {
        console.log('Note added via voice:', data.description);
        setNotes(prev => [...prev, { noteId, description: data.description }]);
      }
    })
    .catch(err => console.error("Error adding note:", err));
};

  
const handleDeleteNote = (description) => {
  if (!description) {
    return console.error(" Missing  description");
  }

  const note = notes.find(n =>
    n.description.toLowerCase().startsWith(description.toLowerCase())
  );
  console.log("Deleting note:", note);
  fetch(`http://localhost:4000/folders/${folderId}/notes/${note.noteId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.error("Delete note error:", data.error);
      } else {
        console.log('Note deleted via voice');
        setNotes(prev => prev.filter(n => n.noteId !== note.noteId));
      }
    })
    .catch(err => console.error("Error deleting note:", err));
};

  return (
    <div className="user-tasks">
      <VoiceAssistant onAddNote={handleAddNote} onDeleteNote={handleDeleteNote}/>
      <Link
        to="/notes"
        className="usernotes-back"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
          <path d="M15 2L5 11L15 20" stroke="#232a32" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{fontSize:16 }}>Back to folders</span>
      </Link>
      <h1 className="usernotes-title">
        {folderName || folderId}
      </h1>

      <div className="all-notes">
        {notes.length === 0 && (
          <p className="usernotes-empty">No notes yet—add one below!</p>
        )}
        {notes.map((note, idx) => (
          <div
            key={note.noteId}
            className="notes-preview"
          >
            <div className="usernote-move">
              <button onClick={() => moveUp(idx)} className="move-button">↑</button>
              <button onClick={() => moveDown(idx)} className="move-button">↓</button>
            </div>
            {editIdx === idx ? (
              <>
                <input
                  className="usernote-edit-input"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleEditSave(idx);
                    if (e.key === 'Escape') handleEditCancel();
                  }}
                  autoFocus
                />
                <button className="usernote-edit-save" onClick={() => handleEditSave(idx)} title="Save"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10.5L9 14.5L15 7.5" stroke="#00871b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                <button className="usernote-edit-cancel" onClick={handleEditCancel} title="Cancel"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 6L14 14M14 6L6 14" stroke="#c00" strokeWidth="2.2" strokeLinecap="round"/></svg></button>
              </>
            ) : (
              <>
                <span className="usernote-text">{note.description}</span>
                <button
                  onClick={() => handleEdit(idx)}
                  className="usernote-edit"
                  title="Edit note"
                >
                  
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 3.5L18.5 6.5M3 19L7.5 18.5L18 8L14 4L3.5 14.5L3 19Z" stroke="#ffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(note.noteId)}
                  className="usernote-delete"
                  title="Delete note"
                >
                 
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect className="check-rect" x="3" y="3" width="22" height="22" rx="4" stroke="#fff" strokeWidth="2.5" fill="none" />
                    <path className="checkmark" d="M9 14.5L13 18L19 10" stroke="#6ec1e4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}

          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="note-content"
      >
        <input
          type="text"
          placeholder="Add New Note"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <button type="submit">
          Add
        </button>
      </form>
    </div>
  );
}
