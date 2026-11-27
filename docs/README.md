# 脉络 Atlas 维护说明

- [产品设计](../DESIGN.md)：主题定位、成员收口边界与成功标准。
- [用户说明](../README.zh.md) · [English README](../README.md)：安装与使用说明。

聚合包在插件页提供一张卡，卡内使用 DSH 原生插件行。
版本管理面板在前，边记部在后。[清单](../aggregate.yml)声明成员及其 `link:` 来源。
生成的 [patch](../cordis.patch.yml)保留成员自己的行 ID、包名和配置，成员仍可独立安装。
一个 profile 只能选用同一行 ID 的一种装载方式。

## 准备与兼容

包名 `@miorin/dsh-atlas-continuity` 发布至 npm。目标 DSH 版本为 `0.2.2-rc.5`。
源码准备需要 Node.js 22.18 或更新的 22.x 版本，或 24.11 及更新版本，以及 pnpm。
本地联调时，两个源码目录 `../dsh-vcs-panel`、`../dsh-sideby-note` 须已完成各自的构建。
在本目录运行 `pnpm install --frozen-lockfile`，安装会在本目录建立依赖并生成聚合 patch。
安装至 DSH 的入口见[用户说明](../README.zh.md)。

## 维护与校验

运行 `pnpm run build` 更新 `scripts/dsh-aggregate.mjs` 及聚合字段。
变更成员时先编辑清单，再生成字段、运行 `pnpm install` 更新锁文件并校验。
提交清单、生成的 patch、包清单、锁文件以及生成的运行时入口（`index.js`、`client.js`），
以便独立仓库 CI 无需工作区工具即可校验和发布。
生成器源文件与默认工作区的 `tools/dsh-aggregate/src/` 保持一致，构建产物不入库。

- `pnpm test` 重新生成，然后运行全部检查。
- `pnpm run check` 只读检查生成工具和聚合字段是否有漂移，并用本地测试检查原生行及成员入口解析。
- 在默认工作区根目录运行 `node tools/new-dsh-plugin/cli.mts --check plugins/dsh-atlas-continuity` 检查骨架与元数据。

图标保留 Atlas 系列的罗盘徽记，主体是一笔相连的双环，表现工作在不同会话之间延续。
