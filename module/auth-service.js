const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema for MongoDB
const userSchema = mongoose.Schema({
  userName: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  loginHistory: [{ dateTime: Date, userAgent: String }],
});

// Model for User
const User = mongoose.model('User', userSchema);

// Register User Function
const registerUser = async (userData) => {
    try {
        // Hash the password using bcryptjs
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Replace the original password with the hashed password
        userData.password = hashedPassword;

        const newUser = await User.create(userData);

        return newUser;
    } catch (err) {
        console.log(err);
        throw new Error("There was an error encrypting the password");
    }
};

const checkUser = async (userData) => {
    try {
      // Find the user by username 
      const user = await User.findOne({ userName: userData.userName });
  
      if (!user) {
        throw new Error(`User not found: ${userData.userName}`);
      }
  
      // Compare the entered password with the stored hashed password
      const isMatch = await bcrypt.compare(userData.password, user.password);
  
      if (!isMatch) {
        throw new Error(`Incorrect Password for user: ${userData.userName}`);
      }
  
      // Push login history
      user.loginHistory.push({
        dateTime: (new Date()).toString(),
        userAgent: userData.userAgent,
      });
  
      // Save updated user
      await user.save();
  
      return {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
  
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  };
  

module.exports = {
  registerUser,
  checkUser,
};
