const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const session = require("express-session")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  }),
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.user || null
  next()
})

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
})

// Passport configuration
passport.use(
  "applicant",
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const [rows] = await pool.query("SELECT * FROM applicants WHERE email = ?", [email])
      if (rows.length === 0) {
        return done(null, false, { message: "Incorrect email." })
      }
      const user = rows[0]
      const isMatch = await bcrypt.compare(password, user.password)
      if (isMatch) {
        user.role = "applicant" // Set role
        return done(null, user)
      } else {
        return done(null, false, { message: "Incorrect password." })
      }
    } catch (error) {
      return done(error)
    }
  }),
)

passport.use(
  "staff",
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const [rows] = await pool.query("SELECT * FROM staff WHERE email = ?", [email])
      if (rows.length === 0) {
        return done(null, false, { message: "Incorrect email." })
      }
      const user = rows[0]
      const isMatch = await bcrypt.compare(password, user.password)
      if (isMatch) {
        user.role = "staff" // Set role
        return done(null, user)
      } else {
        return done(null, false, { message: "Incorrect password." })
      }
    } catch (error) {
      return done(error)
    }
  }),
)

passport.serializeUser((user, done) => {
  done(null, { id: user.id, role: user.role })
})

passport.deserializeUser(async (data, done) => {
  try {
    const { id, role } = data
    const table = role === "staff" ? "staff" : "applicants"
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id])
    if (rows.length === 0) {
      return done(null, false)
    }
    done(null, rows[0])
  } catch (error) {
    done(error)
  }
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

