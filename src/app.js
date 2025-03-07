const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const session = require("express-session")
const mysql = require("mysql2/promise")
const dotenv = require("dotenv")
const ejsLayouts = require("express-ejs-layouts")

dotenv.config()

const app = express()

// View engine setup
app.use(ejsLayouts)
app.set("layout", "layouts/main")
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Middleware
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
app.use(
  session({
    secret: process.env.SESSION_SECRET || "job-portal-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  }),
)

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
})

// Make db available to routes
app.use((req, res, next) => {
  req.db = pool
  next()
})

// Routes
const indexRouter = require("./routes/index")
const authRouter = require("./routes/auth")
const dashboardRouter = require("./routes/dashboard")
const jobsRouter = require("./routes/jobs")
const candidatesRouter = require("./routes/candidates")
const calendarRouter = require("./routes/calendar")

app.use("/", indexRouter)
app.use("/auth", authRouter)
app.use("/dashboard", dashboardRouter)
app.use("/jobs", jobsRouter)
app.use("/candidates", candidatesRouter)
app.use("/calendar", calendarRouter)

// Middleware to check authentication
app.use((req, res, next) => {
  // Store user in locals for views
  res.locals.user = req.session.user || null
  next()
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).render("error", {
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err : {},
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app

