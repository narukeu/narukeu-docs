import type { DefaultTheme } from "vitepress";

export const codesSidebar: DefaultTheme.SidebarItem[] = [
  { text: "简介", items: [{ text: "代码片段", link: "/codes" }] },
  {
    text: "随机",
    items: [{ text: "简易版生成 UID 函数", link: "/codes/simple-uid" }]
  },
  {
    text: "数据显示",
    items: [
      { text: "实现 px 和 rem 的互相转换", link: "/codes/convert-px-rem" }
    ]
  }
];
