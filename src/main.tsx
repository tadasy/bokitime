import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthListener } from "./hooks/use-auth";
import App from "./app";
import LoginPage from "./routes/login";
import TimerPage from "./routes/timer";
import HistoryPage from "./routes/history";
import StatsPage from "./routes/stats";
import GoalsPage from "./routes/goals";
import SettingsPage from "./routes/settings";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function Root() {
  useAuthListener();

  return (
    <BrowserRouter>
      <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<App />}>
            <Route index element={<TimerPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  </StrictMode>,
);
