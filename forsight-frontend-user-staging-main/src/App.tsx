import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import Login from "./pages/Login";
import AuthComponent from "./components/modules/auth/AuthComponent";
import Home from "./pages/Home";
import XDetails from "./pages/XDetails";
import YoutubeDetails from "./pages/YoutubeDetails";
import WebDetails from "./pages/WebDetails";
import useTheme from "./hooks/useTheme";

const routes = createBrowserRouter(
  createRoutesFromElements([
    <Route path="/" element={<AuthComponent />} key={0}>
      <Route index element={<Home />} />
    </Route>,

    <Route path="/data/x/:id" element={<XDetails />} />,
    <Route path="/data/youtube/:id" element={<YoutubeDetails />} />,
    <Route path="/data/web/:id" element={<WebDetails />} />,
    <Route path="/login" element={<Login />} key={1} />,
    <Route key={2} path="/*" element={<NotFoundPage />} />,
  ])
);

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center w-full h-screen dark:bg-gray-900">
      <p className="text-3xl font-bold text-gray-500">404: Not found</p>
    </div>
  );
}

function App() {
  const { theme } = useTheme();
  const root = window.document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
}

export default App;
