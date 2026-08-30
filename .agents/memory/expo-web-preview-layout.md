---
name: Expo web preview layout
description: A rendering constraint for this workspace's Expo web preview.
---

For this workspace's Expo apps, the root `GestureHandlerRootView` must have `flex: 1` or the proxied web preview can appear blank even when Metro is healthy.

**Why:** The browser preview uses a full-height React Native Web root, and an unstyled gesture-handler root can collapse its child tree.

**How to apply:** Preserve a flex-filling root wrapper when wiring providers in the Expo root layout; verify the preview after the first workflow restart.