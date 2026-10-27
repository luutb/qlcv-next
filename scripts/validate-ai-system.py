#!/usr/bin/env python3
"""Validate the maintained minimal AI-system schemas; not semantic workflow gates.

Python 3.11+ standard library only. --native renders Codex's prompt without a model
turn; it may initialize Codex local caches. Never prints prompt contents/secrets.
"""
import argparse
import json
from pathlib import Path
import re
import subprocess
import sys
import tomllib
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
AGENTS = {'ba', 'po', 'pm', 'product-designer', 'architect', 'tech-lead',
          'frontend-developer', 'backend-developer', 'qa', 'code-reviewer', 'release-engineer'}
SKILLS = {'project-context', 'requirements-analysis', 'nextjs-architecture',
          'frontend-implementation', 'api-data-integration', 'testing-verification',
          'code-review', 'security-review', 'git-workflow'}
WORKFLOWS = {'new-feature', 'bug-fix', 'technical-design', 'code-review',
             'refactoring', 'release-verification'}
TEMPLATES = {'requirements', 'user-stories', 'implementation-plan',
             'architecture-decision-record', 'test-plan', 'review-report', 'release-checklist'}


def validate(root):
    errors = []
    def check(ok, message):
        if not ok:
            errors.append(message)
    agent_paths = sorted((root / '.codex/agents').glob('*.toml'))
    skill_paths = sorted((root / '.agents/skills').glob('*/SKILL.md'))
    check({p.stem for p in agent_paths} == AGENTS, 'Agent roster differs from maintained contract')
    check({p.parent.name for p in skill_paths} == SKILLS, 'Skill roster differs from maintained contract')
    names = set()
    for p in agent_paths:
        try:
            agent = tomllib.loads(p.read_text())
            check(set(agent) == {'name', 'description', 'developer_instructions'}, f'{p}: unsupported minimal-schema field')
            for key in ('name', 'description', 'developer_instructions'):
                check(isinstance(agent.get(key), str) and bool(agent[key].strip()), f'{p}: missing/non-string {key}')
            name = agent.get('name')
            check(name == p.stem and name not in names, f'{p}: duplicate/mismatched agent name')
            names.add(name)
            body = agent.get('developer_instructions', '')
            for label in ('Mission:', 'Inputs:', 'Responsibilities:', 'Outputs:', 'Authority and boundaries:', 'Escalation:', 'Quality criteria:'):
                check(label in body, f'{p}: missing {label}')
            if name not in ('frontend-developer', 'backend-developer'):
                check(('Access policy: Do not edit files.' in body or 'Access policy: Do not intentionally edit source, configuration or task artifacts.' in body), f'{p}: missing read-only instruction')
        except (ValueError, TypeError) as exc:
            errors.append(f'{p}: invalid TOML: {exc}')
    for p in skill_paths:
        # Deliberately accept only the two plain/JSON-quoted scalar fields used here;
        # this is not a general YAML parser. Native discovery supplements it.
        match = re.match(r'\A---\nname: ([a-z0-9-]+)\ndescription: ("[^\n]+")\n---\n', p.read_text())
        check(match is not None, f'{p}: unsupported frontmatter; expected name and quoted description')
        if match:
            check(match[1] == p.parent.name and len(match[1]) < 64, f'{p}: invalid name')
            try:
                check(bool(json.loads(match[2]).strip()), f'{p}: empty description')
            except (ValueError, AttributeError):
                errors.append(f'{p}: invalid description scalar')
    base = root / 'docs/ai-development'
    for directory, expected in [('workflows', WORKFLOWS), ('templates', TEMPLATES)]:
        check({p.stem for p in (base / directory).glob('*.md')} == expected, f'{directory}: roster mismatch')
    for p in (base / 'workflows').glob('*.md'):
        for label in ('Purpose:', 'Entry conditions:', 'Required inputs:', 'Responsible agent:', 'Supporting agents:', '## Ordered steps', '## Artifacts produced', '## Decision points', '## Handoff conditions', '## Failure and escalation paths', '## Completion criteria'):
            check(label in p.read_text(), f'{p}: missing {label}')
    for p in (base / 'templates').glob('*.md'):
        for label in ('Purpose:', 'Status: Draft', 'Owner:', 'Task / requirement reference:', '## Decisions and assumptions', '## Completion criteria', '## Unresolved questions'):
            check(label in p.read_text(), f'{p}: missing {label}')
    docs = [root / 'AGENTS.md', *base.rglob('*.md'), *skill_paths]
    for p in docs:
        content = p.read_text()
        for target in re.findall(r'\[[^\]]+\]\(([^)]+)\)', content):
            url = urlsplit(target)
            if url.scheme or not url.path:
                continue
            resolved = (p.parent / unquote(url.path)).resolve()
            check(resolved.exists(), f'{p}: missing link target {target}')
        check(not re.search(r'\b(TODO|FIXME)\b', content), f'{p}: unfinished scaffold')
    check('<!-- BEGIN:nextjs-agent-rules -->' in (root / 'AGENTS.md').read_text(), 'Managed Next.js instructions absent')
    return errors


def native(root):
    result = subprocess.run(['codex', 'debug', 'prompt-input', 'Validate local discovery only.'],
                            cwd=root, capture_output=True, text=True, timeout=55)
    if result.returncode:
        # Avoid dumping stderr: a host could include configuration values there.
        return [f'Native discovery failed (exit {result.returncode}); inspect Codex locally.']
    data = json.loads(result.stdout)
    prompt = json.dumps(data, ensure_ascii=False)
    errors = []
    if 'Codex development system' not in prompt:
        errors.append('Native prompt does not include root project instructions')
    # prompt-input exposes messages, not a guaranteed custom-agent tool catalog.
    # Absence cannot prove the host did not load a role; do not claim activation.
    for p in (root / '.agents/skills').glob('*/SKILL.md'):
        description = json.loads(p.read_text().split('description: ', 1)[1].split('\n', 1)[0])
        if description not in prompt:
            errors.append(f'Native prompt missing skill metadata: {p.parent.name}')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--native', action='store_true')
    args = parser.parse_args()
    errors = validate(ROOT)
    if args.native and not errors:
        try:
            errors.extend(native(ROOT))
        except (OSError, ValueError, subprocess.TimeoutExpired) as exc:
            errors.append(f'Native discovery unavailable: {type(exc).__name__}')
    if errors:
        for error in errors:
            print(f'FAIL: {error}', file=sys.stderr)
        return 1
    print(f'PASS: {len(AGENTS)} agents, {len(SKILLS)} skills, {len(WORKFLOWS)} workflows, {len(TEMPLATES)} templates; schemas, contracts and local links')
    if args.native:
        print('PASS: native Codex prompt includes root instructions and all skill metadata; no model turn executed')
        print('UNVERIFIED: custom-agent activation is not established by prompt rendering; use the documented manual delegation fallback.')
    print('Manual gates, semantic quality, authorization and agent behavior are not enforced by this check.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
