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

async function startServer() {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database
  });

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

  app.listen(3000, "0.0.0.0", () => {
    console.log("✅ Server kjører på port 3000. Andre kan koble til via din IP.");
  });
}

startServer();

/* --- API FOR NOTATER --- */
app.get("/notes", async (req, res) => {
  const notes = await db.all("SELECT * FROM notes ORDER BY id DESC");
  res.json(notes);
});

app.post("/notes", async (req, res) => {
  const { title, content } = req.body;
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

/* --- API FOR TODOS --- */
app.get("/todos", async (req, res) => {
  const todos = await db.all("SELECT * FROM todos ORDER BY id DESC");
  for (let todo of todos) {
    todo.tasks = await db.all("SELECT * FROM tasks WHERE todo_id = ?", [todo.id]);
    todo.tasks = todo.tasks.map(t => ({ ...t, completed: !!t.completed }));
  }
  res.json(todos);
});

app.post("/todos", async (req, res) => {
  const { title, tasks } = req.body;
  const result = await db.run("INSERT INTO todos (title) VALUES (?)", [title]);
  const todoId = result.lastID;
  for (let task of tasks) {
    await db.run("INSERT INTO tasks (todo_id, text, completed) VALUES (?, ?, ?)", 
      [todoId, task.text, task.completed ? 1 : 0]);
  }
  res.json({ ok: true });
});

app.patch("/todos/:todoId/tasks/:taskId", async (req, res) => {
  const task = await db.get("SELECT completed FROM tasks WHERE id = ?", [req.params.taskId]);
  if (task) {
    await db.run("UPDATE tasks SET completed = ? WHERE id = ?", [task.completed ? 0 : 1, req.params.taskId]);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "Fant ikke oppgave" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  await db.run("DELETE FROM todos WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});