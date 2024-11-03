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
  
  console.log('Received login request with:',  User); 

  db.collection('Users').findOne(User)
  .then(doc =>{
    if(User.email===doc.email&&User.password===doc.password){   
     console.log('ok'); 
      res.status(200).json(doc)
    } else{
    res.json(500)
    }
  }) 
  .catch(err => {
    res.status(500).json({error: 'Could not fetch the document'})
  })
  
  });
   
  app.post('/register', (req, res) => {
    const User = req.body;
    
    console.log('Received login request with:',  User); 
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
     
    app.post('/add-event',(req,res) =>{
      const Event = req.body;
      console.log('Received event request with:',  Event); 
      db.collection('UserEvents').insertOne(Event)
      .then(doc =>{
        if(doc){   
          res.status(200).json(doc)
        } else{
          res.json(500)
        }
       })
       .catch(err => {
        res.status(500).json({error: 'Could not fetch the document'})
      })


    })
  
    app.get('/get-events', async (req, res) => {
      try {
       
        const events = await db.collection('UserEvents').find().toArray(); 
        
        res.status(200).json(events); 
      } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
      }
    });

    app.delete('/delete-event/:id', (req, res) => {
      const event = req.body;
      const eventId = req.params.id;
      console.log('Received delete event request with:',  event); 
      db.collection('UserEvents').deleteOne({ id: eventId })
        .then(() => {
          res.status(200).send({ message: 'Event deleted successfully' });
        })
        .catch((err) => {
          res.status(500).send({ error: 'Failed to delete event', details: err });
        });
    });

    app.put('/update-event/:id', async (req, res) => {
      try {
        const eventId = req.params.id;
        const updatedData = req.body;
        
        console.log('Received updated data:',updatedData)
        if (!updatedData.title || !updatedData.start) {
          return res.status(400).send({ error: 'Missing required fields' });
        }
        
        const result = await db.collection('UserEvents').updateOne(
          { id: eventId },
          {
            $set: {
              title: updatedData.title,
              start: updatedData.start,
              end: updatedData.end,
              allDay: updatedData.allDay,
            },
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