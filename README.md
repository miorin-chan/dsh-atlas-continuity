# Continuity Modular Improvement Plan

[中文](README.zh.md)

Continuity Atlas brings repository history and workspace notes together in one DeepSeek Harness **Plugins** card.
Open the version control tab in the right sidebar to review Git and Jujutsu changes and history,
or open Sideby Note beside the conversation to capture ideas while the agent works.
The two plugin rows have independent switches.

In DeepSeek Harness, choose **Plugins** → **Add plugin** and enter `@miorin/dsh-atlas-continuity`
(or select a local directory after building sibling checkouts and running `pnpm install`).
If either member is already installed as a standalone bundle, remove its standalone bundle selection first
to avoid duplicate row IDs.

See the [maintenance guide](docs/README.md) for compatibility and verification commands.
