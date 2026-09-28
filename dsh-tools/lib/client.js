// dsh-tools —— Client 半端。
// 入口：左栏「功能」Tab（sidebar.extensions slot，由 @anoslide/dsh-client-vscode-layout 声明）。
// 卡片 UI 与「移动端访问」同款（圆点 + 标题 + 开关 + 刷新 + 折叠箭头），样式 token 全部走主题变量，深浅色自适应。

window.__ModuleLoader__.load({
  id: 'dsh-tools',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    var React = require('react');
    const h = React.createElement;

    function insertStyles(css) {
      try {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        return () => { try { style.remove() } catch { /* ignore */ } };
      } catch {
        return () => {};
      }
    }

    const POLL_MS = 20000;

    const CSS = `
.dxp-dock{box-sizing:border-box;width:100%;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-specific-sidebar-fill);display:flex;flex-direction:column;padding:6px 10px 8px;font-size:11px;color:var(--dsw-alias-label-primary);position:relative;}
.dxp-row1{display:flex;align-items:center;gap:6px;min-height:22px;flex:none;min-width:0;}
.dxp-title{font-weight:600;font-size:11px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-flex;align-items:center;gap:5px;cursor:pointer;user-select:none;}
.dxp-dot{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-state-warn-primary);flex:none;}
.dxp-dot-ok{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-state-success-primary);flex:none;}
.dxp-dot-err{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-state-error-primary);flex:none;}
.dxp-btn{border:none;background:transparent;color:var(--dsw-alias-brand-primary);cursor:pointer;font-size:11px;padding:1px 7px;border-radius:6px;font-family:inherit;line-height:1.4;flex:none;}
.dxp-btn:hover{background:var(--dsw-alias-interactive-bg-hover);}
.dxp-btn.dxp-primary{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground);}
.dxp-btn.dxp-primary:hover{filter:brightness(1.08);}
.dxp-btn.dxp-danger{color:var(--dsw-alias-state-error-primary);}
.dxp-btn.dxp-danger:hover{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 10%,transparent);}
.dxp-ibar{width:20px;height:20px;border-radius:6px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex:none;padding:0;}
.dxp-ibar:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);}
.dxp-ibar svg{display:block;}
.dxp-collapse{display:grid;grid-template-rows:0fr;transition:grid-template-rows .25s ease;}
.dxp-collapse.dxp-open{grid-template-rows:1fr;}
.dxp-collapse-inner{overflow:hidden;min-height:0;display:flex;flex-direction:column;gap:3px;padding-top:3px;opacity:0;transition:opacity .18s ease;}
.dxp-collapse.dxp-open .dxp-collapse-inner{opacity:1;}
.dxp-row2{display:flex;align-items:center;gap:6px;min-width:0;line-height:1.5;flex:none;}
.dxp-hint{font-size:10px;color:var(--dsw-alias-label-secondary);line-height:1.6;}
.dxp-ok{color:var(--dsw-alias-state-success-primary);}
.dxp-err{color:var(--dsw-alias-state-error-primary);font-size:10px;line-height:1.5;word-break:break-all;}
.dxp-note{font-size:10px;color:var(--dsw-alias-label-secondary);line-height:1.6;border-top:1px dashed var(--dsw-alias-border-l1);padding-top:4px;margin-top:2px;}
.dxp-addr{font-size:10px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--dsw-alias-brand-primary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;text-decoration:none;border-bottom:1px dashed color-mix(in srgb,var(--dsw-alias-brand-primary) 45%,transparent);}
.dxp-addr:hover{opacity:.85;}
.dxp-copy{display:inline-flex;align-items:center;gap:3px;font-size:10px;color:var(--dsw-alias-label-secondary);cursor:pointer;border:none;background:transparent;padding:0;font-family:inherit;flex:none;}
.dxp-copy:hover{color:var(--dsw-alias-brand-primary);}
.dxp-copy svg{display:block;}
.dxp-qrwrap{display:flex;flex-direction:column;align-items:center;gap:4px;padding-top:3px;}
.dxp-qr{width:100%;max-width:190px;height:auto;border-radius:6px;background:#fff;padding:4px;box-sizing:border-box;}
.dxp-agree{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--dsw-alias-label-secondary);cursor:pointer;line-height:1.6;user-select:none;}
.dxp-agree input{width:12px;height:12px;margin:0;flex:none;cursor:pointer;}
`;

    function svgIcon(d, size) {
      return h('svg', { viewBox: '0 0 24 24', width: size || 14, height: size || 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, dangerouslySetInnerHTML: { __html: d } });
    }
    function RefreshIcon() { return svgIcon('<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>', 13); }
    function ChevronIcon(props) { return svgIcon(props && props.up ? '<path d="m18 15-6-6-6 6"/>' : '<path d="m6 9 6 6 6-6"/>', 13); }

    function PhoneIcon() { return svgIcon('<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>'); }
    function CopyIcon() { return svgIcon('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>', 11); }
    function CheckIcon() { return svgIcon('<path d="M20 6 9 17l-5-5"/>', 11); }

    async function copyText(text) {
      try {
        if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
      } catch { /* fallthrough */ }
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch { return false; }
    }

    const POCKET_PHASE = { idle: '未开启', downloading: '正在下载 cloudflared…', starting: '正在启动隧道…', registering: '正在连接 Cloudflare…', ready: '就绪', error: '隧道失败' };

    function PocketDock() {
      const [st, setSt] = React.useState(null);
      const [busy, setBusy] = React.useState(false);
      const [open, setOpen] = React.useState(false);
      const [qr, setQr] = React.useState('');
      const [copied, setCopied] = React.useState('');
      const [err, setErr] = React.useState('');
      const [agree, setAgree] = React.useState(false);

      async function rpcCall(endpoint, payload) {
        const c = globalThis.crypto;
        const rpcId = (c && typeof c.randomUUID === 'function')
          ? c.randomUUID()
          : ('rpc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
        const res = await fetch('/dsh-pocket/' + endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ type: 'client-request', rpcId: rpcId, method: endpoint, payload: payload || {} }),
        });
        if (!res.ok) throw new Error('RPC ' + endpoint + ' → HTTP ' + res.status);
        const full = await res.json();
        if (!full || full.rpcId !== rpcId) throw new Error('RPC 响应不匹配');
        const result = full.result;
        if (!result || typeof result !== 'object') throw new Error('RPC 响应格式异常');
        if (result.ok !== true) {
          const e = result.error || {};
          throw new Error(String(e.message || e.code || 'RPC 调用失败'));
        }
        return result.value;
      }

      const pull = async () => {
        try {
          const v = await rpcCall('pocket.status', {});
          setSt(v);
          setErr('');
        } catch (e) {
          setErr(String((e && e.message) || e));
        }
      };

      React.useEffect(() => {
        let alive = true;
        const run = () => { if (alive) void pull(); };
        run();
        const t = setInterval(run, 8000);
        return () => { alive = false; clearInterval(t); };
      }, []);

      const action = async (fn) => {
        if (busy || !st) return;
        setBusy(true);
        setErr('');
        try {
          await fn();
          setSt(await rpcCall('pocket.status', {}));
        } catch (e) {
          setErr(String((e && e.message) || e));
        }
        setBusy(false);
      };
      const toggleLan = () => action(() => rpcCall('lan.setEnabled', { on: !st.lanEnabled }));
      const toggleTunnel = () => action(() => rpcCall(st.tunnelRunning ? 'tunnel.stop' : 'tunnel.start', st.tunnelRunning ? {} : { disclaimer: true }));

      const doCopy = async (key, text) => {
        if (!text) return;
        const done = await copyText(text);
        setCopied(done ? key : '');
        setTimeout(() => setCopied(''), 1600);
      };

      const phase = (st && st.tunnelState && st.tunnelState.phase) || 'idle';
      const running = !!(st && st.tunnelRunning);
      const lanOn = !!(st && st.lanEnabled);
      const pending = phase === 'downloading' || phase === 'starting' || phase === 'registering';
      const dotCls = !st ? 'dxp-dot' : (running ? 'dxp-dot-ok' : (st.proxyRunning ? 'dxp-dot' : 'dxp-dot-err'));
      const lanUrl = (st && st.lanUrl) || '';
      const tunnelUrl = (st && st.tunnelUrl) || '';
      const tunnelQr = (st && st.tunnelQr) || '';

      const copyBtn = (key, text) => h('button', { type: 'button', className: 'dxp-copy', onClick: () => doCopy(key, text) }, h(copied === key ? CheckIcon : CopyIcon), copied === key ? '已复制' : '复制');
      const switchBtn = (on, onClick, disabled) => h('button', { type: 'button', className: 'dxp-btn ' + (on ? 'dxp-danger' : 'dxp-primary'), disabled: disabled, onClick: onClick }, disabled ? '…' : (on ? '关闭' : '开启'));
      const label = (text) => h('span', { className: 'dxp-hint', style: { flex: 'none', width: '48px' } }, text);

      return h('div', { className: 'dxp-dock' },
        h('div', { className: 'dxp-row1' },
          h('span', { className: cls(dotCls) }),
          h('span', { className: 'dxp-title', title: open ? '点击收起' : '点击展开', onClick: () => setOpen(!open) }, h(PhoneIcon), '移动端访问'),
          h('button', { type: 'button', className: 'dxp-ibar', title: '刷新状态', onClick: pull, 'aria-label': '刷新' }, h(RefreshIcon)),
          h('button', { type: 'button', className: 'dxp-ibar', title: open ? '收起' : '展开', onClick: () => setOpen(!open), 'aria-label': open ? '收起' : '展开', 'aria-expanded': open }, h(ChevronIcon, { up: open })),
        ),
        h('div', { className: 'dxp-collapse' + (open ? ' dxp-open' : '') },
          h('div', { className: 'dxp-collapse-inner' },
            h('div', { className: 'dxp-row2' },
              label('局域网'),
              switchBtn(lanOn, toggleLan, !st || busy),
            ),
            h('div', { className: 'dxp-row2' },
              lanUrl ? h('a', { className: 'dxp-addr', href: lanUrl, target: '_blank', rel: 'noreferrer', title: lanUrl }, lanUrl) : h('span', { className: 'dxp-hint' }, '未就绪'),
              lanUrl ? copyBtn('lan', lanUrl) : null,
            ),
            h('div', { className: 'dxp-row2' },
              label('公网服务'),
              switchBtn(running, toggleTunnel, !st || busy || pending || (!running && !agree)),
            ),
            !running ? h('label', { className: 'dxp-agree' },
              h('input', { type: 'checkbox', checked: agree, onChange: (e) => setAgree(!!(e.target && e.target.checked)) }),
              '我已知情',
            ) : null,
            h('div', { className: 'dxp-row2' },
              tunnelUrl ? h('a', { className: 'dxp-addr', href: tunnelUrl, target: '_blank', rel: 'noreferrer', title: tunnelUrl }, tunnelUrl) : h('span', { className: 'dxp-hint' }, POCKET_PHASE[phase] || '未开启'),
              tunnelUrl ? copyBtn('tunnel', tunnelUrl) : null,
            ),
            tunnelQr ? h('div', { className: 'dxp-row2' }, h('button', { type: 'button', className: 'dxp-btn', onClick: () => setQr(qr === 'tunnel' ? '' : 'tunnel') }, '二维码')) : null,
            (qr === 'tunnel' && tunnelQr) ? h('div', { className: 'dxp-qrwrap' }, h('img', { className: 'dxp-qr', alt: '公网访问二维码', src: tunnelQr })) : null,
            err ? h('div', { className: 'dxp-err' }, err) : null,
            h('div', { className: 'dxp-note' }, '公网这条走第三方的 dsh-pocket（npm 包，GPL-2.0，作者 shaobeichen）：局域网 + 公网隧道 + 二维码，带口令；它不在本仓里，要用这张卡得先装它。自研那张零依赖、只有局域网、无密码、不出公网。两种「移动端访问」占同一个端口，只能装一个。'),
          ),
        ),
      );
    }

    /* ═══ 范式：往「工具」里加一张卡 ═══════════════════════════════
       一张卡 = 三块：
         ① 标题行 .dxp-dock/.dxp-row1 —— 圆点（状态）+ 图标 + 标题 + 右侧动作按钮 + 折叠箭头；
         ② 折叠区 .dxp-collapse（.dxp-open 时展开）—— 展开的内容全放这里；
         ③ 折叠区里想挂什么就挂什么：状态行、表单、列表、canvas、小游戏都行。
       照抄下面 ReverseLanDock / GameDock 的结构即可（都走 DockShell），不必动面板本身。
       ═══════════════════════════════════════════════════════════ */
    function DockShell(props) {
      const open = props.open === true;
      const onToggle = props.onToggle;
      return h('div', { className: 'dxp-dock' },
        h('div', { className: 'dxp-row1' },
          h('span', { className: cls(props.dotCls) }),
          h('span', { className: 'dxp-title', title: open ? '点击收起' : '点击展开', onClick: onToggle }, props.icon, props.title),
          props.actions === undefined ? null : props.actions,
          h('button', { type: 'button', className: 'dxp-ibar', title: open ? '收起' : '展开', 'aria-label': open ? '收起' : '展开', 'aria-expanded': open, onClick: onToggle }, h(ChevronIcon, { up: open })),
        ),
        h('div', { className: 'dxp-collapse' + (open ? ' dxp-open' : '') },
          h('div', { className: 'dxp-collapse-inner' },
            props.children,
            props.note === undefined ? null : h('div', { className: 'dxp-note' }, props.note),
          ),
        ),
      );
    }
    function GameIcon() { return svgIcon('<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M8 12h3M9.5 10.5v3M15 11h.01M17 13h.01"/>'); }

    /* ── 反代·局域网（自研）：只局域网、无密码 ─────────────────────
       后端在 dsh-wifi-access 的 host 半端：GET /wifi-access/api/status，POST .../start|stop。
       它和「反代·公网」那张卡都占 3081，只推荐装/开一个。 */
    function ReverseLanDock() {
      const [st, setSt] = React.useState(null);
      const [busy, setBusy] = React.useState(false);
      const [open, setOpen] = React.useState(false);
      const [err, setErr] = React.useState('');
      const [copied, setCopied] = React.useState(false);

      const pull = React.useCallback(async () => {
        try {
          const res = await fetch('/wifi-access/api/status', { cache: 'no-store' });
          if (res.ok) { setSt(await res.json()); setErr(''); }
        } catch (e) { setErr(String((e && e.message) || e)); }
      }, []);
      React.useEffect(() => {
        pull();
        const t = setInterval(pull, 8000);
        return () => clearInterval(t);
      }, [pull]);

      const act = async (wantOn) => {
        if (busy) return;
        setBusy(true);
        try {
          const res = await fetch('/wifi-access/api/' + (wantOn ? 'start' : 'stop'), { method: 'POST', cache: 'no-store' });
          if (res.ok) setSt(await res.json());
        } catch (e) { setErr(String((e && e.message) || e)); }
        setBusy(false);
      };
      const doCopy = async (text) => {
        if (!text) return;
        const done = await copyText(text);
        setCopied(done);
        setTimeout(() => setCopied(false), 1600);
      };

      const running = !!(st && st.running);
      const dotCls = !st ? 'dxp-dot' : running ? 'dxp-dot-ok' : 'dxp-dot-err';
      const url = (st && st.mainUrl) || '';
      const port = (st && st.port) || 3081;
      const target = (st && st.targetPort) || 3080;
      return h(DockShell, {
        icon: h(PhoneIcon), title: '移动端访问', dotCls: dotCls, open: open, onToggle: () => setOpen(!open),
        actions: h('button', { type: 'button', className: 'dxp-btn ' + (running ? 'dxp-danger' : 'dxp-primary'), disabled: !st || busy, onClick: () => act(!running) }, busy ? '…' : (running ? '关闭' : '开启')),
        note: '自研反代：0.0.0.0:' + String(port) + ' → 127.0.0.1:' + String(target) + '，只走局域网、无密码、不出公网。两种「移动端访问」占同一个端口，只能装一个。',
      },
        h('div', { className: 'dxp-row2' },
          url ? h('a', { className: 'dxp-addr', href: url, target: '_blank', rel: 'noreferrer', title: url }, url)
            : h('span', { className: 'dxp-hint' }, !st ? '读取中…' : (st.delegated ? String(port) + ' 端口已由另一个实例接管' : '未开启')),
          url ? h('button', { type: 'button', className: 'dxp-copy', onClick: () => doCopy(url) }, h(copied ? CheckIcon : CopyIcon), copied ? '已复制' : '复制') : null,
        ),
        err ? h('div', { className: 'dxp-err' }, err) : null,
      );
    }

    /* ── 示例·小游戏：展开区挂任意内容（这里是 2048） ───────────────
       状态存在卡片自己身上，键盘监听在展开时挂、收起时摘 —— 这就是「挂内容」的全部规矩。 */
    const G2048_N = 4;
    function g2048Blank() { const b = []; for (let i = 0; i < G2048_N * G2048_N; i += 1) b.push(0); return b; }
    function g2048Add(board) {
      const empty = [];
      for (let i = 0; i < board.length; i += 1) if (board[i] === 0) empty.push(i);
      if (empty.length === 0) return board;
      const next = board.slice();
      next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
      return next;
    }
    /** 一行压紧 + 合并，返回 [新行, 得分]。 */
    function g2048Row(line) {
      const vals = line.filter((v) => v !== 0);
      const out = [];
      let score = 0;
      for (let i = 0; i < vals.length; i += 1) {
        if (i + 1 < vals.length && vals[i] === vals[i + 1]) { out.push(vals[i] * 2); score += vals[i] * 2; i += 1; }
        else out.push(vals[i]);
      }
      while (out.length < G2048_N) out.push(0);
      return [out, score];
    }
    /** 整盘移动，返回 [新盘, 得分, 是否真的动了]。 */
    function g2048Move(board, dir) {
      const vertical = dir === 'up' || dir === 'down';
      const reverse = dir === 'right' || dir === 'down';
      const next = board.slice();
      let score = 0;
      let moved = false;
      for (let i = 0; i < G2048_N; i += 1) {
        const line = [];
        for (let j = 0; j < G2048_N; j += 1) line.push(vertical ? board[j * G2048_N + i] : board[i * G2048_N + j]);
        if (reverse) line.reverse();
        const merged = g2048Row(line);
        score += merged[1];
        const row = merged[0];
        if (reverse) row.reverse();
        for (let j = 0; j < G2048_N; j += 1) {
          const before = vertical ? board[j * G2048_N + i] : board[i * G2048_N + j];
          if (row[j] !== before) moved = true;
          if (vertical) next[j * G2048_N + i] = row[j]; else next[i * G2048_N + j] = row[j];
        }
      }
      return [next, score, moved];
    }
    function g2048Dead(board) {
      if (board.indexOf(0) >= 0) return false;
      return g2048Move(board, 'left')[2] === false && g2048Move(board, 'up')[2] === false;
    }
    const G2048_TINT = { 2: '#dbe6f0', 4: '#c9dbec', 8: '#9fc3e0', 16: '#7fb0d8', 32: '#5f9bd0', 64: '#3f86c8', 128: '#2f74b8', 256: '#2663a8', 512: '#1d5298', 1024: '#163f86', 2048: '#0f2f74' };
    function GameDock() {
      const [open, setOpen] = React.useState(false);
      const [board, setBoard] = React.useState(() => g2048Add(g2048Add(g2048Blank())));
      const [score, setScore] = React.useState(0);
      const [over, setOver] = React.useState(false);

      const reset = () => { setBoard(g2048Add(g2048Add(g2048Blank()))); setScore(0); setOver(false); };
      const step = (dir) => {
        if (over) return;
        const moved = g2048Move(board, dir);
        if (moved[2] !== true) return;
        const filled = g2048Add(moved[0]);
        setBoard(filled);
        setScore(score + moved[1]);
        if (g2048Dead(filled)) setOver(true);
      };
      React.useEffect(() => {
        if (!open) return void 0;
        const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
        const onKey = (e) => {
          const dir = keys[e.key];
          if (dir === undefined) return;
          e.preventDefault();
          step(dir);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      });

      const best = board.reduce((a, b) => (b > a ? b : a), 0);
      return h(DockShell, {
        icon: h(GameIcon), title: '示例·小游戏', dotCls: over ? 'dxp-dot-err' : 'dxp-dot-ok', open: open, onToggle: () => setOpen(!open),
        actions: h('button', { type: 'button', className: 'dxp-btn', onClick: reset }, '重开'),
        note: '范式演示：卡片只管标题行 + 折叠区，展开区挂什么由卡片自己定（这里是 2048，展开后按方向键）。',
      },
        h('div', { className: 'dxp-row2' }, h('span', { className: 'dxp-hint' }, '得分 ' + String(score) + ' · 最大 ' + String(best) + (over ? ' · 无路可走' : ''))),
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '3px', paddingTop: '3px' } },
          board.map((v, i) => h('div', {
            key: i,
            style: {
              height: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
              background: v === 0 ? 'transparent' : (G2048_TINT[v] || '#0f2f74'), color: v === 0 ? 'transparent' : '#fff',
              border: v === 0 ? '1px dashed var(--dsw-alias-border-l1)' : 'none',
            },
          }, v === 0 ? '' : String(v)))),
      );
    }

    // 小工具：拼 className（避免 undefined）
    function cls() {
      var out = [];
      for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
      return out.join(' ');
    }

    const inject = ['slots'];
    function apply(ctx) {
      insertStyles(CSS);
      const slots = ctx.get('slots');
      if (slots === undefined) return;
      // vk-suite 在场判据：优先看 vk 私有槽是否被声明过（官方 slots.getVersion 公开 API），
      // 取不到再退回 vkRoots 服务；两者都拿不到才算“没有 vk”。
        // 官方槽延迟注册：vk-suite 在场时绝不注册（官方 sidebar 只读 metadata 画按钮，注册了返回 null 也挡不住）。
  // 等 250ms 让所有插件（含异步 apply 的 vk-layout）就位，再按那个全局把手判定。
  const injectLater = (n, f) => {
    setTimeout(() => {
      try { if (globalThis.__VK_LAYOUT_CTX__ === undefined) slots.inject(n, f); } catch (e) { /* ignore */ }
    }, 250);
  };
const vkPresent = () => {
        try {
            if (typeof globalThis !== 'undefined' && globalThis.__VK_LAYOUT_CTX__ !== undefined) return true;
          const s = ctx.get('slots');
          if (s && typeof s.getVersion === 'function') {
            if (s.getVersion('vk.sidebar.sessions') > 0) return true;
            if (s.getVersion('vk.sidebar.dirflow') > 0) return true;
            if (s.getVersion('vk.session.header.left') > 0) return true;
          }
          return ctx.get('vkRoots') !== undefined;
        } catch { return false; }
      };
      // 官方槽：左栏图标 + 中央面板（同一个 id 配对）——没装 vk-suite 时的主路
      injectLater('sidebar.panellist', () => slots.register(
        { name: 'sidebar.panellist', id: 'dsh-pocket-dock', order: 140, label: '移动端访问' },
        (props) => (vkPresent() ? null : h('span', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: (props && props.size) || 22, height: (props && props.size) || 22 } }, h(PhoneIcon))),
      ));
      injectLater('main', () => slots.register(
        { name: 'main', key: 'dsh-pocket-dock' },
        () => (vkPresent() ? null : h(PocketDock)),
      ));
      // vk 槽：左栏「功能」Tab（本机 vk 布局下走这条路）
      slots.inject('vk.sidebar.extensions', () => slots.register(
        { name: 'vk.sidebar.extensions', id: 'dsh-pocket-dock', order: 140, label: '移动端访问' },
        () => (vkPresent() ? h(PocketDock) : null),
      ));
    }

      slots.inject('vk.sidebar.extensions', () => slots.register(
        { name: 'vk.sidebar.extensions', id: 'dsh-reverse-lan', order: 150, label: '移动端访问' },
        () => (vkPresent() ? h(ReverseLanDock) : null),
      ));
      slots.inject('vk.sidebar.extensions', () => slots.register(
        { name: 'vk.sidebar.extensions', id: 'dsh-game-demo', order: 900, label: '示例·小游戏' },
        () => (vkPresent() ? h(GameDock) : null),
      ));
      const panelIcon = (icon) => (props) => (vkPresent() ? null : h('span', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: (props && props.size) || 22, height: (props && props.size) || 22 } }, h(icon)));
      injectLater('sidebar.panellist', () => slots.register(
        { name: 'sidebar.panellist', id: 'dsh-reverse-lan', order: 150, label: '移动端访问' },
        panelIcon(PhoneIcon),
      ));
      injectLater('main', () => slots.register(
        { name: 'main', key: 'dsh-reverse-lan' },
        () => (vkPresent() ? null : h(ReverseLanDock)),
      ));
      injectLater('sidebar.panellist', () => slots.register(
        { name: 'sidebar.panellist', id: 'dsh-game-demo', order: 900, label: '示例·小游戏' },
        panelIcon(GameIcon),
      ));
      injectLater('main', () => slots.register(
        { name: 'main', key: 'dsh-game-demo' },
        () => (vkPresent() ? null : h(GameDock)),
      ));
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
