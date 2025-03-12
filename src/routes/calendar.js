const express = require("express")
const router = express.Router()
const { isAuthenticated } = require("../middleware/auth")
const eventService = require("../services/event-service")
const jobService = require("../services/job-service")

// Staff calendar view
router.get("/", isAuthenticated, async (req, res) => {
  try {
    // Get current month's start and end dates
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const formattedStartDate = startDate.toISOString().split("T")[0]
    const formattedEndDate = endDate.toISOString().split("T")[0]

    const events = await eventService.getEventsByDateRange(formattedStartDate, formattedEndDate)

    // Get jobs for the calendar
    const jobs = await jobService.getAllJobs()

    const currentMonth = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now)

    res.render("calendar/index", {
      title: "Job Calendar",
      events,
      jobs,
      currentMonth,
      user: req.user,
    })
  } catch (error) {
    console.error("Error loading calendar:", error)
    res.status(500).render("error", { message: "Error loading calendar" })
  }
})

// Applicant calendar view
router.get("/applicant", isAuthenticated, async (req, res) => {
  try {
    // Get current month's start and end dates
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const formattedStartDate = startDate.toISOString().split("T")[0]
    const formattedEndDate = endDate.toISOString().split("T")[0]

    const events = await eventService.getEventsByDateRange(formattedStartDate, formattedEndDate)

    // Get jobs for the calendar
    const jobs = await jobService.getAllJobs()

    const currentMonth = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now)

    res.render("calendar/applicant", {
      title: "Job Calendar",
      events,
      jobs,
      currentMonth,
      user: req.user,
    })
  } catch (error) {
    console.error("Error loading calendar:", error)
    res.status(500).render("error", { message: "Error loading calendar" })
  }
})

// Create event (Staff only)
router.post("/events", isAuthenticated, async (req, res) => {
  try {
    const { title, description, startDate, endDate, jobId } = req.body

    await eventService.createEvent(
      {
        title,
        description,
        startDate,
        endDate,
        jobId: jobId || null,
      },
      req.user.id,
    )

    res.redirect("/calendar")
  } catch (error) {
    console.error("Error creating event:", error)
    res.status(500).render("error", { message: "Error creating event" })
  }
})

module.exports = router

