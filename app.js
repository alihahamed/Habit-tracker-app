const express = require("express")
const mysql = require("mysql2")
const dotenv = require("dotenv")
const app = express()
const path = require("path")
const fs = require("fs")
const hbs = require("hbs")
const session = require("express-session")
const MySQLStore = require("express-mysql-session")(session)

hbs.registerHelper('eq', function(a, b, options) {
    if (arguments.length < 3) {
      throw new Error('Handlebars Helper "eq" needs 2 parameters');
    }
    
    if (a === b) {
      return options.fn(this);  // Truthy: render block
    }
    return options.inverse ? options.inverse(this) : '';  // Falsy: render else (or empty)
  });

hbs.registerHelper('times', function(n, options) {
  let result = '';
  for (let i = 0; i < n; i++) {
    result += options.fn(this, { data: { index: i } });
  }
  return result;
});

hbs.registerHelper('or', function() {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args.some(Boolean);
});

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
    maxAge: 1000 * 60 * 60 * 24 
  }
}))

app.use("/", require("./routes/pages"))
app.use("/auth", require("./routes/auth"))

const port = process.env.PORT || 16877
app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})
