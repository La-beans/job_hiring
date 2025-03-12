const pool = require("../config/database")

/**
 * Get all jobs
 * @returns {Promise<Array>} - Array of jobs
 */
async function getAllJobs() {
  try {
    const [rows] = await pool.query(`
      SELECT j.*, COUNT(a.id) as applications
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `)
    return rows
  } catch (error) {
    console.error("Error getting all jobs:", error)
    throw error
  }
}

/**
 * Get job by ID
 * @param {number} id - Job ID
 * @returns {Promise<Object|null>} - Job object or null if not found
 */
async function getJobById(id) {
  try {
    const [rows] = await pool.query(
      `
      SELECT j.*, COUNT(a.id) as applications
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.id = ?
      GROUP BY j.id
    `,
      [id],
    )

    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    console.error("Error getting job by ID:", error)
    throw error
  }
}

/**
 * Create a new job
 * @param {Object} jobData - Job data
 * @param {number} createdBy - ID of the staff member creating the job
 * @returns {Promise<Object>} - Newly created job
 */
async function createJob(jobData, createdBy) {
  try {
    const { title, description, location, experience, icon, colorScheme, startDate, endDate } = jobData

    const [result] = await pool.query(
      `INSERT INTO jobs (title, description, location, experience, icon, color_scheme, start_date, end_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, location, experience, icon, colorScheme, startDate, endDate, createdBy],
    )

    return getJobById(result.insertId)
  } catch (error) {
    console.error("Error creating job:", error)
    throw error
  }
}

/**
 * Update an existing job
 * @param {number} id - Job ID
 * @param {Object} jobData - Updated job data
 * @returns {Promise<Object>} - Updated job
 */
async function updateJob(id, jobData) {
  try {
    const { title, description, location, experience, icon, colorScheme, startDate, endDate } = jobData

    await pool.query(
      `UPDATE jobs 
       SET title = ?, description = ?, location = ?, experience = ?, 
           icon = ?, color_scheme = ?, start_date = ?, end_date = ?
       WHERE id = ?`,
      [title, description, location, experience, icon, colorScheme, startDate, endDate, id],
    )

    return getJobById(id)
  } catch (error) {
    console.error("Error updating job:", error)
    throw error
  }
}

/**
 * Delete a job
 * @param {number} id - Job ID
 * @returns {Promise<boolean>} - True if successful
 */
async function deleteJob(id) {
  try {
    const [result] = await pool.query("DELETE FROM jobs WHERE id = ?", [id])
    return result.affectedRows > 0
  } catch (error) {
    console.error("Error deleting job:", error)
    throw error
  }
}

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
}

