const db = require('../config/database');

exports.getAllCandidates = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM candidates ORDER BY created_at DESC');
    res.render('candidates/index', { 
      title: 'Candidates',
      candidates: rows 
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Error fetching candidates' 
    });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM candidates WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).render('error', { 
        title: 'Not Found',
        message: 'Candidate not found' 
      });
    }
    res.render('candidates/show', { 
      title: rows[0].name,
      candidate: rows[0] 
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Error fetching candidate details' 
    });
  }
};