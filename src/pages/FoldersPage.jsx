import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import './FoldersPage.css';
import VoiceAssistant from "./VoiceAssistant";

export default function FoldersPage() {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");

 
  useEffect(() => {
    fetch("http://localhost:4000/get-folders", { credentials: "include" })
      .then(r => r.json())
      .then(data => setFolders(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const createFolder = async e => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const res = await fetch("http://localhost:4000/add-folder", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim() }),
    });
    if (res.ok) {
      const f = await res.json();
      setFolders(fs => [f, ...fs]);
      setNewFolderName("");
    }
  };

  const deleteFolder = async id => {
    if (!window.confirm("Delete this folder?")) return;
    const res = await fetch(`http://localhost:4000/folders/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setFolders(fs => fs.filter(f => f.folderId !== id));
  };

  
  const [folderNotes, setFolderNotes] = useState({});
  useEffect(() => {
    
    folders.forEach(f => {
      fetch(`http://localhost:4000/folders/${f.folderId}/notes`, { credentials: 'include' })
        .then(res => res.json())
        .then(notes => setFolderNotes(prev => ({ ...prev, [f.folderId]: Array.isArray(notes) ? notes : [] })))
        .catch(() => setFolderNotes(prev => ({ ...prev, [f.folderId]: [] })));
    });
  }, [folders]);

  const [deleteAnim, setDeleteAnim] = useState({});

  const handleAddFolder = ( folderName ) => {
  if (!folderName) return console.error("Missing folder name");

  fetch('http://localhost:4000/add-folder', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify({ name: folderName }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.error("Add folder error:", data.error);
      
      } else {
        console.log('Folder added via voice:', data.name);
          setFolders(fs => [data, ...fs]);
      }
    })
    .catch(err => console.error("Error adding folder:", err));
};

const handleDeleteFolder = ( folderName ) => {
  if (!folderName) return console.error("Missing folder ID");
  const folderId = folders.find(f => f.name === folderName)?.folderId;
  console.log("Deleting folder with ID:", folderId);
  fetch(`http://localhost:4000/folders/${folderId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
    .then(res => {
      if (res.status === 204) {
        console.log('Folder deleted via voice');
        setFolders(fs => fs.filter(f => f.folderId !== folderId))
      } else {
        console.error('Failed to delete folder');
      }
    })
    .catch(err => console.error("Error deleting folder:", err));
};


  return (
    <div className="folders-root">
      <VoiceAssistant onAddFolder={handleAddFolder} onDeleteFolder={handleDeleteFolder} />
      <h1 className="folders-title">Notes Collection</h1>
      <form onSubmit={createFolder} className="folders-form-modern">
        <input
          value={newFolderName}
          onChange={e => setNewFolderName(e.target.value)}
          placeholder="Create a new folder..."
          className="folders-form-modern-input"
        />
        <button className="folders-form-modern-btn" aria-label="Add folder" type="submit">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" >
            <circle cx="11" cy="11" r="10" stroke="#232a32" strokeWidth="2" fill="#fff"/>
            <path d="M11 7V15" stroke="#232a32" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 11H15" stroke="#232a32" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </form>

      <div className="folders-grid">
        {folders.map(f => (
          <div
            key={f.folderId}
            className="folder-card"
          >
            <Link
              to={`/folders/${f.folderId}`}
              className="folder-link"
            >
             
              <div className="folder-name">{f.name}</div>
            </Link>
            <div className="folder-notes-preview">
              {(folderNotes[f.folderId] && folderNotes[f.folderId].length > 0) ? (
                folderNotes[f.folderId].slice(0, 4).map(note => (
                  <div key={note.noteId} className="folder-note-preview">
                    <span className="folder-note-text">{note.description}</span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        fetch(`http://localhost:4000/folders/${f.folderId}/notes/${note.noteId}`, {
                          method: 'DELETE',
                          credentials: 'include',
                        }).then(res => {
                          if (res.ok) setFolderNotes(prev => ({
                            ...prev,
                            [f.folderId]: prev[f.folderId].filter(n => n.noteId !== note.noteId)
                          }));
                        });
                      }}
                      className="folder-note-delete"
                      title="Delete note"
                    >
                     
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect className="check-rect" x="3" y="3" width="22" height="22" rx="4" stroke="#fff" strokeWidth="2.5" fill="none" />
                        <path className="checkmark" d="M7.5 15L12.5 20L20.5 8" stroke="#0000" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="folder-no-notes">No notes</div>
              )}
            </div>
            
            <button
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                setDeleteAnim(anim => ({ ...anim, [f.folderId]: true }));
                setTimeout(() => setDeleteAnim(anim => ({ ...anim, [f.folderId]: false })), 350);
                setTimeout(() => deleteFolder(f.folderId), 200);
              }}
              className={`folder-delete-btn`}
              title="Delete folder"
            >
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
              <path d="M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M17,15.59L15.59,17L12,13.41L8.41,17L7,15.59 L10.59,12L7,8.41L8.41,7L12,10.59L15.59,7L17,8.41L13.41,12L17,15.59z"></path>
          </svg>           
           </button>
          </div>
        ))}
      </div>
    </div>
  );
}
