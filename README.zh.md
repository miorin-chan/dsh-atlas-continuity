# 脉络模块化改良计划

[English](README.md)

脉络 Atlas 把版本管理面板和边记部收在 DeepSeek Harness 的同一张插件卡里。
在右侧栏查看 Git、Jujutsu 的改动与历史，在对话旁用边记部记下 Agent 工作时冒出的想法。
两个成员可以分别启停。

这个私有聚合包链接同级目录 `dsh-vcs-panel` 与 `dsh-sideby-note`。
先完成成员构建，再在本目录运行 `pnpm install`，然后从 DSH 的 **插件** → **添加插件** 选择本目录。
如果已单独安装任一成员，先移除对应独立包的加载项，避免出现重复行 ID。

兼容性与校验命令见[维护说明](docs/README.md)。
