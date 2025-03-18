const express = require("express")
const router = express.Router()
const { isAuthenticated, isStaff, isJobAccessible } = require("../middleware/auth")
const pool = require("../config/database")

// First, add these imports at the top of the file:
const path = require("path")
const fs = require("fs")
const multer = require("multer")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads")
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, "resume-" + uniqueSuffix + ext)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only certain file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Only PDF and Word documents are allowed"))
    }
  },
})

// Jobs dashboard (Staff view)
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
        postedDays: job.posted_days || 0,
        color: colorMap[job.color_scheme] || colorMap.blue,
        borderColor: borderColorMap[job.color_scheme] || borderColorMap.blue,
        startDate: job.start_date,
        endDate: job.end_date,
      }
    })

    res.render("jobs/index", {
      title: "Jobs Dashboard",
      jobs: processedJobs,
    })
  } catch (error) {
    console.error("Error loading jobs dashboard:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading jobs",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Job details page - add the middleware
router.get("/:id", isAuthenticated, isJobAccessible, async (req, res) => {
  try {
    const jobId = req.params.id

    // Fetch job from database
    const [jobs] = await pool.query(
      `
      SELECT 
        j.*, 
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applications,
        DATEDIFF(CURRENT_DATE(), j.created_at) as posted_days
      FROM jobs j
      WHERE j.id = ?
    `,
      [jobId],
    )

    if (jobs.length === 0) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Job not found",
        error: {},
      })
    }

    const job = jobs[0]

    // Map color scheme to gradient classes
    const colorMap = {
      blue: "from-cyan-400 to-blue-500",
      red: "from-red-400 to-pink-500",
      yellow: "from-yellow-400 to-orange-500",
      green: "from-emerald-400 to-teal-500",
    }

    const processedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      icon: job.icon,
      location: job.location,
      experience: job.experience,
      applications: job.applications || 0,
      trend: `${Math.floor(Math.random() * 30)} in last week`,
      trendUp: Math.random() > 0.3,
      postedDays: job.posted_days || 0,
      color: colorMap[job.color_scheme] || colorMap.blue,
      startDate: job.start_date,
      endDate: job.end_date,
    }

    res.render("jobs/details", {
      title: job.title,
      job: processedJob,
    })
  } catch (error) {
    console.error("Error loading job details:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading job details",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Create job form (Staff only)
router.get("/new", isAuthenticated, isStaff, (req, res) => {
  res.render("jobs/new", {
    title: "Create New Job",
  })
})

// Handle job creation (Staff only)
router.post("/", isAuthenticated, isStaff, async (req, res) => {
  try {
    const { title, description, location, experience, icon, colorScheme, startDate, endDate } = req.body

    // Insert job into database
    await pool.query(
      `INSERT INTO jobs (title, description, location, experience, icon, color_scheme, start_date, end_date, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, location, experience, icon, colorScheme, startDate, endDate, req.user.id],
    )

    res.redirect("/jobs")
  } catch (error) {
    console.error("Error creating job:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error creating job",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Edit job form (Staff only)
router.get("/:id/edit", isAuthenticated, isStaff, async (req, res) => {
  try {
    const jobId = req.params.id

    // Fetch job from database
    const [jobs] = await pool.query("SELECT * FROM jobs WHERE id = ?", [jobId])

    if (jobs.length === 0) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Job not found",
        error: {},
      })
    }

    const job = jobs[0]

    res.render("jobs/edit", {
      title: "Edit Job",
      job: job,
    })
  } catch (error) {
    console.error("Error loading job edit form:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading job edit form",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Handle job update (Staff only)
router.post("/:id", isAuthenticated, isStaff, async (req, res) => {
  try {
    const jobId = req.params.id
    const { title, description, location, experience, icon, colorScheme, startDate, endDate } = req.body

    // Update job in database
    await pool.query(
      `UPDATE jobs 
       SET title = ?, description = ?, location = ?, experience = ?, 
           icon = ?, color_scheme = ?, start_date = ?, end_date = ? 
       WHERE id = ?`,
      [title, description, location, experience, icon, colorScheme, startDate, endDate, jobId],
    )

    res.redirect(`/jobs/${jobId}`)
  } catch (error) {
    console.error("Error updating job:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error updating job",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Delete job (Staff only)
router.get("/:id/delete", isAuthenticated, isStaff, async (req, res) => {
  try {
    const jobId = req.params.id

    // Delete job from database
    await pool.query("DELETE FROM jobs WHERE id = ?", [jobId])

    res.redirect("/jobs")
  } catch (error) {
    console.error("Error deleting job:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error deleting job",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Apply for job form - add the middleware
router.get("/:id/apply", isAuthenticated, isJobAccessible, async (req, res) => {
  try {
    const jobId = req.params.id

    // Fetch job from database
    const [jobs] = await pool.query("SELECT * FROM jobs WHERE id = ?", [jobId])

    if (jobs.length === 0) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Job not found",
        error: {},
      })
    }

    const job = jobs[0]

    res.render("jobs/apply", {
      title: `Apply for ${job.title}`,
      job: job,
    })
  } catch (error) {
    console.error("Error loading application form:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading application form",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Then replace the job application submission route with this:

// Handle job application submission - add the middleware
router.post("/:id/apply", isAuthenticated, isJobAccessible, upload.single("cvFile"), async (req, res) => {
  try {
    const jobId = req.params.id
    const applicantId = req.user.id
    const { firstName, lastName, email, phone, alternatePhone, street, city, postalCode, previouslyWorked } = req.body

    // Check if already applied
    const [existingApplications] = await pool.query(
      "SELECT * FROM applications WHERE job_id = ? AND applicant_id = ?",
      [jobId, applicantId],
    )

    if (existingApplications.length > 0) {
      return res.render("error", {
        title: "Already Applied",
        message: "You have already applied for this job",
        error: {},
      })
    }

    // Process file upload if present
    let cvFilename = null
    let cvOriginalName = null
    let cvMimeType = null

    if (req.file) {
      cvFilename = req.file.filename
      cvOriginalName = req.file.originalname
      cvMimeType = req.file.mimetype
    }

    // Insert application into database
    await pool.query(
      `INSERT INTO applications (job_id, applicant_id, first_name, last_name, email, phone, 
        alternate_phone, street, city, postal_code, previously_worked, stage, 
        cv_filename, cv_original_name, cv_mime_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jobId,
        applicantId,
        firstName,
        lastName,
        email,
        phone,
        alternatePhone,
        street,
        city,
        postalCode,
        previouslyWorked === "yes",
        "New",
        cvFilename,
        cvOriginalName,
        cvMimeType,
      ],
    )

    res.redirect("/applicant/dashboard")
  } catch (error) {
    console.error("Error submitting application:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error submitting application",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

module.exports = router

