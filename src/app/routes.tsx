import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { MealTracker } from "./components/MealTracker";
import { Resources } from "./components/Resources";
import LongitudinalHealthReport from "./components/LongitudinalHealthReport";
import { PrenatalHub } from "./components/PrenatalHub";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Layout,
        children: [
            { index: true, Component: Dashboard },
            { path: "prenatal", Component: PrenatalHub }, // ─── ADDED: Define the route path
            { path: "meal-tracker", Component: MealTracker },
            { path: "resources", Component: Resources },
            { path: "export", Component: LongitudinalHealthReport },
        ],
    },
]);