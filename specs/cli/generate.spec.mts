import { test, expect } from "@/fixtures";
import { acme } from "@/workspaces";

test("generate produces a self-contained site", async ({ cli }) => {
  const result = await cli.run("generate", "--workspace", acme);

  expect(result).toSucceed();
  expect(result.file("build/index.html")).toContain("./assets/");
  expect(result.exists("build/assets")).toBe(true);
  const { model } = result.json<{
    model: { softwareSystems: Array<{ name: string }> };
  }>("build/workspace.json");
  expect(model.softwareSystems.map((system) => system.name)).toEqual(["ACME Core", "ACME Billing"]);
});
