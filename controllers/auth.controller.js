const { response } = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const { userEmailExists, userIdExists } = require("../helpers/user-exists");
const { generateJwtToken } = require("../helpers/jwt-helpers");
const { email_template } = require("../helpers/email-template");
const { googleVerify } = require("../helpers/google-verify");

// Transporter object to send emails.
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Creates a new user.
 *
 * @param {Request} req
 * @param {Response} res
 */
const register = async (req, res = response) => {
  try {
    if (await userEmailExists(req.body.email)) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe un usuario con ese email.",
      });
    }

    // Encrypt password
    const salt = bcrypt.genSaltSync();
    req.body.password = bcrypt.hashSync(req.body.password, salt);

    // Create instance of User and save.
    const user = new User(req.body);
    const createdUser = await user.save();

    if (!createdUser) {
      return res.status(404).json({
        ok: false,
        msg: "No se ha podido guardar el usuario.",
      });
    }
    //Generate a verification token with the created user id.
    const verificationToken = await generateJwtToken(createdUser._id);

    // URL to endpoint to verify token
    const url = `${process.env.FRONT_URL}/verificacion/${verificationToken}`;

    // Sending email with nodemailer.
    transporter.sendMail({
      to: createdUser.email,
      subject: "Verificación de cuenta AdminHair",
      html: email_template(url, createdUser.name),
    });
    // https://faun.pub/verifying-emails-b95a0c1c3809
    return res.status(201).json({
      ok: true,
      email: createdUser.email,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error inesperado.",
    });
  }
};

/**
 * Verify the email by turning is_confirmed property to true.
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
const verify = async (req, res = response) => {
  const token = req.params.token;
  if (!token) {
    return res.status(422).json({
      ok: false,
      msg: "El token no es válido.",
    });
  }

  // Verify token
  let payload = null;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error inesperado.",
    });
  }

  // Find user with id in the token provided
  try {
    const user = await userIdExists(payload.uid);
    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: "El usuario no existe en la base de datos.",
      });
    }

    // Update user.is_confirmed to true
    user.is_confirmed = true;
    await user.save();

    return res.status(200).json({
      ok: true,
      msg: "Cuenta verificada",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error inesperado.",
    });
  }
};

/**
 * Returns a valid JWT if the email and password matches.
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
const login = async (req, res = response) => {
  try {
    const { email, password } = req.body;
    // Verify email
    const user = await userEmailExists(email);
    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: "Las credenciales son incorrectas",
      });
    }
    if (!user.is_confirmed) {
      return res.status(401).json({
        ok: false,
        msg: "Debe activar su cuenta. Compruebe su bandeja de correo electrónico.",
      });
    }
    // Verify password
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(404).json({
        ok: false,
        msg: "Las credenciales son incorrectas.",
      });
    }
    // Generate token and response
    const token = await generateJwtToken(user._id);

    return res.status(200).json({
      ok: true,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error inesperado.",
    });
  }
};

const googleSignIn = async (req, res = response) => {
  try {
    const { email, name, picture } = await googleVerify(req.body.token);
    const userDb = await User.findOne({ email });
    //Check if the user exists. If it exists, change google_auth property to true, if not, is created.
    let user = userDb
      ? userDb
      : new User({
          name,
          email,
          password: "###",
          img: picture,
          google_auth: true,
          is_confirmed: true,
        });
    user.google_auth = true;
    user.is_confirmed = true;
    // Save user
    user = await user.save();
    // Generate token
    const token = await generateJwtToken(user.id);
    return res.status(200).json({
      ok: true,
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      ok: false,
      msg: "El token de google no es correcto.",
    });
  }
};

/**
 * Renews and validates (through validateJwt middleware function) a JWT.
 *
 * @param {*} req
 * @param {*} res
 */
const renewToken = async (req, res = response) => {
  try {
    // Gets the uid from the request param added in the validateJwt middleware.
    const uid = req.uid;
    // Generate token and return the token and user.
    const token = await generateJwtToken(uid);
    const user = await User.findById(uid);

    res.json({
      ok: true,
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      ok: false,
      msg: "Error inesperado",
    });
  }
};

module.exports = {
  register,
  verify,
  login,
  renewToken,
  googleSignIn,
};
