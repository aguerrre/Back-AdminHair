const { Schema, model } = require("mongoose");

// Schema User

const UserSchema = Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  img: { type: String, required: false },
  google_auth: { type: Boolean, default: false },
  is_confirmed: { type: Boolean, default: false },
});

// Edit ORM response for User instance
UserSchema.method("toJSON", function () {
  const { __v, _id, password, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model("User", UserSchema);
