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
const appliedTrainerCollection = client.db('SmartPulse-Fitness-Tracker').collection('applyTrainers');
const trainerBookCollection = client.db('SmartPulse-Fitness-Tracker').collection('bookings');
const subscribersCollection = client.db('SmartPulse-Fitness-Tracker').collection('subscribers');
const postCollection = client.db('SmartPulse-Fitness-Tracker').collection('forum');


// user related api
app.get('/users', async (req, res) => {
   const result = await userCollection.find().toArray();
   res.send(result)
});

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
// make admin
app.patch('/users/admin/:id', async (req, res) => {
   const id = req.params.id;
   const filter = { _id: new ObjectId(id) };
   const updatedDoc = {
      $set: {
         role: 'admin'
      }
   }
   const result = await userCollection.updateOne(filter, updatedDoc);
   res.send(result);
});
// delete user
app.delete('/users/:id', async (req, res) => {
   const id = req.params.id;
   const query = { _id: new ObjectId(id) }
   const result = await userCollection.deleteOne(query);
   res.send(result);
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
app.post('/trainers', async (req, res) => {
   const trainer = req.body;
   const result = await trainerCollection.insertOne(trainer);
   res.send(result);
});
// post applied trainer
app.post('/applyTrainers', async (req, res) => {
   const trainer = req.body;
   const result = await appliedTrainerCollection.insertOne(trainer);
   res.send(result);
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
app.post('/bookings', async (req, res) => {
   const bookInfo = req.body;
   const result = await trainerBookCollection.insertOne(bookInfo);
   res.send(result);
});
// get subscriber info admin
app.get('/subscribers', async (req, res) => {
   const result = await subscribersCollection.find().toArray();
   res.send(result)
});
// post subscriber info
app.post('/subscribers', async (req, res) => {
   const subscriber = req.body;
   const result = await subscribersCollection.insertOne(subscriber);
   res.send(result)
});
app.get('/forum', async (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const perPage = 6;
   const totalPosts = postCollection.countDocuments();
   // console.log(totalPosts)
   const totalPages = Math.ceil(totalPosts / perPage);
   // console.log(totalPages)
   const posts = await postCollection.find().skip((page - 1) * perPage).limit(perPage).toArray();
   res.send({
      posts,
      currentPage: page,
      totalPages
   });
});
// patch forum voting no
app.patch('/forum/:id/vote', async (req, res) => {
   const id = req.params.id;
   const filter = { _id: new ObjectId(id) }
   const { type } = req.body;
   if (type === 'upvote') {
      await postCollection.updateOne(filter, { $inc: { upvotes: 1 } });
   } else if (type === 'downvote') {
      await postCollection.updateOne(filter, { $inc: { downvotes: 1 } });
   }
   const result = await postCollection.findOne(filter);
   res.send(result);
});


app.get('/', (req, res) => {
   res.send('Fitness-Tracker is running!!');
})


app.listen(port, () => {
   console.log(`Server is running on port ${port}`)
})