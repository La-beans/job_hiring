const express = require("express")
const router = express.Router()
const { isAuthenticated } = require("../middleware/auth")

// Staff calendar view
router.get("/", isAuthenticated, async (req, res) => {
  try {
    // Mock data for demonstration
    const jobs = [
      {
        id: 1,
        title: "Sr. UX Designer",
        icon: "🎨",
        startDate: "2023-03-10",
        endDate: "2023-03-17",
      },
      {
        id: 2,
        title: "Growth Manager",
        icon: "🚀",
        startDate: "2023-03-15",
        endDate: "2023-03-30",
      },
    ]

    const currentMonth = "March 2023"

    res.render("calendar/index", {
      title: "Job Calendar",
      jobs,
      currentMonth,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error loading calendar:", error)
    res.status(500).render("error", { message: "Error loading calendar" })
  }
})

// Applicant calendar view
router.get("/applicant", isAuthenticated, async (req, res) => {
  try {
    // Mock data for demonstration
    const jobs = [
      {
        id: 1,
        title: "Sr. UX Designer",
        icon: "🎨",
        startDate: "2023-03-10",
        endDate: "2023-03-17",
      },
      {
        id: 2,
        title: "Growth Manager",
        icon: "🚀",
        startDate: "2023-03-15",
        endDate: "2023-03-30",
      },
    ]

    const currentMonth = "March 2023"

    res.render("calendar/applicant", {
      title: "Job Calendar",
      jobs,
      currentMonth,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error loading calendar:", error)
    res.status(500).render("error", { message: "Error loading calendar" })
  }
})

module.exports = router

