// Import required modules
import express from "express";
// import mysql from "mysql";

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
app.get("/", async (req, res) => {
  const result = await connection.query("SELECT * FROM posts");
  res.render("index", {
    posts: result.rows,
    session: req.session,
    title: "index",
  });
});

app.get("/login", async (req, res) => {
  res.render("login", { title: "login", session: req.session });
});

app.get("/create-post", async (req, res) => {
  res.render("create-post", {
    session: req.session,
    title: "create-post",
  });
});

app.post("/create-post", async (req, res) => {
  console.log(req.body)
  const user_id = 1;
  const title = req.body.title
  const description = req.body.editor1
  const result = await connection.query("INSERT INTO posts (user_id, title, description) VALUES ($1, $2, $3) RETURNING *", [user_id, title, description,])
  .catch(err => console.log(err))
  res.render("create-post", {
    session: req.session,
    title: "create-post",
  });
});



// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
