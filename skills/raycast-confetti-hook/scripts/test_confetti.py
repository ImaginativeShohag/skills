"""Run with python3; uses a fake open command, never Raycast."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import time

script = Path(__file__).with_name('confetti.sh')
with tempfile.TemporaryDirectory(prefix='confetti-check-') as directory:
    base = Path(directory)
    fake_open = base / 'open'
    fake_open.write_text('printf "%s\\n" "$1" >> "$CONFETTI_TEST_CALLS"\nexit 1\n')
    calls = base / 'calls'
    env = dict(os.environ, TMPDIR=directory, CONFETTI_TEST_CALLS=str(calls))
    env['PATH'] = directory + os.pathsep + env['PATH']
    # bash can execute this shebang-free mock via its shell fallback.
    fake_open.chmod(0o700)

    def run(event, session='one', **fields):
        payload = dict(hook_event_name=event, session_id=session, **fields)
        result = subprocess.run(['bash', str(script)], input=json.dumps(payload),
                                text=True, capture_output=True, env=env, timeout=5)
        assert (result.returncode, result.stdout, result.stderr) == (0, '', '')

    def count():
        return len(calls.read_text().splitlines()) if calls.exists() else 0

    def wait_count(expected):
        deadline = time.monotonic() + 2
        while count() < expected and time.monotonic() < deadline:
            time.sleep(0.01)
        assert count() == expected

    run('Stop')
    assert count() == 0
    run('UserPromptSubmit', prompt='hi')
    run('UserPromptSubmit', session='two', prompt='hi')
    run('Stop')
    run('Stop')
    wait_count(1)
    run('Stop', session='two')
    wait_count(2)
    for prompt in ('/clear', ' /compact extra', ''):
        run('UserPromptSubmit', prompt=prompt)
        run('Stop')
    for source in ('startup', 'resume', 'clear', 'fork'):
        run('UserPromptSubmit', prompt='hi')
        run('SessionStart', source=source)
        run('Stop')
    assert count() == 2
    run('UserPromptSubmit', prompt='hi')
    run('PreCompact', trigger='auto')
    run('SessionStart', source='compact')
    run('Stop')
    wait_count(3)
    run('UserPromptSubmit', prompt='hi')
    run('PreCompact', trigger='manual')
    run('Stop')
    run('UserPromptSubmit', session='../escape', prompt='hi')
    run('UserPromptSubmit', session='', prompt='hi')
    result = subprocess.run(['bash', str(script)], input='invalid JSON',
                            text=True, capture_output=True, env=env, timeout=5)
    assert (result.returncode, result.stdout, result.stderr) == (0, '', '')
    assert count() == 3
    assert calls.read_text().splitlines() == ['raycast://extensions/raycast/raycast/confetti'] * 3
print('Confetti hook checks passed (Raycast mocked).')
