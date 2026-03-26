# Notatapplikasjon med REST-API

# Beskrivelse
Dette er en enkel notatapplikasjon som lar brukere:  
- Lage tekstnotater med tittel og innhold  
- Lage todo-lister med tittel og oppgaver (hver oppgave har status fullført/ikke fullført)  

Løsningen består av:  
1. Server: Node.js + litt grunnleggende Express som lagrer data i en JSON-fil (`data.json`)  
2. Klient: HTML + JavaScript som kommuniserer med serveren via REST-API  

Dataene håndteres i JSON-format, og både notater og todo-lister kan hentes og legges til dynamisk.

---

## Installere og starte serveren

1. Sørg for at [Node.js](https://nodejs.org/) er installert.  
2. Åpne terminalen i prosjektmappen.  
3. Installer nødvendige pakker i terminalen:

npm init -y
npm install express cors