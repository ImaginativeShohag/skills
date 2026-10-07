import {
  Clipboard,
  getSelectedText,
  LocalStorage,
  showToast,
  Toast,
} from "@raycast/api";
import { correctWithCodex, formatFailure } from "./codex-runner";

export default async function command() {
  let toast: Awaited<ReturnType<typeof showToast>> | undefined;

  try {
    const selectedText = await getSelectedText();
    toast = await showToast({
      style: Toast.Style.Animated,
      title: "Checking…",
    });
    const correction = await correctWithCodex(selectedText, LocalStorage);
    await Clipboard.paste(correction);
    await toast.hide();
    await showToast({
      style: Toast.Style.Success,
      title: "Corrected selected text",
    });
  } catch (error) {
    if (toast) {
      toast.style = Toast.Style.Failure;
      toast.title = "Could not correct selected text";
      toast.message = formatFailure(error);
    } else {
      await showToast({
        style: Toast.Style.Failure,
        title: "Could not correct selected text",
        message: formatFailure(error),
      });
    }
  }
}
