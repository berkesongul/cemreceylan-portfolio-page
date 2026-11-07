import { PDFDocument } from "pdf-lib";

type Scope = "selected" | "same-size" | "all";
type FrameInfo = { id: string; name: string; x: number; y: number; width: number; height: number };

const $ = <T extends Element>(selector: string, scope: ParentNode = document) => scope.querySelector(selector) as T;
const frameList = $<HTMLOListElement>("#frame-list");
const empty = $<HTMLElement>("#empty");
const exportButton = $<HTMLButtonElement>("#export");
const cancelButton = $<HTMLButtonElement>("#cancel");
const status = $<HTMLElement>("#status");
const progressBar = $<HTMLElement>("#progress-bar");
const filename = $("#filename") as HTMLInputElement;

let frames: FrameInfo[] = [];
let included = new Set<string>();
let mergedPdf: PDFDocument | null = null;
let mergeQueue = Promise.resolve();
let exporting = false;
let completedPages = 0;
let totalPages = 0;
let rasterizedPages = 0;

function send(pluginMessage: unknown) {
  parent.postMessage({ pluginMessage }, "*");
}

function safeFilename(value: string) {
  const clean = value.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ");
  return clean || "portfolio";
}

function setStatus(message: string, progress?: number) {
  status.textContent = message;
  if (typeof progress === "number") progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
}

function render() {
  frameList.innerHTML = "";
  empty.classList.toggle("hidden", frames.length > 0);
  exportButton.toggleAttribute("disabled", included.size === 0 || exporting);

  frames.forEach((frame, index) => {
    const item = document.createElement("li");
    item.className = "frame-item";
    item.innerHTML = `
      <label class="frame-check">
        <input type="checkbox" ${included.has(frame.id) ? "checked" : ""} />
        <span class="fake-check"></span>
      </label>
      <span class="frame-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="frame-copy"><b></b><small>${frame.width} × ${frame.height}</small></span>
      <span class="frame-actions">
        <button type="button" data-move="up" aria-label="Yukarı taşı" ${index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" data-move="down" aria-label="Aşağı taşı" ${index === frames.length - 1 ? "disabled" : ""}>↓</button>
      </span>`;

    $("b", item).textContent = frame.name;
    const checkbox = $("input", item) as HTMLInputElement;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) included.add(frame.id);
      else included.delete(frame.id);
      render();
    });

    item.querySelectorAll<HTMLButtonElement>("[data-move]").forEach((button) => {
      button.addEventListener("click", () => {
        const direction = button.dataset.move === "up" ? -1 : 1;
        const target = index + direction;
        [frames[index], frames[target]] = [frames[target], frames[index]];
        render();
      });
    });
    frameList.append(item);
  });
}

function changeScope(scope: Scope) {
  document.querySelectorAll("[data-scope]").forEach((button) => {
    button.classList.toggle("active", (button as HTMLElement).dataset.scope === scope);
  });
  setStatus("Frame listesi hazırlanıyor…", 0);
  send({ type: "list", scope });
}

document.querySelectorAll<HTMLButtonElement>("[data-scope]").forEach((button) => {
  button.addEventListener("click", () => changeScope(button.dataset.scope as Scope));
});

$("#select-all").addEventListener("click", () => {
  included = new Set(frames.map((frame) => frame.id));
  render();
});

$("#select-none").addEventListener("click", () => {
  included.clear();
  render();
});

exportButton.addEventListener("click", () => {
  const ids = frames.filter((frame) => included.has(frame.id)).map((frame) => frame.id);
  if (!ids.length) return;
  exporting = true;
  completedPages = 0;
  totalPages = ids.length;
  rasterizedPages = 0;
  mergedPdf = null;
  mergeQueue = Promise.resolve();
  cancelButton.classList.remove("hidden");
  exportButton.setAttribute("disabled", "");
  setStatus(`0 / ${totalPages} frame hazırlanıyor`, 0);
  send({ type: "export", ids, filename: safeFilename(filename.value) });
});

cancelButton.addEventListener("click", () => {
  send({ type: "cancel" });
  setStatus("İptal ediliyor…");
});

function finishExport() {
  exporting = false;
  cancelButton.classList.add("hidden");
  render();
}

async function downloadPdf() {
  if (!mergedPdf) throw new Error("PDF oluşturulamadı.");
  mergedPdf.setTitle(safeFilename(filename.value));
  mergedPdf.setCreator("Portfolio PDF Exporter for Figma");
  const bytes = await mergedPdf.save();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFilename(filename.value)}.pdf`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}

window.onmessage = (event) => {
  const message = event.data.pluginMessage;
  if (!message) return;

  if (message.type === "frames") {
    const previous = included;
    frames = message.frames;
    included = new Set(frames.filter((frame) => previous.size === 0 || previous.has(frame.id)).map((frame) => frame.id));
    if (!included.size) included = new Set(frames.map((frame) => frame.id));
    setStatus(frames.length ? `${frames.length} frame bulundu.` : "Bu kapsamda frame bulunamadı.", 0);
    render();
  }

  if (message.type === "export-start") {
    mergeQueue = mergeQueue.then(async () => {
      mergedPdf = await PDFDocument.create();
    });
  }

  if (message.type === "pdf-page") {
    mergeQueue = mergeQueue.then(async () => {
      if (!mergedPdf) mergedPdf = await PDFDocument.create();
      const source = await PDFDocument.load(message.bytes);
      const pages = await mergedPdf.copyPages(source, source.getPageIndices());
      pages.forEach((page) => mergedPdf?.addPage(page));
      completedPages += 1;
      setStatus(`${completedPages} / ${totalPages} · ${message.name}`, (completedPages / totalPages) * 100);
    });
  }

  if (message.type === "image-page") {
    mergeQueue = mergeQueue.then(async () => {
      if (!mergedPdf) mergedPdf = await PDFDocument.create();
      const image = await mergedPdf.embedPng(message.bytes);
      const page = mergedPdf.addPage([message.width, message.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: message.width,
        height: message.height,
      });
      completedPages += 1;
      rasterizedPages += 1;
      setStatus(
        `${completedPages} / ${totalPages} · ${message.name} (görsel fallback)`,
        (completedPages / totalPages) * 100,
      );
    });
  }

  if (message.type === "export-complete") {
    mergeQueue = mergeQueue
      .then(downloadPdf)
      .then(() => {
        const fallbackNote = rasterizedPages ? ` · ${rasterizedPages} sayfa görsele dönüştürüldü` : "";
        setStatus(`Tamamlandı · ${completedPages} sayfalık PDF indirildi${fallbackNote}.`, 100);
      })
      .catch((error) => setStatus(`Hata: ${error.message}`))
      .finally(finishExport);
  }

  if (message.type === "export-error") {
    mergeQueue = mergeQueue.finally(() => {
      setStatus(`Hata: ${message.message}`);
      finishExport();
    });
  }

  if (message.type === "export-cancelled") {
    mergeQueue = mergeQueue.finally(() => {
      setStatus("Dışa aktarma iptal edildi.", 0);
      finishExport();
    });
  }
};

changeScope("selected");
