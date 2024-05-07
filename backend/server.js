import express from "express";
import mysql from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  })
);

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ecg_registry",
});

db.connect(function (err) {
  if (err) {
    console.log("Connetion error");
  } else {
    console.log("Connected");
  }
});

//Get all letters
app.get("/letter", (req, res) => {
  const sql = "SELECT * FROM letter";
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

/* app.get("/letter", (req, res) => {
  const sql =
    "SELECT letter.cx_reference, letter.cx_name, letter.cx_tel, letter.cx_category, category.cat_id, category.cat_name FROM letter, category WHERE letter.cx_category = category.cat_id";
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
}); */

app.post("/auth/adminlogin", (req, res) => {
  const sql = "SELECT * from admin WHERE email = ? AND password = ?";
  db.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie("token", token);
      return res.json({ loginStatus: true });
    } else {
      return res.json({ loginStatus: false, Error: "Wrong email or Password" });
    }
  });
});

app.post("/create", (req, res) => {
  const sql =
    "INSERT INTO letter (cx_reference, cx_name, cx_tel, cx_desc, cx_category) VALUES (?)";
  const values = [
    req.body.reference,
    req.body.name,
    req.body.telephone,
    req.body.description,
    req.body.category,
  ];
  db.query(sql, [values], (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

app.get("/category", (req, res) => {
  const sql = "SELECT * FROM category";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

app.get("/letter/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM letter WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

app.put("/editletter/:id", (req, res) => {
  const id = req.params.id;
  const sql =
    "UPDATE letter set cx_reference = ?, cx_name = ?, cx_tel = ?, cx_desc = ?, cx_category = ? WHERE id = ?";
  const values = [
    req.body.reference,
    req.body.name,
    req.body.telephone,
    req.body.description,
    req.body.category,
  ];
  db.query(sql, [...values, id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

app.listen(8081, () => {
  console.log("Listening");
});
