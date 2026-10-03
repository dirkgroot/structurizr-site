import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { siteName } from "../shared/site.js";
import { App } from "./app/App";
import { loadWorkspace } from "./data/workspace.js";
import "./styles/global.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("missing #root element");
}

// Load the exported workspace before first render so the site name is correct
// immediately. A missing or invalid workspace falls back to the placeholder name.
const workspace = await loadWorkspace();
document.title = siteName(workspace);

createRoot(root).render(
  <StrictMode>
    <App workspace={workspace} />
  </StrictMode>,
);
