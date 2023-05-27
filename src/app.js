// Import required modules
import express from "express";
// import mysql from "mysql";
import crypto from "crypto";

import dotenv from "dotenv";
import path from "path";
import expressEjsLayouts from "express-ejs-layouts";
import middleware from "./middleware.js";
import session from "express-session";
// import { connection } from "./database";
import { connection } from "./database.js";
dotenv.config();
const __dirname = new URL(".", import.meta.url).pathname;
// Create an Express app
const app = express();
// Middleware function example
app.set("view engine", "ejs");
app.set("views", "views");
app.use(expressEjsLayouts);
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(
  session({
    secret: "seesion-secret",
    resave: false,
    saveUninitialized: false,
  })
);
// Implement middleware in your application
app.use(middleware.middleware);
// Define route handlers
// app.get("/", (req, res) => {
//   res.send("Hello, world!");
// });

// Create a MySQL connection

// Connect to the MySQL server
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to Postgres:", err);
    return;
  }
  console.log("Connected to Postgres");
});

// Define routes
app.get("/", middleware.isAuthenticated, async (req, res) => {
  const result = await connection.query("SELECT * FROM posts");
  res.render("index", {
    posts: result.rows,
    session: req.session,
    title: "index",
  });
});

app.get("/register", async (req, res) => {
  res.render("register", {
    title: "register",
    session: req.session,
  });
});

app.post("/register", async (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;

  try {
    const result = await connection.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    console.log(user);
    if (user) {
      // User with the same email already exists
      res.render("register", {
        title: "register",
        session: req.session,
        error: "Email already registered",
      });
      return;
    }

    // const hashedPassword = crypto
    //   .createHash("md5")
    //   .update(password)
    //   .digest("hex");
    const hashedPassword = password;
    console.log(hashedPassword);

    // Create a new user in the database

    const getresult = await connection.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    // Registration successful
    res.redirect("/login");
  } catch (error) {
    console.log("Error occurred during registration:", error);
  }
});

app.get("/login", async (req, res) => {
  res.render("login", {
    title: "login",
    session: req.session,
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // const hashedPassword = crypto
    //   .createHash("md5")
    //   .update(password)
    //   .digest("hex");
    const hashedPassword = password;
    const result = await connection.query(
      `SELECT * FROM users WHERE password = '${hashedPassword}' AND email = '${email}'`
    );
    // console.log("🚀 ~ file: app.js:109 ~ app.post ~ result:", result);
    const user = result.rows[0];
    console.log("🚀 ~ file: app.js:127 ~ app.post ~ user:", user);
    if (user) {
      req.session.authenticated = true;
      req.session.userId = user.id;
      req.session.username = user.name;
      res.redirect("/");
      return;
    }
    // if (user) {
    //   if (hashedPassword === user.password) {
    //     // Login successful

    //   }
    // }
    res.render("login", { title: "login", session: req.session });
  } catch (error) {
    console.log("Error occurred during login:", error);
  }
});

app.get("/create-post", middleware.isAuthenticated, async (req, res) => {
  res.render("create-post", {
    session: req.session,
    title: "create-post",
  });
});

app.post("/create-post", middleware.isAuthenticated, async (req, res) => {
  if (!req.session.userId) {
    res.status(401).send("Unauthorized");
    return;
  }
  const user_id = req.session.userId;
  const title = req.body.title;
  const description = req.body.editor1;
  try {
    const result = await connection.query(
      "INSERT INTO posts (user_id, title, description) VALUES ($1, $2, $3) RETURNING *",
      [user_id, title, description]
    );
    // Success response
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    // Error response
    res.json({ success: false, message: "An error occurred while creating the post" });
  }
});


// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
