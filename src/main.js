const style = document.createElement("style");
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0a;
    color: #e0e0e0;
    font-family: system-ui, -apple-system, sans-serif;
  }
  h1 {
    font-size: 2rem;
    font-weight: 300;
    letter-spacing: 0.05em;
  }
`;
document.head.appendChild(style);

const h1 = document.createElement("h1");
h1.textContent = "temporal locality visualisation";
document.body.appendChild(h1);
