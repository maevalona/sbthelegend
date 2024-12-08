import express from "express";
import { engine } from "express-handlebars";
import pg from "pg";
const { Pool } = pg;
import cookieParser from "cookie-parser";
import multer from "multer";
const upload = multer({ dest: "public/uploads/" });
import sessions from "express-session";
import bbz307 from "bbz307";
/* import bcrypt from "bcrypt"; */

export function createApp(dbconfig) {
  const app = express();

  const pool = new Pool(dbconfig);
  const login = new bbz307.Login("users", ["email", "passwort"], pool);

  app.engine("handlebars", engine());
  app.set("view engine", "handlebars");
  app.set("views", "./views");

  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    sessions({
      secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
      saveUninitialized: true,
      cookie: { maxAge: 86400000, secure: false },
      resave: false,
    })
  );

  app.get("/register", (req, res) => {
    res.render("register");
  });
  app.post("/register", upload.none(), async (req, res) => {
    const user = await login.registerUser(req);
    if (user) {
      res.redirect("/login");
      return;
    } else {
      res.redirect("/register");
      return;
    }
  });
  app.get("/", async function (req, res) {
    const user = await login.loggedInUser(req); // <--
    if (!user) {
      // <--
      res.redirect("/login"); // <--
      return; // <--
    }
    const posts = await pool.query("SELECT * FROM posts");
    res.render("start", { posts: posts.rows });
  });
  app.get("/login", (req, res) => {
    res.render("login");
  });
  app.post("/login", upload.none(), async (req, res) => {
    const user = await login.loginUser(req);
    if (!user) {
      res.redirect("/login");
      return;
    } else {
      res.redirect("/");
      return;
    }
  });
  app.get("/intern", async (req, res) => {
    const user = await login.loggedInUser(req); // <--
    if (!user) {
      // <--
      res.redirect("/login"); // <--
      return; // <--
    } // <--
    res.render("intern", { user: user });
  });

  app.get("/posts/:id", async function (req, res) {
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [
      req.params.id,
    ]);
    res.render("details", { post: post.rows[0] });
  });

  app.post("/like/:id", async function (req, res) {
    const user = await login.loggedInUser(req);
    if (!user) {
      res.redirect("/login");
      return;
    }
    await app.locals.pool.query(
      "INSERT INTO likes (posts_id, users_id) VALUES ($1, $2)",
      [req.params.id, user.id]
    );
    res.redirect("/");
  });

  app.post(
    "/create_post",
    upload.single("file_name"),
    async function (req, res) {
      await app.locals.pool.query(
        "INSERT INTO posts (titel, inhalt, file_name) VALUES ($1, $2, $3)",
        [req.body.titel, req.body.inhalt, req.file.filename]
      );
      res.redirect("/");
    }
  );

  app.locals.pool = pool;

  return app;
}

export { upload };
