import { beforeEach, describe, expect, it, vi } from "vitest";

const toast = {
  style: undefined as unknown,
  title: "",
  message: undefined as string | undefined,
  hide: vi.fn(),
};
const getSelectedText = vi.fn();
const paste = vi.fn();
const showToast = vi.fn();
const correctWithCodex = vi.fn();
const localStorage = {};

vi.mock("@raycast/api", () => ({
  Clipboard: { paste },
  LocalStorage: localStorage,
  Toast: {
    Style: {
      Animated: "animated",
      Failure: "failure",
      Success: "success",
    },
  },
  getSelectedText,
  showToast,
}));

vi.mock("./codex-runner", () => ({
  correctWithCodex,
  formatFailure: (error: unknown) =>
    error instanceof Error
      ? error.message
      : "Codex could not correct the selected text",
}));

describe("fixSpellingAndGrammar", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    toast.style = undefined;
    toast.title = "";
    toast.message = undefined;
    toast.hide.mockResolvedValue(undefined);
    showToast.mockResolvedValue(toast);
    getSelectedText.mockResolvedValue("i has recieve your email yesterday");
    correctWithCodex.mockResolvedValue("I received your email yesterday.");
  });

  it("replaces Checking with an explicitly titled success toast", async () => {
    const { default: command } = await import("./fix-spelling-and-grammar");

    await command();

    expect(showToast).toHaveBeenCalledWith({
      style: "animated",
      title: "Checking…",
    });
    expect(correctWithCodex).toHaveBeenCalledWith(
      "i has recieve your email yesterday",
      localStorage,
    );
    expect(paste).toHaveBeenCalledWith("I received your email yesterday.");
    expect(toast.hide).toHaveBeenCalledOnce();
    expect(showToast).toHaveBeenNthCalledWith(2, {
      style: "success",
      title: "Corrected selected text",
    });
  });
});
