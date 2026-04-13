const API = "http://localhost:3000";

// --- NOTATER ---

async function displayNotes() {
    const res = await fetch(`${API}/notes`);
    const notes = await res.json();
    const list = document.getElementById("notesList");
    list.innerHTML = "";

    notes.forEach((note) => {
        const li = document.createElement("li");
        // SQLite returnerer ID som "index" i GET-kallet vårt
        const id = note.index; 

        li.innerHTML = `
            <div style="margin-bottom: 15px;">
                <b>${note.title}</b><br>
                ${note.content}<br>
                <button onclick="editNote(${id})">Rediger</button>
                <button onclick="deleteNote(${id})">Slett</button>
            </div>
        `;
        list.appendChild(li);
    });
}

async function addNote() {
    const titleEl = document.getElementById("noteTitle");
    const contentEl = document.getElementById("noteContent");

    if (!titleEl.value || !contentEl.value) return alert("Fyll ut alt!");

    await fetch(`${API}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleEl.value, content: contentEl.value })
    });

    titleEl.value = "";
    contentEl.value = "";
    displayNotes();
}

async function editNote(id) {
    const res = await fetch(`${API}/notes`);
    const notes = await res.json();
    const note = notes.find(n => n.index == id);

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
    await fetch(`${API}/notes/${id}`, { method: "DELETE" });
    displayNotes();
}

// --- TODOS ---

let currentTasks = [];

function addTaskToList() {
    const taskInput = document.getElementById("todoTaskInput");
    const text = taskInput.value.trim();
    
    if (text) {
        currentTasks.push({ text: text, completed: false });
        taskInput.value = ""; 
        renderCurrentTasks();
    }
}

function renderCurrentTasks() {
    const tempList = document.getElementById("tempTasksList");
    tempList.innerHTML = currentTasks.map((t, i) => 
        `<li>${t.text} <button onclick="currentTasks.splice(${i}, 1); renderCurrentTasks();">x</button></li>`
    ).join("");
}

async function addTodo() {
    const titleEl = document.getElementById("todoTitle");

    if (!titleEl.value || currentTasks.length === 0) {
        alert("Du må ha tittel og minst én oppgave!");
        return;
    }

    await fetch(`${API}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleEl.value, tasks: currentTasks })
    });

    currentTasks = [];
    titleEl.value = "";
    document.getElementById("tempTasksList").innerHTML = "";
    displayTodos();
}

async function displayTodos() {
    const res = await fetch(`${API}/todos`);
    const todos = await res.json();
    const list = document.getElementById("todosList");
    list.innerHTML = "";

    todos.forEach((todo) => {
        const li = document.createElement("li");
        li.style.border = "1px solid #ccc";
        li.style.margin = "10px 0";
        li.style.padding = "10px";
        
        li.innerHTML = `<b>${todo.title}</b>`;

        const ul = document.createElement("ul");
        (todo.tasks || []).forEach((task, j) => {
            const taskLi = document.createElement("li");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;
            
            // Bruker todo.id her (viktig for SQLite)
            checkbox.onchange = async () => {
                await fetch(`${API}/todos/${todo.id}/${j}`, { method: "PATCH" });
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
        
        // Bruker todo.id her for sletting
        delBtn.onclick = async () => {
            await fetch(`${API}/todos/${todo.id}`, { method: "DELETE" });
            displayTodos();
        };

        li.appendChild(ul);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

window.onload = () => {
    displayNotes();
    displayTodos();
};