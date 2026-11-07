/// <reference types="@figma/plugin-typings" />

type Scope = "selected" | "same-size" | "all";

type FrameInfo = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type UiMessage =
  | { type: "list"; scope: Scope }
  | { type: "export"; ids: string[]; filename: string }
  | { type: "cancel" }
  | { type: "close" };

const EXPORTABLE_TYPES = new Set<SceneNode["type"]>([
  "FRAME",
  "COMPONENT",
  "COMPONENT_SET",
  "SECTION",
]);

let cancelled = false;
let activeScope: Scope = "selected";

figma.showUI(__html__, {
  width: 440,
  height: 680,
  themeColors: true,
  title: "Portfolio PDF Exporter",
});

function isExportable(node: BaseNode): node is SceneNode {
  return "type" in node && EXPORTABLE_TYPES.has(node.type as SceneNode["type"]);
}

function topLevelNode(node: SceneNode): SceneNode | null {
  let current: BaseNode | null = node;
  while (current.parent && current.parent.type !== "PAGE") current = current.parent;
  return current && isExportable(current) ? current : null;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function readingOrder(nodes: readonly SceneNode[]): SceneNode[] {
  return [...nodes].sort((a, b) => {
    const rowTolerance = Math.max(32, Math.min(a.height, b.height) * 0.22);
    if (Math.abs(a.y - b.y) <= rowTolerance) return a.x - b.x;
    return a.y - b.y;
  });
}

function selectedTopLevel(): SceneNode[] {
  return unique(
    figma.currentPage.selection
      .map((node) => topLevelNode(node))
      .filter((node): node is SceneNode => Boolean(node)),
  );
}

function pageFrames(): SceneNode[] {
  return figma.currentPage.children.filter(isExportable);
}

function framesForScope(scope: Scope): SceneNode[] {
  const selected = selectedTopLevel();
  if (scope === "selected") return readingOrder(selected);
  if (scope === "all") return readingOrder(pageFrames());

  const reference = selected[0];
  if (!reference) return [];
  return readingOrder(
    pageFrames().filter(
      (node) => Math.abs(node.width - reference.width) < 2 && Math.abs(node.height - reference.height) < 2,
    ),
  );
}

function serialize(node: SceneNode): FrameInfo {
  return {
    id: node.id,
    name: node.name || "Untitled frame",
    x: Math.round(node.x),
    y: Math.round(node.y),
    width: Math.round(node.width),
    height: Math.round(node.height),
  };
}

function sendFrames(scope: Scope) {
  activeScope = scope;
  const frames = framesForScope(scope).map(serialize);
  figma.ui.postMessage({ type: "frames", scope, frames });
}

async function exportFrames(ids: string[], filename: string) {
  cancelled = false;
  figma.ui.postMessage({ type: "export-start", total: ids.length, filename });

  for (let index = 0; index < ids.length; index += 1) {
    if (cancelled) {
      figma.ui.postMessage({ type: "export-cancelled" });
      return;
    }

    const node = await figma.getNodeByIdAsync(ids[index]);
    if (!node || !isExportable(node) || !("exportAsync" in node)) {
      figma.ui.postMessage({
        type: "export-error",
        message: `Frame bulunamadı: ${ids[index]}`,
      });
      return;
    }

    try {
      const bytes = await node.exportAsync({
        format: "PDF",
        contentsOnly: true,
        colorProfile: "SRGB",
      });
      figma.ui.postMessage({
        type: "pdf-page",
        index,
        total: ids.length,
        name: node.name,
        bytes,
      });
    } catch (pdfError) {
      // Some SVG/vector effects cannot be represented by Figma's PDF exporter.
      // Rasterizing only the affected frame keeps the rest of the document vector-based.
      try {
        const maxDimension = Math.max(node.width, node.height);
        const scale = Math.max(0.05, Math.min(2, 4096 / Math.max(1, maxDimension)));
        const bytes = await node.exportAsync({
          format: "PNG",
          contentsOnly: true,
          colorProfile: "SRGB",
          constraint: { type: "SCALE", value: scale },
        });
        figma.ui.postMessage({
          type: "image-page",
          index,
          total: ids.length,
          name: node.name,
          width: node.width,
          height: node.height,
          bytes,
          fallbackReason: pdfError instanceof Error ? pdfError.message : String(pdfError),
        });
      } catch (pngError) {
        figma.ui.postMessage({
          type: "export-error",
          message: `${node.name} PDF veya PNG olarak dışa aktarılamadı: ${
            pngError instanceof Error ? pngError.message : String(pngError)
          }`,
        });
        return;
      }
    }
  }

  figma.ui.postMessage({ type: "export-complete" });
}

figma.ui.onmessage = async (message: UiMessage) => {
  if (message.type === "list") sendFrames(message.scope);
  if (message.type === "cancel") cancelled = true;
  if (message.type === "close") figma.closePlugin();
  if (message.type === "export") {
    if (!message.ids.length) {
      figma.ui.postMessage({ type: "export-error", message: "En az bir frame seç." });
      return;
    }
    await exportFrames(message.ids, message.filename);
  }
};

figma.on("selectionchange", () => {
  if (activeScope === "selected" || activeScope === "same-size") sendFrames(activeScope);
});

void figma.currentPage.loadAsync().then(() => sendFrames("selected"));
