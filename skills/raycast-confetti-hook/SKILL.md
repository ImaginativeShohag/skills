---
name: raycast-confetti-hook
description: Set up, verify, troubleshoot, or remove Raycast confetti hooks for Claude Code on macOS, firing once after a submitted prompt receives a response and staying quiet on clear, manual compaction, or resume.
---

# Raycast confetti hook

Use Claude Code's command hooks and Raycast's existing Confetti command. This skill can be installed by any agent, but the hook configuration targets Claude Code on macOS. Adding this skill to a collection does not authorize changing the user's live hooks.

## Check prerequisites

Before setup, verify macOS, Claude Code, `bash`, `jq`, and Raycast. Check executables through command lookup; check Raycast through installed application metadata or its app bundle, including user-installed apps. A missing `raycast` shell command does not mean the app is absent. If discovery is restricted or inconclusive, say installation could not be verified.

If Raycast is missing, tell the user it is required, link to the [official download](https://www.raycast.com/), and offer to guide installation. Do the same for missing Claude Code or `jq`, using current official installation guidance. Do not silently install prerequisites. Complete independent checks, but leave hook activation pending until prerequisites are ready.

In Raycast, find Confetti and use **Copy Deeplink**. Verify the copied link on the destination Mac before registering hooks. The standard candidate is `raycast://extensions/raycast/raycast/confetti`; some distributions use a different scheme, so prefer the copied link. Test with `open` and confirm the animation visibly appears; a successful `open` exit status alone is not visual proof. Raycast may request permission to run a deeplink. If the test fails, report it and offer setup guidance.

## Set up when requested

1. Run the bundled check from this skill's directory:

   ```sh
   python3 scripts/test_confetti.py
   ```

2. Copy [scripts/confetti.sh](scripts/confetti.sh) to `~/.claude/hooks/confetti.sh`. Do not overwrite an unrelated existing script. The hook invokes it through `bash`, so an executable bit is unnecessary. Set `RAYCAST_CONFETTI_URL` in the hook commands if the verified copied deeplink differs from the default; set `JQ_BIN` to a home-relative executable if `jq` is outside Claude Code's hook PATH.
3. Merge the entries from [references/hooks.json](references/hooks.json) into `~/.claude/settings.json`. Preserve unrelated settings and hook arrays; do not replace the whole file. Check user and project hook settings for equivalent entries so setup remains idempotent. Keep a private backup outside this public repository before editing.
4. Commands use quoted `$HOME` expansion through the shell; do not replace it with a machine-specific absolute path or a quoted literal `~`. Validate the resulting JSON with `jq empty` and confirm the hooks in Claude Code's `/hooks` menu. Restart the session if needed.

## Event behavior

| Event | Action |
| --- | --- |
| `UserPromptSubmit` | Arm a session marker for nonempty prompts, excluding `/clear` and `/compact`. |
| `Stop` | Consume the marker once, then launch the verified Confetti deeplink. |
| `SessionStart` with startup, resume, clear, or fork | Clear stale state. |
| `PreCompact` with manual trigger | Clear state so `/compact` cannot celebrate. |

Auto-compaction leaves the external marker intact; do not add an unconditional `PostCompact` arm hook. Marker consumption is synchronous to avoid an async Stop hook consuming the next prompt's marker; only the Raycast launch runs in the background. The script exits successfully and emits no hook output even when JSON, dependencies, or launching fail.

Claude Code can also emit `UserPromptSubmit` for automated turns. The documented input does not reliably distinguish every human submission, so this marker mechanism alone cannot guarantee human-only celebrations in sessions using scheduled tasks or background messages. Explain this limit when relevant rather than claiming strict filtering. Other blocking Stop hooks can also continue a turn after this hook fires; verify behavior with the destination's existing hooks.

## Verify and report

The bundled check mocks `open`; it must never fire real confetti. It checks one-shot firing, session isolation, invalid input, slash commands, clear/resume resets, auto/manual compaction, and launch failure handling.

After live setup is requested, verify in Claude Code: a normal prompt celebrates once; `/clear`, `/compact`, and resume without a new prompt stay quiet; a prompt spanning auto-compaction still celebrates once. Report script-check results separately from observed live behavior. If dependency lookup fails only in hooks, resolve the destination hook PATH without embedding private host paths in this skill.

To remove the setup when requested, delete only this hook's entries and its installed script. Preserve unrelated hooks and settings. Never delete an entire hooks directory or all temporary files.

## Documentation

- [Claude Code hooks reference](https://code.claude.com/docs/en/hooks)
- [Raycast deeplinks](https://developers.raycast.com/information/lifecycle/deeplinks)
