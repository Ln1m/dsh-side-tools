# dsh-tools

> 两个版本、两个位置：**vk 版**是装 [dsh-vk-suite](https://github.com/Ln1m/dsh-vk-suite) 骨架时把卡挂进左栏**「工具」Tab**（`vk.sidebar.extensions` 列表槽）；**官方挂载版**不依赖骨架，走**官方左栏图标**（`sidebar.panellist`）+ **中央面板**（`main`）—— 也就是装骨架之前的样子。**推荐 vk 版**：左栏的 Tab 切换就是这个 Tab 的宿主。

给 DSH Web 左栏「工具」Tab 用的面板，外加两种「移动端访问」。一个仓，两个包。

| 包 | 作用 |
|---|---|
| `dsh-tools` | 面板本体：卡片宿主 `DockShell` + 卡片范式，附「示例·局域网服务」「示例·小游戏」两张照抄用的范例卡 |
| `dsh-wifi-access` | 自研「移动端访问」的服务端：`0.0.0.0:3081 → 127.0.0.1:3080` 反代 |

本仓只给**局域网服务**与**移动端访问**两类卡：局域网服务卡内部那几张卡不开源，但下面给足「卡里再挂卡片」的范式；**虚拟显示器那类私人卡片不在开源侧**。

## 挂载路径（可复用，以局域网服务卡为例）

一张卡 = 一条注册，同一个 `id` 把左栏入口与正文配成一对。局域网服务卡就是这么挂的，照抄它即可：

```js
const slots = ctx.get('slots');

// 有骨架：左栏「工具」Tab 里的一条（列表槽，一个 Tab 并排挂多张卡）
slots.inject('vk.sidebar.extensions', () => slots.register(
  { name: 'vk.sidebar.extensions', id: 'dsh-lan-services', order: 120, label: '局域网服务' },
  () => h(LanServicesDock)));

// 没骨架：官方左栏图标 + 中央面板（同一个 id 配对）——装骨架之前的样子
slots.inject('sidebar.panellist', () => slots.register(
  { name: 'sidebar.panellist', id: 'dsh-lan-services', order: 120, label: '局域网服务' },
  (props) => h(ServerIcon, { size: (props && props.size) || 22 })));
slots.inject('main', () => slots.register(
  { name: 'main', key: 'dsh-lan-services' },
  () => h(LanServicesDock)));
```

`order` 决定同一区里的先后，`label` 是卡片标题。本仓面板本体现在挂的是**官方那条路**（`sidebar.panellist` + `main`，四张卡）；想让卡出现在左栏「工具」Tab 里，照上面第一段把 `vk.sidebar.extensions` 那条也注册上即可。

## 两种「移动端访问」——**只能装一个**

两张卡名字一样、都占 3081 端口：**同时只装（也只开）一个**，两个一起开会互相抢端口。

| | 自研（局域网） | 公网（第三方 `dsh-pocket`） |
|---|---|---|
| 依赖 | 无，本仓自带 | 要**另外装** [`dsh-pocket`](https://github.com/shaobeichen/dsh-pocket)（npm 包，GPL-2.0） |
| 从哪能访问 | 只有同一局域网内的手机/平板 | 局域网 + 公网，人在外面也能连回电脑 |
| 口令 | 无 | 有 |
| 是否出网 | 不出公网 | 走 Cloudflare 隧道 |
| 适合 | 在家/办公室同一个 WiFi 随手用 | 出门在外要连回电脑 |

**取舍一句话**：要外网访问就装公网版（含公网，代价是多一个第三方依赖 + 要口令）；不需要外网就装自研版（零依赖、无口令、不出网，代价是只能在局域网里用）。

两张卡都在 `dsh-tools` 面板里；卡内底部各写了一句同样的提醒。

## 卡里再挂内容（范式）

一张卡就三块：

1. **标题行** `.dxp-row1`：状态圆点 + 图标 + 标题 + 右侧动作按钮 + 折叠箭头；
2. **折叠区** `.dxp-collapse`：`.dxp-open` 时展开（CSS grid 0fr→1fr 过渡）；
3. **展开区里挂什么由你定**：状态行、表单、列表、canvas、小游戏都行。

`lib/client.js` 里 `DockShell` 是这套骨架，两个现成样本：

- `ReverseLanDock`——自研「移动端访问」卡：轮询 `/wifi-access/api/status`、开关走 `POST .../start|stop`；
- `GameDock`——**展开区挂内容的范式**：里面是个 2048，状态存在卡片自己身上，键盘监听在展开时挂上、收起时摘掉。

局域网服务卡用的是同一套结构（`示例·局域网服务` 那张是「标题行 + 折叠区」的最短范例）：卡里再挂什么，照抄这两张的结构即可，不必动面板本身。

## 安装

```powershell
dsh plugin --profile web add file:<本仓库>/dsh-tools
dsh plugin --profile web add file:<本仓库>/dsh-wifi-access   # 自研移动端访问
# 要公网访问就改成（并且不要上面这条）：
#   dsh plugin --profile web add dsh-pocket
```

装完重启 DSH。装了骨架时卡在左栏「工具」Tab，没装骨架时在官方左栏图标 + 中央面板。

## License

MIT
