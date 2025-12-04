import type { DefaultTheme } from "vitepress";

export const articlesSidebar: DefaultTheme.SidebarItem[] = [
  { text: "简介", link: "/articles" },
  {
    text: "杂谈",
    items: [
      {
        text: "聊下前端 —— 关于我的职业经历和前端是否会被“取代”的碎碎念",
        link: "/articles/oh-frontend"
      },
      {
        text: "原生工具浪潮下 Babel 的定位与未来演进",
        link: "/articles/babel-in-future"
      },
      {
        text: "从 Anthropic 收购 Bun 谈起，聊聊 Bun 的败局",
        link: "/articles/sharp-comment-bun"
      }
    ]
  },
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
      },
      {
        text: "Go 语言项目开发规范",
        link: "/articles/go-conventions"
      },
      {
        text: "Uber Go 风格指南（译）",
        link: "/articles/uber-go"
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
