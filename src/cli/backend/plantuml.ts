import { defaultSpawn, resolveCommand, type SpawnFn } from "./run.js";

/** PlantUML command used when no `--plantuml` override is given. */
export const DEFAULT_PLANTUML_COMMAND = "plantuml";

/**
 * Run the PlantUML backend with `args`. The command is the `--plantuml`
 * override when given, otherwise `plantuml` on `PATH`.
 */
export async function runPlantUml(
  args: string[],
  options: { override?: string } = {},
  spawnFn: SpawnFn = defaultSpawn,
): Promise<{ stdout: string; stderr: string }> {
  const command = resolveCommand(options.override, DEFAULT_PLANTUML_COMMAND);
  return spawnFn(command, args);
}
