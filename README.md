# dsh-tools

> 本仓**只有 vk 版**：位置 —— 左栏「工具」Tab（`vk.sidebar.extensions` 列表槽），没有该 Tab 时落左栏底部（`vk.sidebar.footer`）；**面板与挂卡范式在本仓**，真实局域网服务卡在 [dsh-card-lan-services](https://github.com/Ln1m/dsh-card-lan-services)，需先装 [dsh-vk-suite](https://github.com/Ln1m/dsh-vk-suite) 契约 + 骨架。
> 冲突：一个槽位只渲染优先级最高的一条，同优先级重复注册会直接抛错；与占同一位置的插件互斥（详见 [dsh-vk-suite](https://github.com/Ln1m/dsh-vk-suite) 的「推荐怎么用 / 会跟谁冲突」）。

给 DSH Web 左栏「工具」Tab 用的面板，外加两种「移动端访问」。一个仓，两个包。

| 包 | 作用 |
|---|---|
| `dsh-tools` | 面板本体：卡片宿主 `DockShell` + **一个挂载入口 `mountCard`**，附「示例·局域网服务」「示例·小游戏」两张照抄用的范例卡 |
| `dsh-wifi-access` | 自研「移动端访问」的服务端：`0.0.0.0:3081 → 127.0.0.1:3080` 反代 |

本仓只给**局域网服务**与**移动端访问**两类卡：局域网服务卡内部那几张卡不开源，但下面给足「卡里再挂卡片」的范式；**虚拟显示器那类私人卡片不在开源侧**。

## 挂载路径（可复用，以局域网服务卡为例）

卡只往外说三件事 —— `id` / `order` / `label`，外加正文组件；**挂到哪条槽由面板按环境决定**，写卡的人不必挑。以局域网服务卡为例：

```js
const { mountCard } = require('dsh-tools/client');   // 面板本体导出的唯一入口

mountCard(ctx, slots, { id: 'dsh-lan-services', order: 120, label: '局域网服务', component: LanServicesDock });
```

它展开成两条注册，优先第一条：

```js
// ① 有「工具」Tab：Tab 里的一条
slots.inject('vk.sidebar.extensions', () => slots.register(
  { name: 'vk.sidebar.extensions', id: 'dsh-lan-services', order: 120, label: '局域网服务' },
  () => h(LanServicesDock)));

// ② 没有「工具」Tab（面板查 vkPanes 服务确认这一栏不在）：落到左栏底部常驻 —— 和 vk 下的钱包同一个槽
slots.inject('vk.sidebar.footer', () => (toolsPanePresent(ctx) ? undefined : slots.register(
  { name: 'vk.sidebar.footer', id: 'dsh-lan-services', order: 120, label: '局域网服务' },
  () => h(LanServicesDock))));
```

`order` 决定同一区里的先后，`label` 是卡片标题；`id` 只要求在本仓卡里唯一（面板的卡一律用 `dsh-tools/…` 前缀，免得和别人的卡撞 id）。

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

`dsh-pocket` 装进来时自带它的卡，这时**不要**再让本仓面板挂公网那张（面板里的 `dsh-tools/pocket-dock` 是给没装 `dsh-pocket` 却想看那张卡的位置的）。

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
dsh plugin --profile web add file:<dsh-tool-wifi-access 的克隆路径>   # 自研移动端访问
# 要公网访问就改成（并且不要上面这条）：
#   dsh plugin --profile web add dsh-pocket
```

装完重启 DSH。有「工具」Tab 时卡在 Tab 里，没有时在左栏底部。

## License

MIT
