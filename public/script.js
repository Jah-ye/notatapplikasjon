const API = "/api";

// --- NOTATER ---
async function fetchNotes() {
    const res = await fetch(`${API}/notes`);
    const notes = await res.json();
    const container = document.getElementById("notesContainer");
    
    container.innerHTML = notes.map(n => `
        <div class="card">
            <h3>${n.title}</h3>
            <p>${n.content}</p>
            <button onclick="editNote(${n.id}, '${n.title}', '${n.content}')">Rediger</button>
            <button class="btn-danger" onclick="deleteNote(${n.id})">Slett</button>
        </div>
    `).join("");
}

async function saveNote() {
    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;
    if(!title || !content) return alert("Fyll ut alt!");

    await fetch(`${API}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
    });
    
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";
    fetchNotes();
}

async function editNote(id, oldTitle, oldContent) {
    const title = prompt("Ny tittel:", oldTitle);
    const content = prompt("Nytt innhold:", oldContent);
    if (!title || !content) return;

    await fetch(`${API}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
    });
    fetchNotes();
}

async function deleteNote(id) {
    if(confirm("Slette dette notatet?")) {
        await fetch(`${API}/notes/${id}`, { method: "DELETE" });
        fetchNotes();
    }
}

// --- TODO LISTER ---
let tempTasks = [];

function addTempTask() {
    const input = document.getElementById("taskInput");
    if(input.value) {
        tempTasks.push({ text: input.value, completed: false });
        input.value = "";
        renderTempTasks();
    }
}

function renderTempTasks() {
    document.getElementById("tempTasksList").innerHTML = tempTasks.map(t => `<li>${t.text}</li>`).join("");
}

async function saveTodo() {
    const title = document.getElementById("todoTitle").value;
    if(!title || tempTasks.length === 0) return alert("Trenger tittel og oppgaver!");

    await fetch(`${API}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tasks: tempTasks })
    });

    tempTasks = [];
    document.getElementById("todoTitle").value = "";
    renderTempTasks();
    fetchTodos();
}

async function fetchTodos() {
    const res = await fetch(`${API}/todos`);
    const todos = await res.json();
    const container = document.getElementById("todosContainer");

    container.innerHTML = todos.map(todo => `
        <div class="card">
            <h3>${todo.title}</h3>
            <ul>
                ${todo.tasks.map(t => `
                    <li style="text-decoration: ${t.completed ? 'line-through' : 'none'}">
                        <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask(${t.id})">
                        ${t.text}
                    </li>
                `).join("")}
            </ul>
            <button class="btn-danger" onclick="deleteTodo(${todo.id})">Slett liste</button>
        </div>
    `).join("");
}

async function toggleTask(id) {
    await fetch(`${API}/tasks/${id}`, { method: "PATCH" });
    fetchTodos();
}

async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, { method: "DELETE" });
    fetchTodos();
}

// Automatisk oppdatering hvert 5. sekund
setInterval(() => {
    fetchNotes();
    fetchTodos();
}, 5000);

window.onload = () => { fetchNotes(); fetchTodos(); };