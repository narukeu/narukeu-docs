import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import type { StarlightRouteData } from "@astrojs/starlight/route-data";

type SidebarEntry = StarlightRouteData["sidebar"][number];

const containsActive = (entry: SidebarEntry): boolean => {
  if (entry.type === "link") return entry.isCurrent;
  if (entry.type === "group") return entry.entries.some(containsActive);
  return false;
};

export const onRequest = defineRouteMiddleware((context) => {
  const { starlightRoute } = context.locals;

  if (!starlightRoute.hasSidebar) return;

  const matchedGroup = starlightRoute.sidebar.find(
    (entry) => entry.type === "group" && containsActive(entry)
  );

  if (matchedGroup && matchedGroup.type === "group") {
    starlightRoute.sidebar = matchedGroup.entries;
  }
});
