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

// Add this route to your existing candidates.js file
router.get("/:id/details", isAuthenticated, isStaff, async (req, res) => {
  try {
    const candidateId = req.params.id

    console.log(`Fetching details for candidate ID: ${candidateId}`)

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
      return res.status(404).json({ error: "Candidate not found" })
    }

    const candidate = applications[0]

    // Fetch documents
    const [documents] = await pool.query(
      `
      SELECT 
        a.id,
        a.cv_filename,
        a.cv_original_name,
        a.cv_mime_type,
        a.created_at as upload_date
      FROM applications a
      WHERE a.id = ? AND a.cv_filename IS NOT NULL
      `,
      [candidateId],
    )

    // Format the response
    const response = {
      id: candidate.id,
      name: candidate.name,
      email: candidate.applicant_email,
      phone: candidate.phone,
      jobTitle: candidate.job_title,
      stage: candidate.stage,
      avatar: "/images/avatar.png",
      screeningDate: candidate.stage !== "New" ? candidate.created_at : null,
      designChallengeDate:
        candidate.stage === "Design Challenge" ||
        candidate.stage === "Interview" ||
        candidate.stage === "HR Round" ||
        candidate.stage === "Hired"
          ? addDays(candidate.created_at, 7)
          : null,
      interviewDate:
        candidate.stage === "Interview" || candidate.stage === "HR Round" || candidate.stage === "Hired"
          ? addDays(candidate.created_at, 14)
          : null,
      hrRoundDate:
        candidate.stage === "HR Round" || candidate.stage === "Hired" ? addDays(candidate.created_at, 21) : null,
      hiredDate: candidate.stage === "Hired" ? addDays(candidate.created_at, 28) : null,
      documents: documents.map((doc) => ({
        id: doc.id,
        name: doc.cv_original_name || "Resume.pdf",
        type: doc.cv_mime_type || "application/pdf",
        uploadDate: doc.upload_date,
      })),
      // Mock experience data
      experience: [
        {
          title: "UX Designer",
          company: "Airbnb",
          startDate: "Jan 2020",
          endDate: "Present",
          logo: "/images/airbnb-logo.png",
        },
        {
          title: "UI/UX Designer",
          company: "Dribbble",
          startDate: "Mar 2018",
          endDate: "Dec 2019",
          logo: "/images/dribbble-logo.png",
        },
      ],
    }

    res.json(response)
  } catch (error) {
    console.error("Error fetching candidate details:", error)
    res.status(500).json({
      error: "Error fetching candidate details",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Helper function to add days to a date
function addDays(dateString, days) {
  const date = new Date(dateString)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

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

