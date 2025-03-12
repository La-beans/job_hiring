const express = require("express")
const router = express.Router()
const { isAuthenticated, isStaff } = require("../middleware/auth")
const pool = require("../config/database")

// Candidates list (Staff only)
router.get("/", isAuthenticated, isStaff, async (req, res) => {
  try {
    // Get filter parameter
    const filter = req.query.filter || "All"

    // Build query based on filter
    let query = `
      SELECT 
        a.id,
        ap.name,
        j.title as appliedRole,
        DATE_FORMAT(a.created_at, '%d/%m/%y') as applicationDate,
        a.stage,
        ap.email,
        a.phone
      FROM applications a
      JOIN applicants ap ON a.applicant_id = ap.id
      JOIN jobs j ON a.job_id = j.id
    `

    const queryParams = []

    if (filter !== "All") {
      query += " WHERE a.stage = ?"
      queryParams.push(filter)
    }

    query += " ORDER BY a.created_at DESC"

    // Execute query
    const [applicants] = await pool.query(query, queryParams)

    // Add avatar to each applicant
    applicants.forEach((applicant) => {
      applicant.avatar = "/images/avatar.png"
    })

    res.render("candidates/index", {
      title: "Candidates",
      applicants,
      filter,
      month: getCurrentMonthName(),
    })
  } catch (error) {
    console.error("Error loading candidates:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading candidates",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Candidate details
router.get("/:id", isAuthenticated, isStaff, async (req, res) => {
  try {
    const candidateId = req.params.id

    // Fetch candidate details
    const [applications] = await pool.query(
      `
      SELECT 
        a.*,
        ap.name,
        ap.email as applicant_email,
        j.title as job_title,
        j.location as job_location,
        j.experience as job_experience
      FROM applications a
      JOIN applicants ap ON a.applicant_id = ap.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `,
      [candidateId],
    )

    if (applications.length === 0) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Candidate not found",
        error: {},
      })
    }

    const candidate = applications[0]

    // Add avatar
    candidate.avatar = "/images/avatar.png"

    res.render("candidates/details", {
      title: candidate.name,
      candidate,
    })
  } catch (error) {
    console.error("Error loading candidate details:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading candidate details",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Update candidate stage
router.post("/:id/stage", isAuthenticated, isStaff, async (req, res) => {
  try {
    const candidateId = req.params.id
    const { stage } = req.body

    // Update candidate stage in database
    await pool.query("UPDATE applications SET stage = ? WHERE id = ?", [stage, candidateId])

    res.redirect("/candidates")
  } catch (error) {
    console.error("Error updating candidate stage:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error updating candidate stage",
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

module.exports = router

