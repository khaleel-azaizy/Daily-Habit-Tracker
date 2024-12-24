const express = require('express')
const { getDb, connectToDb } = require('./db')
const cors = require('cors');
const { ObjectId } = require('mongodb')


// init app & middleware
const app = express()
app.use(express.json())
app.use(cors());
// db connection
let db

connectToDb((err) => {
  if(!err){
    app.listen('4000', () => {
      console.log('app listening on port 4000')
    })
    db = getDb()
  }
})

// routes

app.post('/login', (req, res) => {
  const User = req.body;
  
  db.collection('Users').findOne(User)
  .then(doc =>{
    if(User.email===doc.email&&User.password===doc.password){   
      const id = doc._id.toString();
      console.log(id)
      res.status(200).send({userid:id})
    } else{
      res.status(500).json({error: 'email or password are incorrect'})
    }
  }) 
  .catch(err => {
    res.status(500).json({error: 'Could not fetch the document'})
  })
  
  });
   
  app.post('/register', (req, res) => {
    const User = req.body;
     
    db.collection('Users').findOne(User)
    .then(doc =>{
      if(doc){   
        res.status(500).json(doc)
      } else{
        db.collection('Users').insertOne(User)
        res.json(200)
      }
     })
     .catch(err => {
      res.status(500).json({error: 'Could not fetch the document'})
    })

    });

    
    app.post('/add-event/:userId', async (req, res) => {
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

    
  
    app.get('/get-events/:userid', async (req, res) => {
      try {
        const userId = req.params.userid;
        const user = await db.collection('Users').findOne( { _id: new ObjectId(userId)  });
        res.status(200).json(user.events); 
      } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

    app.delete('/delete-event/:userid/:id', (req, res) => {
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

    app.put('/update-event/:userid/:id', async (req, res) => {
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

    app.get('/get-notes/:userid', async (req, res) => {
      try {
        const userId = req.params.userid;
        const user = await db.collection('Users').findOne( { _id: new ObjectId(userId)  });
        res.status(200).json(user.notes); 
      } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
      }
    });

    app.post('/add-note/:userId', async (req, res) => {
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
    app.delete('/delete-note/:userid/:noteid', async (req, res) => {
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