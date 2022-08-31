const User = require("../models/user.model");

const userEmailExists = async (email) => {
  try {
      const user = await User.findOne({ email });
    return user ? user : false;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error inesperado.",
    });
  }
};

const userIdExists = async (id) => {
  try {
      const user = await User.findById(id);
    return user ? user : false;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error inesperado.",
    });
  }
};

module.exports = {
  userEmailExists,
  userIdExists
};
