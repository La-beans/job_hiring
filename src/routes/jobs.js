const express = require("express")
const router = express.Router()
const { isAuthenticated, isStaff } = require("../middleware/auth")

// Jobs dashboard (Staff view)
router.get("/", isAuthenticated, isStaff, async (req, res) => {
  try {
    // Mock data for demonstration
    const jobs = [
      {
        id: 1,
        title: "Sr. UX Designer",
        description:
          "We are seeking a talented Sr. UX Designer to join our team. This role involves creating user-centered designs for our products.",
        icon: "🎨",
        location: "Bengaluru",
        experience: "3 years exp.",
        applications: 45,
        trend: "25 in last week",
        trendUp: true,
        postedDays: 2,
        color: "from-cyan-400 to-blue-500",
        borderColor: "border-cyan-500/20",
        startDate: "2023-03-01",
        endDate: "2023-04-01",
      },
      {
        id: 2,
        title: "Growth Manager",
        description:
          "We are looking for a Growth Manager to help scale our business. This person will be responsible for identifying and executing growth opportunities.",
        icon: "🚀",
        location: "Remote",
        experience: "2+ years exp.",
        applications: 38,
        trend: "9 in last week",
        trendUp: true,
        postedDays: 5,
        color: "from-red-400 to-pink-500",
        borderColor: "border-red-500/20",
        startDate: "2023-03-05",
        endDate: "2023-04-05",
      },
    ]

    res.render("jobs/index", {
      title: "Jobs Dashboard",
      jobs,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error loading jobs dashboard:", error)
    res.status(500).render("error", { message: "Error loading jobs" })
  }
})

// Job details page
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const jobId = req.params.id

    // Mock job data - in a real app, fetch from database
    const job = {
      id: jobId,
      title: "Sr. UX Designer",
      description:
        "We are seeking a talented Sr. UX Designer to join our dynamic team. This is an exciting opportunity for someone who wants to make an impact and grow their career.",
      icon: "🎨",
      location: "Bengaluru",
      experience: "3 years exp.",
      applications: 45,
      trend: "25 in last week",
      trendUp: true,
      postedDays: 2,
      color: "from-cyan-400 to-blue-500",
      borderColor: "border-cyan-500/20",
    }

    res.render("jobs/details", {
      title: job.title,
      job,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error loading job details:", error)
    res.status(500).render("error", { message: "Error loading job details" })
  }
})

// Create job form (Staff only)
router.get("/new", isAuthenticated, isStaff, (req, res) => {
  res.render("jobs/new", {
    title: "Create New Job",
    user: req.session.user,
  })
})

// Handle job creation (Staff only)
router.post("/", isAuthenticated, isStaff, async (req, res) => {
  try {
    const { title, description, location, experience, icon, colorScheme, startDate, endDate } = req.body

    // In a real app, save job to database
    // For demo, just redirect back to jobs page

    res.redirect("/jobs")
  } catch (error) {
    console.error("Error creating job:", error)
    res.status(500).render("error", { message: "Error creating job" })
  }
})

// Apply for job form (Applicant only)
router.get("/:id/apply", isAuthenticated, async (req, res) => {
  try {
    const jobId = req.params.id

    // Mock job data - in a real app, fetch from database
    const job = {
      id: jobId,
      title: "Sr. UX Designer",
      description: "We are seeking a talented Sr. UX Designer to join our team.",
      icon: "🎨",
      location: "Bengaluru",
      experience: "3 years exp.",
    }

    res.render("jobs/apply", {
      title: `Apply for ${job.title}`,
      job,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error loading application form:", error)
    res.status(500).render("error", { message: "Error loading application form" })
  }
})

// Handle job application submission
router.post("/:id/apply", isAuthenticated, async (req, res) => {
  try {
    const jobId = req.params.id
    const {
      firstName,
      lastName,
      email,
      phone,
      alternatePhone,
      street,
      city,
      postalCode,
      previouslyWorked,
      month,
      day,
      year,
    } = req.body

    // In a real app, save application to database
    // For demo, just redirect back to applicant dashboard

    res.redirect("/applicant/dashboard")
  } catch (error) {
    console.error("Error submitting application:", error)
    res.status(500).render("error", { message: "Error submitting application" })
  }
})

module.exports = router

