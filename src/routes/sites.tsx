import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/sites")({
  component: SitesLayout,
});

function SitesLayout() {
  return <Outlet />;
}
