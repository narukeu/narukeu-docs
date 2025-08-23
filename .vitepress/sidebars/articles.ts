import type { DefaultTheme } from "vitepress";

export const articlesSidebar: DefaultTheme.SidebarItem[] = [
  { text: "简介", link: "/articles/" },
  {
    text: "规范",
    items: [
      {
        text: "自用前端命名规范",
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
  }
];
