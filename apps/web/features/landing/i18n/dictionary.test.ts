// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createLandingDict } from "./dictionary";
import { locales, toLandingDictionaryLocale } from "./types";

describe("createLandingDict", () => {
  it("offers Traditional Chinese in the public language menu", () => {
    expect(locales).toContain("zh-Hant");
    expect(toLandingDictionaryLocale("zh-Hant")).toBe("zh-Hant");
  });

  it.each([
    ["en", "/docs"],
    ["zh-Hans", "/docs/zh"],
    // Traditional Chinese public copy is available; documentation still falls
    // back to English until a Traditional Chinese docs tree exists.
    ["zh-Hant", "/docs"],
    ["ko", "/docs/ko"],
    ["ja", "/docs/ja"],
    // French has no landing copy and reuses English, but its docs exist.
    ["fr", "/docs/fr"],
  ] as const)("links the %s footer to %s", (locale, docsHref) => {
    const links = createLandingDict(locale, true).footer.groups.resources.links;
    expect(links[0]?.href).toBe(docsHref);
  });

  it("serves Traditional Chinese copy instead of the English fallback", () => {
    const dict = createLandingDict("zh-Hant", true);
    expect(dict.header.cta).toBe("開始使用");
    expect(dict.hero.downloadDesktop).toBe("下載桌面應用程式");
    expect(dict.howItWorks.steps[0]?.title).toContain("註冊");
    expect(dict.privacy.title).toBe("隱私政策");
  });

  it("keeps all Traditional Chinese public sections and release entries", () => {
    const traditional = createLandingDict("zh-Hant", true);
    const simplified = createLandingDict("zh-Hans", true);

    expect(traditional.features.teammates.cards).toHaveLength(
      simplified.features.teammates.cards.length,
    );
    expect(traditional.licensing.sections).toHaveLength(
      simplified.licensing.sections.length,
    );
    expect(traditional.privacy.sections).toHaveLength(
      simplified.privacy.sections.length,
    );
    expect(traditional.changelog.entries.map((entry) => entry.version)).toEqual(
      simplified.changelog.entries.map((entry) => entry.version),
    );
    expect(traditional.contactSales.countries).toHaveLength(
      simplified.contactSales.countries.length,
    );
  });
});
