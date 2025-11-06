import type { DefaultTheme } from "vitepress";

export const articlesSidebar: DefaultTheme.SidebarItem[] = [
  { text: "简介", link: "/articles/" },
  {
    text: "规范",
    items: [
      {
        text: "Node.js 项目开发规范",
        link: "/articles/frontend-dev-conventions"
      },
      {
        text: "Node.js 项目风格和命名规范",
        link: "/articles/frontend-naming-conventions"
      },
      {
        text: "后端项目开发规范",
        link: "/articles/backend-rules"
      },
      {
        text: "NestJS 开发规范",
        link: "/articles/nestjs-dev-conventions"
      }
    ]
  },
  {
    text: "Linux",
    items: [
      {
        text: "使用 Systemd 防止移动硬盘休眠",
        link: "/articles/linux-keep-usb-alive"
      }
    ]
  },
  {
    text: "前端",
    items: []
  }
];
