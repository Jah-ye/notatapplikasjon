const API = ""; // Relativ URL fungerer best for IP-tilgang

// --- NOTATER ---
async function displayNotes() {
    const res = await fetch(`${API}/notes`);
    const notes = await res.json();
    const list = document.getElementById("notesList");
    if (!list) return;

    // Kun oppdater hvis innholdet faktisk er annerledes (for å unngå blinking)
    const newHTML = notes.map(note => `
        <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px; background: #fff;">
            <b>${note.title}</b><br>${note.content}<br><br>
            <button onclick="editNote(${note.id})">Rediger</button>
            <button onclick="deleteNote(${note.id})" style="background:#ff4d4d; color:white;">Slett</button>
        </div>
    `).join("");

    if (list.innerHTML !== newHTML) list.innerHTML = newHTML;
}

async function addNote() {
    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;
    if (!title || !content) return alert("Fyll ut begge felt");

    await fetch(`${API}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
    });
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";
    displayNotes();
}

async function editNote(id) {
    const title = prompt("Ny tittel:");
    const content = prompt("Nytt innhold:");
    if (!title || !content) return;
    await fetch(`${API}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
    });
    displayNotes();
}

async function deleteNote(id) {
    if (confirm("Slette notat?")) {
        await fetch(`${API}/notes/${id}`, { method: "DELETE" });
        displayNotes();
    }
}

// --- TODOS ---
let currentTasks = [];

function addTaskToList() {
    const input = document.getElementById("todoTaskInput");
    if (input.value.trim()) {
        currentTasks.push({ text: input.value, completed: false });
        input.value = "";
        renderTempTasks();
    }
}

function renderTempTasks() {
    const list = document.getElementById("tempTasksList");
    list.innerHTML = currentTasks.map((t, i) => `<li>${t.text} <small onclick="currentTasks.splice(${i},1);renderTempTasks()" style="color:red; cursor:pointer;">(fjern)</small></li>`).join("");
}

async function addTodo() {
    const title = document.getElementById("todoTitle").value;
    if (!title || currentTasks.length === 0) return alert("Mangler tittel eller oppgaver");

    await fetch(`${API}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tasks: currentTasks })
    });

    currentTasks = [];
    document.getElementById("todoTitle").value = "";
    document.getElementById("tempTasksList").innerHTML = "";
    displayTodos();
}

async function displayTodos() {
    const res = await fetch(`${API}/todos`);
    const todos = await res.json();
    const list = document.getElementById("todosList");
    if (!list) return;

    const newHTML = todos.map(todo => `
        <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px; background: #f9f9f9;">
            <h3 style="margin-top:0">${todo.title}</h3>
            <ul style="list-style:none; padding:0">
                ${todo.tasks.map(task => `
                    <li>
                        <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${todo.id}, ${task.id})">
                        <span style="${task.completed ? 'text-decoration:line-through; color:gray' : ''}">${task.text}</span>
                    </li>
                `).join("")}
            </ul>
            <button onclick="deleteTodo(${todo.id})" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:3px;">Slett liste</button>
        </div>
    `).join("");

    if (list.innerHTML !== newHTML) list.innerHTML = newHTML;
}

async function toggleTask(todoId, taskId) {
    await fetch(`${API}/todos/${todoId}/tasks/${taskId}`, { method: "PATCH" });
    displayTodos();
}

async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, { method: "DELETE" });
    displayTodos();
}

// --- SYNKRONISERING ---
// Denne kjører hvert 5. sekund for å hente endringer fra andre klienter
setInterval(() => {
    displayNotes();
    displayTodos();
}, 5000);

window.onload = () => {
    displayNotes();
    displayTodos();
};