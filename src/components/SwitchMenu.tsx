import type { ReactNode } from "react";

/** 可切换页面的选项 */
export interface PageOption {
  id: string;
  label: string;
}

interface SwitchMenuProps {
  /** 可切换的页面列表 */
  pages: PageOption[];
  /** 当前激活的页面 id */
  activePageId: string;
  /** 选择某个页面时回调 */
  onSelectPage: (id: string) => void;
  /** vertical：横屏左侧竖向菜单；horizontal：横向菜单；bottom：竖屏底部导航 */
  orientation?: "vertical" | "horizontal" | "bottom";
  /** 是否展开显示完整名称（收起时只显示当前页面图标） */
  expanded: boolean;
  /** 点击三条横线按钮时切换展开 / 收起 */
  onToggle: () => void;
  /** bottom 模式下是否显示页面名称（默认显示） */
  showLabels?: boolean;
}

/** 页面图标（线性图标，与项目其他图标风格一致） */
const PAGE_ICONS: Record<string, ReactNode> = {
  songs: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M6.5 11.5V4l5.5-1v7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="4.8" cy="11.7" r="1.7" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10.3" cy="10.7" r="1.7" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  albums: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  artists: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="6"
        y="2.5"
        width="4"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M4 7.5a4 4 0 0 0 8 0M8 11.5V14M6 14h4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  ),
  playlists: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2.5 4h11M2.5 8h7M2.5 12h7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M11.5 9l3 1.75-3 1.75V9z" fill="currentColor" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="-1 -1 26 26" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

/** 未知页面 id 的兜底图标 */
const FALLBACK_ICON: ReactNode = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

/**
 * SwitchMenu - 页面切换菜单
 *
 * 横屏时作为独立的左侧菜单栏（logo 下方竖向排列），
 * 竖屏时作为底部导航栏嵌在播放器区域内（无展开按钮，始终显示名称）。
 * 三条横线按钮固定在菜单最左侧，不随列表滚动；
 * 默认收起，所有页面图标竖向排列、不显示名称；点击三条横线后显示全部名称。
 */
function SwitchMenu({
  pages,
  activePageId,
  onSelectPage,
  orientation = "vertical",
  expanded,
  onToggle,
  showLabels = true,
}: SwitchMenuProps) {
  const vertical = orientation === "vertical";
  const bottom = orientation === "bottom";

  /** 竖向菜单中设置固定在最底部，其余页面按顺序排列 */
  const settingsPage = pages.find((page) => page.id === "settings");
  const mainPages = vertical
    ? pages.filter((page) => page.id !== "settings")
    : pages;

  const renderItem = (page: PageOption) => {
    const active = page.id === activePageId;
    return (
      <button
        key={page.id}
        type="button"
        aria-current={active ? "page" : undefined}
        onClick={() => onSelectPage(page.id)}
        onPointerMove={(e) => {
          // 记录光标在选项内的位置，驱动液态玻璃上的跟随高光
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
        }}
        className={
          "flex cursor-pointer items-center " +
          (vertical
            ? "menu-glass group/item rounded-md transition-colors " +
              (expanded ? "h-8 w-full gap-2 pr-2" : "h-8 w-8")
            : bottom
              ? "h-11 flex-1 flex-col justify-center gap-0.5 rounded-lg transition-colors " +
                (active
                  ? "text-emerald-400"
                  : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100")
              : "menu-glass group/item h-8 shrink-0 gap-1.5 rounded-md pr-2 transition-colors ") +
          (!bottom && active ? "bg-white/10" : "")
        }
      >
        {bottom ? (
          <>
            <span className="flex h-4 w-4 items-center justify-center">
              {PAGE_ICONS[page.id] ?? FALLBACK_ICON}
            </span>
            {showLabels && (
              <span className="text-[10px] leading-none">{page.label}</span>
            )}
          </>
        ) : (
          <>
            {/* 图标与名称共用整行的 hover 背景 */}
            <span
              className={
                "flex h-8 w-8 shrink-0 items-center justify-center transition-colors " +
                (active
                  ? "text-emerald-400"
                  : "text-neutral-400 group-hover/item:text-neutral-100")
              }
            >
              {PAGE_ICONS[page.id] ?? FALLBACK_ICON}
            </span>
            {/* 名称折叠时不改变图标位置 */}
            <span
              className={
                "overflow-hidden whitespace-nowrap text-[11px] leading-none text-neutral-400 transition-all duration-200 group-hover/item:text-neutral-100 " +
                (expanded ? "max-w-16 opacity-100" : "max-w-0 opacity-0")
              }
            >
              {page.label}
            </span>
          </>
        )}
      </button>
    );
  };

  return (
    <nav
      aria-label="页面切换"
      className={
        vertical
          ? "flex min-h-0 flex-1 flex-col px-2 py-2"
          : bottom
            ? "flex w-full shrink-0 items-stretch gap-1 px-2 py-1"
            : "flex shrink-0 items-center px-2 py-2"
      }
    >
      {/* 三条横线：固定在菜单最左侧，展开 / 收起菜单；底部导航模式不显示 */}
      {!bottom && (
        <button
          type="button"
          aria-label={expanded ? "收起菜单" : "展开菜单"}
          aria-expanded={expanded}
          onClick={onToggle}
          onPointerMove={(e) => {
            // 记录光标在按钮内的位置，驱动液态玻璃上的跟随高光
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
          }}
          className={
            "menu-glass group/menu flex shrink-0 cursor-pointer items-center rounded-md transition-colors " +
            (vertical
              ? "mb-1 " + (expanded ? "h-8 w-full gap-2 pr-2" : "h-8 w-8")
              : "h-8 gap-1.5 pr-2")
          }
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-400 transition-colors group-hover/menu:text-neutral-100">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4h12M2 8h12M2 12h12"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          {/* 文字随展开/收起淡入淡出并折叠宽度，图标位置保持不变 */}
          <span
            className={
              "overflow-hidden whitespace-nowrap text-[11px] leading-none text-neutral-400 transition-all duration-200 group-hover/menu:text-neutral-100 " +
              (expanded ? "max-w-16 opacity-100" : "max-w-0 opacity-0")
            }
          >
            菜单
          </span>
        </button>
      )}

      {/* 页面图标：收起时全部图标竖向排列（仅隐藏名称） */}
      <div
        className={
          vertical
            ? "flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden"
            : bottom
              ? "flex min-w-0 flex-1 items-stretch gap-1"
              : "flex min-w-0 items-center gap-1 overflow-x-auto"
        }
      >
        {mainPages.map((page) => renderItem(page))}
      </div>

      {/* 竖向菜单：设置固定在最底部 */}
      {vertical && settingsPage && (
        <div className="shrink-0 pt-1">{renderItem(settingsPage)}</div>
      )}
    </nav>
  );
}

export default SwitchMenu;
