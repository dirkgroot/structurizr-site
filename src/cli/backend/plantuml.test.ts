import { describe, expect, it, vi } from "vitest";
import { runPlantUml } from "./plantuml";

describe("runPlantUml", () => {
  it("runs plantuml on PATH by default", async () => {
    const spawn = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });

    await runPlantUml(["-tsvg", "diagram.puml"], {}, spawn);

    expect(spawn).toHaveBeenCalledWith("plantuml", ["-tsvg", "diagram.puml"]);
  });

  it("honours the override", async () => {
    const spawn = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });

    await runPlantUml(["-tsvg", "diagram.puml"], { override: "java -jar plantuml.jar" }, spawn);

    expect(spawn).toHaveBeenCalledWith("java -jar plantuml.jar", ["-tsvg", "diagram.puml"]);
  });
});
