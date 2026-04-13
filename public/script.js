const API = "http://localhost:3000";

// --- NOTATER ---

async function displayNotes() {
    const res = await fetch(`${API}/notes`);
    const notes = await res.json();
    const list = document.getElementById("notesList");
    list.innerHTML = "";

    notes.forEach((note, index) => {
        const li = document.createElement("li");
        const id = note.index !== undefined ? note.index : index;

        li.innerHTML = `
            <b>${note.title}</b><br>
            ${note.content}<br>
            <button onclick="editNote(${id})">Rediger</button>
            <button onclick="deleteNote(${id})">Slett</button>
        `;
        list.appendChild(li);
    });
}

async function addNote() {
    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;

    await fetch(`${API}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
    });

    displayNotes();
}

async function editNote(id) {
    // Henter gjeldende notater for å fylle inn prompt med eksisterende tekst
    const res = await fetch(`${API}/notes`);
    const notes = await res.json();
    const note = notes.find(n => (n.index !== undefined ? n.index : notes.indexOf(n)) == id);

    const title = prompt("Ny tittel:", note ? note.title : "");
    const content = prompt("Nytt innhold:", note ? note.content : "");

    if (!title || !content) return;

    await fetch(`${API}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
    });

    displayNotes();
}

async function deleteNote(id) {
    await fetch(`${API}/notes/${id}`, {
        method: "DELETE"
    });
    displayNotes();
}

// --- TODOS ---

// Midlertidig liste for oppgaver før de lagres til serveren
let currentTasks = [];

function addTaskToList() {
    const taskInput = document.getElementById("todoTaskInput");
    const text = taskInput.value.trim();
    
    if (text) {
        currentTasks.push({ text: text, completed: false });
        taskInput.value = ""; // Tøm feltet
        renderCurrentTasks();
    }
}

function renderCurrentTasks() {
    const tempList = document.getElementById("tempTasksList");
    tempList.innerHTML = currentTasks.map((t, i) => `<li>${t.text}</li>`).join("");
}

async function addTodo() {
    const title = document.getElementById("todoTitle").value;

    if (!title || currentTasks.length === 0) {
        alert("Du må ha en tittel og minst én oppgave!");
        return;
    }

    await fetch(`${API}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tasks: currentTasks })
    });

    // Nullstill alt etter lagring
    currentTasks = [];
    document.getElementById("todoTitle").value = "";
    document.getElementById("tempTasksList").innerHTML = "";
    displayTodos();
}

async function displayTodos() {
    const res = await fetch(`${API}/todos`);
    const todos = await res.json();
    const list = document.getElementById("todosList");
    list.innerHTML = "";

    todos.forEach((todo, i) => {
        const li = document.createElement("li");
        li.style.border = "1px solid #ccc";
        li.style.margin = "10px 0";
        li.style.padding = "10px";
        
        li.innerHTML = `<b>${todo.title}</b>`;

        const ul = document.createElement("ul");
        (todo.tasks || []).forEach((task, j) => {
            const taskLi = document.createElement("li");
            
            // Checkbox for å markere som ferdig
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;
            checkbox.onchange = async () => {
                await fetch(`${API}/todos/${i}/${j}`, { method: "PATCH" });
                displayTodos();
            };

            const span = document.createElement("span");
            span.textContent = task.text;
            if (task.completed) span.style.textDecoration = "line-through";

            taskLi.appendChild(checkbox);
            taskLi.appendChild(span);
            ul.appendChild(taskLi);
        });

        const delBtn = document.createElement("button");
        delBtn.textContent = "Slett hele listen";
        delBtn.style.marginTop = "10px";
        delBtn.onclick = async () => {
            await fetch(`${API}/todos/${i}`, { method: "DELETE" });
            displayTodos();
        };

        li.appendChild(ul);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, { method: "DELETE" });
    displayTodos();
}

async function editTodo(id) {
    const title = prompt("Ny tittel:");
    const tasks = prompt("Oppgaver (skil med komma):");

    if (!title || !tasks) return;

    await fetch(`${API}/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            tasks: tasks.split(",").map(t => t.trim())
        })
    });

    displayTodos();
}

// --- OPPSTART ---

window.onload = () => {
    displayNotes();
    displayTodos();
};