const express = require("express")
const router = express.Router()
const { isAuthenticated, isStaff } = require("../middleware/auth")

// Candidates list (Staff only)
router.get("/", isAuthenticated, isStaff, async (req, res) => {
  try {
    // Mock data for demonstration
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

    res.render("candidates/index", {
      title: "Candidates",
      applicants,
      filter: "All",
      month: "March 2023",
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error loading candidates:", error)
    res.status(500).render("error", { message: "Error loading candidates" })
  }
})

// Candidate details
router.get("/:id", isAuthenticated, isStaff, async (req, res) => {
  try {
    const candidateId = req.params.id

    // Mock candidate data
    const candidate = {
      id: candidateId,
      name: "Charlie Kristen",
      avatar: "/images/avatar.png",
      appliedRole: "Sr. UX Designer",
      applicationDate: "12/02/23",
      stage: "Design Challenge",
      email: "charlie.k@gmail.com",
      phone: "+1 542-544-4433",
    }

    res.render("candidates/details", {
      title: candidate.name,
      candidate,
      user: req.session.user,
    })
  } catch (error) {
    console.error("Error loading candidate details:", error)
    res.status(500).render("error", { message: "Error loading candidate details" })
  }
})

// Update candidate stage
router.post("/:id/stage", isAuthenticated, isStaff, async (req, res) => {
  try {
    const candidateId = req.params.id
    const { stage } = req.body

    // In a real app, update candidate stage in database

    res.redirect("/candidates")
  } catch (error) {
    console.error("Error updating candidate stage:", error)
    res.status(500).render("error", { message: "Error updating candidate stage" })
  }
})

module.exports = router

