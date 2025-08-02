// 001-exercise-basic-express.js
// This is your first exercise! Follow the instructions below.
// When you're done, type 'node 001-exercise-basic-express.js' to run it.

// TODO 1: Import the express module

// TODO 2: Create an Express application instance

// TODO 3: Create a GET route for the home page ('/') that sends 'Welcome to the Habit Tracker!'

// TODO 4: Start the server on port 3000



// After completing the TODOs, run this file using Node.js and visit http://localhost:3000 in your browser.
// What do you see? Type what you see in the browser below:
// I see: 

// BONUS: Add another route that responds to GET /api/habits with a JSON response containing an array of habits


const express = require("express")
const app = express()
const port = 3000
const router = express.Router()
let habits = []

router.get("/", (req,res) => {
    res.send("Welcome to the habit tracker")
})

router.post("/api/habits", (req,res) => {
    habits.push(req.body)
})

router.get("/api/habits", (req,res) =>{
    res.json(habits)
})

app.use(express.json())
app.use(router)

app.listen(port, () =>{
    console.log('Server is running on http://localhost:3000');
} )

