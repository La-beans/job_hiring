// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      return next()
    }
    res.redirect("/")
  }
  
  const isStaff = (req, res, next) => {
    if (req.session.user && req.session.user.role === "staff") {
      return next()
    }
    res.redirect("/")
  }
  
  const isApplicant = (req, res, next) => {
    if (req.session.user && req.session.user.role === "applicant") {
      return next()
    }
    res.redirect("/")
  }
  
  module.exports = {
    isAuthenticated,
    isStaff,
    isApplicant,
  }
  
  