const express = require("express")
const router = express.Router()
const { isAuthenticated } = require("../middleware/auth")
const pool = require("../config/database") // Fix: Changed from '../config/db' to '../config/database'

// Helper function to format date since utils/date.js might not exist
function formatDate(date) {
  if (!date) return ""
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

// Update the search route to handle JSON requests
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const query = req.query.q || ""
    const format = req.query.format || "html"
    const searchResults = { jobs: [], candidates: [] }

    if (!query.trim()) {
      if (format === "json") {
        return res.json(searchResults)
      }
      return res.render("search/results", {
        title: "Search Results",
        query: query,
        results: searchResults,
      })
    }

    // Search for jobs (accessible to both staff and applicants)
    const [jobs] = await pool.query(
      `
      SELECT 
        j.id,
        j.title,
        j.location,
        j.experience,
        j.icon,
        j.color_scheme,
        j.start_date,
        j.end_date,
        DATEDIFF(CURRENT_DATE(), j.created_at) as posted_days
      FROM jobs j
      WHERE 
        (j.title LIKE ? OR j.description LIKE ? OR j.location LIKE ?)
        ${req.user.role === "applicant" ? "AND j.start_date <= CURRENT_DATE()" : ""}
      ORDER BY j.created_at DESC
      LIMIT 20
    `,
      [`%${query}%`, `%${query}%`, `%${query}%`],
    )

    // Process jobs for display
    searchResults.jobs = jobs.map((job) => {
      // Map color scheme to gradient classes
      const colorMap = {
        blue: "blue-bg",
        red: "red-bg",
        yellow: "yellow-bg",
        green: "green-bg",
      }

      return {
        id: job.id,
        title: job.title,
        location: job.location,
        experience: job.experience,
        icon: job.icon || "💼",
        colorClass: colorMap[job.color_scheme] || "blue-bg",
        postedDays: job.posted_days || 0,
        startDate: formatDate(job.start_date),
        endDate: formatDate(job.end_date),
      }
    })

    // Search for candidates (staff only)
    if (req.user.role === "staff") {
      const [candidates] = await pool.query(
        `
        SELECT 
          a.id as application_id,
          ap.id as applicant_id,
          ap.name,
          j.title as job_title,
          j.id as job_id,
          a.stage,
          a.created_at as application_date
        FROM applications a
        JOIN applicants ap ON a.applicant_id = ap.id
        JOIN jobs j ON a.job_id = j.id
        WHERE ap.name LIKE ? OR a.email LIKE ? OR j.title LIKE ?
        ORDER BY a.created_at DESC
        LIMIT 20
      `,
        [`%${query}%`, `%${query}%`, `%${query}%`],
      )

      // Process candidates for display
      searchResults.candidates = candidates.map((candidate) => ({
        applicationId: candidate.application_id,
        applicantId: candidate.applicant_id,
        name: candidate.name,
        jobTitle: candidate.job_title,
        jobId: candidate.job_id,
        stage: candidate.stage,
        applicationDate: formatDate(candidate.application_date),
        avatar: "/images/avatar.png",
      }))
    }

    // Return JSON if requested
    if (format === "json") {
      return res.json(searchResults)
    }

    // Otherwise render the HTML view
    res.render("search/results", {
      title: "Search Results",
      query: query,
      results: searchResults,
    })
  } catch (error) {
    console.error("Error searching:", error)

    if (req.query.format === "json") {
      return res.status(500).json({ error: "Error performing search" })
    }

    res.status(500).render("error", {
      title: "Error",
      message: "Error performing search",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Add this debug route at the end of the file before module.exports
router.get("/debug", (req, res) => {
  res.json({
    message: "Search route is working",
    query: req.query,
    user: req.user
      ? {
          id: req.user.id,
          role: req.user.role,
          name: req.user.name,
        }
      : null,
  })
})

module.exports = router

