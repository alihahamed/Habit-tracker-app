const express = require("express")
const mysql = require("mysql2")
const dotenv = require("dotenv")
const app = express()
const path = require("path")
const fs = require("fs")
const hbs = require("hbs")
const session = require("express-session")
const MySQLStore = require("express-mysql-session")(session)


dotenv.config({path: './.env'})

   
const dbPool = require('./database')


const sessionStore = new MySQLStore({}, dbPool)


// static files
const publicDirectory = path.join(__dirname,'./public')
app.use(express.static(publicDirectory))

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, '/views/partials'));


app.use(express.urlencoded({extended: false }))
app.use(express.json())
app.use(session({
  store:sessionStore,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:false,
  cookie:{
    maxAge: 120 * 24 * 60 * 60 * 1000
  }
}))

app.use("/", require("./routes/pages"))
app.use("/auth", require("./routes/auth"))

const port = process.env.PORT || 16877
app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})
