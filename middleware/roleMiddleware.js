module.exports = function (allowedRoles) {
  return (req, res, next) => {

    console.log("USER DATA:", req.user);   // DEBUG

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();
  };
};