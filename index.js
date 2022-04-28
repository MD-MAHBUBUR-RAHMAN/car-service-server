const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// middleWare
app.use(cors());
app.use(express.json());

// MiddleWare for JsonToken:------
function verifyjwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorize access" });
  }
  const token = authHeader.split(" ")[1];
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      // console.log("decoded", decoded);
      req.decoded = decoded;
      next();
    });
  }

  // console.log("inside verify JWT", authHeader);
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uylt2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("carService").collection("service");
    //  Create Collection For Add Order Informaion:-----
    const orderCollection = client.db("carService").collection("order");

    // AUTH For web Token:---------
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    //// API: To Get All Data:------------------
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    //// API : GET :-- TO GET SINGLE OR UNIQUE DATA:-------------
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    // API : POST :-- To Add single data:-----
    app.post("/service", async (req, res) => {
      const newSevice = req.body;
      const result = await serviceCollection.insertOne(newSevice);
      res.send(result);
    });
    // API : DELET DATA SINGLE
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });

    // Order Collection API:===
    // Get Order --------- API :---
    app.get("/order", verifyjwt, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = orderCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });
    // Post Order:-------------API
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome My Car Service App Server");
});

app.listen(port, () => {
  console.log("listening car server port", port);
});
