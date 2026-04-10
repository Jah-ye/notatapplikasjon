const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// frontend hosting
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const FILE = "data.json";

//  trygg lesing
function readData() {
  try {
    if (!fs.existsSync(FILE)) return { notes: [], todos: [] };
    const data = fs.readFileSync(FILE, "utf-8");
    return data ? JSON.parse(data) : { notes: [], todos: [] };
  } catch {
    return { notes: [], todos: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/* NOTES */

app.get("/notes", (req, res) => {
  res.json(readData().notes);
});

app.post("/notes", (req, res) => {
  const data = readData();
  data.notes.push(req.body);
  saveData(data);
  res.json({ ok: true });
});

app.put("/notes/:index", (req, res) => {
  const data = readData();
  data.notes[req.params.index] = req.body;
  saveData(data);
  res.json({ ok: true });
});

app.delete("/notes/:index", (req, res) => {
  const data = readData();
  data.notes.splice(req.params.index, 1);
  saveData(data);
  res.json({ ok: true });
});

/* TODOS */

app.get("/todos", (req, res) => {
  res.json(readData().todos);
});

app.post("/todos", (req, res) => {
  const data = readData();
  data.todos.push(req.body);
  saveData(data);
  res.json({ ok: true });
});

app.put("/todos/:index", (req, res) => {
  const data = readData();
  data.todos[req.params.index] = req.body;
  saveData(data);
  res.json({ ok: true });
});

app.delete("/todos/:index", (req, res) => {
  const data = readData();
  data.todos.splice(req.params.index, 1);
  saveData(data);
  res.json({ ok: true });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server kjører på port ${PORT}`);
});