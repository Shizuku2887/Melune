/**
 * 平台检测工具
 *
 * 用于判断当前运行环境是否为 Windows。
 * 在 Tauri 的 WebView 中，可通过 navigator.userAgent 判断宿主系统。
 */
export const isWindows = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /Windows/i.test(navigator.userAgent);
};