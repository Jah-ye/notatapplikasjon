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
  const res = await fetch("http://localhost:3000/todos");
  const todos = await res.json();

  const list = document.getElementById("todosList");
  list.innerHTML = "";

  todos.forEach((todo, todoIndex) => {
    const li = document.createElement("li");

    const title = document.createElement("b");
    title.textContent = todo.title;
    li.appendChild(title);

    const taskList = document.createElement("ul");

    (todo.tasks || []).forEach((task, taskIndex) => {
      const taskLi = document.createElement("li");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;

      const label = document.createElement("span");
      label.textContent = task.text;

      if (task.completed) {
        label.style.textDecoration = "line-through";
        label.style.opacity = "0.6";
      }

      // 🔥 toggle completed
      checkbox.addEventListener("change", async () => {
        await fetch(
          `http://localhost:3000/todos/${todoIndex}/${taskIndex}`,
          {
            method: "PATCH"
          }
        );

        displayTodos();
      });

      taskLi.appendChild(checkbox);
      taskLi.appendChild(label);
      taskList.appendChild(taskLi);
    });

    // knapper
    const editBtn = document.createElement("button");
    editBtn.textContent = "Rediger";
    editBtn.onclick = () => editTodo(todoIndex);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Slett";
    deleteBtn.onclick = () => deleteTodo(todoIndex);

    li.appendChild(taskList);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

async function addTodo() {
  const title = document.getElementById("todoTitle").value;
  const tasks = document.getElementById("todoTasks")
    .value.split("\n")
    .filter(t => t.trim() !== "");

  await fetch("http://localhost:3000/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, tasks })
  });

  displayTodos();
}

async function deleteTodo(id) {
  await fetch(`http://localhost:3000/todos/${id}`, {
    method: "DELETE"
  });

  displayTodos();
}

async function editTodo(id) {
  const title = prompt("Ny tittel:");
  const tasks = prompt("Oppgaver (skil med komma):");

  if (!title || !tasks) return;

  await fetch(`http://localhost:3000/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      tasks: tasks.split(",").map(t => t.trim())
    })
  });

  displayTodos();
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

async function editNote(id, oldTitle, oldContent) {
  const title = prompt("Ny tittel:", oldTitle);
  const content = prompt("Nytt innhold:", oldContent);

  if (!title || !content) return;

  await fetch(`http://localhost:3000/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content })
  });

  displayNotes();
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