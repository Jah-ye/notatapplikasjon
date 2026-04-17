// API er separert for å gjøre koden mer fleksibel og lett å bytte mellom lokal og ekstern server uten å endre fetch-kallene.
const API = ""; 



// Henter og tegner alle notater fra server
async function displayNotes() { 
    try {
        const res = await fetch(`${API}/notes`); // Sender GET-request til /notes
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
        console.error("Kunne ikke laste notater:", err); // Logger feil hvis noe går galt
    }
}


// Oppretter nytt notat
async function addNote() { // funksjon for å legge til notat
    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;

    if (!title || !content) { // sjekker at begge feltene er fylt ut
        return alert("Fyll ut både tittel og innhold"); // Viser feilmelding
    }

    await fetch(`${API}/notes`, { // Sender POST-request til server
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Forteller at vi sender JSON
        body: JSON.stringify({ title, content }) // Gjør data om til JSON
    });

    document.getElementById("noteTitle").value = ""; 
    document.getElementById("noteContent").value = ""; 

    displayNotes(); // Oppdaterer listen med nye notater
}


// Redigering av notat
async function editNote(id) { // Tar inn IDen til notatet som skal redigeres
    const title = prompt("Ny tittel:");
    const content = prompt("Nytt innhold:");

    if (!title || !content) return;

    await fetch(`${API}/notes/${id}`, { // Sender PUT-request til riktig notat
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }) 
    });

    displayNotes(); // Oppdaterer visning
}


// Slett notat
async function deleteNote(id) { // Tar inn ID til notatet som skal slettes
    if (!confirm("Vil du slette dette notatet?")) return; // Bekreftelse fra bruker

    await fetch(`${API}/notes/${id}`, {
        method: "DELETE" // Sender request
    });

    displayNotes(); // Oppdaterer visning
}




let currentTasks = []; 

// Legg til en midlertidig oppgave før lagring
function addTaskToList() {
    const input = document.getElementById("todoTaskInput");  

    if (!input || !input.value.trim()) return; // Stopper hvis tom input

    currentTasks.push({ 
        text: input.value.trim(), 
        completed: false
    });

    input.value = ""; 
    renderTempTasks(); 
}


// Viser oppgavene som ikke er lagret enda
function renderTempTasks() {
    const list = document.getElementById("tempTasksList"); // Henter liste-element
    if (!list) return; // Stopper hvis ikke finnes

    list.innerHTML = currentTasks.map((task, i) => ` 
        <li>
            ${escapeHtml(task.text)} 
            <span
                style="color:#c00;cursor:pointer;margin-left:8px"
                onclick="currentTasks.splice(${i},1);renderTempTasks()">
                fjern
            </span>
        </li>
    `).join(""); // Slår sammen HTML
}


// Lagre todo-liste til server
async function addTodo() {
    const title = document.getElementById("todoTitle").value; 

    if (!title || currentTasks.length === 0) { 
        return alert("Legg til tittel og minst en oppgave");
    }

    await fetch(`${API}/todos`, { // Sender POST request
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tasks: currentTasks }) 
    });

    currentTasks = []; // Nullstiller liste
    document.getElementById("todoTitle").value = ""; 

    const temp = document.getElementById("tempTasksList"); 
    if (temp) temp.innerHTML = ""; // Tømmer visning

    displayTodos(); 
}


// Henter og viser todos
async function displayTodos() {
    try {
        const res = await fetch(`${API}/todos`); 
        const todos = await res.json(); // Konverterer til JSON

        const container = document.getElementById("todosList"); // Henter container
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
        console.error("Kunne ikke laste todos:", err); // Logger feil
    }
}


// Toggle ferdig/ikke ferdig
async function toggleTask(todoId, taskId) {
    await fetch(`${API}/todos/${todoId}/tasks/${taskId}`, {
        method: "PATCH" // Oppdaterer kun status
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




setInterval(() => { // Kjører hvert 5. sekund for å holde UI synkronisert
    displayNotes(); // Oppdaterer notater
    displayTodos(); // Oppdaterer todos
}, 5000);


// Init
window.onload = () => { // Kjører når siden er ferdig lastet
    displayNotes(); // Laster notater
    displayTodos(); // Laster todos
};