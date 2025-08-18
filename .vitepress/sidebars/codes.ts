import type { DefaultTheme } from "vitepress";

export const codesSidebar: DefaultTheme.SidebarItem[] = [
  { text: "简介", items: [{ text: "代码片段", link: "/codes" }] },
  {
    text: "代码格式化",
    items: [
      {
        text: "Eslint 配置",
        link: "/codes/eslint-flat-config"
      }
    ]
  },
  {
    text: "数组",
    items: [
      { text: "对象数组指定键求和", link: "/codes/array-sum" },
      {
        text: "根据选择数据获取标签",
        link: "/codes/array-get-value-by-select-data"
      },
      {
        text: "根据 id 列表从对象数组中过滤出项并返回匹配项和在其在原数组的索引",
        link: "/codes/filter-array-with-index-by-id"
      }
    ]
  },
  {
    text: "对象",
    items: [
      { text: "将对象转换为 URL 查询字符串", link: "/codes/build-query-string" }
    ]
  },
  {
    text: "随机",
    items: [
      { text: "简易版生成 UID 函数", link: "/codes/simple-uid" },
      { text: "为给定的延迟时间添加抖动", link: "/codes/add-jitter" }
    ]
  },
  {
    text: "数据显示",
    items: [
      { text: "实现 px 和 rem 的互相转换", link: "/codes/convert-px-rem" }
    ]
  }
];
