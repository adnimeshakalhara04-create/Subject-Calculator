# Tablet Run

This branch exists only to run the original main project from GitHub Codespaces without changing the original app source.

When a Codespace starts:
1. The split ZIP parts are merged.
2. The ZIP is extracted.
3. The first app package.json is detected.
4. Dependencies are installed.
5. The dev server starts on port 3000.

If the page does not open automatically, open the Ports tab in Codespaces and tap Subject Calculator (3000).

Logs:
```bash
cat /tmp/subject-calculator.log
```

Manual restart:
```bash
bash .devcontainer/start-app.sh
```
