const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors');
const admin = require("firebase-admin");
const bodyParser = require('body-parser');
require('dotenv').config()

const port = process.env.PORT || 4000

const serviceAccount = require('./firebaseKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express()
app.use(cors());
app.use(bodyParser.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zpujg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentsCollection = client.db("DoctorsPortal").collection("Appointments");
  const usersCollection = client.db("DoctorsPortal").collection("UserCollection");
  const reviewCollection = client.db("DoctorsPortal").collection("Reviews");


  app.post('/addAppointment', (req, res) => {
    const newAppointment = req.body;
    console.log('adding Appointment', newAppointment)
    appointmentsCollection.insertOne(newAppointment)
    .then(result => {
      console.log("data added successfully", result.insertedCount)
      res.send(result.insertedCount > 0)
    })
  })

  app.post('/appointmentsByDate', (req, res) => {
    const date = req.body;
    console.log('adding date', date.date)
    appointmentsCollection.find({date: date.date})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  app.get('/patients', (req, res) => {
    appointmentsCollection.find()
    .toArray((err, patients) => {
      res.send(patients)
    })
  })

  app.post('/AddUsers', async(req, res) => {
    const newUsers = req.body;
    await usersCollection.insertOne(newUsers)
    .then(result => {
      console.log("data added successfully", result.insertedCount)
      res.send(result.insertedCount > 0)
    })
  });

  app.put('/AddUsers', async(req, res) => {
    const user = req.body;
    const filter = {email: user.email};
    const options = {upsert: true};
    const updateDoc = {$set: user};
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.json(result); 
  })


  async function verifyToken(req, res, next){
    if(req.headers?.authorization?.startsWith('Bearer ')){
      const token = req.headers.authorization.split(' ')[1];

      try{
        const decodedUser = await admin.auth().verifyIdToken(token);
        req.decodedEmail = decodedUser.email;
      }
      catch{

      }
    }
    next()
  }

  app.put('/AddUsers/admin',  verifyToken, async(req, res) => {
    const user = req.body;
    const requester = req.decodedEmail;

    if(requester){
      const requesterAccount = await usersCollection.findOne({email: requester});

      if(requesterAccount.role === 'admin'){
        const filter = {email: user.email};
        const updateDoc = {$set: {role: 'admin'}};
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result)
      }
    }
    else{
      res.status(403).json({message: 'You do not have access to make admin'});
    }
    
  })

  app.get('/AddUsers/admin/:email', async(req, res) => {
    const email = req.params.email;
    const query = {email: email};
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if(user?.role === 'admin'){
      isAdmin = true;
    }
    res.json({admin: isAdmin});
  })

  app.post('/addReview', (req, res) => {
    const newReview = req.body;
    console.log('adding Appointment', newReview)
    reviewCollection.insertOne(newReview)
    .then(result => {
      console.log("data added successfully", result.insertedCount)
      res.send(result.insertedCount > 0)
    })
  })
  app.get('/review', (req, res) => {
    reviewCollection.find()
    .toArray((err, review) => {
      res.send(review)
    })
  })
    
  app.delete('/deleteAppointment/:id', (req, res)=> {
    const id = ObjectID(req.params.id);
    appointmentsCollection.findOneAndDelete({_id: id})
    .then(result => {
      res.send(result.deletedCount > 0)
    })
  })

  //   app.patch('/updateCar/:id', (req, res) => {
  //     const id = ObjectID(req.params.id);
  //     carsCollection.updateOne({_id: id},
  //     {
  //       $set: {name: req.body.name, model: req.body.model, price: req.body.price}
  //     })
  //     .then( result => {
  //       res.send(result.modifiedCount > 0)
  //     })

  //   })
  
});

app.get('/', (req, res) => {
  res.send('Hello Doctors')
})

app.listen(port)
