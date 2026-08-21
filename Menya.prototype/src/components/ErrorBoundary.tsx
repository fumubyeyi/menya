import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router";
import { AlertTriangle, RotateCcw, LogIn } from "lucide-react";

function describeError(error: unknown): { title: string; detail: string } {
  if (isRouteErrorResponse(error)) {
    return {
      title: error.status === 404 ? "Page not found" : `Error ${error.status}`,
      detail: error.statusText || "That page doesn't exist or couldn't be loaded.",
    };
  }
  if (error instanceof Error) {
    return { title: "Something went wrong", detail: error.message || "An unexpected error occurred." };
  }
  return { title: "Something went wrong", detail: "An unexpected error occurred." };
}

// Renders full-viewport — for the router root, where AppShell itself may not have mounted.
export function AppErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { title, detail } = describeError(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-sm p-8 text-center space-y-5">
        <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-display font-semibold text-lg text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-1">
          <button onClick={() => navigate(0)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
            <RotateCcw className="w-3.5 h-3.5" /> Reload
          </button>
          <button onClick={() => navigate("/login")}
            className="flex items-center gap-1.5 px-4 py-2 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted transition-colors">
            <LogIn className="w-3.5 h-3.5" /> Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

// Renders inside AppShell's content area, so the sidebar/nav stay usable while
// only the page that errored is replaced.
export function SectionErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { title, detail } = describeError(error);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center space-y-5">
        <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-display font-semibold text-lg text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
        <button onClick={() => navigate(0)}
          className="flex items-center gap-1.5 mx-auto px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
          <RotateCcw className="w-3.5 h-3.5" /> Reload
        </button>
      </div>
    </div>
  );
}
