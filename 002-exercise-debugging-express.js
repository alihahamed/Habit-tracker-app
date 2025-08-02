const express = require("express");
const app = express();
const port = 3002;
const router = express.Router();

let habits = [];

router.get("/", (req, res) => {
  res.send("Welcome to the Habit Debugger!");
});

router.post("/api/habits", (req, res) => {
  habits.push(req.body);
  res.send("Habit added!");
});

router.get("/api/habits", (req, res) => {
  res.json(habits);
});

app.use(express.json())
app.use(router);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});