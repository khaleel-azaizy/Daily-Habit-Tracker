const express = require('express')
const { getDb, connectToDb } = require('./db')
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { ObjectId } = require('mongodb');
const e = require('express');
const auth = require('./auth');
const  OpenAI  = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ,organization:'org-Nrvvl1fbAFfASGmiNmOHyE89',project: 'proj_AvLOquTF2pdWCTewpbcv8nwa'});


const app = express()
app.use(express.json())
app.use(cookieParser());  
app.use(cors({origin: 'http://localhost:3000',credentials: true}));

let db

connectToDb((err) => {
  if(!err){
    app.listen('4000', () => {
      console.log('app listening on port 4000')
    })
    db = getDb()
  }
})
 
const JWT_SECRET = process.env.JWT_SECRET;

app.post('/login', (req, res) => {
  const User = req.body;
  db.collection('Users').findOne({ email: User.email })
  .then(doc =>{
    if(doc.email === User.email && bcrypt.compare(User.password,doc.password.toString())){   
      const id = doc._id.toString();

      const token = jwt.sign({ userId: id }, JWT_SECRET, {
        expiresIn: '1d',  
      });

     

      db.collection('UserTokens').updateOne({userId: new ObjectId(id)} , { $push: { tokens: token } })
      console.log(token);

        res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie('userid', id.toString(), {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

     
      res.status(200).send({userid:id})

    } else{
      
      res.status(500).json({error: 'email or password are incorrect'})
    }
  }) 
  .catch(err => {
    console.log(err);
    res.status(500).json({error: 'Could not fetch the document'})
  })
  
  });
   
  app.post('/register', (req, res) => {
    const User = req.body;
     
    db.collection('Users').findOne({ email: User.email })
    .then(doc =>{
      if(doc){   
        res.status(500).json(doc)
      } else{
        const saltRounds = 10;
        const hashedPassword =  bcrypt.hash(User.password, saltRounds);
        const newUser = ({
          email: User.email,
          name: User.name,
          password: hashedPassword,
        });
        db.collection('Users').insertOne(newUser);
        db.collection('UserTokens').insertOne({userId: newUser._id, tokens: []})
        res.json(200)
      }
    })
        
      });

    app.get('/refresh',auth, async (req, res) => {
      try {
        
        const { token } = req.cookies;
        
        if (!token) {
          return res.status(401).json({ error: 'No refresh token' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       
        db.collection('UserTokens').findOne({ userId: new ObjectId(decoded.userId )})
        .then(doc =>{
          if(!doc.tokens.includes(token)){
            res.status(401).json({ error: 'Invalid refresh token' });
          } else{
            res.status(200).json();
          }
        })
      } catch (error) {}
    });

     
    app.post('/add-event', auth, async (req, res) => {
      try {
        const { userid } = req.cookies;
        const eventData = req.body;
        console.log('Received event data:', eventData);

        for (let i = 0; i < eventData.length; i++) {
          await db.collection('Users').updateOne(
            { _id: new ObjectId(userid) },
            { $push: { events: { eventId: new ObjectId(), ...eventData[i] } } }
          );
        }

        res.status(200).send({ message: 'Event added successfully' });
      } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).send({ error: 'Failed to add event' });
      }
    });

    app.get('/get-one-time-events', auth, async (req, res) => {
      try {
        const { userid } = req.cookies;
        if (!userid) {
          return res.status(400).json({ error: 'User ID not found in cookies' });
        }
        const user = await db.collection('Users').findOne({ _id: new ObjectId(userid) });
        if (user && user.events) {
          const oneTimeEvents = user.events.filter(event => event.isPermanent === false);
          res.status(200).json(oneTimeEvents);
        } else {
          res.status(404).json({ error: 'User or events not found' });
        }
      } catch (error) {
        console.error('Error fetching one-time events:', error);
        res.status(500).json({ error: 'Failed to fetch one-time events' });
      }
    });
  
    app.get('/get-events', auth, async (req, res) => {
      try {
        const { userid } = req.cookies;
        if (!userid) {
          return res.status(400).json({ error: 'User ID not found in cookies' });
        }
        const user = await db.collection('Users').findOne({ _id: new ObjectId(userid) });
        res.status(200).json(user.events);
      } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

    app.delete('/delete-event/:id', auth, async (req, res) => {
      try {
        const { userid } = req.cookies;
        const eventId = req.params.id;

        if (!userid) {
          return res.status(400).json({ error: 'User ID not found in cookies' });
        }

        const result = await db.collection('Users').updateOne(
          { _id: new ObjectId(userid) },
          { $pull: { events: { id: eventId } } }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).send({ error: 'Event not found' });
        }

        res.status(200).send({ message: 'Event deleted successfully' });
      } catch (err) {
        res.status(500).send({ error: 'Failed to delete event', details: err });
      }
    });

    app.put('/update-event/:id', auth, async (req, res) => {
      try {
        const eventId = req.params.id;
        const { userid } = req.cookies;
        const updatedData = req.body;

        console.log('Received updated data:', updatedData);
        if (!updatedData.date) {
          return res.status(400).send({ error: 'Missing required fields' });
        }

        const result = await db.collection('Users').updateOne(
          { _id: new ObjectId(userid), "events.id": eventId },
          {
            $set: {
              "events.$.date": updatedData.date,
            }
          }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).send({ error: 'Event not found' });
        }

        res.status(200).send({ message: 'Event updated successfully' });
      } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).send({ error: 'Failed to update event', details: error.message });
      }
    });

    

app.get('/get-folders', auth, async (req, res) => {
  try {
    const { userid } = req.cookies;
    if (!userid) return res.status(400).json({ error: 'User not authenticated' });

    const user = await db
      .collection('Users')
      .findOne(
        { _id: new ObjectId(userid) },
        { projection: { folders: 1 } }
      );

    res.json(Array.isArray(user?.folders) ? user.folders : []);
  } catch (err) {
    console.error('Error fetching folders:', err);
    res.status(500).json({ error: 'Could not fetch folders' });
  }
});


app.post('/add-folder', auth, async (req, res) => {
  try {
    const { userid } = req.cookies;
    const { name } = req.body;
    if (!userid) return res.status(400).json({ error: 'User not authenticated' });
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const newFolder = {
      folderId: new ObjectId().toString(),
      name: name.trim(),
      createdAt: new Date(),
      notes: []           
    };

    await db.collection('Users').updateOne(
      { _id: new ObjectId(userid) },
      { $push: { folders: newFolder } }
    );

    res.status(201).json(newFolder);
  } catch (err) {
    console.error('Error creating folder:', err);
    res.status(500).json({ error: 'Could not create folder' });
  }
});

app.delete('/folders/:folderId', auth, async (req, res) => {
  try {
    const { userid } = req.cookies;
    const { folderId } = req.params;
    if (!userid) return res.status(400).json({ error: 'User not authenticated' });

    const result = await db.collection('Users').updateOne(
      { _id: new ObjectId(userid) },
      { $pull: { folders: { folderId } } }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting folder:', err);
    res.status(500).json({ error: 'Could not delete folder' });
  }
});



app.get('/folders/:folderId/notes', auth, async (req, res) => {
  try {
    const { userid } = req.cookies;
    const { folderId } = req.params;
    if (!userid) return res.status(400).json({ error: 'User not authenticated' });

    const user = await db
      .collection('Users')
      .findOne(
        { _id: new ObjectId(userid), 'folders.folderId': folderId },
        { projection: { 'folders.$': 1 } }
      );

    const notes = user?.folders?.[0]?.notes;
    res.json(Array.isArray(notes) ? notes : []);
  } catch (err) {
    console.error('Error fetching notes for folder:', err);
    res.status(500).json({ error: 'Could not fetch notes' });
  }
});

app.post('/folders/addnote/:folderId', auth, async (req, res) => {
  try {
  const { userid } = req.cookies;
  const { folderId } = req.params;
  const { noteId, description } = req.body;
  if (!userid) return res.status(400).json({ error: 'User not authenticated' });
  if (!noteId || !description) {
    return res.status(400).json({ error: 'noteId and description required' });
  }

  const newNote = {
    noteId,
    description,
    createdAt: new Date(),
  };

  await db.collection('Users').updateOne(
    { _id: new ObjectId(userid), 'folders.folderId': folderId },
    { $push: { 'folders.$.notes': newNote } }
  );

  res.status(201).json(newNote);
  } catch (err) {
    console.error('Error adding note to folder:', err);
    res.status(500).json({ error: 'Could not add note' });
  }
});

app.delete('/folders/:folderId/notes/:noteId', auth, async (req, res) => {
  try {
    const { userid } = req.cookies;
    const { folderId, noteId } = req.params;
    if (!userid) return res.status(400).json({ error: 'User not authenticated' });

    const result = await db.collection('Users').updateOne(
      { _id: new ObjectId(userid), 'folders.folderId': folderId },
      { $pull: { 'folders.$.notes': { noteId } } }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Note or folder not found' });
    }

    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: 'Could not delete note' });
  }
});

