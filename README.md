# teacher

This is just a little system prompt and extension I've created to help get
better results with [Matt Pocock's teach
skill](https://github.com/mattpocock/skills/tree/main/skills/productivity/teach)
when restarting sessions with less capable models.

Copy the following into your project's `.pi` directory:

- `SYSTEM.md`
- `APPEND_SYSTEM_template.md`, renaming it to `APPEND_SYSTEM.md`
- `extensions/teach-loader.ts` (see below)

## `APPEND_SYSTEM.md`

pi appends your global `~/.pi/agent/APPEND_SYSTEM.md` to the system prompt even
when a project `SYSTEM.md` is active, so those global rules leak into teaching
sessions. Your global `APPEND_SYSTEM.md` may contain rules that suit coding work
but fight teaching, such as a blanket ban on suggesting next steps or an
ASCII-only output rule that conflicts with the "beautiful" HTML lessons the
teach skill produces.

`APPEND_SYSTEM_template.md` drops those teaching-hostile rules and keeps the
rest. It is a starting point, not a universal default. Tune it for your personal
needs. The guardrails reflect my setup and may reference tools you do not have
(for example, `memctx_save`).

This is EXPERIMENTAL. It's an attempt to get better results without having
to fork and modify the upstream skill.

