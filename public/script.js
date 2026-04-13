const API = "http://localhost:3000";

// --- NOTATER ---

async function displayNotes() {
    const res = await fetch(`${API}/notes`);
    const notes = await res.json();
    const list = document.getElementById("notesList");
    list.innerHTML = "";

    notes.forEach((note, index) => {
        // SKUDDSIKKER ID: Sjekker om notatet har en id fra databasen, ellers bruker den loop-tallet.
        const id = note.id !== undefined ? note.id : (note.index !== undefined ? note.index : index);

        const li = document.createElement("li");
        li.innerHTML = `
            <div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <b>${note.title}</b><br>
                ${note.content}<br><br>
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

    if (!titleEl.value || !contentEl.value) return alert("Fyll ut både tittel og innhold!");

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
    
    // Finner riktig notat uavhengig av hvordan databasen er satt opp
    const note = notes.find((n, index) => {
        const checkId = n.id !== undefined ? n.id : (n.index !== undefined ? n.index : index);
        return checkId == id;
    });

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
    // La tilbake x-knappen så du kan angre hvis du skriver feil i listen før lagring!
    tempList.innerHTML = currentTasks.map((t, i) => 
        `<li style="margin-bottom: 5px;">
            ${t.text} 
            <button onclick="currentTasks.splice(${i}, 1); renderCurrentTasks();" style="color: red; border: none; background: none; cursor: pointer; font-weight: bold;">✕</button>
        </li>`
    ).join("");
}

async function addTodo() {
    const titleEl = document.getElementById("todoTitle");

    if (!titleEl.value || currentTasks.length === 0) {
        alert("Du må ha en tittel og minst én oppgave!");
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

    todos.forEach((todo, i) => {
        // Skuddsikker ID for todos også
        const todoId = todo.id !== undefined ? todo.id : i;

        const li = document.createElement("li");
        li.style.border = "1px solid #ccc";
        li.style.margin = "10px 0";
        li.style.padding = "15px";
        li.style.borderRadius = "5px";
        
        li.innerHTML = `<h3 style="margin-top: 0;">${todo.title}</h3>`;

        const ul = document.createElement("ul");
        ul.style.listStyleType = "none";
        ul.style.paddingLeft = "0";

        (todo.tasks || []).forEach((task, j) => {
            const taskLi = document.createElement("li");
            taskLi.style.marginBottom = "8px";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;
            
            checkbox.onchange = async () => {
                await fetch(`${API}/todos/${todoId}/${j}`, { method: "PATCH" });
                displayTodos();
            };

            const span = document.createElement("span");
            span.textContent = task.text;
            span.style.marginLeft = "8px";
            if (task.completed) {
                span.style.textDecoration = "line-through";
                span.style.color = "#888";
            }

            taskLi.appendChild(checkbox);
            taskLi.appendChild(span);
            ul.appendChild(taskLi);
        });

        const delBtn = document.createElement("button");
        delBtn.textContent = "Slett hele listen";
        delBtn.style.marginTop = "15px";
        
        delBtn.onclick = async () => {
            await fetch(`${API}/todos/${todoId}`, { method: "DELETE" });
            displayTodos();
        };

        li.appendChild(ul);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

// --- OPPSTART ---
window.onload = () => {
    displayNotes();
    displayTodos();
};