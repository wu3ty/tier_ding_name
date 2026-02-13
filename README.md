# Tier, Ding, Name

A simple frontend skeleton for the game "Tier Ding Name", "Animal, Thing, Name" (aka _Categories_ in English). The running application is available here https://wu3ty.github.io/tier_ding_name/.

- Random starting letter (A-Z) via animated spinning wheel
- Round timer with selectable duration (1-30 minutes)
- Manual or automatic round end

## Run Locally

Since the script is loaded as ES modules, run it through a local web server:

```bash
python3 -m http.server 5173
```

Then open in your browser:

`http://localhost:5173`

## Tests

Unit tests with the Node test runner:

```bash
npm test
```

## Potential next steps

- Scoring per player
- Input fields and validation per category
- Round results view
- Persistence (e.g., LocalStorage)
- Build setup (e.g., Vite) for deployment

