import { createFileRoute } from "@tanstack/react-router";
import { Resources } from "@/components/hera/Resources";

export const Route = createFileRoute("/resources")({
  component: Resources,
});
