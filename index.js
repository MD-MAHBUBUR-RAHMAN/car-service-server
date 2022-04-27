const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const res = require("express/lib/response");
require("dotenv").config();

// middleWare
app.use(cors());
app.use(express.json());

// XiDsIQV1XNe4WxRT

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

    //// API: To Get All Data:------------------
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    //// API : TO GET SINGLE OR UNIQUE DATA:-------------
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    // API : To Add single data:-----
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
