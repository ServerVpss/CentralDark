import { describe, expect, it } from "vitest";
import { redact } from "./redaction";

describe("redação de segredos", () => {
  it("remove segredos por chave e formato", () => {
    expect(redact({ apiKey: "abc", note: "Bearer abcdefghijklmnop" })).toEqual({
      apiKey: "[REDACTED]",
      note: "[REDACTED]",
    });
  });
});
