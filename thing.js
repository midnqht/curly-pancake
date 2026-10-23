(async () => {
  "use strict";

  // ============================
  // CONFIGURATION
  // ============================
  const MAX_ACCOUNTS = 999;
  const ELEMENT_TIMEOUT = 30000;
  const SEL = {
    signUpTabText: "Sign Up",
    username: 'input[placeholder="Username"]',
    password: 'input[placeholder="Password"]',
    submit: 'button[type="submit"]',
    submitText: "Create Account",
    logout: 'button[title="Log Out"]'
  };

  // Restrict automated registration to local/test environments.
  const h = location.hostname;
  const isTestHost =
    h === "chatapp-2c49e.web.app" ||
    h === "127.0.0.1" ||
    h.endsWith(".test") ||
    h.startsWith("staging.");
  if (!isTestHost) {
    console.error("Stopped: run this test runner on a local or staging site.");
    return;
  }

  // Stop any previous instance that is still running.
  if (window.__nebulaCtl) window.__nebulaCtl.stop = true;
  document.getElementById("nebula-host")?.remove();

  // ============================
  // STYLES
  // ============================
  const CSS = `
:host{--win:#120d1cf0;--border:#8a6ec080;--title:#0c0814;--titleA:#5b34a8;--frame:#5b34a88a;--frameH:#9a64fa66;--frameA:#9a64faab;
--btn:#9a64fa66;--btnH:#9a64fa;--btnA:#7c3af0;--hdr:#9a64fa4f;--hdrH:#9a64facc;--hdrA:#9a64fa;--chk:#c4a1ff;--grab:#8a52e0;--grabA:#a678ff;
--text:#fff;--dim:#a094b8;--sep:#8a6ec080}
*{box-sizing:border-box}
.win{position:absolute;pointer-events:auto;background:var(--win);border:1px solid var(--border);display:flex;flex-direction:column;
  min-width:200px;min-height:23px;overflow:hidden;color:var(--text);user-select:none;-webkit-user-select:none;
  font:13px/1 "Proggy Clean",ui-monospace,"SF Mono","Cascadia Mono",Consolas,Menlo,monospace;transform-origin:24px 0;
  transition:opacity .24s ease,transform .32s cubic-bezier(.2,.8,.2,1),visibility 0s linear 0s}
.win.hidden{opacity:0;transform:translateY(10px) scale(.965);visibility:hidden;pointer-events:none;
  transition:opacity .2s ease,transform .2s ease-in,visibility 0s linear .2s}
.win.anim{transition:opacity .24s ease,transform .32s cubic-bezier(.2,.8,.2,1),height .3s cubic-bezier(.2,.8,.2,1)}
.win.collapsed{min-height:0}.win.collapsed .grip{display:none}
.title{height:19px;background:var(--title);display:flex;align-items:center;padding:0 4px;cursor:move;flex:none;white-space:nowrap;touch-action:none}
.win.active .title{background:var(--titleA)}
.arrow{width:13px;height:13px;margin-right:4px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;border-radius:2px}
.arrow:hover{background:var(--hdrH)}
.arrow::before{content:"";border:4px solid transparent;border-top:6px solid var(--text);border-bottom:0;margin-top:1px;transition:transform .22s cubic-bezier(.2,.8,.2,1)}
.win.collapsed .arrow::before,.hdr.closed .arrow::before{transform:rotate(-90deg)}
.tt{flex:1;overflow:hidden;text-overflow:ellipsis}
.x{width:15px;height:15px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px}
.x:hover{background:var(--hdrH)}
.body{flex:1;overflow:auto;padding:8px 8px 14px}
.body::-webkit-scrollbar{width:14px}.body::-webkit-scrollbar-track{background:#05050587}
.body::-webkit-scrollbar-thumb{background:#5a4a78;border-radius:7px;border:2px solid transparent;background-clip:content-box}
.grip{position:absolute;right:1px;bottom:1px;width:14px;height:14px;cursor:nwse-resize;touch-action:none;
  background:linear-gradient(135deg,transparent 50%,#9a64fa40 50%);clip-path:polygon(100% 0,100% 100%,0 100%)}
.grip:hover{background:var(--hdrH)}
.row{display:flex;align-items:center;gap:4px;margin:0 0 4px;min-height:19px;flex-wrap:wrap}
.dim{color:var(--dim)}
hr{border:0;border-top:1px solid var(--sep);margin:5px 0 7px}
.btn{background:var(--btn);padding:3px 8px;height:19px;display:inline-flex;align-items:center;cursor:pointer;white-space:nowrap}
.btn:hover{background:var(--btnH)}.btn:active{background:var(--btnA)}
.chk{display:inline-flex;align-items:center;gap:4px;cursor:pointer}
.chk i{width:19px;height:19px;background:var(--frame);display:inline-flex;align-items:center;justify-content:center}
.chk:hover i{background:var(--frameH)}.chk i svg{display:none}.chk.on i svg{display:block}
.fld{background:var(--frame);height:19px;position:relative;display:flex;align-items:center;padding:0 4px;min-width:0}
.fld:hover{background:var(--frameH)}
.sl{width:180px;cursor:ew-resize;justify-content:center;touch-action:none}
.sl .fill{position:absolute;top:2px;bottom:2px;width:10px;background:var(--grab)}
.sl.drag .fill{background:var(--grabA)}.sl.drag{background:var(--frameA)}
.sl span{position:relative;pointer-events:none}
input.fld{border:0;color:var(--text);font:inherit;outline:0;width:180px}
input.fld:focus{background:var(--frameH)}
.combo{width:180px;justify-content:space-between;cursor:pointer;padding:0 0 0 4px}
.combo .dd{width:19px;height:19px;background:var(--btn);display:flex;align-items:center;justify-content:center}
.combo .dd::before{content:"";border:4px solid transparent;border-top:6px solid #fff;border-bottom:0;margin-top:2px}
.pop{position:fixed;pointer-events:auto;background:#141414f0;border:1px solid var(--border);z-index:99;padding:2px;display:none;
  color:var(--text);font:13px/1 ui-monospace,Consolas,Menlo,monospace}
.pop div{padding:3px 6px;cursor:pointer;height:17px}.pop div:hover,.pop div.sel{background:var(--hdr)}
.lbl{white-space:nowrap}
.hdr{background:var(--hdr);height:19px;display:flex;align-items:center;padding:0 5px 0 4px;margin:2px -2px 4px;cursor:pointer}
.hdr:hover{background:var(--hdrH)}.hdr:active{background:var(--hdrA)}.hdr .arrow{pointer-events:none}
.sec{display:grid;grid-template-rows:1fr;padding-left:4px;transition:grid-template-rows .26s cubic-bezier(.2,.8,.2,1)}
.sec.hide{grid-template-rows:0fr}.sec>.in{overflow:hidden;min-height:0}
.prog{width:100%;height:19px;background:var(--frame);position:relative;display:flex;align-items:center;justify-content:center}
.prog .f{position:absolute;left:0;top:0;bottom:0;background:var(--grab);transition:width .38s cubic-bezier(.2,.8,.2,1)}
.prog span{position:relative}
.logo{width:15px;height:15px;vertical-align:-3px;margin-right:5px;color:var(--chk)}
.ln{animation:ln .24s ease-out}
@keyframes ln{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
.dock{position:fixed;left:8px;bottom:0;padding-bottom:8px;display:flex;gap:6px;pointer-events:auto;z-index:9999;
  color:var(--text);font:13px/1 ui-monospace,Consolas,Menlo,monospace}
.btn,.fld,.chk i,.hdr,.x,.arrow{transition:background-color .14s ease}
@media (prefers-reduced-motion:reduce){*,*::before{transition:none!important;animation:none!important}}
`;

  // ============================
  // SHADOW-DOM HOST
  // ============================
  const host = document.createElement("div");
  host.id = "nebula-host";
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none";
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>${CSS}</style>`;
  const ui = document.createElement("div");
  root.appendChild(ui);

  const $ = (s, r = root) => r.querySelector(s);
  const el = (t, c, html) => {
    const e = document.createElement(t);
    if (c) e.className = c;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const LOGO = '<svg class="logo" viewBox="0 0 400 400" fill="none"><path d="M72.4336 193.066C73.6055 177.351 79.087 152.855 85.0459 138.436C127.145 36.5836 347.246 178.391 242.523 261.263C225.56 274.685 192.657 282.179 171.015 273.815C141.434 262.378 102.824 178.677 144.974 158.417C184.232 139.544 229.58 173.915 219.984 215.483C204.326 283.305 123.069 176.428 183.344 197.588M145.303 249.894C218.545 365.441 374.063 242.911 313.654 154.816" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHECK = '<svg width="13" height="13" viewBox="0 0 13 13"><path d="M2 7l3 3 6-7" fill="none" stroke="#c4a1ff" stroke-width="2"/></svg>';

  // ============================
  // SETTINGS (bound to the GUI)
  // ============================
  const st = {
    count: 50, start: 1, pattern: "{prefix}_{random}", prefix: "robot",
    pwMode: "Random per account", len: 24, up: true, dig: true, sym: false,
    delay: 250, postDelay: 0, retry: 2
  };
  const ctl = { stop: false, paused: false, running: false };
  window.__nebulaCtl = ctl;
  let quickBusy = false;

  // ============================
  // GUI HELPERS
  // ============================
  const row = p => { const r = el("div", "row"); p.appendChild(r); return r; };
  const label = (r, t) => r.appendChild(el("span", "lbl", t));
  const button = (r, t, fn) => { const b = el("span", "btn", t); b.onclick = fn; r.appendChild(b); return b; };

  function checkbox(r, t, key) {
    const c = el("span", "chk" + (st[key] ? " on" : ""), `<i>${CHECK}</i><span>${t}</span>`);
    c.onclick = () => { st[key] = !st[key]; c.classList.toggle("on", st[key]); };
    r.appendChild(c);
  }

  function slider(r, t, key, min, max) {
    const f = el("div", "fld sl", '<div class="fill"></div><span></span>');
    const fill = $(".fill", f), txt = $("span", f);
    const draw = () => {
      txt.textContent = st[key];
      fill.style.left = ((st[key] - min) / (max - min)) * (f.clientWidth - 10) + "px";
    };
    const set = e => {
      const b = f.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (e.clientX - b.left - 5) / (b.width - 10)));
      st[key] = Math.round(min + p * (max - min));
      draw();
    };
    f.onpointerdown = e => { e.stopPropagation(); f.setPointerCapture(e.pointerId); f.classList.add("drag"); set(e); };
    f.onpointermove = e => { if (f.classList.contains("drag")) set(e); };
    f.onpointerup = () => f.classList.remove("drag");
    r.appendChild(f); label(r, t);
    requestAnimationFrame(draw);
  }

  function input(r, t, key) {
    const i = el("input", "fld");
    i.value = st[key];
    i.oninput = () => { st[key] = i.value.trim() || "robot"; };
    ["keydown", "keyup", "keypress", "pointerdown"].forEach(ev =>
      i.addEventListener(ev, e => e.stopPropagation()));
    r.appendChild(i); label(r, t);
  }

  const pop = el("div", "pop");
  ui.appendChild(pop);
  document.addEventListener("pointerdown", e => {
    const path = e.composedPath();
    if (!path.includes(pop) && !path.some(n => n.classList && n.classList.contains("combo"))) pop.style.display = "none";
  }, true);

  function combo(r, t, opts, key) {
    const d = el("div", "fld combo", `<span class="v">${st[key]}</span><span class="dd"></span>`);
    r.appendChild(d); label(r, t);
    d.onclick = e => {
      e.stopPropagation();
      const b = d.getBoundingClientRect();
      pop.innerHTML = "";
      opts.forEach(o => {
        const x = el("div", o === st[key] ? "sel" : "");
        x.textContent = o;
        x.onclick = () => { st[key] = o; $(".v", d).textContent = o; pop.style.display = "none"; };
        pop.appendChild(x);
      });
      Object.assign(pop.style, { left: b.left + "px", top: b.bottom + "px", width: b.width + "px", display: "block" });
    };
  }

  function header(parent, t, open) {
    const hd = el("div", "hdr" + (open ? "" : " closed"), `<span class="arrow"></span>${t}`);
    const s = el("div", "sec" + (open ? "" : " hide")), n = el("div", "in");
    s.appendChild(n);
    hd.onclick = () => { const o = s.classList.toggle("hide"); hd.classList.toggle("closed", o); };
    parent.appendChild(hd); parent.appendChild(s);
    return n;
  }

  function makeWin(title, css, hidden, logo) {
    const w = el("div", "win" + (hidden ? " hidden" : ""),
      `<div class="title"><span class="arrow"></span><span class="tt">${logo ? LOGO : ""}${title}</span><span class="x">\u2715</span></div>
       <div class="body"></div><div class="grip"></div>`);
    w.style.cssText = css;
    ui.appendChild(w);
    return w;
  }

  // ============================
  // WINDOWS
  // ============================
  const w1Left = Math.max(8, innerWidth - 456);
  const W1 = makeWin("Nebula", `left:${w1Left}px;top:16px;width:440px;height:470px`, true, true);
  const W2 = makeWin("Log", `left:${Math.max(8, w1Left - 356)}px;top:16px;width:340px;height:240px`, true);
  const body = $(".body", W1), b2 = $(".body", W2);

  let r, s;
  s = header(body, "Quick account", true);
  r = row(s);
  const quickB = button(r, "Create", () => onQuick());

  s = header(body, "Batch", true);
  slider(row(s), "accounts to create", "count", 1, MAX_ACCOUNTS);
  slider(row(s), "start index", "start", 0, 999);
  combo(row(s), "username pattern", ["{prefix}_{random}", "{prefix}_{n}"], "pattern");
  input(row(s), "prefix", "prefix");

  s = header(body, "Credentials", true);
  combo(row(s), "password mode", ["Random per account", "Same for all"], "pwMode");
  slider(row(s), "password length", "len", 8, 64);
  r = row(s); checkbox(r, "uppercase", "up"); checkbox(r, "digits", "dig"); checkbox(r, "symbols", "sym");

  s = header(body, "Pacing", true);
  slider(row(s), "delay between (ms)", "delay", 0, 5000);
  slider(row(s), "delay after creation (ms)", "postDelay", 0, 10000);
  slider(row(s), "retries on error", "retry", 0, 10);

  body.appendChild(el("hr"));
  r = row(body);
  const startB = button(r, "Start", () => onStart());
  button(r, "Stop", () => onStop());
  r = row(body);
  const prog = el("div", "prog", '<div class="f" style="width:0"></div><span></span>');
  r.appendChild(prog);
  const setProg = k => {
    $(".f", prog).style.width = (k / st.count * 100) + "%";
    $("span", prog).textContent = k + "/" + st.count;
  };
  setProg(0);

  // Log window content
  const status = el("div", "row", "Status: idle");
  b2.appendChild(status); b2.appendChild(el("hr"));
  const lg = el("div"); b2.appendChild(lg);
  const stamp = () => new Date().toLocaleTimeString([], { hour12: false });
  function log(text, dim) {
    const d = el("div", "row ln" + (dim ? " dim" : ""));
    d.textContent = `[${stamp()}] ${text}`;
    lg.appendChild(d);
    b2.scrollTop = b2.scrollHeight;
    console.log("[Nebula]", text);
  }
  const setStatus = t => { status.textContent = "Status: " + t; };

  // ============================
  // WINDOW MANAGER
  // ============================
  let z = 10;
  const dock = el("div", "dock"), chips = new Map();
  ui.appendChild(dock);
  [[W1, "Nebula"], [W2, "Log"]].forEach(([w, n]) => {
    const c = el("span", "btn", (w === W1 ? LOGO : "") + n);
    c.style.display = "none";
    c.onclick = () => showWin(w);
    dock.appendChild(c); chips.set(w, c);
  });
  function activate(w) {
    root.querySelectorAll(".win").forEach(o => o.classList.remove("active"));
    w.classList.add("active"); w.style.zIndex = ++z;
  }
  function showWin(w) { w.classList.remove("hidden"); activate(w); chips.get(w).style.display = "none"; }
  function hideWin(w, silent) {
    w.classList.add("hidden"); w.classList.remove("active");
    if (!silent) chips.get(w).style.display = "inline-flex";
  }

  [W1, W2].forEach(w => {
    const ti = $(".title", w), gr = $(".grip", w), ar = $(".arrow", w), x = $(".x", w);
    w.addEventListener("pointerdown", () => activate(w));
    ti.onpointerdown = e => {
      if (e.target === x || e.target === ar) return;
      const sx = e.clientX - w.offsetLeft, sy = e.clientY - w.offsetTop;
      ti.setPointerCapture(e.pointerId);
      ti.onpointermove = m => {
        w.style.left = Math.max(-w.offsetWidth + 60, Math.min(innerWidth - 40, m.clientX - sx)) + "px";
        w.style.top = Math.max(0, Math.min(innerHeight - 20, m.clientY - sy)) + "px";
      };
      ti.onpointerup = () => { ti.onpointermove = null; };
    };
    const toggle = () => {
      const busy = w.classList.contains("anim");
      w.classList.add("anim");
      if (!w.classList.contains("collapsed")) {
        if (!busy) w._h = w.offsetHeight;
        w.style.height = w.offsetHeight + "px";
        void w.offsetHeight;
        w.classList.add("collapsed");
        w.style.height = (ti.offsetHeight + 2) + "px";
      } else {
        w.classList.remove("collapsed");
        w.style.height = w._h + "px";
      }
      clearTimeout(w._t);
      w._t = setTimeout(() => w.classList.remove("anim"), 340);
    };
    ti.ondblclick = e => { if (e.target !== x && e.target !== ar) toggle(); };
    ar.onclick = e => { e.stopPropagation(); toggle(); };
    x.onclick = () => hideWin(w);
    gr.onpointerdown = e => {
      e.stopPropagation(); activate(w); gr.setPointerCapture(e.pointerId);
      const sw = w.offsetWidth, sh = w.offsetHeight, sx = e.clientX, sy = e.clientY;
      gr.onpointermove = m => {
        w.style.width = Math.max(200, sw + m.clientX - sx) + "px";
        w.style.height = Math.max(80, sh + m.clientY - sy) + "px";
      };
      gr.onpointerup = () => { gr.onpointermove = null; };
    };
  });
  requestAnimationFrame(() => requestAnimationFrame(() => showWin(W1)));

  // ============================
  // AUTOMATION
  // ============================
  const SETS = {
    low: "abcdefghijklmnopqrstuvwxyz", up: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    dig: "0123456789", sym: "!@#$%^&*-_=+?"
  };
  const ALNUM = SETS.low + SETS.up + SETS.dig;
  const rnd = n => crypto.getRandomValues(new Uint32Array(1))[0] % n;
  const pick = set => set[rnd(set.length)];
  const randomString = (n, set = ALNUM) => Array.from({ length: n }, () => pick(set)).join("");

  function makePassword() {
    const classes = [SETS.low];
    if (st.up) classes.push(SETS.up);
    if (st.dig) classes.push(SETS.dig);
    if (st.sym) classes.push(SETS.sym);
    const all = classes.join("");
    const chars = Array.from({ length: st.len }, () => pick(all));
    classes.forEach((c, i) => { chars[i] = pick(c); });
    for (let i = chars.length - 1; i > 0; i--) {
      const j = rnd(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
  }

  function makeUsername(i) {
    const suffix = st.pattern === "{prefix}_{n}"
      ? String(st.start + i).padStart(3, "0")
      : randomString(8);
    return `${st.prefix}_${suffix}`;
  }

  const guard = () => { if (ctl.stop) throw new Error("Runner stopped."); };
  async function pause(ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { guard(); await sleep(Math.min(150, ms - (Date.now() - t0))); }
  }

  async function waitForElement(selector, timeout = ELEMENT_TIMEOUT) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      guard();
      const e = document.querySelector(selector);
      if (e && e.isConnected) return e;
      await sleep(150);
    }
    throw new Error(`Timed out waiting for ${selector}`);
  }

  async function waitUntil(predicate, timeout = ELEMENT_TIMEOUT) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      guard();
      if (predicate()) return;
      await sleep(150);
    }
    throw new Error("Timed out waiting for the application.");
  }

  function setInputValue(inputEl, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(inputEl, value);
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    inputEl.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function logOutIfNeeded() {
    const out = document.querySelector(SEL.logout);
    if (out) {
      out.click();
      await waitUntil(() => !document.querySelector(SEL.logout));
    }
  }

  async function createOneTestAccount(index, sharedPassword, keepLoggedIn) {
    await logOutIfNeeded();

    // 1. Open the Sign Up tab.
    const signUp = [...document.querySelectorAll("button")]
      .find(b => b.textContent.trim() === SEL.signUpTabText);
    if (signUp) signUp.click();

    // 2. Wait for registration fields.
    const userInput = await waitForElement(SEL.username);
    const passInput = await waitForElement(SEL.password);

    // 3. Generate unique test credentials.
    const username = makeUsername(index);
    const password = sharedPassword || makePassword();
    setInputValue(userInput, username);
    setInputValue(passInput, password);

    // 4. Click Create Account.
    const create = [...document.querySelectorAll(SEL.submit)]
      .find(b => b.textContent.trim() === SEL.submitText);
    if (!create || create.disabled) throw new Error("Create Account button missing or disabled.");
    create.click();

    // 5. Wait for the authenticated application, then let it settle.
    await waitForElement(SEL.logout);
    await sleep(150);
    if (keepLoggedIn) return { username, password };
    await pause(st.postDelay);

    // 6. Log out and wait for it to finish before counting success.
    const out = document.querySelector(SEL.logout);
    if (!out) throw new Error("Log Out button disappeared.");
    out.click();
    await waitUntil(() => !document.querySelector(SEL.logout));
    return username;
  }

  async function withRetry(index, sharedPassword, keepLoggedIn) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await createOneTestAccount(index, sharedPassword, keepLoggedIn);
      } catch (err) {
        if (ctl.stop || attempt >= st.retry) throw err;
        log(`Attempt ${attempt + 1} failed: ${err.message} Retrying...`, true);
        await sleep(1000);
      }
    }
  }

  async function runLoop() {
    const total = st.count;
    const sharedPassword = st.pwMode === "Same for all" ? makePassword() : null;
    let done = 0;
    lg.innerHTML = "";
    setProg(0);
    showWin(W2);
    log(`Run started: ${total} test accounts.`);
    log(`Delay ${st.delay} ms, retries ${st.retry}.`, true);
    try {
      for (let i = 0; i < total; i++) {
        while (ctl.paused && !ctl.stop) await sleep(150);
        guard();
        setStatus(`creating ${i + 1}/${total}`);
        const name = await withRetry(i, sharedPassword);
        done++;
        setProg(done);
        log(`Created ${name} (${done}/${total})`);
        if (i < total - 1 && st.delay > 0) await sleep(st.delay);
      }
      log(`Finished: ${done}/${total} cycles completed.`, true);
      setStatus("done");
    } catch (err) {
      if (ctl.stop) { log("Stopped.", true); setStatus("stopped"); }
      else { console.error(err); log("Error: " + err.message); setStatus("stopped on error"); }
    } finally {
      ctl.running = false; ctl.paused = false; ctl.stop = false;
      startB.textContent = "Start";
    }
  }

  async function onQuick() {
    if (ctl.running || quickBusy) return;
    quickBusy = true; ctl.stop = false;
    quickB.textContent = "Working...";
    showWin(W2);
    setStatus("creating one account");
    log("Logging out (if needed) and creating one account...");
    try {
      const { username, password } = await withRetry(
        st.start, st.pwMode === "Same for all" ? makePassword() : null, true);
      log(`Created ${username} and stayed logged in.`);
      log(`Password: ${password}`, true);
      setStatus("idle");
    } catch (err) {
      if (ctl.stop) log("Stopped.", true);
      else { console.error(err); log("Error: " + err.message); }
      setStatus("idle");
    } finally {
      quickBusy = false; ctl.stop = false;
      quickB.textContent = "Create";
    }
  }

  function onStart() {
    if (!ctl.running) {
      if (quickBusy) return;
      ctl.running = true; ctl.paused = false; ctl.stop = false;
      startB.textContent = "Pause";
      runLoop();
    } else if (!ctl.paused) {
      ctl.paused = true;
      startB.textContent = "Resume";
      setStatus("pausing after current cycle");
    } else {
      ctl.paused = false;
      startB.textContent = "Pause";
      setStatus("running");
    }
  }

  function onStop() {
    if (!ctl.running && !quickBusy) return;
    ctl.stop = true;
    ctl.paused = false;
    setStatus("stopping...");
  }
})();
