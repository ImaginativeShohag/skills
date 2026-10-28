---
name: claude-personal-launcher
disable-model-invocation: true
description: Create a separate Claude Personal launcher on macOS with dedicated configuration and user-data directories and a purple icon, using the installed Claude desktop app.
---

# Claude Personal launcher

Use the shell script below when the user requests a personal Claude desktop launcher on macOS. Packaging or installing this skill alone does not authorize running it or opening Claude.

## Before running

- Require macOS, the standard `osacompile`, `osascript`, `plutil`, and `open` tools, and Claude installed at `/Applications/Claude.app`. Report missing prerequisites; do not install them automatically.
- The script creates `~/Applications/Claude Personal.app`, `~/.claude-personal`, and `~/Library/Application Support/Claude-Personal`. It sets the launcher's bundle identifier to `local.claude.personal.launcher` and applies a hue-shifted Claude icon.
- Inspect an existing launcher before rerunning. Do not overwrite an unrelated app; replace an existing generated launcher only when replacement is within the user's request. Preserve existing configuration and user data.
- This is shell code, despite the embedded JavaScript. Run the entire block in `bash`; keep the quoted heredoc delimiters intact. Home paths are discovered at runtime; `/Applications/Claude.app` and `/usr/bin/open` are intentional macOS system locations.

## Create the launcher

```bash
(
  set -e

  launcher="$HOME/Applications/Claude Personal.app"
  data_dir="$HOME/Library/Application Support/Claude-Personal"

  test -d "/Applications/Claude.app"
  mkdir -p "$HOME/Applications" "$HOME/.claude-personal" "$data_dir"
  test -w "$data_dir"

  osacompile -o "$launcher" <<'APPLESCRIPT'
set homeDir to POSIX path of (path to home folder)
set configDir to homeDir & ".claude-personal"
set dataDir to homeDir & "Library/Application Support/Claude-Personal"

do shell script "/usr/bin/open -n -a '/Applications/Claude.app' --env " & quoted form of ("CLAUDE_CONFIG_DIR=" & configDir) & " --args --user-data-dir=" & quoted form of dataDir
APPLESCRIPT

  plutil -replace CFBundleIdentifier -string \
    "local.claude.personal.launcher" "$launcher/Contents/Info.plist"

  # Remove the generated stock icon catalog so the custom icon can show.
  rm -f "$launcher/Contents/Resources/Assets.car"

  osascript -l JavaScript - "$launcher" <<'JXA'
ObjC.import('AppKit');
ObjC.import('CoreImage');

function run(args) {
  const source = '/Applications/Claude.app/Contents/Resources/electron.icns';
  const data = $.NSData.dataWithContentsOfFile(source);
  if (!data.js) throw new Error('Claude icon not found');

  const image = $.CIImage.imageWithData(data);
  if (!image.js) throw new Error('Cannot read Claude icon');

  const filter = $.CIFilter.filterWithName('CIHueAdjust');
  filter.setDefaults;
  filter.setValueForKey(image, 'inputImage');
  filter.setValueForKey(
    $.NSNumber.numberWithDouble(180 * Math.PI / 180),
    'inputAngle'
  );

  const representation = $.NSCIImageRep.imageRepWithCIImage(
    filter.valueForKey('outputImage')
  );
  const icon = $.NSImage.alloc.initWithSize(representation.size);
  icon.addRepresentation(representation);

  if (!$.NSWorkspace.sharedWorkspace.setIconForFileOptions(icon, args[0], 0)) {
    throw new Error('Could not set launcher icon');
  }

  return 'Purple launcher created';
}
JXA
)
```

## Verify and report

After authorized execution, check that the launcher exists and its `Contents/Info.plist` contains the expected bundle identifier. Inspect its icon in Finder. Script success alone does not prove the icon is visible or Claude uses a separate account.

When the user requests launching or testing, open `~/Applications/Claude Personal.app` and verify the intended personal session in the UI. Let the user handle sign-in. Report observed behavior separately from syntax or bundle checks.

The script passes `CLAUDE_CONFIG_DIR` and `--user-data-dir` to the installed app. Treat this as the supplied workflow, not a guarantee of complete account, credential, cache, or process isolation: Claude's current handling of these inputs must be tested. Electron's [application API](https://www.electronjs.org/docs/latest/api/app) describes app-controlled paths and single-instance behavior. If launching reuses the existing session, stop and report it; do not delete profiles or sign out other sessions.

Failures can leave a partially created launcher. Report the failing step and inspect the result before retrying. If the icon resource changes in a Claude update, report the missing resource instead of claiming success.
