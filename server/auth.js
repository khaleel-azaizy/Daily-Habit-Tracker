const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function(req, res, next) {
  const token = req.cookies.token; 
 
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};