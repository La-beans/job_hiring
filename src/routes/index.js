const express = require("express")
const router = express.Router()

// Landing page with role selection
router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    // If user is already logged in, redirect to their dashboard
    if (req.user.role === "staff") {
      return res.redirect("/dashboard")
    } else {
      return res.redirect("/applicant/dashboard")
    }
  }
  res.render("index", { title: "Choose Role", layout: "layouts/blank" })
})

module.exports = router

