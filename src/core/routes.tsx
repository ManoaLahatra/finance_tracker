import type { RouteObject } from "react-router-dom";
import MainLayout from "@core/components/Layout/MainLayout";
import Dashboard from "@screens/Dashboard/Dashboard";
import Accounts from "@screens/Accounts/Accounts";
import Categories from "@screens/Categories/Categories";
import Transactions from "@screens/Transactions/Transactions";
import Summary from "@screens/Summary/Summary";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/accounts",
        element: <Accounts />,
      },
      {
        path: "/categories",
        element: <Categories />,
      },
      {
        path: "/transactions",
        element: <Transactions />,
      },
      {
        path: "/summary",
        element: <Summary />,
      },
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
];

export default routes;
