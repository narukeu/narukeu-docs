import type { SidebarItem } from "../../types";

export const codesSidebar: SidebarItem[] = [
  { label: "简介", slug: "codes" },
  {
    label: "配置文件",
    collapsed: false,
    items: [
      { label: "前端通用 .gitignore", slug: "codes/frontend-gitignore" },
      { label: "BiomeJS 配置", slug: "codes/biomejs-config" },
      { label: "Eslint 配置", slug: "codes/eslint-flat-config" }
    ]
  },
  {
    label: "类型判断",
    collapsed: false,
    items: [{ label: "isEmpty 判空函数", slug: "codes/is-empty" }]
  },
  {
    label: "数组",
    collapsed: false,
    items: [
      { label: "对象数组指定键求和", slug: "codes/array-sum" },
      {
        label: "根据选择数据获取标签",
        slug: "codes/array-get-value-by-select-data"
      },
      {
        label: "根据 id 列表从对象数组中过滤出项并返回匹配项和在其在原数组的索引",
        slug: "codes/filter-array-with-index-by-id"
      }
    ]
  },
  {
    label: "对象",
    collapsed: false,
    items: [
      {
        label: "将对象转换为 URL 查询字符串",
        slug: "codes/build-query-string"
      }
    ]
  },
  {
    label: "随机",
    collapsed: false,
    items: [
      { label: "简易版生成 UID 函数", slug: "codes/simple-uid" },
      { label: "为给定的延迟时间添加抖动", slug: "codes/add-jitter" }
    ]
  },
  {
    label: "数据显示",
    collapsed: false,
    items: [
      { label: "实现 px 和 rem 的互相转换", slug: "codes/convert-px-rem" }
    ]
  }
];
