// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import {
  codesSidebar,
  articlesSidebar,
  designDocSidebar,
  githubCollectionsSidebar
} from "./src/config/sidebars";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Luke Na's Docs",
      description: "Web 文章、资料、代码片段等内容",
      defaultLocale: "root",
      locales: {
        root: {
          label: "简体中文",
          lang: "zh-CN"
        }
      },
	  favicon: "/favicon.png",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/narukeu"
        }
      ],
      lastUpdated: true,
      sidebar: [
        {
          label: "代码片段",
          items: codesSidebar
        },
        {
          label: "文章/资料",
          items: articlesSidebar
        },
        {
          label: "设计文档",
          items: designDocSidebar
        },
        {
          label: "GitHub 项目收集",
          items: githubCollectionsSidebar
        }
      ],
	    routeMiddleware: "./src/route.ts",
	    plugins: [
      ],
    })
  ]
});
