const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri = 'mongodb://localhost:27017/UserDetails';

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));

// Define user schema and model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String }
});

const UserModel = mongoose.model("User", UserSchema);

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const userData = await UserModel.findOne({ email });
    
    if (!userData) {
      console.log('User not found');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    // Validate password
    if (password === userData.password) {
      console.log('Password validated');
      res.json({ message: "Logged in successfully" });
    } else {
      console.log('Invalid password');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

  } catch (err) {
    console.error('Error in login route:', err);
    res.status(500).send('Server Error');
  }
});






// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Use environment variables
    pass: process.env.EMAIL_PASS // Use environment variables
  }
});

// Function to generate a random 4-digit OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}


// Email validation route
app.post("/emailValidation", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Received forgot password request for email:", email);

    // Find user by email
    const user = await UserModel.findOne({ email });

    // If user is found
    if (user) {
      // Generate OTP
      const otp = generateOTP();

      // Store OTP in user's record
      user.otp = otp;
      await user.save();


      // Send OTP to user's email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}`
      };
      setTimeout(async () => {
        try {
          user.otp = null;
          await user.save();
          console.log(`OTP for user ${user.email} has been deleted.`);
        } catch (error) {
          console.error(`Failed to delete OTP for user ${user.email}:`, error);
        }
      }, 180000); // 3 minutes in milliseconds
      

      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          res.status(500).json({ message: "Failed to send OTP. Please try again later." });
        } else {
          console.log("OTP sent successfully:", info.response);
          // Respond with success message and isEmailValid = true
          res.json({ message: "OTP sent to your email. Please check your inbox.", isEmailValid: true });
        }
      });
    } else {
      // User not found, send error response and isEmailValid = false
      console.log("User not found in the database.");
      res.json({ message: "User not found", isEmailValid: false });
    }
  } catch (error) {
    // Error occurred, send internal server error response
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", isEmailValid: false });
  }
});

// Secret code validation route
app.post("/codeValidation", async (req, res) => {
  try {
    const { email, secretCode } = req.body;

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (user && user.otp === secretCode) {
      res.json({ message: "OTP matched", isSecretCodeValid: true });
    } else {
      res.json({ message: "OTP doesn't match. Please try again", isSecretCodeValid: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", isSecretCodeValid: false });
  }
});

// Password reset route
app.post("/passwordReset", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await UserModel.findOne({ email });

    if (user) {
      user.password = newPassword;
      await user.save();
      res.json({ message: "Password Updated Successfully", isPasswordUpdated: true });
    } else {
      res.json({ message: "User not found", isPasswordUpdated: false });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", isPasswordUpdated: false });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
