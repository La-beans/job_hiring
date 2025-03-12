const bcrypt = require("bcryptjs")
const pool = require("../config/database")

/**
 * Authenticate a staff member
 * @param {string} email - Staff email
 * @param {string} password - Staff password
 * @returns {Promise<Object|null>} - Staff user object or null if authentication fails
 */
async function authenticateStaff(email, password) {
  try {
    const [rows] = await pool.query("SELECT * FROM staff WHERE email = ?", [email])
    if (rows.length === 0) {
      return null
    }

    const user = rows[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
      // Don't return the password
      delete user.password
      user.role = "staff"
      return user
    }

    return null
  } catch (error) {
    console.error("Error authenticating staff:", error)
    throw error
  }
}

/**
 * Authenticate an applicant
 * @param {string} email - Applicant email
 * @param {string} password - Applicant password
 * @returns {Promise<Object|null>} - Applicant user object or null if authentication fails
 */
async function authenticateApplicant(email, password) {
  try {
    const [rows] = await pool.query("SELECT * FROM applicants WHERE email = ?", [email])
    if (rows.length === 0) {
      return null
    }

    const user = rows[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
      // Don't return the password
      delete user.password
      user.role = "applicant"
      return user
    }

    return null
  } catch (error) {
    console.error("Error authenticating applicant:", error)
    throw error
  }
}

/**
 * Register a new applicant
 * @param {Object} applicantData - Applicant registration data
 * @returns {Promise<Object>} - Newly created applicant
 */
async function registerApplicant(applicantData) {
  try {
    const { name, email, password, dateOfBirth } = applicantData

    // Check if email already exists
    const [existingUser] = await pool.query("SELECT * FROM applicants WHERE email = ?", [email])
    if (existingUser.length > 0) {
      throw new Error("Email already in use")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new applicant
    const [result] = await pool.query(
      "INSERT INTO applicants (name, email, password, date_of_birth) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, dateOfBirth],
    )

    // Get the newly created applicant (without password)
    const [newApplicant] = await pool.query(
      "SELECT id, name, email, date_of_birth, avatar, created_at FROM applicants WHERE id = ?",
      [result.insertId],
    )

    return { ...newApplicant[0], role: "applicant" }
  } catch (error) {
    console.error("Error registering applicant:", error)
    throw error
  }
}

module.exports = {
  authenticateStaff,
  authenticateApplicant,
  registerApplicant,
}

