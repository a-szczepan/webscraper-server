require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const { prepareRouter } = require("./route/routes");
const app = express();

app.use(express.json());
app.use(cors());
app.use(prepareRouter());

const start = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    app.listen(process.env.PORT || 5000, () => console.log(`Server running `));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
