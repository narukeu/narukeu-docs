import type { DefaultTheme } from "vitepress";

export const articlesSidebar: DefaultTheme.SidebarItem[] = [
  { text: "简介", link: "/articles/" },
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
