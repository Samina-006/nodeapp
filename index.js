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
app.get("/update.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "update.html"));
});
app.get("/delete.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "delete.html"));
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
app.post('/products/update', (req, res) => {
  
  const frm_product = req.body;

  Product.findOneAndUpdate(
    { id: frm_product.id },
    frm_product,
    { new: true }
  )
    .then((doc) => {
      console.log('Product updated');
      res.json(doc);
    })
    .catch((err) => {
      console.log(err);
      res.send('Error updating product');
    });

});


// DELETE product
app.post('/products/delete', (req, res) => {

  const frm_product = req.body;

  Product.findOneAndDelete({ id: frm_product.id })
    .then((doc) => {
      if (!doc) {
        console.log("Product not found");
        return res.json({ message: "Product not found" });
      }

      console.log("Product deleted");
      res.json(doc);
    })
    .catch((err) => {
      console.log(err);
      res.send("Error deleting product");
    });

});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

