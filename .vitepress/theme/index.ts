import DefaultTheme from "vitepress/theme";
import { MermaidContainer } from "./mermaid";
import type { App } from "vue";

type EnhanceAppProps = {
  app: App;
};

export default {
  ...DefaultTheme,
  enhanceApp({ app }: EnhanceAppProps) {
    app.component("Mermaid", MermaidContainer);
  }
};
