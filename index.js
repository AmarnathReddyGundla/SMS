
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const collection3 = require("./models/students");
const hbs = require("hbs");

const port = 4000;

// MongoDB Connection
mongoose
  .connect("mongodb+srv://amarnath:amarvedha2@cluster0.6dac6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views")); // Use the "views" folder for templates

let loginError = false;
let signupError = false;

// Routes
app.get("/", (req, res) => {
  res.render("index", { loginError, signupError });
});

app.get("/signup", (req, res) => {
  res.render("index", { loginError, signupError });
});

app.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.signuppassword, 10);
    const data = {
      _id: new mongoose.Types.ObjectId(),
      name: req.body.signupname,
      password: hashedPassword,
    };

    const checking = await collection3.findOne({ name: req.body.signupname });

    if (req.body.signuppassword === req.body.passwordcheck) {
      if (checking) {
        signupError = true;
        const signupErrorMessage = "User details already exist. Please sign in.";
        return res.render("index", { signupErrorMessage, hideSignupButton: true, loginError, signupError });
      } else {
        await collection3.insertMany([data]);
        const success = "Account has been created. Please Sign-In.";
        return res.render("index", { success, loginError: false, signupError: false });
      }
    } else {
      signupError = true;
      const signupErrorMessage = "Passwords do not match. Please try again.";
      return res.render("index", { signupErrorMessage, loginError: false, signupError: true });
    }
  } catch (error) {
    signupError = true;
    const signupErrorMessage = "An error occurred during signup. Please try again.";
    return res.render("index", { signupErrorMessage, loginError: false, signupError: true });
  }
});

app.post("/login", async (req, res) => {
  try {
    const check = await collection3.findOne({ name: req.body.loginname });

    if (check && (await bcrypt.compare(req.body.loginpassword, check.password))) {
      loginError = false;
      signupError = false;
      console.log(`Logged in user ID: ${check._id}`);
      return res.redirect("/");
    } else {
      loginError = true;
      const loginErrorMessage = "Invalid login credentials. Please try again.";
      return res.render("index", { loginErrorMessage, loginError, signupError });
    }
  } catch (error) {
    loginError = true;
    const loginErrorMessage = "An error occurred. Please create an account before signing in.";
    return res.render("index", { loginErrorMessage, loginError, signupError });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
