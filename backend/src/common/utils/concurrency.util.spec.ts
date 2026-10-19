import { runWithConcurrency } from "./concurrency.util";

describe("runWithConcurrency", () => {
  it("keeps results in original order", async () => {
    const items = [1, 2, 3];
    const result = await runWithConcurrency(items, 2, async (item) => {
      if (item === 1) await new Promise((resolve) => setTimeout(resolve, 15));
      return item * 10;
    });

    expect(result).toEqual([
      { status: "fulfilled", value: 10 },
      { status: "fulfilled", value: 20 },
      { status: "fulfilled", value: 30 },
    ]);
  });

  it("captures errors without interrupting other workers", async () => {
    const result = await runWithConcurrency([1, 2, 3], 3, async (item) => {
      if (item === 2) throw new Error("boom");
      return item;
    });

    expect(result[0]).toEqual({ status: "fulfilled", value: 1 });
    expect(result[1].status).toBe("rejected");
    expect((result[1] as PromiseRejectedResult).reason).toEqual(expect.any(Error));
    expect(result[2]).toEqual({ status: "fulfilled", value: 3 });
  });

  it("respects the concurrency limit", async () => {
    let active = 0;
    let maxActive = 0;

    await runWithConcurrency([1, 2, 3, 4, 5], 2, async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active -= 1;
      return true;
    });

    expect(maxActive).toBeLessThanOrEqual(2);
  });
});
