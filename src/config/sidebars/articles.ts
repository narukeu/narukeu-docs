import type { SidebarItem } from "../../types";

export const articlesSidebar: SidebarItem[] = [
  { label: "简介", slug: "articles" },
  {
    label: "TypeScript",
    collapsed: false,
    items: [
      {
        label: "聊下 `rewriteRelativeImportExtensions` 这个 TS 配置项",
        slug: "articles/rewrite-relative-import-extensions"
      }
    ]
  },
  {
    label: "Linux",
    collapsed: false,
    items: [
      {
        label: "固定在 Hyper-V 中 Ubuntu Server 虚拟机的 IP 地址",
        slug: "articles/ubuntu-server-hyperv-fix-ip"
      },
      {
        label: "在主机上设置 Linux 客户机 SSH 免密钥登录",
        slug: "articles/set-ssh-and-set-agent"
      },
      {
        label: "使用 Systemd 防止移动硬盘休眠",
        slug: "articles/linux-keep-usb-alive"
      },
      {
        label: "在只有无线网卡的笔记本上通过 Archiso 安装 Arch Linux",
        slug: "articles/archiso-wifi-laptop"
      }
    ]
  },
  {
    label: "技术杂谈",
    collapsed: false,
    items: [
      {
        label: '聊下前端 —— 关于我的职业经历和前端是否会被"取代"的碎碎念',
        slug: "articles/oh-frontend"
      },
      {
        label: "原生工具浪潮下 Babel 的定位与未来演进",
        slug: "articles/babel-in-future"
      },
      {
        label: "从 Anthropic 收购 Bun 谈起，聊聊 Bun 的败局",
        slug: "articles/sharp-comment-bun"
      },
      {
        label: '90% 代码用 AI 写？我拒了 Offer，也拒了所有华而不实的"网红技术"',
        slug: "articles/i-choose-avoid"
      }
    ]
  },
  {
    label: "规范",
    collapsed: false,
    items: [
      {
        label: "Node.js 项目开发规范",
        slug: "articles/frontend-dev-conventions"
      },
      {
        label: "Node.js 项目风格和命名规范",
        slug: "articles/frontend-naming-conventions"
      },
      { label: "后端项目开发规范", slug: "articles/backend-rules" },
      { label: "NestJS 开发规范", slug: "articles/nestjs-dev-conventions" },
      { label: "Go 语言项目开发规范", slug: "articles/go-conventions" },
      { label: "Uber Go 风格指南（译）", slug: "articles/uber-go" },
      { label: "JSDoc 注释规范", slug: "articles/jsdoc-based-comment" }
    ]
  }
];
