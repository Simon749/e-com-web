import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";   // ✅ Import Stripe class

// Load environment variables
dotenv.config();

console.log("All env variables:", process.env);


console.log("Stripe Key Loaded:", process.env.STRIPE_SECRET_KEY);


// Initialize express
const app = express();

// ✅ Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.static("public"));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.get("/cart", (req, res) => {
  res.sendFile("cart.html", { root: "public" });
});

// Stripe Checkout
app.post("/stripe-checkout", async (req, res) => {
  try {
    const lineItems = req.body.items.map((item) => {
      const unitAmount = parseInt(parseFloat(item.price) * 100);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: "http://localhost:3000/success.html",
      cancel_url: "http://localhost:3000/cancel.html",
      line_items: lineItems,
      billing_address_collection: "required",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
