import { createFileRoute } from "@tanstack/react-router";
import { PrenatalHub } from "@/components/hera/PrenatalHub";

export const Route = createFileRoute("/prenatal")({
  component: PrenatalHub,
});