import { createFileRoute } from "@tanstack/react-router";
import { MealTracker } from "@/components/hera/MealTracker";

export const Route = createFileRoute("/meal-tracker")({
  component: MealTracker,
});
