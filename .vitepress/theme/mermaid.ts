import mermaid, { type MermaidConfig } from "mermaid";
import {
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  type PropType
} from "vue";

const render = async (
  id: string,
  code: string,
  config: MermaidConfig
): Promise<string> => {
  mermaid.initialize(config);
  const { svg } = await mermaid.render(id, code);
  return svg;
};

export const MermaidContainer = defineComponent({
  name: "Mermaid",
  props: {
    graph: {
      type: String as PropType<string>,
      required: true
    },
    id: {
      type: String as PropType<string>,
      required: true
    },
    showCode: {
      type: Boolean as PropType<boolean>,
      default: true
    }
  },
  setup(props) {
    const svg = ref<string>("");
    const code = ref<string>(decodeURIComponent(props.graph));
    const ctrlSymbol = ref<string>(
      /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "⌘" : "Ctrl"
    );
    const editableContent = ref<HTMLElement | null>(null);
    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
    const contentEditable = ref<string>(isFirefox ? "true" : "plaintext-only");

    let mut: MutationObserver | null = null;

    const updateCode = (event: Event) => {
      const target = event.target as HTMLElement;
      code.value = target.innerText;
    };

    const renderChart = async () => {
      console.log("rendering chart" + props.id + code.value);
      const hasDarkClass = document.documentElement.classList.contains("dark");
      const mermaidConfig = {
        securityLevel: "loose" as const,
        startOnLoad: false,
        theme: hasDarkClass ? ("dark" as const) : ("default" as const)
      };
      const svgCode = await render(props.id, code.value, mermaidConfig);

      // This is a hack to force v-html to re-render, otherwise the diagram disappears
      // when **switching themes** or **reloading the page**.
      const salt = Math.random().toString(36).substring(7);
      svg.value = `${svgCode} <span style="display: none">${salt}</span>`;
    };

    onMounted(async () => {
      mut = new MutationObserver(() => renderChart());
      mut.observe(document.documentElement, { attributes: true });

      if (editableContent.value) {
        editableContent.value.textContent = code.value;
      }

      await renderChart();
    });

    onUnmounted(() => {
      if (mut) {
        mut.disconnect();
      }
    });

    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        renderChart();
      }
    };

    return () => {
      const codeSection = props.showCode
        ? h("div", [
            h("h5", "Code:"),
            h("div", { class: "language-mermaid" }, [
              h("button", { class: "copy" }),
              h("span", { class: "lang" }, "mermaid"),
              h("pre", [
                h("code", {
                  contenteditable: contentEditable.value,
                  onInput: updateCode,
                  onKeydown: handleKeydown,
                  ref: editableContent,
                  class: "editable-code"
                })
              ]),
              h("div", { class: "buttons-container" }, [
                h("span", `${ctrlSymbol.value} + Enter`),
                h("span", "|"),
                h("button", { onClick: renderChart }, "Run ▶")
              ])
            ])
          ])
        : null;

      const svgSection = h("div", {
        innerHTML: svg.value
      });

      return h("div", [codeSection, svgSection].filter(Boolean));
    };
  }
});
