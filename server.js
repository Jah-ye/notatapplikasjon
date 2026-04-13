const express = require("express");
const path = require("path");
const cors = require("cors");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let db;

// Funksjon for å starte alt i riktig rekkefølge
async function startServer() {
  // 1. Åpne databasen
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database
  });

  // 2. Lag tabeller
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT
    );
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      todo_id INTEGER,
      text TEXT,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
    );
  `);

  // 3. Start Express først ETTER at databasen er klar
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`✅ Database klar og server kjører på http://localhost:${PORT}`);
  });
}

// Start prosessen
startServer().catch(err => {
  console.error("❌ Kunne ikke starte serveren:", err);
});

/* ================= ROUTES (Uendret, men nå er db garantert klar) ================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/notes", async (req, res) => {
  const notes = await db.all("SELECT id AS 'index', title, content FROM notes");
  res.json(notes);
});

app.post("/notes", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Manglende data" });
  await db.run("INSERT INTO notes (title, content) VALUES (?, ?)", [title, content]);
  res.json({ ok: true });
});

app.put("/notes/:id", async (req, res) => {
  const { title, content } = req.body;
  await db.run("UPDATE notes SET title = ?, content = ? WHERE id = ?", [title, content, req.params.id]);
  res.json({ ok: true });
});

app.delete("/notes/:id", async (req, res) => {
  await db.run("DELETE FROM notes WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

app.get("/todos", async (req, res) => {
  const todos = await db.all("SELECT * FROM todos");
  for (let todo of todos) {
    const tasks = await db.all("SELECT id, text, completed FROM tasks WHERE todo_id = ?", [todo.id]);
    todo.tasks = tasks.map(t => ({ ...t, completed: !!t.completed }));
  }
  res.json(todos);
});

app.post("/todos", async (req, res) => {
  const { title, tasks } = req.body;
  if (!title || !Array.isArray(tasks)) return res.status(400).json({ error: "Feil format" });

  const result = await db.run("INSERT INTO todos (title) VALUES (?)", [title]);
  const todoId = result.lastID;

  for (let task of tasks) {
    await db.run("INSERT INTO tasks (todo_id, text, completed) VALUES (?, ?, ?)", 
      [todoId, task.text, task.completed ? 1 : 0]);
  }
  res.json({ ok: true });
});

app.patch("/todos/:todoId/:taskIndex", async (req, res) => {
  const tasks = await db.all("SELECT id, completed FROM tasks WHERE todo_id = ?", [req.params.todoId]);
  const task = tasks[req.params.taskIndex];
  if (task) {
    const newStatus = task.completed ? 0 : 1;
    await db.run("UPDATE tasks SET completed = ? WHERE id = ?", [newStatus, task.id]);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "Task finnes ikke" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  await db.run("DELETE FROM todos WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});