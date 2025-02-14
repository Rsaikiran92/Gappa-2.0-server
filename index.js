const express = require("express");
const { connection } = require("./Configs/db");
const { userRouter } = require("./routes/user.routes");
const { tokenRouter } = require("./routes/token.routes");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome Home Page");
});

app.use("/user", userRouter);
app.use("/token", tokenRouter);

app.listen(8080, async () => {
  try {
    await connection;
    console.log("Connected to the DB");
  } catch (err) {
    console.log("Trouble connecting to the DB");
    console.log(err);
  }
  console.log(`Running at 8080 Port`);
});
