const express = require("express")
const router = express.Router()
const { isAuthenticated } = require("../middleware/auth")
const pool = require("../config/database")

// Helper function to get month details
function getMonthDetails(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  let firstDayOfWeek = firstDay.getDay()
  // Adjust for Monday as first day of week
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  return {
    firstDay,
    lastDay,
    daysInMonth,
    firstDayOfWeek,
    year,
    month,
  }
}

// Staff calendar view
router.get("/", isAuthenticated, async (req, res) => {
  try {
    // Get requested month and year from query params, default to current
    const today = new Date()
    const year = Number.parseInt(req.query.year) || today.getFullYear()
    const month = Number.parseInt(req.query.month) || today.getMonth()

    // Get month details
    const monthDetails = getMonthDetails(year, month)

    // Fetch all jobs for staff view
    const [jobs] = await pool.query(
      `
      SELECT 
        id, 
        title, 
        IFNULL(icon, '💼') as icon, 
        start_date, 
        end_date, 
        IFNULL(color_scheme, 'blue') as color_scheme
      FROM jobs
      WHERE YEAR(start_date) = ? AND MONTH(start_date) = ?
      ORDER BY start_date
    `,
      [year, month + 1],
    ) // MySQL months are 1-based

    // Process jobs for display
    const processedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      icon: job.icon,
      startDate: formatDate(job.start_date),
      endDate: formatDate(job.end_date),
      colorScheme: job.color_scheme,
    }))

    res.render("calendar/index", {
      title: "Job Calendar",
      jobs: processedJobs,
      monthDetails,
      currentDate: formatDate(today),
      currentMonth: formatMonth(year, month),
    })
  } catch (error) {
    console.error("Error loading calendar:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading calendar",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Applicant calendar view
router.get("/applicant", isAuthenticated, async (req, res) => {
  try {
    // Get requested month and year from query params, default to current
    const today = new Date()
    const year = Number.parseInt(req.query.year) || today.getFullYear()
    const month = Number.parseInt(req.query.month) || today.getMonth()

    // Get month details
    const monthDetails = getMonthDetails(year, month)

    // Fetch only current and past jobs for applicant view
    const [jobs] = await pool.query(`
      SELECT 
        id, 
        title, 
        IFNULL(icon, '💼') as icon, 
        start_date, 
        end_date, 
        IFNULL(color_scheme, 'blue') as color_scheme
      FROM jobs
      WHERE 
        start_date <= CURRENT_DATE()
        AND end_date >= CURRENT_DATE()
      ORDER BY start_date
    `)

    // Process jobs for display
    const processedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      icon: job.icon,
      startDate: formatDate(job.start_date),
      endDate: formatDate(job.end_date),
      colorScheme: job.color_scheme,
    }))

    res.render("calendar/applicant", {
      title: "Job Calendar",
      jobs: processedJobs,
      monthDetails,
      currentDate: formatDate(today),
      currentMonth: formatMonth(year, month),
    })
  } catch (error) {
    console.error("Error loading calendar:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading calendar",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Helper function to format date
function formatDate(date) {
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

// Helper function to format month
function formatMonth(year, month) {
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
  return `${months[month]} ${year}`
}

module.exports = router

