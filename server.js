const path = require('path')
const express = require('express')
const dotenv = require('dotenv').config()
const mongoose = require('mongoose')
const morgan = require('morgan') 
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const connectDB = require('./config/db')



//Passport config
require('./config/passport.js')(passport)


connectDB()
const app = express()

//Parse body
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//Method override to use put and delete
app.use(
  methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)
//Logging using morgan
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
//handlebar helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')

//Handlebars template engine
app.engine(
    '.hbs',
    exphbs.engine({ 
      helpers:{
        formatDate,
        stripTags,
        truncate,
        editIcon,
        select
      },
     defaultLayout: 'main',
      extname: '.hbs',
    })
  )
  app.set('view engine', '.hbs')


//Session Middleware
app.use(session({
  secret: 'shared trips',
  resave: false,
  saveUninitialized:false,
  store: MongoStore.create({
    mongoUrl:process.env.MONGO_URI,
    
  })
  
}))

//Passport Middleware
  app.use(passport.initialize())
  app.use(passport.session())

//set global variable so auth 
//middleware has access to user within template
app.use((req,res,next)=>{
  res.locals.user = req.user || null
  next()
})

  //static folder
  app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/',  require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


const PORT = process.env.PORT || 5000 
app.listen(PORT,() => {
     console.log('Server started on port' , PORT)
 })


