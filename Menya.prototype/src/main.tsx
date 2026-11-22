
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { migrateLegacyProgress } from "./lib/studentProgress";

  // Move module progress saved before it was per-student (runs once; see
  // lib/studentProgress.ts).
  migrateLegacyProgress();

  createRoot(document.getElementById("root")!).render(<App />);
  