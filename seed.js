require('dotenv').config();
const mongoose = require("mongoose");

const Product = require("./models/Product");

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    await Product.deleteMany();
    await Product.insertMany([
      { name: "T-Shirt", price: 499, image: "/images/shirt.jpg",isBestSeller:true,compare_price:660},
      { name: "Sneakers", price: 1999, image: "/images/shoes.jpg",isBestSeller:true,compare_price:3000 },
      { name: "Watch", price: 2599, image: "/images/watch.jpg",compare_price:7000 },
      { name: "T-Shirt_1", price: 499, image: "/images/shirt.jpg",isBestSeller:true,compare_price:660},
      { name: "Sneakers_1", price: 1999, image: "/images/shoes.jpg",isBestSeller:true,compare_price:3000 },
      { name: "Watch_1", price: 2599, image: "/images/watch.jpg",compare_price:7000 },
      { name: "Watch_2", price: 2599, image: "/images/watch.jpg",compare_price:7000 },
      { name: "Watch_3", price: 2599, image: "/images/watch.jpg",compare_price:7000 },
    ]);
    console.log("✅ Products seeded");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });


