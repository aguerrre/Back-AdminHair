const { Router } = require("express");
const { check } = require("express-validator");

const { register, verify, login, renewToken, googleSignIn } = require("../controllers/auth.controller");
const { validateFields } = require("../middlewares/validation-forms");
const { validateJWT } = require("../middlewares/validation-jwt");

/**
 * Router const
 */
const router = Router();

/**
 * POST to login an user.
 */
router.post(
  "/login",
  [
    check("email", "El email debe ser válido").isEmail(),
    check("password", "La contraseña es obligatoria.").notEmpty(),
    validateFields,
  ],
  login
);
/**
 * POST to register a new user.
 */
router.post(
  "/register",
  [
    check("name", "El nombre es obligatorio").notEmpty(),
    check("email", "El email debe ser válido").isEmail(),
    check("password", "La contraseña no es válida.").matches(
      //Must have at least one digit, one lower case, one upper case and 8 or more characters
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
      "i"
      ),
    validateFields,
  ],
  register
);
/**
 * PUT to confirm an user's email. Change the property is_confirmed to true.
 */
router.put(
  "/verify/:token",
  [
    check("token", "No es un token válido").isJWT(),
    validateFields
  ],
  verify
);
/**
 * POST to register a user using Google Authentication
 */
router.post(
  "/google",
  [
    check("token", "El token de google es obligatorio").notEmpty(),
    validateFields,
  ],
  googleSignIn
);
/**
 * GET to validate and renew the JWT.
 */
router.get('/renew', [validateJWT], renewToken);

module.exports = router;
