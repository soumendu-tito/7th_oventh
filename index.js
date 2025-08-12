require('dotenv').config();
const express = require('express');
const session = require('express-session');
const DOMAIN = process.env.DOMAIN || 'http://localhost:3000';
const mongoose = require('mongoose');

const app = express();
const paymentRoutes = require('./routes/payment');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
app.use('/api/payment', paymentRoutes);
// Middleware
app.use(express.urlencoded({ extended: true })); // <-- this is crucial
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
const PORT = process.env.PORT || 3000;
const Product = require("./models/Product");
const Order = require('./models/Order');
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected!');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})
.catch(err => console.error('MongoDB connection error:', err));
// Set view engine
app.set("view engine", "ejs");

// Static files
app.use(express.static("public"));

// Home route
app.get("/", async(req, res) => {
  try {
    const products = await Product.find({});
    const bestSellers = await Product.find({ isBestSeller: true });

    const last7Days = new Date();
last7Days.setDate(last7Days.getDate() - 7);

const newArrivals = await Product.find({ createdAt: { $gte: last7Days } });
    res.render("index", { products:products, products_best: bestSellers,newArrivals:newArrivals });
  } catch (err) {
    console.error("❌ Failed to fetch products:", err.message);
    res.status(500).send("Error fetching products.");
  }
});
app.get('/best-sellers', async (req, res) => {
  try {
    // Option 1: Based on sales volume
    //const bestSellers = await Product.find().sort({ sold: -1 }).limit(10);

    // Option 2: If flagged manually
    // const bestSellers = await Product.find({ isBestSeller: true });
    const bestSellers = await Product.find({ isBestSeller: true });
    res.render('best-sellers', { products_best: bestSellers });
  } catch (err) {
    res.status(500).send('Error fetching best sellers');
  }
});


app.post('/add-to-cart/:id', async (req, res) => {
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).send("Product not found");

  // Initialize cart if empty
  if (!req.session.cart) {
    req.session.cart = [];
  }

  // Check if item already in cart
  const existing = req.session.cart.find(p => p._id == productId);
  if (existing) {
    existing.qty += 1;
  } else {
    req.session.cart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1
    });
  }

  res.redirect('/cart');
});
app.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
  });
  res.render('cart', { cart, total });
});

app.get('/checkout', (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/cart');

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
  });

  res.render('checkout', { cart, total });
});

app.post('/place-order', async (req, res) => {
  const { name, address, phone } = req.body;
  const cart = req.session.cart;

  if (!cart || cart.length === 0) return res.redirect('/cart');

  const order = new Order({
    customer: { name, address, phone },
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    createdAt: new Date()
  });

  await order.save();

  // Clear cart
 
  res.redirect(307,'/create-checkout-session');
});
app.get('/order-success', (req, res) => {
  req.session.cart = [];

  res.send("<h2>Order placed successfully!</h2><a href='/'>Back to Shop</a>");
});
app.get('/cancel', (req, res) => {
  res.send("<h2>Order Not placed !</h2><a href='/'>Back to Shop</a>");
});

app.get('/clr_cart', (req, res) => {
  req.session.cart = [];
  res.send("<h2>Cart Deleted !</h2><a href='/'>Back to Shop</a>");
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (cart.length === 0) {
      return res.redirect('/cart');
    }

    const line_items = cart.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // dollars → cents
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${DOMAIN}/order-success`,
      cancel_url:  `${DOMAIN}/cancel`,
    });

    res.redirect(303, session.url);
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).send('Payment failed');
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});