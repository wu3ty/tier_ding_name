# Tier Ding Name (SPA-Geruest)

Ein einfaches Frontend-Grundgeruest fuer das Spiel "Tier Ding Name":

- Zufalls-Startbuchstabe (A-Z) per animiertem Gluecksrad
- Rundentimer mit frei waehbarer Laufzeit (1-30 Minuten)
- Manuelles oder automatisches Rundenende

## Lokal starten

Da das Script als ES-Module geladen wird, starte es ueber einen lokalen Webserver:

```bash
python3 -m http.server 5173
```

Dann im Browser oeffnen:

`http://localhost:5173`

## Tests

Unit-Tests mit dem Node Test Runner:

```bash
npm test
```

## Naechste Schritte Richtung vollwertige SPA

- Punktevergabe pro Spieler
- Eingabefelder und Validierung je Kategorie
- Rundenergebnis-Ansicht
- Persistenz (z. B. LocalStorage)
- Build-Setup (z. B. Vite) fuer Deployment
