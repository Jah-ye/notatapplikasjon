const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "data.json";

// Hent data
function readData() {
  if (!fs.existsSync(FILE)) return { notes: [], todos: [] };
  return JSON.parse(fs.readFileSync(FILE));
}

// Lagre data
function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// --- Notater ---
// POST /notes
app.post("/notes", (req, res) => {
  const data = readData();
  data.notes.push(req.body);
  saveData(data);
  res.json({ message: "Notat lagret" });
});

// GET /notes
app.get("/notes", (req, res) => {
  res.json(readData().notes);
});

// --- Todo-lister ---
// POST /todos
app.post("/todos", (req, res) => {
  const data = readData();
  data.todos.push(req.body);
  saveData(data);
  res.json({ message: "Todo lagret" });
});

// GET /todos
app.get("/todos", (req, res) => {
  res.json(readData().todos);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server kjører på port ${PORT}`);
});