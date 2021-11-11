const crypto = require("crypto");
for (let i = 0; i < 100; i++) {
  test("all generated iv is 32th hex letter", () => {
    let iv = crypto.randomBytes(16).toString("hex");
    expect(iv.length).toBe(32);
  });
}
