import { writeFile } from "node:fs/promises";

const open = "<";
const lines = [
  open + "!DOCTYPE html>",
  open + 'html lang="en" style="height: 100%">',
  "  " + open + "head>",
  '    ' + open + 'meta charset="UTF-8" />',
  '    ' + open + 'meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />',
  "    " + open + "title>Mockup Canvas" + open + "/title>",
  "  " + open + "/head>",
  '  ' + open + 'body style="height: 100%; margin: 0">',
  '    ' + open + 'div id="root" style="height: 100%">' + open + "/div>",
  '    ' + open + 'script type="module" src="/src/main.tsx">' + open + "/script>",
  "  " + open + "/body>",
  open + "/html>",
  "",
];

await writeFile(new URL("./index.html", import.meta.url), lines.join("\n"));