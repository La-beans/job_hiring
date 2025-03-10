const express = require("express")
const router = express.Router()
const { isAuthenticated, isStaff, isApplicant } = require("../middleware/auth")

// Staff dashboard
router.get("/", isAuthenticated, isStaff, async (req, res) => {
  try {
    // In a real app, fetch jobs and applicants from the database
    // Mock data for demonstration
    const jobs = [
      {
        id: 1,
        title: "Sr. UX Designer",
        icon: "🎨",
        location: "Bengaluru",
        experience: "3 years exp.",
        applications: 45,
        trend: "25 in last week",
        trendUp: true,
        postedDays: 2,
        color: "from-cyan-400 to-blue-500",
        borderColor: "border-cyan-500/20",
      },
      {
        id: 2,
        title: "Growth Manager",
        icon: "🚀",
        location: "Remote",
        experience: "2+ years exp.",
        applications: 38,
        trend: "9 in last week",
        trendUp: true,
        postedDays: 5,
        color: "from-red-400 to-pink-500",
        borderColor: "border-red-500/20",
      },
    ]

    const applicants = [
      {
        id: 1,
        name: "Charlie Kristen",
        avatar: "/images/avatar.png",
        appliedRole: "Sr. UX Designer",
        applicationDate: "12/02/23",
        stage: "Design Challenge",
        email: "charlie.k@gmail.com",
        phone: "+1 542-544-4433",
      },
      {
        id: 2,
        name: "Malaika Brown",
        avatar: "/images/avatar.png",
        appliedRole: "Sr. UX Designer",
        applicationDate: "18/02/23",
        stage: "Screening",
        email: "malaika.br@gmail.com",
        phone: "+1 542-544-4433",
      },
      {
        id: 3,
        name: "Simon Minter",
        avatar: "/images/avatar.png",
        appliedRole: "Financial Analyst",
        applicationDate: "04/01/23",
        stage: "Interview",
        email: "simon.m@gmail.com",
        phone: "+1 542-544-4433",
      },
    ]

    res.render("dashboard/index", {
      title: "Staff Dashboard",
      jobs,
      applicants,
      filter: "All",
      month: "March 2023",
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error loading dashboard:", error)
    res.status(500).render("error", { message: "Error loading dashboard" })
  }
})

// Applicant dashboard
router.get("/applicant", isAuthenticated, isApplicant, async (req, res) => {
  try {
    // Mock data for demonstration
    const jobs = [
      {
        id: 1,
        title: "Sr. UX Designer",
        icon: "��",
        location: "Bengaluru",
        experience: "3 years exp.",
        applications: 45,
        trend: "25 in last week",
        trendUp: true,
        postedDays: 2,
        color: "from-cyan-400 to-blue-500",
        borderColor: "border-cyan-500/20",
      },
      {
        id: 2,
        title: "Growth Manager",
        icon: "🚀",
        location: "Remote",
        experience: "2+ years exp.",
        applications: 38,
        trend: "9 in last week",
        trendUp: true,
        postedDays: 5,
        color: "from-red-400 to-pink-500",
        borderColor: "border-red-500/20",
      },
      {
        id: 3,
        title: "Financial Analyst",
        icon: "💰",
        location: "Mumbai",
        experience: "5+ years exp.",
        applications: 25,
        trend: "26 in last week",
        trendUp: true,
        postedDays: 10,
        color: "from-yellow-400 to-orange-500",
        borderColor: "border-yellow-500/20",
      },
    ]

    res.render("dashboard/applicant", {
      title: "Applicant Dashboard",
      jobs,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error loading applicant dashboard:", error)
    res.status(500).render("error", { message: "Error loading dashboard" })
  }
})

module.exports = router

