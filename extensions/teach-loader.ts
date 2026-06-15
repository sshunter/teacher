/**
 * Teach Skill Loader Extension
 *
 * Force-injects the full teach SKILL.md content into the system prompt on the
 * first turn of each session. This solves the reliability problem where agents
 * fail to load the skill on their own (due to disable-model-invocation and
 * progressive disclosure).
 *
 * The skill is discovered by name ("teach") via the systemPromptOptions API,
 * so no filesystem path is hardcoded. The live file is read each session,
 * automatically picking up updates to the externally-maintained skill.
 */

import * as fs from "node:fs";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  let injected = false;

  pi.on("session_start", async () => {
    // Reset on new session or reload so the skill is re-injected.
    injected = false;
  });

  pi.on("before_agent_start", async (event) => {
    if (injected) return;

    const skills = event.systemPromptOptions.skills ?? [];
    const teach = skills.find((s: any) => s.name === "teach");

    if (!teach) {
      console.log("teach-loader: teach skill not found in discovered skills");
      return;
    }

    const skillPath = teach.sourceInfo?.path;
    if (!skillPath) {
      console.log("teach-loader: teach skill has no sourceInfo.path");
      return;
    }

    let skillContent: string;
    try {
      skillContent = fs.readFileSync(skillPath, "utf8");
    } catch (err) {
      console.log(`teach-loader: failed to read ${skillPath}: ${err}`);
      return;
    }

    injected = true;

    return {
      systemPrompt: event.systemPrompt + "\n\n" + skillContent,
    };
  });
}
