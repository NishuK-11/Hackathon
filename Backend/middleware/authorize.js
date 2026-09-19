const authorize = (...roles) => {
  
  return (req, res, next) => {

        // console.log("========== AUTHORIZE ==========");
        // console.log("REQ.USER:", req.user);
        // console.log("REQ.USER ROLE:", req.user?.role);
        // console.log("ALLOWED ROLES:", roles);
    if (!roles.includes(req.user.role)) {
        console.log("USER ROLE:", req.user.role);

      return res.status(403).json({ msg: "Access denied" });
    }
    next();
  };
};

module.exports = authorize;
