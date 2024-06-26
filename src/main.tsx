import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Params,
  RouterProvider,
  ShouldRevalidateFunction
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Home from "./routes/Home.tsx";
import Supersede from "./routes/Supersede.tsx";
import FollowUp from "./routes/FollowUp.tsx";
import NewEntry from "./routes/NewEntry.tsx";
import ViewEntry from "./routes/ViewEntry.tsx";
import ErrorBoundary from "./routes/ErrorBoundary";
import AdminNavbar from "./components/AdminNavbar.tsx";
import AdminLogbooks from "./routes/AdminDashboard/AdminLogbooks.tsx";
import AdminGroups from "./routes/AdminDashboard/AdminGroups.tsx";
import AdminUsers from "./routes/AdminDashboard/AdminUsers.tsx";
import AdminApplications from "./routes/AdminDashboard/AdminApplications.tsx";
import { fetchEntry, ServerError } from "./api";
import "./index.css";
import reportServerError from "./reportServerError.tsx";

const queryClient = new QueryClient();

function entryLoader({ params }: { params: Params }) {
  if (params.entryId) {
    const entryId = params.entryId as string;

    return queryClient
      .prefetchQuery({
        queryKey: ["entry", entryId],
        queryFn: () => fetchEntry(entryId),
      })
      .then(() => null);
  }
  return null;
}

function shouldRevalidate({
  currentParams,
  nextParams,
}: Parameters<ShouldRevalidateFunction>[0]) {
  return currentParams.entryId !== nextParams.entryId;
}

const router = createBrowserRouter(
  [
    {
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: "/admin",
          element: (<AdminNavbar />),
          children: [
            {
              index: true,
              path: "logbooks",
              element: <AdminLogbooks/>
            },
            {
              path: "/admin/logbooks/:logbookId",
              element: <AdminLogbooks />,
            },
            {
              path: "users",
              element: <AdminUsers/>
            },
            {
              path: "/admin/users/:userID",
              element: <AdminUsers/>
            },

            {
              path: "groups",
              element: (<AdminGroups/>)
            },
            {
              path: "/admin/groups/:groupID",
              element: <AdminGroups/>
            },
            {
              path: "applications",
              element: <AdminApplications/>
            },
            {
              path: "applications/:appID",
              element: <AdminApplications/>
            }
          ]
        },
        
        {
          path: "/",
          element: <Home />,
          errorElement: <ErrorBoundary />,
          children: [
            {
              path: ":entryId/supersede",
              loader: entryLoader,
              shouldRevalidate,
              element: <Supersede />,
            },
            {
              path: ":entryId/follow-up",
              loader: entryLoader,
              shouldRevalidate,
              element: <FollowUp />,
            },
            {
              path: ":entryId",
              loader: entryLoader,
              shouldRevalidate,
              element: <ViewEntry />,
            },
            {
              path: "new-entry",
              element: <NewEntry />,
            },
          ],
        },
      ],
    },
  ],
  { basename: "/elog" }
);

window.addEventListener("unhandledrejection", (e) => {
  if (e.reason instanceof ServerError) {
    reportServerError("Unexpected error", e.reason);
  }
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer hideProgressBar={true} />
    </QueryClientProvider>
  </React.StrictMode>
);
