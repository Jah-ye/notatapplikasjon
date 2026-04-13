Notat & Todo Applikasjon
Beskrivelse av løsningen

Dette er en enkel webapplikasjon for notater og todo-lister. Brukeren kan opprette notater, lage oppgaver og organisere dem i lister via et enkelt og brukervennlig grensesnitt.

Applikasjonen består av:

Frontend: HTML, CSS og JavaScript
Backend: Node.js med Express API
Database: SQLite 

Funksjonalitet:
Opprette og lagre notater
Lage todo-lister med flere oppgaver
Hente og vise lagrede data fra server
Kommunikasjon mellom klient og server via REST API



Hvordan installere og starte serveren

Installer Node.js
Gå til prosjektmappen i terminalen
Installer nødvendige pakker:
npm install express cors sqlite3
Start serveren:
node server.js

Serveren kjører vanligvis på http://192.168.20.62:3000/ eller http://localhost:3000 på hvis du ønsker å se dette lokalt via Live Server.

Hvordan starte klienten

Åpne index.html i nettleseren.
For riktig API-funksjonalitet anbefales det å bruke Live Server i VS Code:

Høyreklikk index.html
Velg Open with Live Server!