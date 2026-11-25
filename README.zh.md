# 脉络模块化改良计划

[English](README.md)

脉络 Atlas 把版本管理面板和边记部收在 DeepSeek Harness 的同一张插件卡里。
在右侧栏查看 Git、Jujutsu 的改动与历史，在对话旁用边记部记下 Agent 工作时冒出的想法。
两个成员可以分别启停。

在 DeepSeek Harness 的 **插件** → **添加插件** 中输入 `@miorin/dsh-atlas-continuity`（本地开发时先完成成员构建、
在本目录运行 `pnpm install`，再从目录添加）。
如果已单独安装任一成员，先移除对应独立包的加载项，避免出现重复行 ID。

兼容性与校验命令见[维护说明](docs/README.md)。
