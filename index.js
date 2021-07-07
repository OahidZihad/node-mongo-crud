const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const uri =
  "mongodb+srv://organicUser:valarmorgulis@cluster0.9wgmh.mongodb.net/organicdb?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

///database connection
client.connect((err) => {
  const productCollection = client.db("organicdb").collection("products");

  //load all products (READ)
  app.get("/products", (req, res) => {
    productCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //dynamic parameter diye load korsi(READ)
  app.get("/product/:id", (req, res) => {
    productCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  //add/create product (CREATE)
  app.post("/addProduct", (req, res) => {
    const product = req.body;
    productCollection.insertOne(product).then((result) => {
      console.log("one product added");
      res.redirect("/");
    });
  });

  // update product (UPDATE)
  app.patch("/update/:id", (req, res) => {
    console.log(req.body.price);
    productCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            name: req.body.name,
            quantity: req.body.quantity,
            price: req.body.price,
          },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });

  //delete product (DELETE)
  app.delete("/delete/:id", (req, res) => {
    productCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });
});

app.listen(3000);
