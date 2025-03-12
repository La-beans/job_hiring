const schedule = require("node-schedule")
const pool = require("../config/database")
const nodemailer = require("nodemailer")

// Configure nodemailer (you'll need to set up your email service)
const transporter = nodemailer.createTransport({
  // Add your email service configuration here
})

class SchedulerService {
  constructor() {
    this.jobs = new Map()
  }

  async scheduleReminders() {
    const [events] = await pool.query("SELECT * FROM events WHERE start_date > NOW() AND reminder_sent = FALSE")

    events.forEach((event) => {
      const reminderTime = new Date(event.start_date)
      reminderTime.setHours(reminderTime.getHours() - 24) // Set reminder 24 hours before the event

      const job = schedule.scheduleJob(reminderTime, () => this.sendReminder(event))
      this.jobs.set(event.id, job)
    })
  }

  async sendReminder(event) {
    try {
      const [user] = await pool.query(`SELECT * FROM ${event.user_type}s WHERE id = ?`, [event.user_id])

      if (user.length === 0) {
        console.error(`User not found for event ${event.id}`)
        return
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user[0].email,
        subject: `Reminder: ${event.title}`,
        text: `This is a reminder for your upcoming event: ${event.title} on ${event.start_date}`,
      }

      await transporter.sendMail(mailOptions)

      await pool.query("UPDATE events SET reminder_sent = TRUE WHERE id = ?", [event.id])

      console.log(`Reminder sent for event ${event.id}`)
    } catch (error) {
      console.error(`Error sending reminder for event ${event.id}:`, error)
    }
  }

  async updateEventStatuses() {
    const [events] = await pool.query('SELECT * FROM events WHERE end_date < NOW() AND status = "scheduled"')

    for (const event of events) {
      await pool.query('UPDATE events SET status = "completed" WHERE id = ?', [event.id])
      console.log(`Event ${event.id} status updated to completed`)
    }
  }

  scheduleStatusUpdates() {
    // Run status updates every hour
    schedule.scheduleJob("0 * * * *", () => this.updateEventStatuses())
  }

  init() {
    this.scheduleReminders()
    this.scheduleStatusUpdates()
  }
}

module.exports = new SchedulerService()

