import { useCallback, useEffect, useRef, useState } from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import ListHeader, { type PageOption } from "./ListHeader";
import ListToolbar from "./ListToolbar";
import TitleBar from "./TitleBar";

/** 列表区最小宽度 */
const MIN_LIST_WIDTH = 200;
/** 播放器区最小宽度 */
const MIN_PLAYER_WIDTH = 240;
/** 列表区默认宽度 */
const DEFAULT_LIST_WIDTH = 290;

/** 占位歌曲数量 */
const SONG_COUNT = 12;

/** 菜单可切换的页面 */
const PAGES: PageOption[] = [
  { id: "songs", label: "歌曲" },
  { id: "albums", label: "专辑" },
  { id: "artists", label: "歌手" },
  { id: "playlists", label: "歌单" },
];

/**
 * MainLayout - 音乐播放器主布局
 *
 * 响应式策略（使用 Tailwind orientation 变体）：
 * - 横屏 (landscape)：双分栏布局 —— 左侧音乐列表 + 可拖动分隔条 + 右侧播放器。
 *   标题栏参与分栏：logo 在左列顶部，窗口控制按钮在右列顶部，分隔条贯穿整列高度。
 * - 竖屏 (portrait)：层叠布局 —— 顶部完整标题栏 + 上方音乐列表 + 底部播放器（不启用拖动）。
 *
 * 当前仅为占位 UI，用简单文字代表各区域，暂不实现具体功能。
 */
function MainLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [listWidth, setListWidth] = useState(DEFAULT_LIST_WIDTH);
  const [isLandscape, setIsLandscape] = useState(false);
  const draggingRef = useRef(false);
  const [activePageId, setActivePageId] = useState(PAGES[0].id);
  const [searchOpen, setSearchOpen] = useState(false);

  const activePageLabel =
    PAGES.find((p) => p.id === activePageId)?.label ?? "歌曲";

  // 监听横屏状态：只有横屏才启用可拖动分栏与分栏标题栏
  useEffect(() => {
    const mql = window.matchMedia("(orientation: landscape)");
    const update = () => setIsLandscape(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // 将列表宽度限制在 [MIN_LIST_WIDTH, 容器宽 - MIN_PLAYER_WIDTH] 之间
  const clampWidth = useCallback((width: number) => {
    const container = containerRef.current;
    if (!container) return width;
    const total = container.clientWidth;
    const max = Math.max(MIN_LIST_WIDTH, total - MIN_PLAYER_WIDTH);
    return Math.min(Math.max(width, MIN_LIST_WIDTH), max);
  }, []);

  // 拖动开始
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // 某些环境不支持 pointer capture，忽略
    }
  }, []);

  // 拖动过程与结束（在 window 上监听，避免指针移出分隔条丢失事件）
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setListWidth(clampWidth(e.clientX - rect.left));
    };
    const onPointerUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [clampWidth]);

  // 窗口尺寸变化时重新约束列表宽度
  useEffect(() => {
    const onResize = () => setListWidth((w) => clampWidth(w));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampWidth]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-900 text-neutral-100">
      {/* 竖屏：顶部完整标题栏（logo 左 + 窗口按钮右） */}
      {!isLandscape && <TitleBar part="full" />}

      {/* 内容区域：横屏双分栏 / 竖屏层叠 */}
      {/* 安全区域内边距：Android 状态栏(顶部)、导航栏(底部)、横屏刘海(左右)自动避让；桌面端 env() 为 0，无影响 */}
      <div
        ref={containerRef}
        className="relative flex min-h-0 flex-1 flex-col pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)] landscape:pb-[env(safe-area-inset-bottom)] landscape:flex-row"
      >
        {/* ===== 左侧：音乐列表分栏 ===== */}
        <section
          className="group flex flex-1 flex-col overflow-hidden border-neutral-800 portrait:border-b landscape:flex-none"
          style={isLandscape ? { width: listWidth } : undefined}
        >

          {/* 列表内容：使用 SimpleBar 自绘滚动条；头部作为 sticky 玻璃层叠在内容之上 */}
          <SimpleBar className="relative min-h-0 flex-1">
            {/* 玻璃头部：sticky 固定在列表顶部，下方内容滚动时从玻璃下方穿过。
                isolate 让内部 z-0/z-10/z-20 的层级只在头部内部比较，不会盖住页面其他浮层。 */}
            <div className="sticky top-0 z-20 isolate">
              {/* 玻璃背景层：纯 CSS 玻璃拟态，绝对定位铺满整个头部，只作装饰、不参与交互。
                  底色保持到接近底部，只用垂直 mask 在最后一小段淡出，
                  让渐变恰好收束在头部底边。 */}
              <div
                className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/10 to-white/5 backdrop-blur-xl backdrop-saturate-150"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 85%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 85%, transparent 100%)",
                }}
              />

              {/* 头部内容层：正常文档流，撑开父容器高度 */}
              <div className="relative z-10 ">
                {/* 横屏：logo 位于本列顶部，参与分栏 */}
                {isLandscape && <TitleBar part="logo" />}

                {/* 列表标题栏（菜单切换页面 + 搜索，搜索框从右向左扩张） */}
                <ListHeader
                  title={activePageLabel}
                  pages={PAGES}
                  activePageId={activePageId}
                  onSelectPage={(id) => {
                    setActivePageId(id);
                    setSearchOpen(false);
                  }}
                  onSearchClick={() => setSearchOpen((v) => !v)}
                  searchOpen={searchOpen}
                />

                {/* 工具栏：仅歌曲页显示，位于列表标题栏下方 */}
                {activePageId === "songs" && <ListToolbar count={SONG_COUNT} />}
              </div>
            </div>

            <ul className="space-y-1 p-2 portrait:pb-[calc(env(safe-area-inset-bottom)+3.5rem)]">
              {Array.from({ length: SONG_COUNT }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-neutral-800"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-700 text-xs text-neutral-400">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      {activePageLabel} {i + 1}
                    </p>
                    <p className="truncate text-xs text-neutral-500">歌手名</p>
                  </div>
                </li>
              ))}
            </ul>
          </SimpleBar>
        </section>

        {/* ===== 可拖动分隔条（仅横屏，贯穿整列高度含标题栏） ===== */}
        {isLandscape && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="拖动调整分栏宽度"
            onPointerDown={handlePointerDown}
            className="group/split flex w-1.5 shrink-0 cursor-col-resize touch-none select-none items-center justify-center bg-neutral-800 transition-colors hover:bg-neutral-700 active:bg-neutral-600"
          >
            <div className="h-8 w-0.5 rounded-full bg-neutral-600 transition-colors group-hover/split:bg-neutral-400" />
          </div>
        )}

        {/* ===== 右侧：播放器分栏 ===== */}
        {/* 液态玻璃背景：半透明白 + 背景模糊与饱和增强，与列表头部玻璃效果保持一致。
            竖屏时通过绝对定位悬浮在列表底部之上，让列表滚动条与内容从玻璃下方穿过、透出玻璃。 */}
        <aside className={`flex h-14 shrink-0 flex-col border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150 portrait:absolute portrait:inset-x-0 portrait:bottom-0 portrait:z-30 portrait:border-t portrait:pb-[env(safe-area-inset-bottom)] landscape:h-auto landscape:flex-1 ${!isLandscape && "rounded-t-md"} `}>
          {/* 横屏：窗口控制按钮位于本列顶部，参与分栏 */}
          {isLandscape && <TitleBar part="controls" />}

          {/* 播放器内容占位 */}
          <div className="flex flex-1 flex-col items-center justify-center gap-1">
            <p className="text-sm font-medium">播放器区域</p>
            <p className="text-xs text-neutral-500">
              竖屏：底部播放器 / 横屏：右侧播放器
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MainLayout;