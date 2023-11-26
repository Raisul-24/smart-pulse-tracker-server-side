require('dotenv').config();
const express = require('express');

const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken');

// This is your test secret API key.
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express()

const port = process.env.PORT || 5013

// middleware
app.use(cors());
app.use(express.json());


// // middleware
// const verifyToken = (req, res, next) => {
//    console.log('inside verify token', req.headers);
//    if (!req.headers.authorization) {
//       return res.status(401).send({ message: 'forbidden access' })
//    }
//    const token = req.headers.authorization.split(' ')[1];
//    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//       if (err) {
//          return res.status(401).send({ message: 'forbidden access' })
//       }
//       req.decoded = decoded;
//       next();
//    })

// }


// use verify admin after verifyToken
// const verifyAdmin = async (req, res, next) => {
//    const email = req.decoded.email;
//    const query = { email: email };
//    const user = await userCollection.findOne(query);
//    const isAdmin = user?.role === 'admin';
//    if (!isAdmin) {
//       return res.status(403).send({ message: 'forbidden access' });
//    }
//    next();
// }



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sxdrhxr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   }
});
const dbConnect = async () => {
   try {
      // client.connect()
      console.log('DB Connected Successfully✅')
   } catch (error) {
      console.log(error.name, error.message)
   }
}
dbConnect()

const userCollection = client.db('SmartPulse-Fitness-Tracker').collection('users');
const featureCollection = client.db('SmartPulse-Fitness-Tracker').collection('features');
const trainerCollection = client.db('SmartPulse-Fitness-Tracker').collection('trainers');
const trainerBookCollection = client.db('SmartPulse-Fitness-Tracker').collection('bookings');


app.post('/users', async (req, res) => {
   const user = req.body;
   // insert email if user doesn't exists.
   console.log(user);
   const query = { email: user.email }
   const existingUser = await userCollection.findOne(query);
   if (existingUser) {
      return res.send({ message: 'user already exists', insertedId: null })
   }

   const result = await userCollection.insertOne(user);
   res.send(result)
});
// get features
app.get('/features', async (req, res) => {
   const result = await featureCollection.find().toArray();
   res.send(result);
});
// get trainer
app.get('/trainers', async (req, res) => {
   const result = await trainerCollection.find().toArray();
   res.send(result);
});
// post trainer
app.post('/trainers', async (req, res) =>{
   const trainer = req.body;
   const result = await trainerCollection.insertOne(trainer);
   res.send(result)
});
// specific trainer
app.get('/trainers/:id', async (req, res) => {
   const id = req.params.id;
   // console.log(id)
   const query = { _id: new ObjectId(id) }
   const result = await trainerCollection.findOne(query);
   res.send(result);
});
// user book trainer
app.post('/bookings', async (req, res) =>{
   const bookInfo = req.body;
   const result = await trainerBookCollection.insertOne(bookInfo);
   res.send(result);
})


app.get('/', (req, res) => {
   res.send('Fitness-Tracker is running!!');
})


app.listen(port, () => {
   console.log(`Server is running on port ${port}`)
})