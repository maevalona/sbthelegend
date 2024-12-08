import { createApp, upload } from "./config.js";

const app = createApp({
  user: "silmae",
  host: "bbz.cloud",
  database: "silmae",
  password: "HX+)RcG;%/d2n[B!",
  port: 30211,
});

/* Startseite */

app.get("/impressum", async function (req, res) {
  res.render("impressum", {});
});

app.get("/new_post", async function (req, res) {
  res.render("new_post", {});
});

/* Wichtig! Diese Zeilen müssen immer am Schluss der Website stehen! */
app.listen(3010, () => {
  console.log(`Example app listening at http://localhost:3010`);
});
