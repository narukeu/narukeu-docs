import type { DefaultTheme } from "vitepress";

export const articlesSidebar: DefaultTheme.SidebarItem[] = [
  { text: "简介", link: "/articles/" },
  {
    text: "规范",
    items: [
      {
        text: "Node.js 项目通用代码规范",
        link: "/articles/frontend-naming-conventions"
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
    items: [
      {
        text: "常用的 JavaScript 方法",
        link: "/articles/common-js-func"
      }
    ]
  }
];
