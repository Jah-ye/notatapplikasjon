const API = "";

/* NOTATER */
// Henter og tegner alle notater fra server
async function displayNotes() {
    try {
        const res = await fetch(`${API}/notes`);
        const notes = await res.json();

        const container = document.getElementById("notesList");
        if (!container) return;

        container.innerHTML = notes.map(note => `
            <div class="card">
                <div class="card-title">
                    ${escapeHtml(note.title)}
                </div>

                <div class="card-content">
                    ${escapeHtml(note.content)}
                </div>

                <div class="card-actions">
                    <button onclick="editNote(${note.id})">Rediger</button>
                    <button onclick="deleteNote(${note.id})" class="danger">
                        Slett
                    </button>
                </div>
            </div>
        `).join("");

    } catch (err) {
        console.error("Kunne ikke laste notater:", err);
    }
}


// Oppretter nytt notat
async function addNote() {
    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;

    if (!title || !content) {
        return alert("Fyll ut både tittel og innhold");
    }

    await fetch(`${API}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
    });

    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";

    displayNotes();
}


// Redigering av notat
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


// Slett notat
async function deleteNote(id) {
    if (!confirm("Vil du slette dette notatet?")) return;

    await fetch(`${API}/notes/${id}`, {
        method: "DELETE"
    });

    displayNotes();
}


/* =================================================
   TODO LISTER
================================================= */

let currentTasks = [];

// Legg til en midlertidig oppgave før lagring
function addTaskToList() {
    const input = document.getElementById("todoTaskInput");

    if (!input || !input.value.trim()) return;

    currentTasks.push({
        text: input.value.trim(),
        completed: false
    });

    input.value = "";
    renderTempTasks();
}


// Tegner oppgaver før de lagres
function renderTempTasks() {
    const list = document.getElementById("tempTasksList");
    if (!list) return;

    list.innerHTML = currentTasks.map((task, i) => `
        <li>
            ${escapeHtml(task.text)}
            <span
                style="color:#c00;cursor:pointer;margin-left:8px"
                onclick="currentTasks.splice(${i},1);renderTempTasks()">
                fjern
            </span>
        </li>
    `).join("");
}


// Lagre todo-liste til server
async function addTodo() {
    const title = document.getElementById("todoTitle").value;

    if (!title || currentTasks.length === 0) {
        return alert("Legg til tittel og minst én oppgave");
    }

    await fetch(`${API}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tasks: currentTasks })
    });

    currentTasks = [];
    document.getElementById("todoTitle").value = "";

    const temp = document.getElementById("tempTasksList");
    if (temp) temp.innerHTML = "";

    displayTodos();
}


// Henter og viser todos
async function displayTodos() {
    try {
        const res = await fetch(`${API}/todos`);
        const todos = await res.json();

        const container = document.getElementById("todosList");
        if (!container) return;

        container.innerHTML = todos.map(todo => `
            <div class="todo-card">
                <h3>${escapeHtml(todo.title)}</h3>

                <ul>
                    ${(todo.tasks || []).map(task => `
                        <li>
                            <input
                                type="checkbox"
                                ${task.completed ? "checked" : ""}
                                onchange="toggleTask(${todo.id}, ${task.id})"
                            >
                            <span style="${task.completed ? 'text-decoration:line-through;color:gray' : ''}">
                                ${escapeHtml(task.text)}
                            </span>
                        </li>
                    `).join("")}
                </ul>

                <button onclick="deleteTodo(${todo.id})" class="danger">
                    Slett liste
                </button>
            </div>
        `).join("");

    } catch (err) {
        console.error("Kunne ikke laste todos:", err);
    }
}


// Toggle ferdig/ikke ferdig
async function toggleTask(todoId, taskId) {
    await fetch(`${API}/todos/${todoId}/tasks/${taskId}`, {
        method: "PATCH"
    });

    displayTodos();
}


// Slett todo-liste
async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, {
        method: "DELETE"
    });

    displayTodos();
}


/* AUTO OPPDATERING */

setInterval(() => {
    displayNotes();
    displayTodos();
}, 5000);


// Init
window.onload = () => {
    displayNotes();
    displayTodos();
};