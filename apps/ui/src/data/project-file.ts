export const projectFiles = {
  "vanilla-web-app": {
    directory: {
      "package.json": {
        file: {
          contents: `{
  "name": "vanilla-web-app",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}`,
        },
      },

      "server.js": {
        file: {
          contents: `import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
`,
        },
      },

      public: {
        directory: {
          "index.html": {
            file: {
              contents: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vanilla Web App</title>
  <link rel="stylesheet" href="./style.css" />
</head>
<body>
  <div class="app">
    <h1>🚀 Vanilla HTML + CSS + JS</h1>
    <p>This is served from a Node.js server.</p>
    <button id="pingBtn">Ping Server</button>
    <pre id="output"></pre>
  </div>

  <script src="./script.js"></script>
</body>
</html>`,
            },
          },

          "style.css": {
            file: {
              contents: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #000000;
  color: #e5e7eb;
}

.app {
  padding: 40px;
  max-width: 600px;
  margin: auto;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #2563eb;
}

pre {
  margin-top: 16px;
  padding: 12px;
  background: #020617;
  border-radius: 6px;
}`,
            },
          },

          "script.js": {
            file: {
              contents: `const btn = document.getElementById("pingBtn");
const output = document.getElementById("output");

btn.addEventListener("click", async () => {
  output.textContent = "Pinging server...";
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = "Error connecting to server";
  }
});
`,
            },
          },
        },
      },
    },
  },
};

// export const projectFiles = {
//   "vite-react-app": {
//     directory: {
//       "package.json": {
//         file: {
//           contents: `{
//   "name": "vite-react-app",
//   "private": true,
//   "version": "0.0.0",
//   "type": "module",
//   "scripts": {
//     "dev": "vite --host",
//     "build": "vite build",
//     "preview": "vite preview"
//   },
//   "dependencies": {
//     "react": "^18.2.0",
//     "react-dom": "^18.2.0"
//   },
//   "devDependencies": {
//     "vite": "^5.0.0",
//     "@vitejs/plugin-react": "^4.0.0",
//     "typescript": "^5.0.0"
//   }
// }`,
//         },
//       },

//       "vite.config.ts": {
//         file: {
//           contents: `import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
// });
// `,
//         },
//       },

//       "tsconfig.json": {
//         file: {
//           contents: `{
//   "compilerOptions": {
//     "target": "ESNext",
//     "lib": ["DOM", "DOM.Iterable", "ESNext"],
//     "jsx": "react-jsx",
//     "module": "ESNext",
//     "moduleResolution": "bundler",
//     "strict": true,
//     "skipLibCheck": true
//   }
// }`,
//         },
//       },

//       "index.html": {
//         file: {
//           contents: `<!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <title>Vite App</title>
//   </head>
//   <body>
//     <div id="root"></div>
//     <script type="module" src="/src/main.tsx"></script>
//   </body>
// </html>`,
//         },
//       },

//       src: {
//         directory: {
//           "main.tsx": {
//             file: {
//               contents: `import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./index.css";

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
// `,
//             },
//           },

//           "App.tsx": {
//             file: {
//               contents: `export default function App() {
//   return (
//     <div style={{ padding: 24 }}>
//       <h1>Vite + React</h1>
//       <p>Edit App.tsx and save to test HMR</p>
//     </div>
//   );
// }
// `,
//             },
//           },

//           "index.css": {
//             file: {
//               contents: `* {
//   box-sizing: border-box;
// }

// body {
//   margin: 0;
//   font-family: system-ui, sans-serif;
// }
// `,
//             },
//           },
//         },
//       },
//     },
//   },
// };
