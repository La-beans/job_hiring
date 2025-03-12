const pool = require("../config/database")

/**
 * Get all events
 * @returns {Promise<Array>} - Array of events
 */
async function getAllEvents() {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, j.title as job_title
      FROM events e
      LEFT JOIN jobs j ON e.job_id = j.id
      ORDER BY e.start_date ASC
    `)
    return rows
  } catch (error) {
    console.error("Error getting all events:", error)
    throw error
  }
}

/**
 * Get events by date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array of events in the date range
 */
async function getEventsByDateRange(startDate, endDate) {
  try {
    const [rows] = await pool.query(
      `
      SELECT e.*, j.title as job_title
      FROM events e
      LEFT JOIN jobs j ON e.job_id = j.id
      WHERE 
        (e.start_date BETWEEN ? AND ?) OR
        (e.end_date BETWEEN ? AND ?) OR
        (e.start_date <= ? AND e.end_date >= ?)
      ORDER BY e.start_date ASC
    `,
      [startDate, endDate, startDate, endDate, startDate, endDate],
    )
    return rows
  } catch (error) {
    console.error("Error getting events by date range:", error)
    throw error
  }
}

/**
 * Get events by job ID
 * @param {number} jobId - Job ID
 * @returns {Promise<Array>} - Array of events for the job
 */
async function getEventsByJobId(jobId) {
  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM events
      WHERE job_id = ?
      ORDER BY start_date ASC
    `,
      [jobId],
    )
    return rows
  } catch (error) {
    console.error("Error getting events by job ID:", error)
    throw error
  }
}

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @param {number} createdBy - ID of the staff member creating the event
 * @returns {Promise<Object>} - Newly created event
 */
async function createEvent(eventData, createdBy) {
  try {
    const { title, description, startDate, endDate, jobId } = eventData

    const [result] = await pool.query(
      `INSERT INTO events (title, description, start_date, end_date, job_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, startDate, endDate, jobId || null, createdBy],
    )

    const [newEvent] = await pool.query("SELECT * FROM events WHERE id = ?", [result.insertId])

    return newEvent[0]
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
  }
}

/**
 * Update an existing event
 * @param {number} id - Event ID
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>} - Updated event
 */
async function updateEvent(id, eventData) {
  try {
    const { title, description, startDate, endDate, jobId } = eventData

    await pool.query(
      `UPDATE events 
       SET title = ?, description = ?, start_date = ?, end_date = ?, job_id = ?
       WHERE id = ?`,
      [title, description, startDate, endDate, jobId || null, id],
    )

    const [updatedEvent] = await pool.query("SELECT * FROM events WHERE id = ?", [id])

    return updatedEvent[0]
  } catch (error) {
    console.error("Error updating event:", error)
    throw error
  }
}

/**
 * Delete an event
 * @param {number} id - Event ID
 * @returns {Promise<boolean>} - True if successful
 */
async function deleteEvent(id) {
  try {
    const [result] = await pool.query("DELETE FROM events WHERE id = ?", [id])
    return result.affectedRows > 0
  } catch (error) {
    console.error("Error deleting event:", error)
    throw error
  }
}

module.exports = {
  getAllEvents,
  getEventsByDateRange,
  getEventsByJobId,
  createEvent,
  updateEvent,
  deleteEvent,
}

