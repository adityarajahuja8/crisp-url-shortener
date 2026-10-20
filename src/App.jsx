
import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import { Button } from "@/components/ui/button";
import AppLayout from "./layouts/app-layout";
import RedirectLink from "./pages/redirect-link";
import LandingPage from "./pages/landing";
import Link from "./pages/link";
import Auth from "./pages/auth";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import Dashboard from "./pages/dashboard";
import UrlProvider from './context';
import RequireAuth from './components/require';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/dashboard",
        element:
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
          ,
      },
      {
        path: "/auth",
        element:
          <Auth />
        ,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/link/:id",
        element: <RequireAuth>
          <Link />
        </RequireAuth>,
      },
      {
        path: "/:id",
        element:<RedirectLink />
      },
      {
        path: "*",
        element: (
          <div className="py-10 text-center">
            <p className="text-4xl font-bold">Page not found.</p>
            <br/>
            <a href="/" className="text-blue-400 hover:underline decoration-slate-400 underline-offset-4">Go home</a>
          </div>
        ),
      },
    ],
  },
]);

function App() {
  return( 
    <UrlProvider> 
      <RouterProvider router={router}/>
    </UrlProvider>
  )
}

export default App