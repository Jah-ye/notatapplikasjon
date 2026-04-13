const express = require("express");
const path = require("path");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const app = express();


app.use(cors());
app.use(express.json());

// server frontend direkte fra /public
app.use(express.static("public"));

// DATABASE 
let db;

/*
    Starter databasen før serveren kjører.
    Dette sikrer at API ikke starter uten database-tilkobling.
*/
async function startServer() {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database
  });

  // Oppretter tabeller hvis de ikke finnes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      todo_id INTEGER,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0
    );
  `);

  app.listen(3000, "0.0.0.0", () => {
    console.log("Server kjører på port 3000");
  });
}

startServer();


//  NOTES API


// Hent alle notater
app.get("/notes", async (req, res) => {
  const notes = await db.all("SELECT * FROM notes ORDER BY id DESC");
  res.json(notes);
});

// Opprett nytt notat
app.post("/notes", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Mangler tittel eller innhold" });
  }

  await db.run(
    "INSERT INTO notes (title, content) VALUES (?, ?)",
    [title, content]
  );

  res.json({ ok: true });
});

// Oppdater notat
app.put("/notes/:id", async (req, res) => {
  const { title, content } = req.body;

  await db.run(
    "UPDATE notes SET title = ?, content = ? WHERE id = ?",
    [title, content, req.params.id]
  );

  res.json({ ok: true });
});

// Slett notat
app.delete("/notes/:id", async (req, res) => {
  await db.run("DELETE FROM notes WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

 
//  TODOS API 

// Hent alle todos + tasks
app.get("/todos", async (req, res) => {
  const todos = await db.all("SELECT * FROM todos ORDER BY id DESC");

  for (let todo of todos) {
    const tasks = await db.all(
      "SELECT * FROM tasks WHERE todo_id = ?",
      [todo.id]
    );

    todo.tasks = tasks.map(t => ({
      id: t.id,
      text: t.text,
      completed: !!t.completed
    }));
  }

  res.json(todos);
});

// Opprett todo + tilhørende tasks
app.post("/todos", async (req, res) => {
  const { title, tasks } = req.body;

  if (!title || !Array.isArray(tasks)) {
    return res.status(400).json({ error: "Feil dataformat" });
  }

  const result = await db.run(
    "INSERT INTO todos (title) VALUES (?)",
    [title]
  );

  const todoId = result.lastID;

  for (let task of tasks) {
    await db.run(
      "INSERT INTO tasks (todo_id, text, completed) VALUES (?, ?, ?)",
      [todoId, task.text, task.completed ? 1 : 0]
    );
  }

  res.json({ ok: true });
});


// TOGGLE TASK 
/*
   Dette brukes når checkbox trykkes i frontend.
   Hver task toggles individuelt.
*/
app.patch("/tasks/:id", async (req, res) => {
  const task = await db.get(
    "SELECT completed FROM tasks WHERE id = ?",
    [req.params.id]
  );

  if (!task) {
    return res.status(404).json({ error: "Task finnes ikke" });
  }

  await db.run(
    "UPDATE tasks SET completed = ? WHERE id = ?",
    [task.completed ? 0 : 1, req.params.id]
  );

  res.json({ ok: true });
});


// DELETE TODO 
/*
   Viktig: vi sletter først tasks,
   så todoen selv (manuell cascade)
*/
app.delete("/todos/:id", async (req, res) => {
  const id = req.params.id;

  await db.run("DELETE FROM tasks WHERE todo_id = ?", [id]);
  await db.run("DELETE FROM todos WHERE id = ?", [id]);

  res.json({ ok: true });
});