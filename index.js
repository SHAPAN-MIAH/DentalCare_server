const express = require('express')
const MongoClient = require('mongodb').MongoClient;
// const ObjectID = require('mongodb').ObjectID;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()

const port = process.env.PORT || 4000

const app = express()
app.use(cors());
app.use(bodyParser.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zpujg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentsCollection = client.db("DoctorsPortal").collection("Appointments");
//   const ordersCollection = client.db("DoctorsPortal").collection("orders");

    //   app.get('/cars', (req, res) => {
    //     carsCollection.find()
    //     .toArray((err, cars) => {
    //       res.send(cars)
    //     })
    //   })
    //   app.get('/cars/:id', (req, res) => {
    //     const id = ObjectID(req.params.id);
    //     carsCollection.find(id)
    //     .toArray((err, cars) => {
    //       res.send(cars)
    //     })
    //   })

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


    //   app.post('/addOrder', (req, res) => {
    //     const order = req.body;
    //     ordersCollection.insertOne(order)
    //     .then(result => {
    //        res.send(result.insertedCount > 0)
    //     })
    //   })

    //   app.get('/order', (req, res) => {
    //     ordersCollection.find()
    //     .toArray((err, cars) => {
    //       res.send(cars)
    //     })
    //   })

    //   app.delete('/deleteCar/:id', (req, res)=> {
    //     const id = ObjectID(req.params.id);
    //     carsCollection.findOneAndDelete({_id: id})
    //     .then(result => {
    //       res.send(result.deletedCount > 0)
    //     })
    //   })

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