app.put('/folders/:folderId/notes', auth, async (req, res) => {
  try {
    const { userid } = req.cookies;
    const { folderId } = req.params;
    const updatedNotes = req.body;
    console.log('PUT /folders/:folderId/notes', { userid, folderId, updatedNotes });
    if (!userid) return res.status(401).json({ error: 'Not authenticated' });
    if (!Array.isArray(updatedNotes)) return res.status(400).json({ error: 'Invalid notes data' });

    const user = await db.collection('Users').findOne({ _id: new ObjectId(userid), 'folders.folderId': folderId.toString() });
    if (!user) {
      console.error('Folder not found for user', { userid, folderId });
      return res.status(404).json({ error: 'Folder not found for user' });
    }

    const result = await db.collection('Users').updateOne(
      { _id: new ObjectId(userid), 'folders.folderId': folderId.toString() },
      { $set: { 'folders.$.notes': updatedNotes } }
    );
    res.json({ message: 'Notes reordered' });
  } catch (err) {
    console.error('Error updating notes order:', err);
    res.status(500).json({ error: 'Could not update notes' });
  }
});


app.put('/folders/:folderId/notes/:noteId', auth, async (req, res) => {
  try {
    const { userid } = req.cookies;
    const { folderId, noteId } = req.params;
    const { description } = req.body;
    if (!userid) return res.status(400).json({ error: 'User not authenticated' });
    if (!description) return res.status(400).json({ error: 'Description required' });

    const result = await db.collection('Users').updateOne(
      { _id: new ObjectId(userid), 'folders.folderId': folderId, 'folders.notes.noteId': noteId },
      { $set: { 'folders.$[folder].notes.$[note].description': description } },
      { arrayFilters: [{ 'folder.folderId': folderId }, { 'note.noteId': noteId }] }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Note or folder not found' });
    }
    res.json({ message: 'Note updated' });
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: 'Could not update note' });
  }
});

    app.post('/logout', async (req, res) => {
      const { token } = req.cookies;
      if (!token) {
        return res.status(401).json({ error: 'No refresh token' });
      }
      const decoded = jwt.verify(token, JWT_SECRET);

       db.collection('UserTokens').updateOne(
        { 
          userId: new ObjectId(decoded.userId) },
        { $pull: { tokens: token } }
      )
      .then(() => {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
      })
      .catch((err) => {
        console.error('Logout error:', err);
        res.status(500).json({ error: 'Failed to logout' });
      });
   
  });
 

  app.post('/api/parse-command', async (req, res) => {
  const { transcript } = req.body;

    const prompt = `
    You are an assistant that extracts structured JSON commands from user input for a calendar and notes application.
    Supported intents:
      - "add_event": Add a new event. Required fields: "title", "date", "startTime", "endTime", "isPermanent" (boolean). If "isPermanent" is true, include "every" ("week"|"month"|"year") and "period" ("startDate/endDate").
      - "delete_event": Delete an event. Required field: "title" and "date".
      - "add_folder": Add a new folder. Required field: "name".
      - "delete_folder": Delete a folder. Required field: "name".
      - "add_note": Add a note to a folder. Required fields: "folderName", "description".
      - "delete_note": Delete a note from a folder. Required fields: "folderName", "description" or "noteId".
      - "go_to_notes": Navigate to notes section.
      - "go_to_home": Navigate to home section.
      - "unkown": The Request is not valid.

    Return the result as a single JSON object. Example formats:
    {
      "intent": "add_event",
      "title": "Math exam",
      "date": "2025-06-10",
      "startTime": "10:00",
      "endTime": "12:00",
      "isPermanent": false
    }
    {
      "intent": "add_event",
      "title": "Math exam",
      "date": "2025-06-10",
      "startTime": "10:00",
      "endTime": "12:00",
      "isPermanent": true,
      "every": "week",
      "period": "2025-06-10/2025-07-10"
    }
    {
      "intent": "add_folder",
      "name": "Physics Notes"
    }
    {
      "intent": "add_note",
      "folderName": "Physics Notes",
      "description": "Newton's laws summary"
    }
    `;

  try {
   const completion = await openai.chat.completions.create({
   model: "gpt-4",
   messages: [
    {
      role: "system",
      content: prompt,
    },
    {
      role: "user",
      content:transcript,
    },
  ],
  }); 
  const raw = completion.choices[0].message.content;
  const data = JSON.parse(raw); 
    console.log("Parsed:", data);
    res.json(data);
    } catch (error) {
      console.error("AI parse error:", error); 
      res.status(500).json({ error: 'Failed to parse command' });
    }
  });