const express = require("express")
const router = express.Router()
const { isAuthenticated, isStaff } = require("../middleware/auth")
const pool = require("../config/database")
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

// Documents page (Staff only)
router.get("/", isAuthenticated, isStaff, async (req, res) => {
  try {
    // Fetch all jobs with applications that have documents
    const [jobs] = await pool.query(`
      SELECT DISTINCT 
        j.id,
        j.title,
        j.icon,
        j.color_scheme
      FROM jobs j
      JOIN applications a ON j.id = a.job_id
      WHERE a.cv_filename IS NOT NULL
      ORDER BY j.title
    `)

    // For each job, fetch the candidates and their documents
    const jobsWithDocuments = await Promise.all(
      jobs.map(async (job) => {
        const [candidates] = await pool.query(
          `
          SELECT 
            a.id as application_id,
            ap.id as applicant_id,
            ap.name as applicant_name,
            a.cv_filename,
            a.cv_original_name,
            a.cv_mime_type,
            a.created_at as application_date
          FROM applications a
          JOIN applicants ap ON a.applicant_id = ap.id
          WHERE a.job_id = ? AND a.cv_filename IS NOT NULL
          ORDER BY ap.name
        `,
          [job.id],
        )

        // Map color scheme to CSS classes
        const colorMap = {
          blue: "blue-bg",
          red: "red-bg",
          yellow: "yellow-bg",
          green: "green-bg",
        }

        return {
          ...job,
          colorClass: colorMap[job.color_scheme] || "blue-bg",
          candidates: candidates,
        }
      }),
    )

    res.render("documents/index", {
      title: "Documents",
      jobsWithDocuments,
    })
  } catch (error) {
    console.error("Error loading documents:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error loading documents",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Document download route
router.get("/:id/download", isAuthenticated, isStaff, async (req, res) => {
  try {
    const applicationId = req.params.id

    // Fetch document information
    const [applications] = await pool.query(
      `
      SELECT 
        cv_filename,
        cv_original_name,
        cv_mime_type
      FROM applications
      WHERE id = ?
    `,
      [applicationId],
    )

    if (applications.length === 0 || !applications[0].cv_filename) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Document not found",
        error: {},
      })
    }

    const { cv_filename, cv_original_name, cv_mime_type } = applications[0]

    // Construct file path
    const filePath = path.join(__dirname, "../uploads", cv_filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).render("error", {
        title: "File Not Found",
        message: "The requested file does not exist on the server.",
        error: {},
      })
    }

    // Set appropriate headers
    res.setHeader("Content-Type", cv_mime_type)
    res.setHeader("Content-Disposition", `attachment; filename="${cv_original_name}"`)

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  } catch (error) {
    console.error("Error downloading document:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error downloading document",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Document preview route
router.get("/:id/preview", isAuthenticated, isStaff, async (req, res) => {
  try {
    const applicationId = req.params.id

    // Fetch document information
    const [applications] = await pool.query(
      `
      SELECT 
        cv_filename,
        cv_original_name,
        cv_mime_type
      FROM applications
      WHERE id = ?
    `,
      [applicationId],
    )

    if (applications.length === 0 || !applications[0].cv_filename) {
      return res.status(404).render("error", {
        title: "Not Found",
        message: "Document not found",
        error: {},
      })
    }

    const { cv_filename, cv_original_name, cv_mime_type } = applications[0]

    // Construct file path
    const filePath = path.join(__dirname, "../uploads", cv_filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).render("error", {
        title: "File Not Found",
        message: "The requested file does not exist on the server.",
        error: {},
      })
    }

    // For PDF files, we can display them inline in the browser
    if (cv_mime_type === "application/pdf") {
      res.setHeader("Content-Type", cv_mime_type)
      res.setHeader("Content-Disposition", `inline; filename="${cv_original_name}"`)

      // Stream the file to the response
      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(res)
    } else {
      // For other file types, redirect to download
      res.redirect(`/documents/${applicationId}/download`)
    }
  } catch (error) {
    console.error("Error previewing document:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error previewing document",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

// Upload document route (for testing purposes)
router.post("/upload", isAuthenticated, isStaff, upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).render("error", {
        title: "Error",
        message: "No file uploaded",
        error: {},
      })
    }

    const { applicationId } = req.body

    // Update the application record with file information
    await pool.query(
      `
      UPDATE applications
      SET 
        cv_filename = ?,
        cv_original_name = ?,
        cv_mime_type = ?
      WHERE id = ?
    `,
      [req.file.filename, req.file.originalname, req.file.mimetype, applicationId],
    )

    res.redirect("/documents")
  } catch (error) {
    console.error("Error uploading document:", error)
    res.status(500).render("error", {
      title: "Error",
      message: "Error uploading document",
      error: process.env.NODE_ENV === "development" ? error : {},
    })
  }
})

module.exports = router

