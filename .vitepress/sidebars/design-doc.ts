import type { DefaultTheme } from "vitepress";

export const designDocSidebar: DefaultTheme.SidebarItem[] = [
  { text: "简介", items: [{ text: "设计文档", link: "/design-doc" }] },
  {
    text: "Go",
    items: [{ text: "基础设施设计文档", link: "/design-doc/ripple.md" }]
  }
  // { text: "RookiePack", link: "/design-doc/rookiepack" }
];
