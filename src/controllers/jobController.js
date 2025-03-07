const db = require('../config/database');

exports.getAllJobs = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM jobs ORDER BY created_at DESC');
    res.render('jobs/index', { 
      title: 'Job Listings',
      jobs: rows 
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Error fetching jobs' 
    });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).render('error', { 
        title: 'Not Found',
        message: 'Job not found' 
      });
    }
    res.render('jobs/show', { 
      title: rows[0].title,
      job: rows[0] 
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Error fetching job details' 
    });
  }
};

exports.getNewJobForm = (req, res) => {
  res.render('jobs/new', { title: 'Post a New Job' });
};

exports.createJob = async (req, res) => {
  const { title, description, location, experience } = req.body;
  try {
    await db.query(
      'INSERT INTO jobs (title, description, location, experience) VALUES (?, ?, ?, ?)',
      [title, description, location, experience]
    );
    res.redirect('/jobs');
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Error creating job' 
    });
  }
};

exports.getJobApplicationForm = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).render('error', { 
        title: 'Not Found',
        message: 'Job not found' 
      });
    }
    res.render('jobs/apply', { 
      title: 'Apply for ' + rows[0].title,
      job: rows[0] 
    });
  } catch (error) {
    console.error('Error fetching job for application:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Error loading application form' 
    });
  }
};

exports.submitJobApplication = async (req, res) => {
  const { name, email, phone, experience } = req.body;
  const jobId = req.params.id;
  
  try {
    await db.query(
      'INSERT INTO applications (job_id, name, email, phone, experience) VALUES (?, ?, ?, ?, ?)',
      [jobId, name, email, phone, experience]
    );
    res.render('jobs/application-success', { 
      title: 'Application Submitted',
      jobId: jobId
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Error submitting application' 
    });
  }
};