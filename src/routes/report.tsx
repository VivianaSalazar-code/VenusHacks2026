import { createFileRoute } from "@tanstack/react-router";
import { HealthReport } from "@/components/hera/HealthReport";

export const Route = createFileRoute("/report")({
  component: HealthReport,
});
