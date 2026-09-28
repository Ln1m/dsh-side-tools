# dsh-tools

The panel behind the left sidebar's **Tools** tab in the DSH Web client, plus two flavours of "mobile access". One repository, three packages.

| Package | What it is |
|---|---|
| `dsh-tools` | The panel itself: the card host for the left sidebar's **Tools** tab, plus the card pattern. Private cards (e.g. the virtual-display switch) are **not** in the open-source build |
| `dsh-lan-services` | LAN service manager: probes local HTTP services on ports 3090–3099 and starts/stops them. It doubles as the **reference example** for adding a card |
| `dsh-wifi-access` | The host half of the self-made "mobile access": a `0.0.0.0:3081 → 127.0.0.1:3080` reverse proxy |

## Two flavours of "mobile access" — **install only one**

Both cards carry the same name and both want port 3081: **install (and run) exactly one**; running both makes them fight over the port.

| | Self-made (LAN) | Public (third-party `dsh-pocket`) |
|---|---|---|
| Dependencies | none, ships in this repository | requires installing [`dsh-pocket`](https://github.com/shaobeichen/dsh-pocket) separately (npm, GPL-2.0) |
| Reachable from | phones/tablets on the same LAN only | LAN + the public internet, so you can reach your machine from anywhere |
| Password | none | yes |
| Goes off-LAN | no | yes, through a Cloudflare tunnel |
| Best for | quick use at home/office on the same Wi-Fi | reaching your machine while travelling |

**The trade-off in one line**: if you need access from outside, install the public flavour (it adds public reachability at the cost of one third-party dependency and a password); if you don't, install the self-made one (no dependencies, no password, never leaves your LAN, but LAN-only).

Both cards live in the `dsh-tools` panel; each carries the same reminder at the bottom.

## Adding a card to **Tools** (the pattern)

A card is three pieces:

1. **Title row** `.dxp-row1`: status dot + icon + title + an action button on the right + the collapse chevron;
2. **Collapse area** `.dxp-collapse`: opens when `.dxp-open` is set (CSS grid 0fr→1fr transition);
3. **Whatever you hang inside is up to you**: status lines, forms, lists, a canvas, a small game.

`DockShell` in `lib/client.js` is that skeleton, and there are two ready-made examples:

- `ReverseLanDock` — the self-made "mobile access" card: polls `/wifi-access/api/status`, toggles via `POST .../start|stop`;
- `GameDock` — **the example of hanging content inside**: a 2048 board whose state lives on the card, with the keyboard listener attached while expanded and detached when collapsed.

Copy either structure to add your own tool; the panel itself needs no changes. The `dsh-lan-services` card has the same shape and is worth reading alongside them.

## Install

```powershell
dsh plugin --profile web add file:<this repository>/dsh-tools
dsh plugin --profile web add file:<this repository>/dsh-lan-services
dsh plugin --profile web add file:<this repository>/dsh-wifi-access   # self-made mobile access
# for public access, install this instead of the line above:
#   dsh plugin --profile web add dsh-pocket
```

Restart DSH afterwards. The first tab in the left sidebar is **Tools**.

## License

MIT
