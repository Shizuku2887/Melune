import { getCurrentWindow } from "@tauri-apps/api/window";
import { isWindows } from "../lib/platform";

/**
 * 标题栏的渲染部分：
 * - "full"：整条标题栏（logo 在左、窗口按钮在右），用于竖屏单行布局
 * - "logo"：仅左侧 logo，用于横屏时放在列表分栏顶部
 * - "controls"：仅右侧窗口按钮，用于横屏时放在播放器分栏顶部
 */
export type TitleBarPart = "full" | "logo" | "controls";

interface TitleBarProps {
  part?: TitleBarPart;
  /** 紧凑模式：仅显示 logo 图标、隐藏文字（菜单栏收起时使用） */
  compact?: boolean;
}

/**
 * TitleBar - 沉浸式标题栏（仅在 Windows 下显示）
 *
 * 配合 tauri.windows.conf.json 中 `decorations: false` 使用：
 * 隐藏系统原生标题栏，由本组件取代，实现沉浸式外观。
 * 提供拖动窗口、最小化、最大化/还原、关闭等基础操作。
 *
 * 支持拆分为 logo / controls 两部分，以便标题栏参与左右分栏布局。
 */
function TitleBar({ part = "full", compact = false }: TitleBarProps) {
  // 非 Windows 环境不渲染（其他平台保留系统原生标题栏）
  if (!isWindows()) return null;

  const appWindow = getCurrentWindow();

  const logo = (
    <div data-tauri-drag-region className="brand flex items-center gap-2">
      {/* 品牌图标：月牙（Lune）+ 星光，单色跟随主题 */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          {/* 用遮罩从圆上挖出偏移圆，得到边缘平滑的月牙 */}
          <mask id="melune-moon-mask">
            <rect width="20" height="20" fill="white" />
            <circle cx="11.1" cy="9.1" r="6" fill="black" />
          </mask>
        </defs>
        {/* 月牙：开口朝右上 */}
        <circle
          cx="8.6"
          cy="10.8"
          r="6.2"
          fill="currentColor"
          mask="url(#melune-moon-mask)"
        />
        {/* 星光：落在月牙开口处 */}
        <path
          d="M15.8 2.4c.2 1.3 1.1 2.2 2.4 2.4-1.3.2-2.2 1.1-2.4 2.4-.2-1.3-1.1-2.2-2.4-2.4 1.3-.2 2.2-1.1 2.4-2.4Z"
          fill="currentColor"
        />
      </svg>
      {/* 文字随收起折叠，logo 图标位置保持不变 */}
      <span
        className={
          "brand-name overflow-hidden whitespace-nowrap transition-all duration-200 " +
          (compact ? "max-w-0 opacity-0" : "max-w-24 opacity-100")
        }
      >
        Melune
      </span>
    </div>
  );

  const controls = (
    <div className="flex items-center">
      <button
        type="button"
        aria-label="最小化"
        onClick={() => appWindow.minimize()}
        className="flex h-7 w-10 items-center justify-center rounded text-neutral-400"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5h6" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>

      <button
        type="button"
        aria-label="最大化"
        onClick={() => appWindow.toggleMaximize()}
        className="flex h-7 w-10 items-center justify-center rounded text-neutral-400"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect
            x="2"
            y="2"
            width="6"
            height="6"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      </button>

      <button
        type="button"
        aria-label="关闭"
        onClick={() => appWindow.close()}
        className="flex h-7 w-10 items-center justify-center rounded text-neutral-400"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 2l6 6M8 2l-6 6"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      </button>
    </div>
  );

  // 仅左侧 logo：左内边距与菜单图标对齐，展开 / 收起时位置不变
  if (part === "logo") {
    return (
      <header
        data-tauri-drag-region
        className="flex h-9 shrink-0 select-none items-center pl-[14px]"
      >
        {logo}
      </header>
    );
  }

  // 仅右侧窗口按钮：背景透明，右对齐
  if (part === "controls") {
    return (
      <header
        data-tauri-drag-region
        className="flex h-9 shrink-0 select-none items-center justify-end px-1 text-neutral-300"
      >
        {controls}
      </header>
    );
  }

  // 完整标题栏（竖屏单行）
  return (
    <header
      data-tauri-drag-region
      className="flex h-9 shrink-0 select-none items-center justify-between px-3 text-neutral-300"
    >
      {logo}
      {controls}
    </header>
  );
}

export default TitleBar;