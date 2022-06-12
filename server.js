const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("./routes/routes");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

require("./config/passport");

app.use("/api", routes);

app.use((_, res, __) => {
  res.status(404).json({
    message: "Use api on routes: /api",
  });
});

app.use((err, _, res, __) => {
  res.status(500).json({
    message: err.message,
  });
});

const uriDb = process.env.DB_URI;
const PORT = process.env.PORT || 3000;

const connection = mongoose.connect(uriDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connection
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Database connection successful! Listening on PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
