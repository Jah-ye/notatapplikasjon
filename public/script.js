const API = ""; 
// tom fordi frontend og backend nå er samme server (!)

async function displayNotes() {
  const res = await fetch("/notes");
  const notes = await res.json();

  const list = document.getElementById("notesList");
  list.innerHTML = "";

  notes.forEach((n, index) => {
    const li = document.createElement("li");
    li.textContent = `${n.title}: ${n.content}`;

    const del = document.createElement("button");
    del.textContent = "Slett";
    del.onclick = async () => {
      await fetch(`/notes/${index}`, { method: "DELETE" });
      displayNotes();
    };

    li.appendChild(del);
    list.appendChild(li);
  });
}

async function displayTodos() {
  const res = await fetch("/todos");
  const todos = await res.json();

  const list = document.getElementById("todosList");
  list.innerHTML = "";

  todos.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t.title;

    list.appendChild(li);
  });
}

async function addNote() {
  await fetch("/notes", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      title: noteTitle.value,
      content: noteContent.value
    })
  });

  displayNotes();
}

async function addTodo() {
  const tasks = todoTasks.value.split("\n").map(t => ({
    text: t,
    completed: false
  }));

  await fetch("/todos", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      title: todoTitle.value,
      tasks
    })
  });

  displayTodos();
}

window.onload = () => {
  displayNotes();
  displayTodos();
};