const express = require("express")
const router = express.Router()

// Staff login page
router.get("/staff-login", (req, res) => {
  res.render("auth/staff-login", { title: "Staff Login", layout: "layouts/blank" })
})

// Applicant login page
router.get("/applicant-login", (req, res) => {
  res.render("auth/applicant-login", { title: "Applicant Login", layout: "layouts/blank" })
})

// Handle staff login
router.post("/staff-login", async (req, res) => {
  const { email, password } = req.body

  // In a real app, you would validate credentials against the database
  // For demo purposes, we're accepting any email/password combination
  if (email && password) {
    req.session.user = {
      id: 1,
      name: "HR Staff",
      email: email,
      role: "staff",
      avatar: "/images/avatar.png",
    }
    res.redirect("/dashboard")
  } else {
    res.render("auth/staff-login", {
      title: "Staff Login",
      layout: "layouts/blank",
      error: "Please enter email and password",
    })
  }
})

// Handle applicant login
router.post("/applicant-login", async (req, res) => {
  const { email, password } = req.body

  // In a real app, you would validate credentials against the database
  if (email && password) {
    req.session.user = {
      id: 2,
      name: "Job Applicant",
      email: email,
      role: "applicant",
      avatar: "/images/avatar.png",
    }
    res.redirect("/applicant/dashboard")
  } else {
    res.render("auth/applicant-login", {
      title: "Applicant Login",
      layout: "layouts/blank",
      error: "Please enter email and password",
    })
  }
})

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy()
  res.redirect("/")
})

module.exports = router

