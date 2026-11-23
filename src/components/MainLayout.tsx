import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import ListHeader from "./ListHeader";
import ListToolbar from "./ListToolbar";
import Player from "./Player";
import SettingsPage, {
  PageSettingsPanel,
  type GlowStyle,
} from "./SettingsPage";
import SwitchMenu, { type PageOption } from "./SwitchMenu";
import TitleBar from "./TitleBar";

/** 列表区最小宽度 */
const MIN_LIST_WIDTH = 200;
/** 播放器区最小宽度 */
const MIN_PLAYER_WIDTH = 240;
/** 列表区默认宽度 */
const DEFAULT_LIST_WIDTH = 290;
/** 横屏左侧菜单栏收起时的宽度 */
const NAV_WIDTH_COLLAPSED = 48;
/** 横屏左侧菜单栏展开时的宽度 */
const NAV_WIDTH_EXPANDED = 128;

/** 占位歌曲数量 */
const SONG_COUNT = 12;

/** 萤火虫光点数量 */
const FIREFLY_COUNT = 18;

/** 播放页背景：漂浮的绿色萤火虫光点 */
function Fireflies() {
  return (
    <div className="player-fireflies" aria-hidden="true">
      {Array.from({ length: FIREFLY_COUNT }).map((_, i) => {
        // 用固定公式分布光点，避免每次渲染位置跳动
        const left = 5 + ((i * 37) % 90);
        const top = 18 + ((i * 29) % 77);
        const size = 3 + (i % 4);
        const floatDuration = 10 + (i % 5) * 2.5;
        const glowDuration = 5 + (i % 4) * 1.5;
        const delay = -(i * 1.3);
        const driftX = (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 6);
        const driftY = -(18 + (i % 5) * 10);

        const style = {
          left: `${left}%`,
          top: `${top}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDuration: `${floatDuration}s, ${glowDuration}s`,
          animationDelay: `${delay}s, ${delay * 0.6}s`,
          "--drift-x": `${driftX}px`,
          "--drift-y": `${driftY}px`,
        } as CSSProperties;

        return <span key={i} className="firefly" style={style} />;
      })}
    </div>
  );
}

/** 菜单可切换的页面 */
const PAGES: PageOption[] = [
  { id: "songs", label: "歌曲" },
  { id: "albums", label: "专辑" },
  { id: "artists", label: "歌手" },
  { id: "playlists", label: "歌单" },
  { id: "settings", label: "设置" },
];

/**
 * MainLayout - 音乐播放器主布局
 *
 * 响应式策略（使用 Tailwind orientation 变体）：
 * - 横屏 (landscape)：三分栏布局 —— 左侧独立菜单栏 + 音乐列表 + 可拖动分隔条 + 右侧播放器。
 *   标题栏参与分栏：logo 在菜单栏顶部，窗口控制按钮在播放器列顶部。
 * - 竖屏 (portrait)：层叠布局 —— 顶部完整标题栏 + 音乐列表 + 底部播放器，
 *   页面导航作为底部导航栏嵌在播放器区域内（无展开按钮，不启用拖动）。
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
  const [menuExpanded, setMenuExpanded] = useState(false);
  /** 是否正在查看「页面设置」详情（横屏在右侧分栏打开） */
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);
  /** 竖屏底部导航是否显示页面名称 */
  const [portraitShowLabels, setPortraitShowLabels] = useState(true);
  /** 竖屏：是否展开全屏播放页 */
  const [portraitPlayerOpen, setPortraitPlayerOpen] = useState(false);
  /** 鼠标跟随发光的形状样式 */
  const [glowStyle, setGlowStyle] = useState<GlowStyle>("circle");

  /** 当前菜单栏宽度（收起只显示图标，展开显示名称） */
  const navWidth = menuExpanded ? NAV_WIDTH_EXPANDED : NAV_WIDTH_COLLAPSED;

  const activePageLabel =
    PAGES.find((p) => p.id === activePageId)?.label ?? "歌曲";

  // 切换页面：同时收起搜索框与页面设置详情
  const handleSelectPage = useCallback((id: string) => {
    setActivePageId(id);
    setSearchOpen(false);
    setPageSettingsOpen(false);
  }, []);

  // 监听横屏状态：只有横屏才启用可拖动分栏与分栏标题栏
  useEffect(() => {
    const mql = window.matchMedia("(orientation: landscape)");
    const update = () => setIsLandscape(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // 切换菜单展开状态
  const handleToggleMenu = useCallback(() => {
    setMenuExpanded((v) => !v);
  }, []);

  // 打开 / 关闭页面设置详情
  const handleOpenPageSettings = useCallback(() => {
    setPageSettingsOpen(true);
  }, []);
  const handleClosePageSettings = useCallback(() => {
    setPageSettingsOpen(false);
  }, []);

  // 竖屏：打开 / 收起全屏播放页
  const handleOpenPortraitPlayer = useCallback(() => {
    setPortraitPlayerOpen(true);
  }, []);
  const handleClosePortraitPlayer = useCallback(() => {
    setPortraitPlayerOpen(false);
  }, []);

  // 切换到横屏时关闭全屏播放页，避免遮住分栏布局
  useEffect(() => {
    if (isLandscape) setPortraitPlayerOpen(false);
  }, [isLandscape]);

  // 将列表宽度限制在 [MIN_LIST_WIDTH, 容器宽 - 菜单栏宽 - MIN_PLAYER_WIDTH] 之间
  const clampWidth = useCallback(
    (width: number) => {
      const container = containerRef.current;
      if (!container) return width;
      const total = container.clientWidth;
      const max = Math.max(
        MIN_LIST_WIDTH,
        total - navWidth - MIN_PLAYER_WIDTH,
      );
      return Math.min(Math.max(width, MIN_LIST_WIDTH), max);
    },
    [navWidth],
  );

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
      setListWidth(clampWidth(e.clientX - rect.left - navWidth));
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
  }, [clampWidth, navWidth]);

  // 窗口尺寸变化时重新约束列表宽度
  useEffect(() => {
    const onResize = () => setListWidth((w) => clampWidth(w));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampWidth]);

  return (
    <div
      className={`glow-${glowStyle} flex h-screen w-screen flex-col overflow-hidden bg-neutral-900 text-neutral-100`}
    >
      {/* 竖屏：顶部完整标题栏（logo 左 + 窗口按钮右） */}
      {!isLandscape && <TitleBar part="full" />}

      {/* 内容区域：横屏三分栏 / 竖屏层叠 */}
      {/* 安全区域内边距：Android 状态栏(顶部)、导航栏(底部)、横屏刘海(左右)自动避让；桌面端 env() 为 0，无影响 */}
      <div
        ref={containerRef}
        className="relative flex min-h-0 flex-1 flex-col pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)] landscape:pb-[env(safe-area-inset-bottom)] landscape:flex-row"
      >
        {/* ===== 横屏：左侧独立菜单栏（可收起 / 展开） ===== */}
        {isLandscape && (
          <nav
            aria-label="主菜单"
            className="flex shrink-0 flex-col overflow-hidden border-r border-neutral-800 transition-[width] duration-200 ease-out"
            style={{ width: navWidth }}
          >
            {/* logo 位于菜单栏顶部，参与分栏；收起时只保留图标 */}
            <TitleBar part="logo" compact={!menuExpanded} />
            <SwitchMenu
              pages={PAGES}
              activePageId={activePageId}
              onSelectPage={handleSelectPage}
              expanded={menuExpanded}
              onToggle={handleToggleMenu}
            />
          </nav>
        )}

        {/* ===== 音乐列表分栏 ===== */}
        <section
          className="group flex flex-1 flex-col overflow-hidden border-neutral-800 portrait:border-b landscape:flex-none"
          style={isLandscape ? { width: listWidth } : undefined}
        >

          {activePageId === "settings" ? (
            pageSettingsOpen && !isLandscape ? (
              /* 竖屏：没有右侧分栏，页面设置直接占据列表区域 */
              <PageSettingsPanel
                showPortraitLabels={portraitShowLabels}
                onShowPortraitLabelsChange={setPortraitShowLabels}
                glowStyle={glowStyle}
                onGlowStyleChange={setGlowStyle}
                onBack={handleClosePageSettings}
              />
            ) : (
              <SettingsPage onOpenPageSettings={handleOpenPageSettings} />
            )
          ) : (
          /* 列表内容：使用 SimpleBar 自绘滚动条；头部固定在内容之上 */
          <SimpleBar className="relative min-h-0 flex-1">
            {/* 吸顶头部：不使用玻璃效果，改用与页面一致的纯色底色，
                列表滚动到下方时被完全遮挡，保证标题与工具栏清晰可读。 */}
            <div className="sticky top-0 z-20 border-b border-white/5 bg-neutral-900">
              {/* 列表标题栏（页面标题 + 搜索，搜索框从右向左扩张） */}
              <ListHeader
                title={activePageLabel}
                onSearchClick={() => setSearchOpen((v) => !v)}
                searchOpen={searchOpen}
              />

              {/* 工具栏：仅歌曲页显示，位于列表标题栏下方 */}
              {activePageId === "songs" && <ListToolbar count={SONG_COUNT} />}
            </div>

            <ul className="space-y-1 p-2 portrait:pb-[calc(env(safe-area-inset-bottom)+7rem)]">
              {Array.from({ length: SONG_COUNT }).map((_, i) => (
                <li
                  key={i}
                  className="song-item flex items-center gap-3 rounded-lg px-3 py-2"
                  onPointerMove={(e) => {
                    // 记录光标在行内的位置，驱动液态玻璃上的跟随高光
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty(
                      "--mx",
                      `${e.clientX - rect.left}px`,
                    );
                    e.currentTarget.style.setProperty(
                      "--my",
                      `${e.clientY - rect.top}px`,
                    );
                  }}
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
          )}
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
        {/* 液态玻璃背景：半透明白 + 背景模糊与饱和增强。
            竖屏时通过绝对定位悬浮在列表底部之上，让列表滚动条与内容从玻璃下方穿过、透出玻璃。 */}
        <aside className={`flex h-14 shrink-0 flex-col border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150 portrait:absolute portrait:inset-x-0 portrait:bottom-0 portrait:z-30 portrait:h-auto portrait:border-t portrait:pb-[env(safe-area-inset-bottom)] landscape:relative landscape:h-auto landscape:flex-1 ${!isLandscape && "rounded-t-md"} `}
        >
          {/* 横屏：液态玻璃下方漂浮的绿色萤火虫 */}
          {isLandscape && <Fireflies />}

          {/* 横屏：窗口控制按钮位于本列顶部，参与分栏 */}
          {isLandscape && <TitleBar part="controls" />}

          {isLandscape && pageSettingsOpen ? (
            /* 横屏：页面设置在最右侧分栏打开 */
            <PageSettingsPanel
              showPortraitLabels={portraitShowLabels}
              onShowPortraitLabelsChange={setPortraitShowLabels}
              glowStyle={glowStyle}
              onGlowStyleChange={setGlowStyle}
              onBack={handleClosePageSettings}
            />
          ) : (
            <>
              {/* 横屏：完整播放器；竖屏：底部迷你播放器（点击可打开全屏播放页） */}
              <Player
                compact={!isLandscape}
                onOpen={!isLandscape ? handleOpenPortraitPlayer : undefined}
              />

              {/* 竖屏：页面导航作为底部导航栏，随播放器一起固定在底部 */}
              {!isLandscape && (
                <SwitchMenu
                  orientation="bottom"
                  pages={PAGES}
                  activePageId={activePageId}
                  onSelectPage={handleSelectPage}
                  expanded={menuExpanded}
                  onToggle={handleToggleMenu}
                  showLabels={portraitShowLabels}
                />
              )}
            </>
          )}
        </aside>
      </div>

      {/* 竖屏：点击迷你播放栏后从底部滑出的全屏播放页 */}
      {!isLandscape && (
        <div
          className={
            "fixed inset-0 z-50 isolate flex flex-col overflow-hidden bg-neutral-900/90 backdrop-blur-xl backdrop-saturate-150 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-out " +
            (portraitPlayerOpen
              ? "translate-y-0"
              : "pointer-events-none translate-y-full")
          }
          aria-hidden={!portraitPlayerOpen}
          inert={!portraitPlayerOpen}
        >
          {/* 液态玻璃下方漂浮的绿色萤火虫 */}
          <Fireflies />

          {/* 顶部：收起按钮 */}
          <header className="flex shrink-0 items-center px-2 pt-[env(safe-area-inset-top)]">
            <button
              type="button"
              aria-label="收起播放页"
              onClick={handleClosePortraitPlayer}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-100"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </header>

          <Player />
        </div>
      )}
    </div>
  );
}

export default MainLayout;