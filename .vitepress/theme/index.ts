import DefaultTheme from "vitepress/theme";
import { MermaidContainer } from "./mermaid";

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component("Mermaid", MermaidContainer);
  }
};
