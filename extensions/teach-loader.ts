/**
 * Teach Skill Loader Extension
 *
 * Force-injects the full teach SKILL.md content into the system prompt on
 * every turn. This solves the reliability problem where agents fail to load
 * the skill on their own (due to disable-model-invocation and progressive
 * disclosure). The runner resets the system prompt to the base on each turn,
 * so we must re-inject every time — not just once per session.
 *
 * The skill is discovered by name ("teach") via the systemPromptOptions API,
 * so no filesystem path is hardcoded. The live file is read each session,
 * automatically picking up updates to the externally-maintained skill.
 *
 * In addition to the skill content, we inject its on-disk <location> — the
 * SKILL.md path, derived from the same sourceInfo lookup as the content
 * (nothing hardcoded). The teach SKILL.md references sibling format files by
 * relative path (./MISSION-FORMAT.md, ./RESOURCES-FORMAT.md,
 * ./LEARNING-RECORD-FORMAT.md, ./GLOSSARY-FORMAT.md). Without the location the
 * agent has no way to resolve those ./ references; with it, the agent resolves
 * them against the skill directory (dirname of the path), exactly as it does
 * for every skill in <available_skills>, which each carry their own
 * <location>.
 *
 * IMPORTANT: we do not own or edit the skill content. The SKILL.md body is
 * injected VERBATIM. The <location> is carried in a separate, extension-owned
 * annotation prepended ahead of the skill content — never woven into the
 * skill's text or front matter.
 */

import * as fs from "node:fs";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  // NOTE: We inject on EVERY before_agent_start, not just the first turn.
  // The runner resets the system prompt to the base prompt on each turn
  // when no extension returns a systemPrompt. So a once-per-session flag
  // would cause the teach content to vanish after turn 1.
  pi.on("before_agent_start", async (event) => {
    const skills = event.systemPromptOptions?.skills ?? [];
    const teach = skills.find((s: any) => s.name === "teach");

    if (!teach) return;

    const skillPath = teach.sourceInfo?.path;
    if (!skillPath) return;

    let skillContent: string;
    try {
      skillContent = fs.readFileSync(skillPath, "utf8");
    } catch {
      return;
    }

    // Extension-owned annotation, kept separate from the (verbatim) skill
    // content. Carries the on-disk path so the agent can resolve the skill's
    // relative ./ references against the skill directory (dirname of the path).
    const locationNote =
      `The teach skill content below is injected verbatim by the teach-loader extension from <location>${skillPath}</location>. ` +
      `Resolve its relative path references (./MISSION-FORMAT.md, ./RESOURCES-FORMAT.md, ./LEARNING-RECORD-FORMAT.md, ./GLOSSARY-FORMAT.md) against the skill directory, i.e. dirname of the <location> path.`;

    return {
      systemPrompt:
        event.systemPrompt + "\n\n" + locationNote + "\n\n" + skillContent + "\n",
    };
  });
}