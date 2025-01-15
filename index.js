// const dotenv = require("dotenv").config();
// if (dotenv.error) {
//   console.error(
//     "Warning: Unable to load .env file. Defaulting to environment variables."
//   );
// }

const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const routes = require("./routes");
const { stripeWeebhook } = require("./controllers/webhook");

const app = express();
// Web-Hook
app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  stripeWeebhook
);
app.use(bodyParser.json());
app.use(cors({ origin: true }));
app.use(express.raw({ type: "application/json" }));

app.use("/api", routes);

exports.api = functions.https.onRequest(app);
// app.listen(5000, () => {
//   console.log(`App listening on port ${5000}`);
// });
