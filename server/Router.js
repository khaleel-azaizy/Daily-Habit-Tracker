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

    app.post('/add-event/:userId',auth,async (req, res) => {
      try {
        
        const userId = req.params.userId;
        const eventData = req.body;
       
        await db.collection('Users').updateOne(
          { _id: new ObjectId(userId) },
          { $push: { events: { eventId: new ObjectId(), ...eventData } } }
        );
    
        res.status(200).send({ message: 'Event added successfully' });
      } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).send({ error: 'Failed to add event' });
      }
    });

    
  
    app.get('/get-events/:userid',auth, async (req, res) => {
      try {
        const userId = req.params.userid;
        const user = await db.collection('Users').findOne( { _id: new ObjectId(userId)  });
        res.status(200).json(user.events); 
      } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

    app.delete('/delete-event/:userid/:id',auth, (req, res) => {
      const event = req.body;
      const userId = req.params.userid;
      const eventId = req.params.id;
      console.log('Received delete event request with:',  event); 
      db.collection('Users').updateOne({ _id: new ObjectId(userId) },
       { $pull: { events: { id: eventId } } })
        .then(() => {
          res.status(200).send({ message: 'Event deleted successfully' });
        })
        .catch((err) => {
          res.status(500).send({ error: 'Failed to delete event', details: err });
        });
    });

    app.put('/update-event/:userid/:id',auth, async (req, res) => {
      try {
        const eventId = req.params.id;
        const userId = req.params.userid;
        const updatedData = req.body;
        
        console.log('Received updated data:',updatedData)
        if (!updatedData.title || !updatedData.start) {
          return res.status(400).send({ error: 'Missing required fields' });
        }
        
        const result = await db.collection('Users').updateOne(
          { _id: new ObjectId(userId), "events.id": eventId },
          { 
            $set: {
              "events.$.title": updatedData.title,
              "events.$.start": updatedData.start,
              "events.$.end": updatedData.end,
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

    app.get('/get-notes/:userid',auth, async (req, res) => {
      try {
        const userId = req.params.userid;
        const user = await db.collection('Users').findOne( { _id: new ObjectId(userId)  });
        res.status(200).json(user.notes); 
      } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
      }
    });

    app.post('/add-note/:userId',auth, async (req, res) => {
      try {
        const userId = req.params.userId;
        const noteData = req.body; 
        await db.collection('Users').updateOne(
          { _id: new ObjectId(userId) },
          { $push: { notes: { noteId: noteData.noteId, description: noteData.description } } }
        );
    
        res.status(200).send({ message: 'note added successfully' });
      } catch (error) {
        console.error('Error adding notes:', error);
        res.status(500).send({ error: 'Failed to add notes' });
      }
    });
    app.delete('/delete-note/:userid/:noteid',auth, async (req, res) => {
      try {
        const userId = req.params.userid;
        const noteId = req.params.noteid;
        
        console.log('Received updated data:',noteId)
      
        const result = await db.collection('Users').updateOne(
          { _id: new ObjectId(userId)},
          { 
            $pull: {
            notes: {noteId: noteId}
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
 