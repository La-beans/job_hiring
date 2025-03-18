const express = require("express")
const router = express.Router()
const { isAuthenticated, isApplicant } = require("../middleware/auth")
const pool = require("../config/database")

// Applicant dashboard
router.get("/dashboard", isAuthenticated, isApplicant, async (req, res) => {
  try {
    // Fetch available jobs - only show jobs where start_date has been reached
    const [jobs] = await pool.query(`
    SELECT 
      j.*, 
      (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applications,
      DATEDIFF(CURRENT_DATE(), j.created_at) as posted_days
    FROM jobs j
    WHERE j.end_date >= CURRENT_DATE()
    AND j.start_date <= CURRENT_DATE()  /* Only show jobs where start date has been reached */
    ORDER BY j.created_at DESC
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

    // Fetch applicant's applications
    const [applications] = await pool.query(
      `
    SELECT 
      a.*,
      j.title as job_title,
      j.location as job_location,
      j.icon as job_icon
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE a.applicant_id = ?
    ORDER BY a.created_at DESC
  `,
      [req.user.id],
    )

    res.render("applicant/dashboard", {
      title: "Applicant Dashboard",
      jobs: processedJobs,
      applications: applications,
    })
  } catch (error) {
    console.error("Error loading applicant dashboard:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading dashboard",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Applicant profile
router.get("/profile", isAuthenticated, isApplicant, async (req, res) => {
  try {
    res.render("applicant/profile", {
      title: "My Profile",
    })
  } catch (error) {
    console.error("Error loading profile:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading profile",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Update applicant profile
router.post("/profile", isAuthenticated, isApplicant, async (req, res) => {
  try {
    const { name, email } = req.body

    // Update profile in database
    await pool.query("UPDATE applicants SET name = ?, email = ? WHERE id = ?", [name, email, req.user.id])

    // Update session
    req.user.name = name
    req.user.email = email

    res.redirect("/applicant/profile")
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error updating profile",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Applicant applications
router.get("/applications", isAuthenticated, isApplicant, async (req, res) => {
  try {
    // Fetch applicant's applications
    const [applications] = await pool.query(
      `
      SELECT 
        a.*,
        j.title as job_title,
        j.location as job_location,
        j.icon as job_icon
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.applicant_id = ?
      ORDER BY a.created_at DESC
    `,
      [req.user.id],
    )

    res.render("applicant/applications", {
      title: "My Applications",
      applications: applications,
    })
  } catch (error) {
    console.error("Error loading applications:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading applications",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Add this route to get all available jobs for applicants
router.get("/available-jobs", isAuthenticated, isApplicant, async (req, res) => {
  try {
    // Fetch available jobs - only show jobs where start_date has been reached
    const [jobs] = await pool.query(`
      SELECT 
        j.*, 
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applications,
        DATEDIFF(CURRENT_DATE(), j.created_at) as posted_days
      FROM jobs j
      WHERE j.end_date >= CURRENT_DATE()
      AND j.start_date <= CURRENT_DATE()  /* Only show jobs where start date has been reached */
      ORDER BY j.created_at DESC
    `)

    // Process jobs for display
    const processedJobs = jobs.map((job) => {
      // Map color scheme to gradient classes
      const colorMap = {
        blue: "from-cyan-400 to-blue-500",
        red: "from-red-400 to-pink-500",
        yellow: "from-yellow-400 to-orange-500",
        green: "from-emerald-400 to-teal-500",
      }

      return {
        id: job.id,
        title: job.title,
        icon: job.icon || "💼",
        location: job.location,
        experience: job.experience,
        postedDays: job.posted_days || 0,
        color: colorMap[job.color_scheme] || colorMap.blue,
        startDate: formatDate(job.start_date),
        endDate: formatDate(job.end_date),
      }
    })

    res.render("applicant/available-jobs", {
      title: "Available Jobs",
      jobs: processedJobs,
    })
  } catch (error) {
    console.error("Error loading available jobs:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading available jobs",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Helper function to format date
function formatDate(date) {
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

module.exports = router

