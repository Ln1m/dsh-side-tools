# dsh-tools

> **The vk build only**: position — the sidebar Tools tab (`vk.sidebar.extensions`, a list slot), falling back to the sidebar bottom (`vk.sidebar.footer`); **the panel and the card pattern live here**, the real LAN-services card is [dsh-card-lan-services](https://github.com/Ln1m/dsh-card-lan-services); install the [dsh-vk-suite](https://github.com/Ln1m/dsh-vk-suite) contract + skeleton first.
> Conflicts: a slot renders only its highest-priority entry, and two registrations at the same priority throw; mutually exclusive with anything claiming the same position (see "How to use it / what it conflicts with" in [dsh-vk-suite](https://github.com/Ln1m/dsh-vk-suite)).

The panel behind the left sidebar's **Tools** tab in the DSH Web client, plus two flavours of "mobile access". One repository, two packages.

| Package | What it is |
|---|---|
| `dsh-tools` | The panel itself: the `DockShell` card host plus **one mount entry, `mountCard`**, with two copy-me examples ("Example · LAN services", "Example · mini game") |
| `dsh-wifi-access` | The host half of the self-made "mobile access": a `0.0.0.0:3081 → 127.0.0.1:3080` reverse proxy |

The open-source side ships **LAN services** and **mobile access** cards only. The LAN-services card's own inner cards are not open source, but the pattern for hanging content inside a card is given below in full; private cards such as the **virtual display** are not here.

## The mount path (reusable; the LAN-services card is the example)

A card only declares three things — `id` / `order` / `label` — plus its body component. **Which slot it lands in is the panel's decision**, so card authors never pick one. The LAN-services card is mounted like this:

```js
const { mountCard } = require('dsh-tools/client');   // the single entry the panel exports

mountCard(ctx, slots, { id: 'dsh-lan-services', order: 120, label: 'LAN services', component: LanServicesDock });
```

That expands into two registrations, first one preferred:

```js
// 1) With a Tools tab: one entry inside the tab
slots.inject('vk.sidebar.extensions', () => slots.register(
  { name: 'vk.sidebar.extensions', id: 'dsh-lan-services', order: 120, label: 'LAN services' },
  () => h(LanServicesDock)));

// 2) Without one (the panel checks the vkPanes service): a pinned card at the bottom of the sidebar —
//    the same slot the wallet uses under vk
slots.inject('vk.sidebar.footer', () => (toolsPanePresent(ctx) ? undefined : slots.register(
  { name: 'vk.sidebar.footer', id: 'dsh-lan-services', order: 120, label: 'LAN services' },
  () => h(LanServicesDock))));
```

`order` decides the position inside one area, `label` is the card title, and `id` only has to be unique among this repository's cards (the panel's own cards are prefixed `dsh-tools/…` so they never collide with anyone else's).

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

Installing `dsh-pocket` brings its own card; do **not** mount this panel's public card as well (the panel's `dsh-tools/pocket-dock` exists only so the card has a home when `dsh-pocket` is not installed).

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
dsh plugin --profile web add file:<clone of dsh-tool-wifi-access>   # self-made mobile access
# for public access, install this instead of the line above:
#   dsh plugin --profile web add dsh-pocket
```

Restart DSH afterwards. With a Tools tab the cards sit in it; without one they sit at the bottom of the sidebar.

## License

MIT
