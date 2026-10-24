import { test, expect } from "@/fixtures";
import { acme } from "@/workspaces";

test("the home page introduces the workspace", async ({ site, page }) => {
  await site.serve(acme);

  await page.goto(site.url("/"));

  const breadcrumb = page.getByRole("navigation");
  await expect(breadcrumb.getByText("ACME Corporation")).toBeVisible();
  await expect(page.getByRole("main").getByText("The software architecture of ACME Corporation.")).toBeVisible();
});
