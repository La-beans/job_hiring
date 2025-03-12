const express = require("express")
const router = express.Router()
const passport = require("passport")
const authService = require("../services/auth-service")

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
router.post(
  "/staff-login",
  passport.authenticate("staff", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/staff-login",
    failureFlash: true,
  }),
)

// Handle applicant login
router.post(
  "/applicant-login",
  passport.authenticate("applicant", {
    successRedirect: "/applicant/dashboard",
    failureRedirect: "/auth/applicant-login",
    failureFlash: true,
  }),
)

// Handle applicant signup
router.post("/applicant-signup", async (req, res) => {
  try {
    const { name, email, password, dateOfBirth } = req.body

    await authService.registerApplicant({
      name,
      email,
      password,
      dateOfBirth,
    })

    res.redirect("/auth/applicant-login")
  } catch (error) {
    console.error("Error during signup:", error)
    res.render("auth/applicant-signup", {
      title: "Applicant Signup",
      layout: "layouts/blank",
      error: error.message || "An error occurred during signup",
    })
  }
})

// Logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    res.redirect("/")
  })
})

module.exports = router

