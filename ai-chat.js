// @ts-check

(() => {
  if (location.pathname.endsWith("/print.html") || document.getElementById("rust-ai-panel")) {
    return;
  }

  const API_BASE = "http://127.0.0.1:8787";
  const STORAGE_PREFIX = "rust-book-ai:";
  const activeConvKey = `${STORAGE_PREFIX}active-conversation:${location.pathname}`;
  const widthKey = `${STORAGE_PREFIX}panel-width`;
  const openKey = `${STORAGE_PREFIX}panel-open`;
  
  const state = {
    conversationId: localStorage.getItem(activeConvKey) || null,
    messages: /** @type {Array<{role: string, content: string, chapters?: Array<{title: string, path: string}>}>} */ ([]),
    generating: false,
    composing: false,
    controller: /** @type {AbortController | null} */ (null),
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    const menuButtons = document.querySelector("#mdbook-menu-bar .right-buttons");
    if (!menuButtons) return;

    const toggle = document.createElement("button");
    toggle.id = "rust-ai-toggle";
    toggle.type = "button";
    toggle.title = "打开 Ferris";
    toggle.setAttribute("aria-controls", "rust-ai-panel");
    toggle.innerHTML = '<img class="ai-ferris-icon" src="img/ferris/not_desired_behavior.svg" alt=""><span class="ai-toggle-label">Ferris</span>';
    toggle.addEventListener("click", () => setPanelOpen(!isPanelOpen()));
    menuButtons.append(toggle);

    document.body.insertAdjacentHTML("beforeend", panelTemplate());
    bindEvents();
    restorePanelState();

    if (state.conversationId) {
      loadConversationMessages(state.conversationId);
    } else {
      renderMessages();
    }
    checkHealth();
  }

  function panelTemplate() {
    const title = escapeHtml(getPageTitle());
    return `
      <aside id="rust-ai-panel" aria-label="Ferris">
        <div class="ai-resize-handle" aria-hidden="true"></div>
        <header class="ai-panel-header">
          <div class="ai-panel-heading">
            <strong>Ferris</strong>
            <span title="${title}">${title}</span>
          </div>
          <button class="ai-icon-button" id="rust-ai-new" title="新建对话" aria-label="新建对话">＋</button>
          <button class="ai-icon-button" id="rust-ai-close" title="收起面板" aria-label="收起面板">×</button>
        </header>
        <div class="ai-chat-scroll" id="rust-ai-messages"></div>
        <div class="ai-composer-wrap">
          <div class="ai-context-row">
            <select id="rust-ai-mode" aria-label="对话上下文">
              <option value="page">当前页面</option>
              <option value="book">教材学习</option>
              <option value="rust">通用 Rust</option>
            </select>
            <span class="ai-status" id="rust-ai-status">正在检查服务…</span>
          </div>
          <div class="ai-composer">
            <textarea id="rust-ai-input" rows="2" placeholder="询问当前页面或 Rust 知识…"></textarea>
            <div class="ai-composer-actions">
              <span class="ai-composer-hint">Enter 发送 · Shift+Enter 换行</span>
              <button id="rust-ai-send" type="button" aria-label="发送">${sendClawIcon()}</button>
            </div>
          </div>
        </div>
      </aside>`;
  }

  function bindEvents() {
    byId("rust-ai-close").addEventListener("click", () => setPanelOpen(false));
    byId("rust-ai-new").addEventListener("click", clearConversation);
    byId("rust-ai-send").addEventListener("click", sendMessage);

    const input = /** @type {HTMLTextAreaElement} */ (byId("rust-ai-input"));
    input.addEventListener("compositionstart", () => {
      state.composing = true;
    });
    input.addEventListener("compositionend", () => {
      state.composing = false;
    });
    input.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter"
        && !event.shiftKey
        && !event.isComposing
        && !state.composing
        && event.keyCode !== 229
      ) {
        event.preventDefault();
        sendMessage();
      }
    });
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
    });

    document.querySelector(".ai-resize-handle")?.addEventListener("pointerdown", startResize);
  }

  function restorePanelState() {
    const width = Number(localStorage.getItem(widthKey));
    if (width >= 320 && width <= 560) {
      document.documentElement.style.setProperty("--ai-panel-width", `${width}px`);
    }
    setPanelOpen(localStorage.getItem(openKey) !== "false");
  }

  function isPanelOpen() {
    return document.documentElement.classList.contains("ai-panel-open");
  }

  function setPanelOpen(open) {
    document.documentElement.classList.toggle("ai-panel-open", open);
    byId("rust-ai-toggle")?.setAttribute("aria-expanded", String(open));
    localStorage.setItem(openKey, String(open));
  }

  function startResize(event) {
    if (!(event instanceof PointerEvent) || window.innerWidth < 1280) return;
    event.preventDefault();
    const move = (moveEvent) => {
      const width = Math.max(320, Math.min(560, window.innerWidth - moveEvent.clientX));
      document.documentElement.style.setProperty("--ai-panel-width", `${width}px`);
      localStorage.setItem(widthKey, String(width));
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }

  async function checkHealth() {
    const status = byId("rust-ai-status");
    try {
      const response = await fetch(`${API_BASE}/api/health`);
      if (!response.ok) throw new Error();
      status.textContent = "服务已连接";
    } catch {
      status.textContent = "AI 服务未启动";
    }
  }

  async function loadConversationMessages(id) {
    const status = byId("rust-ai-status");
    status.textContent = "正在加载历史记录…";
    try {
      const response = await fetch(`${API_BASE}/api/conversations/${id}/messages`);
      if (!response.ok) {
        if (response.status === 404) {
          // Conversation deleted on backend
          state.conversationId = null;
          localStorage.removeItem(activeConvKey);
        }
        throw new Error();
      }
      const data = await response.json();
      state.messages = data.map((/** @type {any} */ msg) => ({
        role: msg.role,
        content: msg.content,
        chapters: msg.metadata?.retrieval?.chapters || [],
      }));
      renderMessages();
      status.textContent = "历史记录已加载";
    } catch {
      status.textContent = "无法加载历史记录";
      renderMessages();
    } finally {
      setTimeout(checkHealth, 1500);
    }
  }

  async function sendMessage() {
    if (state.generating) {
      state.controller?.abort();
      return;
    }

    const input = /** @type {HTMLTextAreaElement} */ (byId("rust-ai-input"));
    const content = input.value.trim();
    if (!content) return;

    // 1. If conversation does not exist, create it first
    if (!state.conversationId) {
      const status = byId("rust-ai-status");
      status.textContent = "正在创建对话…";
      try {
        const title = getPageTitle();
        const response = await fetch(`${API_BASE}/api/conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, currentPage: location.pathname }),
        });
        if (!response.ok) throw new Error("无法创建服务器会话");
        const conv = await response.json();
        state.conversationId = conv.id;
        localStorage.setItem(activeConvKey, conv.id);
      } catch (error) {
        status.textContent = "创建对话失败";
        alert(`会话初始化失败: ${error instanceof Error ? error.message : "网络错误"}`);
        return;
      }
    }

    state.messages.push({ role: "user", content });
    input.value = "";
    input.style.height = "auto";
    renderMessages();

    /** @type {{role: string, content: string, chapters: Array<{title: string, path: string}>}} */
    const assistant = { role: "assistant", content: "", chapters: [] };
    state.messages.push(assistant);
    setGenerating(true);
    renderMessages();

    state.controller = new AbortController();
    try {
      const mode = /** @type {HTMLSelectElement} */ (byId("rust-ai-mode")).value;
      const response = await fetch(`${API_BASE}/api/conversations/${state.conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: state.controller.signal,
        body: JSON.stringify({
          content,
          mode,
          page: mode === "rust" ? null : getPageContext(),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `请求失败 (${response.status})`);
      }
      if (!response.body) throw new Error("浏览器不支持流式响应");

      await readStream(response.body, {
        retrieval: (data) => {
          if (data.chapters && data.chapters.length > 0) {
            assistant.chapters = data.chapters;
            updateLastAssistant(assistant.content, assistant.chapters);
          }
        },
        delta: (data) => {
          assistant.content += data.content;
          updateLastAssistant(assistant.content, assistant.chapters);
        },
        done: (data) => {
          // SSE done event
        }
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        if (!assistant.content) assistant.content = "已停止生成。";
      } else {
        assistant.content = `请求失败：${error instanceof Error ? error.message : "未知错误"}`;
      }
      updateLastAssistant(assistant.content, assistant.chapters);
    } finally {
      setGenerating(false);
      state.controller = null;
    }
  }

  /**
   * @param {ReadableStream<Uint8Array>} stream
   * @param {Record<string, (data: any) => void>} handlers
   */
  async function readStream(stream, handlers) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let currentEvent = "";

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("event:")) {
          currentEvent = trimmed.slice(6).trim();
        } else if (trimmed.startsWith("data:")) {
          const dataStr = trimmed.slice(5).trim();
          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              if (handlers[currentEvent]) {
                handlers[currentEvent](data);
              }
            } catch (e) {
              console.error("Failed to parse SSE data JSON:", e, dataStr);
            }
          }
          currentEvent = ""; // Reset event
        }
      }
      if (done) break;
    }
  }

  function setGenerating(generating) {
    state.generating = generating;
    const button = /** @type {HTMLButtonElement} */ (byId("rust-ai-send"));
    button.innerHTML = generating ? "■" : sendClawIcon();
    button.title = generating ? "停止生成" : "发送";
  }

  function sendClawIcon() {
    return '<img class="ai-send-claw" src="img/ferris/claw-cartoon.png" alt="">';
  }

  function clearConversation() {
    if (state.generating) state.controller?.abort();
    state.messages = [];
    state.conversationId = null;
    localStorage.removeItem(activeConvKey);
    renderMessages();
    /** @type {HTMLTextAreaElement} */ (byId("rust-ai-input")).focus();
  }

  function renderMessages() {
    const container = byId("rust-ai-messages");
    if (!state.messages.length) {
      container.innerHTML = emptyTemplate();
      container.querySelectorAll(".ai-suggestion").forEach((button) => {
        button.addEventListener("click", () => {
          const input = /** @type {HTMLTextAreaElement} */ (byId("rust-ai-input"));
          input.value = button.textContent?.trim() || "";
          sendMessage();
        });
      });
      return;
    }

    container.innerHTML = state.messages
      .map((message) => messageTemplate(message.role, message.content, message.chapters))
      .join("");
    container.scrollTop = container.scrollHeight;
  }

  /**
   * @param {string} content
   * @param {Array<{title: string, path: string}>} [chapters]
   */
  function updateLastAssistant(content, chapters) {
    const bodies = document.querySelectorAll(".ai-message-assistant .ai-message-body");
    const last = bodies[bodies.length - 1];
    if (last) {
      let refsHtml = "";
      if (chapters && chapters.length > 0) {
        refsHtml = `
          <div class="ai-references">
            <span class="ai-references-label">📚 查阅章节：</span>
            ${chapters.map(ch => `<a class="ai-ref-link" href="${ch.path}" target="_blank">${ch.title}</a>`).join("")}
          </div>`;
      }
      last.innerHTML = renderMarkdown(content || "正在思考…") + refsHtml;
    }
    const container = byId("rust-ai-messages");
    container.scrollTop = container.scrollHeight;
  }

  function emptyTemplate() {
    return `
      <div class="ai-empty">
        <h2>如何帮助你学习？</h2>
        <p>回答会优先参考当前教材页面。</p>
        <div class="ai-suggestions">
          <button class="ai-suggestion">总结当前页面</button>
          <button class="ai-suggestion">用更简单的语言解释本页概念</button>
          <button class="ai-suggestion">给我出 3 道练习题</button>
          <button class="ai-suggestion">解释本页中的 Rust 代码</button>
        </div>
      </div>`;
  }

  /**
   * @param {string} role
   * @param {string} content
   * @param {Array<{title: string, path: string}>} [chapters]
   */
  fnTemplate = messageTemplate; // helper for type checker
  function messageTemplate(role, content, chapters) {
    const label = role === "user" ? "你" : "RUST AI";
    let refsHtml = "";
    if (chapters && chapters.length > 0) {
      refsHtml = `
        <div class="ai-references">
          <span class="ai-references-label">📚 查阅章节：</span>
          ${chapters.map(ch => `<a class="ai-ref-link" href="${ch.path}" target="_blank">${ch.title}</a>`).join("")}
        </div>`;
    }
    return `
      <article class="ai-message ai-message-${role}">
        <div class="ai-message-role">${label}</div>
        <div class="ai-message-body">
          ${renderMarkdown(content || "正在思考…")}
          ${refsHtml}
        </div>
      </article>`;
  }

  function renderMarkdown(value) {
    const safe = escapeHtml(value);
    const withCode = safe.replace(/```(?:rust)?\s*\n([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
    const withInline = withCode.replace(/`([^`\n]+)`/g, "<code>$1</code>");
    const withBold = withInline.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return withBold
      .split(/\n{2,}/)
      .map((part) => part.startsWith("<pre>") ? part : `<p>${part.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function getPageContext() {
    const main = document.querySelector("#mdbook-content main");
    const selection = window.getSelection()?.toString().trim();
    const content = selection && selection.length > 20
      ? `用户当前选中的内容：\n${selection}`
      : main?.textContent?.replace(/\s+/g, " ").trim() || "";
    return {
      title: getPageTitle(),
      url: location.pathname,
      content: content.slice(0, 20000),
    };
  }

  function getPageTitle() {
    return document.querySelector("#mdbook-content main h1")?.textContent?.trim()
      || document.title.replace(" - Rust 程序设计语言 简体中文版", "")
      || "当前页面";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function byId(id) {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing element #${id}`);
    return element;
  }
})();
