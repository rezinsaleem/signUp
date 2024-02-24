
const express = require("express")
const path = require("node:path")
const session = require("express-session")
const bcrypt = require("bcrypt")
const collection = require("./models/config")
const nocache = require("nocache")
const flash = require("express-flash")
const userRouter = require('./route/userRouter')
const adminRouter = require('./route/adminRouter')

const PORT = process.env.PORT || 4000;

const app = express()

app.use(nocache())
app.use(flash())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: "rwrwrwrw",
    resave: false,
    saveUninitialized: false
}))

app.use('/', userRouter)
app.use('/admin', adminRouter)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})