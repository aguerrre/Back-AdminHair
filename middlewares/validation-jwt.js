const jwt = require("jsonwebtoken");

const validateJWT = (req, res, next) => {
  //Leer el token
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "Autenticación requerida.",
    });
  }

  try {
    //Verify token and if it is correct, add the uid from the payload to a request param.
    const { uid } = jwt.verify(token, process.env.JWT_SECRET);
    req.uid = uid;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      msg: "Token no válido.",
    });
  }
};

module.exports = {
  validateJWT,
};
