const express = require("express")
const router = express.Router()
const { isAuthenticated, isStaff } = require("../middleware/auth")
const pool = require("../config/database")

// Staff dashboard
router.get("/", isAuthenticated, isStaff, async (req, res) => {
  try {
    // Fetch jobs from database
    const [jobs] = await pool.query(`
      SELECT 
        j.*, 
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applications,
        DATEDIFF(CURRENT_DATE(), j.created_at) as posted_days
      FROM jobs j
      ORDER BY j.created_at DESC
      LIMIT 5
    `)

    // Process jobs for display
    const processedJobs = jobs.map((job) => {
      // Calculate trend (mock data for now)
      const trendNumber = Math.floor(Math.random() * 30)
      const trendUp = Math.random() > 0.3 // 70% chance of trend being up

      // Map color scheme to gradient classes
      const colorMap = {
        blue: "from-cyan-400 to-blue-500",
        red: "from-red-400 to-pink-500",
        yellow: "from-yellow-400 to-orange-500",
        green: "from-emerald-400 to-teal-500",
      }

      const borderColorMap = {
        blue: "border-cyan-500/20",
        red: "border-red-500/20",
        yellow: "border-yellow-500/20",
        green: "border-emerald-500/20",
      }

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        icon: job.icon,
        location: job.location,
        experience: job.experience,
        applications: job.applications || 0,
        trend: `${trendNumber} in last week`,
        trendUp: trendUp,
        postedDays: job.posted_days || 0,
        color: colorMap[job.color_scheme] || colorMap.blue,
        borderColor: borderColorMap[job.color_scheme] || borderColorMap.blue,
        startDate: job.start_date,
        endDate: job.end_date,
      }
    })

    // Fetch recent applicants
    const [applicants] = await pool.query(`
  SELECT 
    a.id, 
    a.name, 
    j.title as appliedRole,
    DATE_FORMAT(ap.created_at, '%d/%m/%y') as applicationDate,
    ap.stage
  FROM applications ap
  JOIN applicants a ON ap.applicant_id = a.id
  JOIN jobs j ON ap.job_id = j.id
  ORDER BY ap.created_at DESC
  LIMIT 5
`)

    // If no applicants in database, use mock data
    const displayApplicants =
      applicants.length > 0
        ? applicants
        : [
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

    // Add avatar to each applicant
    displayApplicants.forEach((applicant) => {
      applicant.avatar = applicant.avatar || "/images/avatar.png"
    })

    res.render("dashboard/index", {
      title: "Staff Dashboard",
      jobs: processedJobs,
      applicants: displayApplicants,
      filter: "All",
      month: getCurrentMonthName(),
    })
  } catch (error) {
    console.error("Error loading dashboard:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading dashboard",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Helper function to get current month name
function getCurrentMonthName() {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const now = new Date()
  return `${months[now.getMonth()]} ${now.getFullYear()}`
}

// Applicant dashboard
// router.get("/applicant", isAuthenticated, isApplicant, async (req, res) => {
//   try {
//     // Mock data for demonstration
//     const jobs = [
//       {
//         id: 1,
//         title: "Sr. UX Designer",
//         icon: "🎨",
//         location: "Bengaluru",
//         experience: "3 years exp.",
//         applications: 45,
//         trend: "25 in last week",
//         trendUp: true,
//         postedDays: 2,
//         color: "from-cyan-400 to-blue-500",
//         borderColor: "border-cyan-500/20",
//       },
//       {
//         id: 2,
//         title: "Growth Manager",
//         icon: "🚀",
//         location: "Remote",
//         experience: "2+ years exp.",
//         applications: 38,
//         trend: "9 in last week",
//         trendUp: true,
//         postedDays: 5,
//         color: "from-red-400 to-pink-500",
//         borderColor: "border-red-500/20",
//       },
//       {
//         id: 3,
//         title: "Financial Analyst",
//         icon: "💰",
//         location: "Mumbai",
//         experience: "5+ years exp.",
//         applications: 25,
//         trend: "26 in last week",
//         trendUp: true,
//         postedDays: 10,
//         color: "from-yellow-400 to-orange-500",
//         borderColor: "border-yellow-500/20",
//       },
//     ]

//     res.render("dashboard/applicant", {
//       title: "Applicant Dashboard",
//       jobs,
//       user: req.user, // Use req.user instead of req.session.user
//     })
//   } catch (error) {
//     console.error("Error loading applicant dashboard:", error)
//     res.status(500).render("error", { message: "Error loading dashboard" })
//   }
// })

module.exports = router

