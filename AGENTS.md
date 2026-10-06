# Custom skills repository

This repository contains portable skills intended for public GitHub distribution and installation through the Skills CLI.

## Structure and compatibility

- Put each skill in `skills/<skill-name>/SKILL.md`.
- Use lowercase, hyphenated names. The directory and frontmatter `name` must match.
- Include YAML frontmatter with `name` and a concise `description` explaining when to use the skill.
- Keep skills self-contained. Root instructions are for repository contributors and may not be installed with a skill.
- Use agent-neutral instructions; describe required capabilities and provide product-specific guidance only where necessary. If a capability is unavailable, report the limitation.
- Add scripts, references, assets, or agent metadata only when the workflow needs them. Use relative links within the skill.

## Paths and public safety

- All stored filesystem paths must be relative to the repository, skill, or explicitly stated working directory. Use `~/` only for home-relative runtime locations; never embed a machine's absolute home directory.
- Keep device-specific configuration outside the repository. Discover it at runtime or ask for the minimum necessary settings.
- Never include credentials, tokens, private keys, personal identifiers, account IDs, private URLs, chat IDs, raw conversation exports, maintenance logs, or local automation state.
- When adapting a chat, extract the reusable workflow and remove private context. Use clearly marked placeholders where runtime configuration is needed.
- Do not copy private files into examples or fixtures. `.gitignore` is a convenience, not proof that content is safe to publish.
- Creating or installing a skill does not authorize running its external actions. Preserve the source workflow's authorization and read-only boundaries.

## Changes and validation

- Keep changes focused. Update the root README skill list when adding or renaming a skill.
- For CLI, library, or API instructions, resolve and query current documentation through Context7 when available; consult official documentation if unavailable or incomplete.
- Validate frontmatter and names, resolve local links, and review every added file for sensitive content and absolute paths before completion.
- Run any added scripts and one meaningful check for non-trivial logic. For instruction-only skills, validate structure and review realistic use cases.
- Do not commit, push, publish, install skills globally, or create schedules unless the user requests that action.
