import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { MealTracker } from "./components/MealTracker";
import { Resources } from "./components/Resources";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "meal-tracker", Component: MealTracker },
      { path: "resources", Component: Resources },
    ],
  },
]);
