const pool = require("../config/database")

/**
 * Get all applications
 * @returns {Promise<Array>} - Array of applications
 */
async function getAllApplications() {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, j.title as job_title, ap.name as applicant_name, ap.email as applicant_email
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN applicants ap ON a.applicant_id = ap.id
      ORDER BY a.application_date DESC
    `)
    return rows
  } catch (error) {
    console.error("Error getting all applications:", error)
    throw error
  }
}

/**
 * Get applications by job ID
 * @param {number} jobId - Job ID
 * @returns {Promise<Array>} - Array of applications for the job
 */
async function getApplicationsByJobId(jobId) {
  try {
    const [rows] = await pool.query(
      `
      SELECT a.*, ap.name as applicant_name, ap.email as applicant_email, ap.avatar as applicant_avatar
      FROM applications a
      JOIN applicants ap ON a.applicant_id = ap.id
      WHERE a.job_id = ?
      ORDER BY a.application_date DESC
    `,
      [jobId],
    )
    return rows
  } catch (error) {
    console.error("Error getting applications by job ID:", error)
    throw error
  }
}

/**
 * Get applications by applicant ID
 * @param {number} applicantId - Applicant ID
 * @returns {Promise<Array>} - Array of applications by the applicant
 */
async function getApplicationsByApplicantId(applicantId) {
  try {
    const [rows] = await pool.query(
      `
      SELECT a.*, j.title as job_title, j.location as job_location, j.icon as job_icon
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.applicant_id = ?
      ORDER BY a.application_date DESC
    `,
      [applicantId],
    )
    return rows
  } catch (error) {
    console.error("Error getting applications by applicant ID:", error)
    throw error
  }
}

/**
 * Create a new application
 * @param {Object} applicationData - Application data
 * @returns {Promise<Object>} - Newly created application
 */
async function createApplication(applicationData) {
  try {
    const { applicantId, jobId } = applicationData

    // Check if applicant has already applied for this job
    const [existingApplication] = await pool.query("SELECT * FROM applications WHERE applicant_id = ? AND job_id = ?", [
      applicantId,
      jobId,
    ])

    if (existingApplication.length > 0) {
      throw new Error("You have already applied for this job")
    }

    const [result] = await pool.query("INSERT INTO applications (applicant_id, job_id) VALUES (?, ?)", [
      applicantId,
      jobId,
    ])

    const [newApplication] = await pool.query("SELECT * FROM applications WHERE id = ?", [result.insertId])

    return newApplication[0]
  } catch (error) {
    console.error("Error creating application:", error)
    throw error
  }
}

/**
 * Update application status
 * @param {number} id - Application ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated application
 */
async function updateApplicationStatus(id, status) {
  try {
    await pool.query("UPDATE applications SET status = ? WHERE id = ?", [status, id])

    const [updatedApplication] = await pool.query("SELECT * FROM applications WHERE id = ?", [id])

    return updatedApplication[0]
  } catch (error) {
    console.error("Error updating application status:", error)
    throw error
  }
}

module.exports = {
  getAllApplications,
  getApplicationsByJobId,
  getApplicationsByApplicantId,
  createApplication,
  updateApplicationStatus,
}

