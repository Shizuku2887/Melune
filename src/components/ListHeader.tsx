import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ListHeaderProps {
  /** 左侧显示的当前页面标题 */
  title: string;
  /** 点击搜索按钮回调 */
  onSearchClick: () => void;
  /** 搜索框是否展开 */
  searchOpen: boolean;
}

/**
 * ListHeader - 列表区域顶部标题栏
 *
 * 包含：页面标题、右侧搜索区域。页面切换菜单已独立为左侧菜单栏。
 *
 * 搜索交互：搜索输入框与搜索按钮为两个独立盒子，与标题同处一行。
 * 搜索按钮固定在最右侧、位置不变；输入框盒子收起时宽度为 0，
 * 点击展开后通过 flex-grow 向左扩张，自动填充标题与按钮之间的剩余空间——
 * 长度不固定，在标题前「停下」（紧贴标题右缘），标题保持自身宽度不被覆盖。
 * 使用 framer-motion 对 flex-grow 做平滑过渡（打开向左扩、关闭向右收）。
 */
function ListHeader({ title, onSearchClick, searchOpen }: ListHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 搜索框展开后自动聚焦
  useEffect(() => {
    if (searchOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(t);
    }
  }, [searchOpen]);

  return (
    <header className="relative flex shrink-0 items-center gap-1 pl-4 pr-2 pb-1 pt-1">
      {/* 当前页面标题：保持自身宽度（不参与伸缩），搜索框在其右侧停下 */}
      <h1 className="max-w-[45%] shrink-0 truncate text-base font-semibold">
        {title}
      </h1>

      {/* 搜索区域：始终靠右。输入框盒子展开时向左扩张填满剩余空间，
          收起时向右收缩（右侧边缘固定不动）；搜索按钮独立于输入框盒子，
          位置始终固定在最右侧。 */}
      <div className="ml-3 flex min-w-0 flex-1 items-center justify-end gap-1">
        {/* 输入框盒子：独立的一个盒子，展开/收起动画 */}
        <motion.div
          initial={false}
          animate={{ flexGrow: searchOpen ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          onPointerMove={(e) => {
            // 记录光标在搜索框内的位置，驱动液态玻璃上的跟随高光
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
          }}
          className={
            "flex h-8 min-w-0 basis-0 items-center overflow-hidden rounded-md transition-colors " +
            (searchOpen
              ? "frosted-glass"
              : "")
          }
        >
          {/* 输入框：仅在点击搜索按钮展开后显示；宽度随盒子自适应（flex-1），长度不固定 */}
          {searchOpen && (
            <input
              ref={inputRef}
              type="text"
              placeholder={`搜索${title}`}
              className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
            />
          )}
        </motion.div>

        {/* 搜索按钮：独立盒子，位置固定，不随输入框伸缩 */}
        <button
          type="button"
          aria-label="搜索"
          aria-pressed={searchOpen}
          onClick={onSearchClick}
          onPointerMove={(e) => {
            // 记录光标在按钮内的位置，驱动液态玻璃上的跟随高光
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
          }}
          className={
            "menu-glass flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors " +
            (searchOpen
              ? "bg-white/10 text-emerald-500"
              : "text-neutral-400 hover:text-neutral-100")
          }
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M10.5 10.5L14 14"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default ListHeader;
