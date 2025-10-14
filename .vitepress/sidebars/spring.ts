import type { DefaultTheme } from "vitepress";

export const springSidebar: DefaultTheme.SidebarItem[] = [
  { text: "简介", items: [{ text: "设计文档", link: "/spring" }] },
  {
    text: "微服务",
    items: [
      { text: "微服务项目中鉴权逻辑和分工", link: "/spring/microservice-auth" }
    ]
  }
];
