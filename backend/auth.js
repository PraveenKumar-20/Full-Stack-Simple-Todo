const jwt = require("jsonwebtoken");

const JWT_SECRET = "PRAVEEN_APP";

function auth(req, res, next) {
  const token = req.headers.token;

  const response = jwt.verify(token, JWT_SECRET);

  if (response) {
    req.userId = jwt.decode(token);
    next();
  } else {
    res.status(403).send({
      message: "Incorrect Credentials",
    });
  }
}

module.exports = {
  auth,
  JWT_SECRET,
};
