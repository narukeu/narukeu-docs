import type { SidebarItem } from "../../types";

export const designDocSidebar: SidebarItem[] = [
  { label: "简介", slug: "design-doc" },
  {
    label: "Go",
    collapsed: false,
    items: [{ label: "基础设施设计文档", slug: "design-doc/packer" }]
  }
];
