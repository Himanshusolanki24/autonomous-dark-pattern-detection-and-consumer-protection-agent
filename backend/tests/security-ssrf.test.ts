import { describe, it, expect } from "vitest";
import { validateTargetUrl, validateTargetUrlSync, isPrivateAddress } from "@/lib/security/ssrf";

describe("isPrivateAddress", () => {
  it.each(["10.0.0.1", "127.0.0.1", "192.168.1.1", "172.16.5.5", "169.254.1.1", "0.0.0.0", "::1", "fe80::1", "fc00::1"])(
    "flags %s as private",
    (ip) => expect(isPrivateAddress(ip)).toBe(true)
  );

  it.each(["8.8.8.8", "1.1.1.1", "2606:4700::1111"])("accepts %s as public", (ip) =>
    expect(isPrivateAddress(ip)).toBe(false)
  );
});

describe("validateTargetUrlSync", () => {
  it("accepts https", () => {
    expect(validateTargetUrlSync("https://example.com/x").hostname).toBe("example.com");
  });

  it("rejects non-http protocols", () => {
    expect(() => validateTargetUrlSync("file:///etc/passwd")).toThrow(/Protocol/);
    expect(() => validateTargetUrlSync("javascript:alert(1)")).toThrow(/Protocol/);
    expect(() => validateTargetUrlSync("ftp://x.com")).toThrow(/Protocol/);
  });

  it("rejects embedded credentials", () => {
    expect(() => validateTargetUrlSync("https://user:pass@x.com")).toThrow(/credentials/);
  });
});

describe("validateTargetUrl", () => {
  it("rejects loopback hostnames", async () => {
    await expect(validateTargetUrl("http://localhost:3001/x")).rejects.toThrow(/Loopback/);
    await expect(validateTargetUrl("http://127.0.0.1:3000/x")).rejects.toThrow(/not allowed/);
  });

  it("rejects obviously private literals", async () => {
    await expect(validateTargetUrl("http://192.168.0.1/x")).rejects.toThrow(/Private IP/);
    await expect(validateTargetUrl("http://10.0.0.5/x")).rejects.toThrow(/Private IP/);
  });

  it("rejects malformed URLs", async () => {
    await expect(validateTargetUrl("not a url")).rejects.toThrow();
  });
});