import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * @openapi
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *        - email
 *        - firstname
 *        - lastname
 *        - username
 *      properties:
 *        firstname:
 *          type: string
 *          default: Jane
 *        lastname:
 *          type: string
 *          default: Doe
 *        email: 
 *          type: string
 *          default: jane.doe@gmail.com
 *        username:
 *          type: string
 *          default: JaneDoe
 */

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Please enter an email'],
      unique: true,
    },
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: [true, 'Username already exists'],
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "subscriber"],
      default: "user"
    },
    photo: {
      type: String,
      default: "https://learnrapp.s3.amazonaws.com/default-images/default-profile.jpg"
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    resetPassword: {
      type: String,
      select: false,
    }
  },
  { timestamps: true }
);

// compare password
userSchema.methods.isCorrectPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// encrypting password before saving the user
userSchema.pre('save', async function (next) {
  try {
    // generate salt
    const salt = await bcrypt.genSalt(10);
    // generate hashed password
    const hashedPassword = await bcrypt.hash(this.password, salt);
    // assign hashed password to password field
    this.password = hashedPassword;
    // move on to next middleware
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model('User', userSchema);

export default User;
