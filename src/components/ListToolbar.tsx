/**
 * ListToolbar - 列表标题栏下方的工具栏
 *
 * 提供常见的列表操作入口（占位按钮，暂无实际功能）：
 * 随机播放、排序、更多操作，并显示当前列表的歌曲数量。
 * 视觉风格与 ListHeader 保持一致（neutral 配色、h-6 按钮）。
 */
interface ListToolbarProps {
  /** 当前列表的歌曲数量 */
  count: number;
}

function ListToolbar({ count }: ListToolbarProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 px-2">


      <div className="flex gap-1 items-center group/random cursor-pointer">
        {/* 随机播放 */}
        <button
          type="button"
          aria-label="随机播放"
          className="flex h-6 w-8 shrink-0 items-center justify-center cursor-pointer rounded-md text-neutral-400 group-hover/random:text-neutral-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 4.5h2.5L11 11.5H14M2 11.5h2.5L11 4.5H14"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 3l2 1.5L12 6M12 10l2 1.5L12 13"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 歌曲数量 */}
        <span className="text-xs tabular-nums text-neutral-500 group-hover/random:text-neutral-100 ">{count}</span>
      </div>


      {/* 排序 */}
      <button
        type="button"
        aria-label="排序"
        className="ml-auto flex h-6 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:text-neutral-100"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M5 3v10M5 13l-2-2M5 13l2-2M11 13V3M11 3l-2 2M11 3l2 2"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 更多操作：推到最右侧 */}
      <button
        type="button"
        aria-label="更多操作"
        className="flex h-6 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:text-neutral-100"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="3.5" cy="8" r="1.2" fill="currentColor" />
          <circle cx="8" cy="8" r="1.2" fill="currentColor" />
          <circle cx="12.5" cy="8" r="1.2" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}

export default ListToolbar;