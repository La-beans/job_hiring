const express = require("express")
const router = express.Router()
const passport = require("passport")
const bcrypt = require("bcryptjs")
const pool = require("../config/database")

// Staff login page
router.get("/staff-login", (req, res) => {
  res.render("auth/staff-login", { title: "Staff Login", layout: "layouts/blank" })
})

// Applicant login page
router.get("/applicant-login", (req, res) => {
  res.render("auth/applicant-login", { title: "Applicant Login", layout: "layouts/blank" })
})

// Applicant signup page
router.get("/applicant-signup", (req, res) => {
  res.render("auth/applicant-signup", { title: "Applicant Signup", layout: "layouts/blank" })
})

// Handle staff login
router.post("/staff-login", (req, res, next) => {
  passport.authenticate("staff", (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.render("auth/staff-login", {
        title: "Staff Login",
        layout: "layouts/blank",
        error: info.message || "Invalid credentials",
      })
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      }
      return res.redirect("/dashboard")
    })
  })(req, res, next)
})

// Handle applicant login
router.post("/applicant-login", (req, res, next) => {
  passport.authenticate("applicant", (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.render("auth/applicant-login", {
        title: "Applicant Login",
        layout: "layouts/blank",
        error: info.message || "Invalid credentials",
      })
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      }
      return res.redirect("/applicant/dashboard")
    })
  })(req, res, next)
})

// Handle applicant signup
router.post("/applicant-signup", async (req, res) => {
  try {
    const { name, email, password, dateOfBirth } = req.body

    // Check if email already exists
    const [existingUser] = await pool.query("SELECT * FROM applicants WHERE email = ?", [email])
    if (existingUser.length > 0) {
      return res.render("auth/applicant-signup", {
        title: "Applicant Signup",
        layout: "layouts/blank",
        error: "Email already in use",
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new applicant
    await pool.query("INSERT INTO applicants (name, email, password, date_of_birth) VALUES (?, ?, ?, ?)", [
      name,
      email,
      hashedPassword,
      dateOfBirth,
    ])

    res.redirect("/auth/applicant-login")
  } catch (error) {
    console.error("Error during signup:", error)
    res.render("auth/applicant-signup", {
      title: "Applicant Signup",
      layout: "layouts/blank",
      error: "An error occurred during signup",
    })
  }
})

// Logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    req.session.destroy()
    res.redirect("/")
  })
})

module.exports = router

