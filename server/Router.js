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

    });
     
  

