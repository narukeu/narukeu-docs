import type { DefaultTheme } from "vitepress";

export const designDocSidebar: DefaultTheme.SidebarItem[] = [
  { text: "简介", items: [{ text: "设计文档", link: "/design-doc" }] },
  {
    text: "OKUtils",
    items: [{ text: "Fetch", link: "/design-doc/okutils/fetch.md" }]
  },
  { text: "RookiePack", link: "/design-doc/rookiepack" }
];
