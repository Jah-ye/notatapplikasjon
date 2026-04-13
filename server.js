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

// trygg lesing
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

/* ================= NOTES ================= */

// GET
app.get("/notes", (req, res) => {
  res.json(readData().notes);
});

// POST
app.post("/notes", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Manglende data" });
  }

  const data = readData();
  data.notes.push({ title, content });
  saveData(data);

  res.json({ ok: true });
});

// PUT
app.put("/notes/:index", (req, res) => {
  const data = readData();
  const index = parseInt(req.params.index);

  if (isNaN(index) || !data.notes[index]) {
    return res.status(404).json({ error: "Notat finnes ikke" });
  }

  data.notes[index] = req.body;
  saveData(data);

  res.json({ ok: true });
});

// DELETE
app.delete("/notes/:index", (req, res) => {
  const data = readData();
  const index = parseInt(req.params.index);

  if (isNaN(index) || !data.notes[index]) {
    return res.status(404).json({ error: "Notat finnes ikke" });
  }

  data.notes.splice(index, 1);
  saveData(data);

  res.json({ ok: true });
});

/* ================= TODOS ================= */

// GET
app.get("/todos", (req, res) => {
  res.json(readData().todos);
});

// POST
app.post("/todos", (req, res) => {
  const { title, tasks } = req.body;

  if (!title || !Array.isArray(tasks)) {
    return res.status(400).json({ error: "Feil format" });
  }

  const data = readData();

  // sørger for riktig struktur
  const formattedTasks = tasks.map(t =>
    typeof t === "string"
      ? { text: t, completed: false }
      : { text: t.text, completed: t.completed || false }
  );

  data.todos.push({ title, tasks: formattedTasks });
  saveData(data);

  res.json({ ok: true });
});

app.patch("/todos/:todoIndex/:taskIndex", (req, res) => {
  const data = readData();
  const todoIndex = parseInt(req.params.todoIndex);
  const taskIndex = parseInt(req.params.taskIndex);

  if (
    isNaN(todoIndex) ||
    isNaN(taskIndex) ||
    !data.todos[todoIndex] ||
    !data.todos[todoIndex].tasks[taskIndex]
  ) {
    return res.status(404).json({ error: "Task finnes ikke" });
  }

  const task = data.todos[todoIndex].tasks[taskIndex];
  task.completed = !task.completed;

  saveData(data);

  res.json({ ok: true });
});

// PUT
app.put("/todos/:index", (req, res) => {
  const data = readData();
  const index = parseInt(req.params.index);

  if (isNaN(index) || !data.todos[index]) {
    return res.status(404).json({ error: "Todo finnes ikke" });
  }

  const { title, tasks } = req.body;

  const formattedTasks = (tasks || []).map(t =>
    typeof t === "string"
      ? { text: t, completed: false }
      : { text: t.text, completed: t.completed || false }
  );

  data.todos[index] = {
    title,
    tasks: formattedTasks
  };

  saveData(data);

  res.json({ ok: true });
});

// DELETE
app.delete("/todos/:index", (req, res) => {
  const data = readData();
  const index = parseInt(req.params.index);

  if (isNaN(index) || !data.todos[index]) {
    return res.status(404).json({ error: "Todo finnes ikke" });
  }

  data.todos.splice(index, 1);
  saveData(data);

  res.json({ ok: true });
});

/* ================= START ================= */

app.listen(3000, "0.0.0.0", () => {
  console.log("Server kjører på port 3000");
});