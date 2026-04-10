const API = ""; 
// tom fordi frontend og backend er samme server 

async function displayNotes() {
  const res = await fetch("http://localhost:3000/notes");
  const notes = await res.json();

  const list = document.getElementById("notesList");
  list.innerHTML = "";

  notes.forEach(note => {
    const li = document.createElement("li");

    li.innerHTML = `
      <b>${note.title}</b><br>
      ${note.content}<br>
      <button onclick="editNote(${note.id}, '${note.title}', \`${note.content}\`)">Rediger</button>
      <button onclick="deleteNote(${note.id})">Slett</button>
    `;

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
  const title = document.getElementById("noteTitle").value;
  const content = document.getElementById("noteContent").value;

  await fetch("http://localhost:3000/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content })
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

async function deleteNote(id) {
  await fetch(`http://localhost:3000/notes/${id}`, {
    method: "DELETE"
  });

  displayNotes();
}


window.onload = () => {
  displayNotes();
  displayTodos();
};