# dsh-tools

> Two builds, two positions. The **vk build** puts cards in the sidebar's **Tools** tab when the [dsh-vk-suite](https://github.com/Ln1m/dsh-vk-suite) skeleton is installed (`vk.sidebar.extensions`, a list slot); the **vk-free build** needs no skeleton and goes through the **official sidebar icons** (`sidebar.panellist`) plus the **central panel** (`main`) — the way it looked before the skeleton. **Use the vk build**: the sidebar tab switcher is what hosts that tab.

The panel behind the left sidebar's **Tools** tab in the DSH Web client, plus two flavours of "mobile access". One repository, two packages.

| Package | What it is |
|---|---|
| `dsh-tools` | The panel itself: the `DockShell` card host plus the card pattern, with two copy-me examples ("Example · LAN services", "Example · mini game") |
| `dsh-wifi-access` | The host half of the self-made "mobile access": a `0.0.0.0:3081 → 127.0.0.1:3080` reverse proxy |

The open-source side ships **LAN services** and **mobile access** cards only. The LAN-services card's own inner cards are not open source, but the pattern for hanging content inside a card is given below in full; private cards such as the **virtual display** are not here.

## The mount path (reusable; the LAN-services card is the example)

One card is one registration, and the same `id` pairs the sidebar entry with its body. The LAN-services card is mounted exactly like this — copy it:

```js
const slots = ctx.get('slots');

// With the skeleton: one entry in the sidebar's Tools tab (a list slot, several cards side by side)
slots.inject('vk.sidebar.extensions', () => slots.register(
  { name: 'vk.sidebar.extensions', id: 'dsh-lan-services', order: 120, label: 'LAN services' },
  () => h(LanServicesDock)));

// Without it: an official sidebar icon plus the central panel (same id pairs them) — the pre-skeleton look
slots.inject('sidebar.panellist', () => slots.register(
  { name: 'sidebar.panellist', id: 'dsh-lan-services', order: 120, label: 'LAN services' },
  (props) => h(ServerIcon, { size: (props && props.size) || 22 })));
slots.inject('main', () => slots.register(
  { name: 'main', key: 'dsh-lan-services' },
  () => h(LanServicesDock)));
```

`order` decides the position inside one area, `label` is the card title. This repository's panel currently registers the **official path** (`sidebar.panellist` + `main`, four cards); to make a card show up in the sidebar's Tools tab, register the `vk.sidebar.extensions` entry as shown in the first block.

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

## Hanging content inside a card (the pattern)

A card is three pieces:

1. **Title row** `.dxp-row1`: status dot + icon + title + an action button on the right + the collapse chevron;
2. **Collapse area** `.dxp-collapse`: opens when `.dxp-open` is set (CSS grid 0fr→1fr transition);
3. **Whatever you hang inside is up to you**: status lines, forms, lists, a canvas, a small game.

`DockShell` in `lib/client.js` is that skeleton, and there are two ready-made examples:

- `ReverseLanDock` — the self-made "mobile access" card: polls `/wifi-access/api/status`, toggles via `POST .../start|stop`;
- `GameDock` — **the example of hanging content inside**: a 2048 board whose state lives on the card, with the keyboard listener attached while expanded and detached when collapsed.

The LAN-services card uses the same structure (the "Example · LAN services" card is the shortest "title row + collapse area" sample): copy either structure to hang your own content inside a card, and the panel itself needs no changes.

## Install

```powershell
dsh plugin --profile web add file:<this repository>/dsh-tools
dsh plugin --profile web add file:<this repository>/dsh-wifi-access   # self-made mobile access
# for public access, install this instead of the line above:
#   dsh plugin --profile web add dsh-pocket
```

Restart DSH afterwards. With the skeleton installed the cards sit in the sidebar's Tools tab; without it they sit behind the official sidebar icon plus the central panel.

## License

MIT
