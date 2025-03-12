const express = require("express")
const router = express.Router()
const { isAuthenticated, isStaff, isApplicant } = require("../middleware/auth")
const pool = require("../config/database")
const schedulerService = require("../services/scheduler.service")

// Get all events for the authenticated user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const [events] = await pool.query("SELECT * FROM events WHERE user_id = ? AND user_type = ?", [
      req.user.id,
      req.user.role,
    ])

    res.render("calendar/index", {
      title: "Calendar",
      events,
      user: req.user,
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    res.status(500).render("error", { message: "Error fetching events" })
  }
})

// Create a new event
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { title, description, start_date, end_date, event_type } = req.body
    const [result] = await pool.query(
      "INSERT INTO events (title, description, start_date, end_date, user_id, user_type, event_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, description, start_date, end_date, req.user.id, req.user.role, event_type],
    )

    // Schedule a reminder for the new event
    schedulerService.scheduleReminders()

    res.redirect("/calendar")
  } catch (error) {
    console.error("Error creating event:", error)
    res.status(500).render("error", { message: "Error creating event" })
  }
})

// Update an event
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { title, description, start_date, end_date, event_type, status } = req.body
    await pool.query(
      "UPDATE events SET title = ?, description = ?, start_date = ?, end_date = ?, event_type = ?, status = ? WHERE id = ? AND user_id = ? AND user_type = ?",
      [title, description, start_date, end_date, event_type, status, req.params.id, req.user.id, req.user.role],
    )

    // Reschedule reminders after updating the event
    schedulerService.scheduleReminders()

    res.redirect("/calendar")
  } catch (error) {
    console.error("Error updating event:", error)
    res.status(500).render("error", { message: "Error updating event" })
  }
})

// Delete an event
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    await pool.query("DELETE FROM events WHERE id = ? AND user_id = ? AND user_type = ?", [
      req.params.id,
      req.user.id,
      req.user.role,
    ])

    res.redirect("/calendar")
  } catch (error) {
    console.error("Error deleting event:", error)
    res.status(500).render("error", { message: "Error deleting event" })
  }
})

module.exports = router

