import { defineConfig } from "vitepress";
import {
  codesSidebar,
  articlesSidebar,
  designDocSidebar,
  springSidebar
} from "./sidebars";
import { MermaidMarkdown } from "./mermaid-markdown";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "zh-Hans",
  head: [["link", { rel: "icon", href: "/favicon.png" }]],
  title: "Luke Na's Docs",
  description: "Web 文章、资料、代码片段等内容",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "代码片段（前端）", link: "/codes" },
      { text: "文章/资料", link: "/articles" },
      { text: "设计文档", link: "/design-doc" },
      { text: "后端专区", link: "/spring" }
    ],
    sidebar: {
      "/articles": articlesSidebar,
      "/codes": codesSidebar,
      "/design-doc": designDocSidebar,
      "/spring": springSidebar
    },
    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "full",
        timeStyle: "medium"
      }
    },
    socialLinks: [{ icon: "github", link: "https://github.com/narukeu" }]
  },

  markdown: {
    config: (md) => {
      MermaidMarkdown(md);
    }
  },

  vite: {
    server: {
      port: 8890,
      host: true
    }
  }
});
