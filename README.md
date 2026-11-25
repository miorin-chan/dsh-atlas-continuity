# Continuity Modular Improvement Plan

[中文](README.zh.md)

Continuity Atlas brings repository history and workspace notes together in one DeepSeek Harness **Plugins** card.
Open the version control tab in the right sidebar to review Git and Jujutsu changes and history,
or open Sideby Note beside the conversation to capture ideas while the agent works.
The two plugin rows have independent switches.

This private bundle links the sibling `dsh-vcs-panel` and `dsh-sideby-note` checkouts.
Build those checkouts first, then run `pnpm install` here.
In DSH, choose **Plugins** → **Add plugin** and select this directory.
If either member is already installed as a standalone bundle, remove its standalone bundle selection first
to avoid duplicate row IDs.

See the [maintenance guide](docs/README.md) for compatibility and verification commands.
