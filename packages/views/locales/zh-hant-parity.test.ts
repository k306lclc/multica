// @vitest-environment node
import { describe, expect, it } from "vitest";
import { RESOURCES } from "./index";

function leaves(value: Record<string, unknown>, prefix = ""): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string") {
      result.set(path, child);
    } else if (child && typeof child === "object" && !Array.isArray(child)) {
      for (const [nestedPath, text] of leaves(child as Record<string, unknown>, path)) {
        result.set(nestedPath, text);
      }
    } else {
      throw new Error(`${path} must be a string or a nested namespace`);
    }
  }
  return result;
}

function placeholders(text: string): string[] {
  return [...new Set([...text.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)].map((match) => match[1]!.trim()))]
    .toSorted();
}

describe("Traditional Chinese locale parity", () => {
  const english = RESOURCES.en as Record<string, Record<string, unknown>>;
  const traditional = RESOURCES["zh-Hant"] as Record<string, Record<string, unknown>>;

  it("registers exactly the same namespaces as English", () => {
    expect(Object.keys(traditional).toSorted()).toEqual(Object.keys(english).toSorted());
  });

  for (const [namespace, englishTree] of Object.entries(english)) {
    it(`${namespace} has every current key and the same interpolation variables`, () => {
      const englishKeys = leaves(englishTree);
      const traditionalKeys = leaves(traditional[namespace]!);
      const applicableEnglishKeys = [...englishKeys.keys()]
        .filter((key) => !key.endsWith("_one"))
        .toSorted();
      expect([...traditionalKeys.keys()].toSorted()).toEqual(applicableEnglishKeys);

      for (const [key, englishText] of englishKeys) {
        if (key.endsWith("_one")) continue;
        const translated = traditionalKeys.get(key);
        if (englishText.trim()) {
          expect(translated?.trim().length, `${namespace}.${key} is blank`).toBeGreaterThan(0);
        }
        expect(placeholders(translated!), `${namespace}.${key} changed interpolation variables`)
          .toEqual(placeholders(englishText));
      }
    });
  }
});
