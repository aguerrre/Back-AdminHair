const jwt = require("jsonwebtoken");

const generateJwtToken = async (id) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { uid: id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("No se pudo generar el JWT");
        } else {
          resolve(token);
        }
      }
    );
  });
};

module.exports = {
    generateJwtToken
}