const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect("/")
}

const isStaff = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "staff") {
    return next()
  }
  res.redirect("/")
}

const isApplicant = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "applicant") {
    return next()
  }
  res.redirect("/")
}

module.exports = {
  isAuthenticated,
  isStaff,
  isApplicant,
}

