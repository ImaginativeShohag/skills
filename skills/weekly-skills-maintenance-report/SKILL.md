---
name: weekly-skills-maintenance-report
disable-model-invocation: true
description: Create or recreate a weekly read-only maintenance report schedule on another device, or run that report, using logs and a success marker from an existing host job that updates skills and Android tooling.
---

# Weekly skills maintenance report

Create one recurring local schedule that reports the results of an existing host maintenance job. The reporting task must never perform updates itself. Installing this skill alone does not create a schedule.

## Resolve destination settings

Use the user's supplied settings first. Before creating a schedule, ask the user to choose the time and model, offering the recommendations below. If the user already chose either setting, ask only for the remaining choice. Do not create the schedule until both choices are provided; do not ask again during report runs.

| Setting | Default |
| --- | --- |
| Name | Weekly skills maintenance report |
| Recommended cadence | Every Monday at 3:15 PM in the destination device's local timezone |
| Status | Active |
| Execution | Local, standalone; projectless when supported |
| Working directory | `~` (destination user's home directory) |
| Recommended model | An available medium-priced model, with medium reasoning effort |
| Notifications | Normal/default behavior; do not mute failures |
| Maintenance log | `~/Library/Logs/Codex Maintenance/weekly-skills-and-android.log` |
| Success marker | `~/Library/Application Support/Codex Maintenance/weekly-skills-and-android.success-week` |

These home-relative paths describe the original macOS workflow, not a prerequisite for every platform. On another platform or host layout, ask for equivalent paths relative to the destination home directory or an explicit working directory. Never infer a personal username or host job identifier.

Verify that a separate host job already exists and identify its log, success marker, cadence, and marker format from destination configuration or user input. On macOS this may be a `launchd` job. Do not install, configure, repair, or trigger it. If prerequisites are missing, report what is missing; do not claim the workflow is operational.

Recommend a concrete model from the destination scheduler's available models using current official pricing or a documented pricing tier. Do not hard-code a model name or assume that model names imply price. If pricing cannot be verified, say so and ask the user which available model to use. Offer medium reasoning effort when supported; disclose if it is unavailable. Confirm the destination timezone if it cannot be determined.

## Check required apps and tooling

Identify the apps and tools actually used by the destination maintenance job and local scheduler, such as the Skills CLI, Android CLI, and the scheduling app. Check installation using read-only executable, package, or app metadata checks. Do not run download-on-demand commands just to check installation. A missing executable on the current search path alone does not prove an app is uninstalled; distinguish confirmed absence from an unverifiable installation.

Tell the user which required apps or tools are not installed, what checks will be skipped, and offer to guide their installation if needed. If installation cannot be verified, report that separately. Continue the checks that remain possible. Installation requires a separate user request and is outside this report's read-only scope.

## Create or update the schedule

Only create or update a schedule when the user requests it. Use the receiving agent's supported local scheduling capability. For Codex, use the scheduled-task/automation tool rather than editing internal automation files manually. Use its standalone local schedule option, not a thread follow-up, when available.

1. Check for an existing schedule with the same purpose. Update it instead of creating a duplicate; preserve unrelated settings.
2. Configure the settings above, applying the user's overrides. Store durable instructions in the saved prompt so future runs do not need this conversation.
3. Substitute the resolved home-relative or working-directory-relative paths into the prompt below. State the base directory if using working-directory-relative paths. Include the identified required apps/tools and their read-only installation checks in the saved prompt so each run can verify them without this conversation.
4. Read back the saved schedule or supported task card. Verify name, cadence, timezone, active status, local execution, prompt, and applicable model settings. Distinguish a saved schedule from a successful report run.

If local scheduling or local file access is unavailable, explain the limitation and provide the prompt for a compatible scheduler. Do not silently substitute a cloud task that cannot read the files.

## Saved prompt

```text
Review the existing host maintenance job's output in `~/Library/Logs/Codex Maintenance/weekly-skills-and-android.log` and `~/Library/Application Support/Codex Maintenance/weekly-skills-and-android.success-week`. These paths are relative to the destination user's home directory. The separate host job performs skills and Android CLI maintenance; this task only reports its results.

Check whether the apps and tools required by the configured maintenance workflow are installed using read-only installation checks. Do not invoke commands that download or install tools to check their presence. Report confirmed missing apps/tools, explain which checks were skipped, and offer to guide installation if needed. Distinguish an unverifiable installation from confirmed absence. Continue any checks that remain possible; do not install anything as part of this report.

Report activity since the previous review: newly observed updates and command failures, whether the latest run completed successfully, and whether the success marker is current for the host job's expected cadence. Use the scheduler's prior run history or permitted private memory to determine the previous review boundary. Never write review state into the maintenance files or the public skills repository. If no previous review is available, establish a baseline from the latest identifiable run and say that a delta could not be determined. If no new host run occurred, say so concisely, but still flag an overdue run or stale marker.

If files are missing or unreadable, run boundaries are ambiguous, or the marker format or job cadence is unknown, report the limitation rather than inferring success. A current marker does not prove a newer failed run succeeded. Redact credentials and personal data; summarize results without copying raw logs.

Do not run `npx skills` or `android` update commands. Do not install, repair, or trigger maintenance. Do not modify project source code, dependencies, configuration files, the host job or LaunchAgent, or its log/state files.
```

## Run a report directly

When the user requests a report instead of a schedule, check required apps and tooling, then apply the saved prompt to the resolved destination files. Read only the relevant run boundaries and entries. Report updates, failures, latest-run outcome, marker freshness, missing apps/tools, and any evidence limitations concisely. Offer installation guidance for missing apps/tools. Do not create a schedule as a side effect.
