require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schema + Model
const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number
});

const Product = mongoose.model("Product", productSchema);

// Home page (form)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "add.html"));
});

// GET all products
app.get("/products", (req, res) => {
  Product.find({})
    .then(products => res.json(products))
    .catch(err => res.status(500).json({ error: err.message }));
});

// GET product by ID
app.get("/products/:id", (req, res) => {
  Product.findOne({ id: req.params.id })
    .then(product => {
      if (!product) return res.json({ message: "Product not found" });
      res.json(product);
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// POST new product
app.post("/products", (req, res) => {
  const newProduct = new Product({
    id: Number(req.body.id),
    name: req.body.name,
    price: Number(req.body.price)
  });

  newProduct.save()
    .then(() => res.send("Product added successfully"))
    .catch(err => res.status(500).json({ error: err.message }));
});

// UPDATE product
app.put("/products/:id", (req, res) => {
  Product.findOneAndUpdate(
    { id: req.params.id },
    req.body,
    { new: true }
  )
    .then(product => {
      if (!product) return res.json({ message: "Product not found" });
      res.json(product);
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// DELETE product
app.delete("/products/:id", (req, res) => {
  Product.findOneAndDelete({ id: req.params.id })
    .then(product => {
      if (!product) return res.json({ message: "Product not found" });
      res.json({ message: "Product deleted successfully" });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

