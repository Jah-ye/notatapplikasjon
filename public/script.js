const API = "";

// -------------------- SAFE HTML --------------------
function escapeHtml(str) {
    return String(str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// -------------------- NOTATER --------------------
async function displayNotes() {
    try {
        const res = await fetch(`${API}/notes`);
        const notes = await res.json();

        const list = document.getElementById("notesList");
        if (!list) return;

        const newHTML = notes.map(note => {
            const noteId = note.id;

            return `
                <div style="border:1px solid #ddd; padding:10px; margin-bottom:10px; border-radius:5px; background:#fff;">
                    <b>${escapeHtml(note.title)}</b><br>
                    ${escapeHtml(note.content)}<br><br>

                    <button onclick="editNote(${noteId})">Rediger</button>
                    <button onclick="deleteNote(${noteId})"
                        style="background:#ff4d4d;color:white;border:none;padding:5px 10px;border-radius:3px;cursor:pointer;">
                        Slett
                    </button>
                </div>
            `;
        }).join("");

        list.innerHTML = newHTML;
    } catch (err) {
        console.error("Notes error:", err);
    }
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
    if (!confirm("Slette notat?")) return;

    await fetch(`${API}/notes/${id}`, {
        method: "DELETE"
    });

    displayNotes();
}

// -------------------- TODOS --------------------
let currentTasks = [];

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

function renderTempTasks() {
    const list = document.getElementById("tempTasksList");
    if (!list) return;

    list.innerHTML = currentTasks.map((t, i) => `
        <li>
            ${escapeHtml(t.text)}
            <small style="color:red;cursor:pointer"
                onclick="currentTasks.splice(${i},1);renderTempTasks()">
                (fjern)
            </small>
        </li>
    `).join("");
}

async function addTodo() {
    const title = document.getElementById("todoTitle").value;

    if (!title || currentTasks.length === 0)
        return alert("Mangler tittel eller oppgaver");

    await fetch(`${API}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tasks: currentTasks })
    });

    currentTasks = [];
    document.getElementById("todoTitle").value = "";

    const tempList = document.getElementById("tempTasksList");
    if (tempList) tempList.innerHTML = "";

    displayTodos();
}

async function displayTodos() {
    try {
        const res = await fetch(`${API}/todos`);
        const todos = await res.json();

        const list = document.getElementById("todosList");
        if (!list) return;

        const newHTML = todos.map(todo => `
            <div style="border:1px solid #ccc;padding:15px;margin-bottom:10px;border-radius:8px;background:#f9f9f9;">
                <h3>${escapeHtml(todo.title)}</h3>

                <ul style="list-style:none;padding:0">
                    ${(todo.tasks || []).map(task => {
                        const taskId = task.id;

                        return `
                            <li>
                                <input type="checkbox"
                                    ${task.completed ? "checked" : ""}
                                    onchange="toggleTask(${todo.id}, ${taskId})">

                                <span style="${task.completed ? 'text-decoration:line-through;color:gray' : ''}">
                                    ${escapeHtml(task.text)}
                                </span>
                            </li>
                        `;
                    }).join("")}
                </ul>

                <button onclick="deleteTodo(${todo.id})"
                    style="background:#ff4d4d;color:white;border:none;padding:5px 10px;cursor:pointer;border-radius:3px;">
                    Slett liste
                </button>
            </div>
        `).join("");

        list.innerHTML = newHTML;

    } catch (err) {
        console.error("Todos error:", err);
    }
}

async function toggleTask(todoId, taskId) {
    await fetch(`${API}/todos/${todoId}/tasks/${taskId}`, {
        method: "PATCH"
    });

    displayTodos();
}

async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, { method: "DELETE" });
    displayTodos();
}

// -------------------- AUTO SYNC --------------------
setInterval(() => {
    displayNotes();
    displayTodos();
}, 5000);

window.onload = () => {
    displayNotes();
    displayTodos();
};