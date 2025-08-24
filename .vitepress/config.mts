import { defineConfig } from "vitepress";
import { codesSidebar, articlesSidebar, designDocSidebar } from "./sidebars";
import { MermaidMarkdown } from "./mermaid-markdown";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "zh-Hans",
  head: [["link", { rel: "icon", href: "/favicon.png" }]],
  title: "Luke Na's Docs",
  description: "前端、JS、TS 相关的博客和代码片段",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "代码片段", link: "/codes" },
      { text: "文章", link: "/articles" },
      { text: "设计文档", link: "/design-doc" }
    ],
    sidebar: {
      "/articles": articlesSidebar,
      "/codes": codesSidebar,
      "/design-doc": designDocSidebar
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
