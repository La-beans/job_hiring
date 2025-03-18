const pool = require("../config/database") // Import the database connection pool

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect("/")
}

const isStaff = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "staff") {
    return next()
  }
  res.redirect("/")
}

const isApplicant = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "applicant") {
    return next()
  }
  res.redirect("/")
}

// Add this middleware to check if a job is accessible to applicants
const isJobAccessible = async (req, res, next) => {
  try {
    // Skip check for staff members
    if (req.user && req.user.role === "staff") {
      return next()
    }

    const jobId = req.params.id

    // Check if job exists and if start date has been reached
    const [jobs] = await pool.query(`SELECT * FROM jobs WHERE id = ? AND start_date <= CURRENT_DATE()`, [jobId])

    if (jobs.length === 0) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Job not available or not found",
        error: {},
      })
    }

    next()
  } catch (error) {
    console.error("Error checking job accessibility:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error checking job accessibility",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
}

module.exports = {
  isAuthenticated,
  isStaff,
  isApplicant,
  isJobAccessible,
}

