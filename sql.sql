CREATE DATABASE job_portal;
USE job_portal;

CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  experience VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  experience TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

CREATE TABLE candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  experience TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Insert into jobs (title, DESCRIPTION, location, experience) values
('Full Stack Developer', 'We are looking for a Full Stack Developer to join our team. The ideal candidate should have experience with JavaScript, Node.js, and React.', 'Remote', '3+ years'),
('Frontend Developer', 'We are looking for a Frontend Developer to join our team. The ideal candidate should have experience with JavaScript, React, and Redux.', 'Remote', '2+ years'),
('Backend Developer', 'We are looking for a Backend Developer to join our team. The ideal candidate should have experience with Node.js, Express, and MongoDB.', 'Remote', '2+ years');