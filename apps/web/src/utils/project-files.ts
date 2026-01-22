export const projectFiles = {
  "vite-react-app": {
    directory: {
      "package.json": {
        file: {
          contents: `{
  "name": "vite-react-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
  "dev": "vite --host",
  "build": "vite build",
  "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0"
  }
}`,
        },
      },

      "vite.config.ts": {
        file: {
          contents: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [react()],
});
`,
        },
      },

      "tsconfig.json": {
        file: {
          contents: `{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  }
}`,
        },
      },

      "index.html": {
        file: {
          contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        },
      },

      src: {
        directory: {
          "main.tsx": {
            file: {
              contents: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
            },
          },

          "App.tsx": {
            file: {
              contents: `export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Vite + React</h1>
      <p>Edit App.tsx and save to test HMR</p>
    </div>
  );
}
`,
            },
          },

          "index.css": {
            file: {
              contents: `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
`,
            },
          },
        },
      },
    },
  },
};
