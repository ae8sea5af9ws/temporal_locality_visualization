export function injectStyles() {
  const style = document.createElement("style")
  style.textContent = `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #0a0a0a;
      color: #e0e0e0;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 24px 16px;
      gap: 20px;
    }

    .difficulty-bar {
      display: flex;
      gap: 8px;
    }

    .diff-btn {
      padding: 7px 22px;
      border: 1px solid #333;
      background: transparent;
      color: #999;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      font-family: inherit;
      transition: border-color 0.2s, color 0.2s, background 0.2s;
    }
    .diff-btn:hover { border-color: #555; color: #ccc; }
    .diff-btn.active {
      border-color: #888;
      color: #e0e0e0;
      background: rgba(255,255,255,0.04);
    }

    #viz-canvas {
      border-radius: 8px;
      border: 1px solid #1a1a1a;
      display: block;
      max-width: 100%;
    }

    .badges-row {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      justify-content: center;
      max-width: 1200px;
      width: 100%;
    }

    .agent-badge {
      flex: 1 1 220px;
      max-width: 280px;
      padding: 14px;
      border-radius: 8px;
      border: 2px solid #333;
      background: #111;
      transition: opacity 0.3s;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .agent-badge.disabled { opacity: 0.35; }

    .badge-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .agent-name {
      font-size: 0.9rem;
      font-weight: 500;
    }

    .agent-desc {
      font-size: 0.72rem;
      color: #777;
      line-height: 1.4;
    }

    .token-bar {
      height: 5px;
      background: #222;
      border-radius: 3px;
      overflow: hidden;
      position: relative;
    }
    .token-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.2s;
    }

    .badge-stats {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #666;
    }

    .toggle-btn {
      width: 36px;
      height: 20px;
      border-radius: 10px;
      border: 1px solid #444;
      background: #222;
      cursor: pointer;
      position: relative;
      align-self: flex-end;
      transition: background 0.2s;
      padding: 0;
    }
    .toggle-btn.on { background: #2a3a2a; border-color: #4a6a4a; }
    .toggle-btn::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #666;
      transition: transform 0.2s, background 0.2s;
    }
    .toggle-btn.on::after {
      transform: translateX(16px);
      background: #8c8;
    }

    .restart-btn {
      padding: 10px 36px;
      border: 1px solid #444;
      background: transparent;
      color: #aaa;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-family: inherit;
      transition: border-color 0.2s, color 0.2s;
    }
    .restart-btn:hover { border-color: #777; color: #e0e0e0; }
  `
  document.head.appendChild(style)
}
