import { useState, type MouseEvent } from "react";

/** 占位歌曲信息 */
const SONG = {
  title: "夜航",
  artist: "Melune",
  elapsed: "0:45",
  duration: "3:12",
  /** 播放进度百分比 */
  progress: 30,
};

/** 占位歌词 */
const LYRICS = [
  "夜色把城市调成静音",
  "月光沿着海岸线漫过来",
  "我们乘着夜航的船",
  "把心事交给风",
  "星光落在你的侧脸",
  "潮汐偷偷记住了这一刻",
  "就让时间慢一点",
  "再远一点也没关系",
];

/** 当前高亮的歌词行 */
const ACTIVE_LYRIC = 2;

/** 音符图标（封面占位） */
function NoteIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
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
  );
}

/** 封面占位：渐变底 + 音符 */
function Cover({ mini = false }: { mini?: boolean }) {
  return (
    <div
      onPointerMove={
        mini
          ? undefined
          : (e) => {
              // 记录光标在封面内的位置，驱动扫光 / 高光跟随鼠标扫过
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
            }
      }
      className={
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-linear-to-br from-neutral-700 via-neutral-800 to-neutral-900 text-neutral-500 " +
        (mini
          ? "h-12 w-12 rounded-lg shadow-lg shadow-black/40"
          : "glass-glow aspect-square w-full max-w-45 rounded-xl shadow-lg shadow-black/30")
      }
    >
      <NoteIcon size={mini ? 18 : 40} />
    </div>
  );
}

/** 播放 / 暂停按钮 */
function PlayButton({
  playing,
  onClick,
  size = "full",
}: {
  playing: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  size?: "mini" | "full";
}) {
  const iconSize = size === "mini" ? 16 : 24;

  return (
    <button
      type="button"
      aria-label={playing ? "暂停" : "播放"}
      onClick={onClick}
      className={
        "flex shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-100 transition duration-150 hover:bg-white/10 hover:text-white active:scale-95 " +
        (size === "mini" ? "h-7 w-7" : "h-12 w-12")
      }
    >
      {playing ? (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <rect x="5" y="4" width="2.4" height="8" rx="1" />
          <rect x="8.6" y="4" width="2.4" height="8" rx="1" />
        </svg>
      ) : (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          {/* 圆角三角形，并向右微移做视觉居中 */}
          <path
            d="M6.2 3.9 12.6 8l-6.4 4.1V3.9Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * Player - 播放器区域
 *
 * compact：竖屏底部迷你播放器（封面 + 歌名 + 播放 / 下一首）
 * 默认：横屏右侧完整播放器（封面、歌曲信息、进度、上一首 / 播放 / 下一首、音量）
 *
 * 当前为占位实现，仅播放状态可切换，进度与歌曲信息为静态示例。
 */
function Player({
  compact = false,
  onOpen,
}: {
  compact?: boolean;
  /** 竖屏：点击迷你播放栏时打开全屏播放页 */
  onOpen?: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const togglePlaying = () => setPlaying((v) => !v);

  if (compact) {
    return (
      <div
        onClick={onOpen}
        className={
          "relative flex h-[30px] items-center gap-2.5 px-3 " +
          (onOpen ? "cursor-pointer" : "")
        }
      >
        {/* 封面底部与播放栏底部对齐，顶部溢出播放栏显示 */}
        <div className="absolute bottom-0 left-3">
          <Cover mini />
        </div>
        <div className="min-w-0 flex-1 pl-[4.25rem]">
          <p className="truncate text-xs">{SONG.title}</p>
        </div>
        <PlayButton
          playing={playing}
          onClick={(e) => {
            // 播放 / 暂停按钮不触发打开播放页
            e.stopPropagation();
            togglePlaying();
          }}
          size="mini"
        />
        <button
          type="button"
          aria-label="下一首"
          onClick={(e) => e.stopPropagation()}
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-100"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M3.5 4l6 4-6 4V4z" fill="currentColor" />
            <path
              d="M12 4v8"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-4 py-6 landscape:flex-row landscape:gap-8">
      {/* 左侧：封面、歌曲信息、进度条、播控 */}
      <div className="flex w-full max-w-[320px] shrink-0 flex-col items-center gap-5 landscape:w-[46%] landscape:max-w-[280px] landscape:min-w-0">
        {/* 封面 */}
        <Cover />

        {/* 歌曲信息：宽度与封面一致，左边缘对齐 */}
        <div className="w-full max-w-[180px] text-start">
          <p className="truncate text-base font-medium">{SONG.title}</p>
          <p className="mt-1 truncate text-xs text-neutral-500">{SONG.artist}</p>
        </div>

        {/* 进度条 */}
        <div className="w-full max-w-[300px]">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${SONG.progress}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-neutral-500">
            <span>{SONG.elapsed}</span>
            <span>{SONG.duration}</span>
          </div>
        </div>

        {/* 播放控制 */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="上一首"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-100"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M12.5 4l-6 4 6 4V4z" fill="currentColor" />
              <path
                d="M4 4v8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <PlayButton playing={playing} onClick={togglePlaying} />

          <button
            type="button"
            aria-label="下一首"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-100"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 4l6 4-6 4V4z" fill="currentColor" />
              <path
                d="M12 4v8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 右侧：歌词（仅分栏横屏显示） */}
      <section className="hidden flex-col gap-3 landscape:flex landscape:min-w-0 landscape:max-w-[420px] landscape:flex-1 landscape:justify-center">
        <h2 className="text-xs font-medium tracking-wider text-neutral-500">
          歌词
        </h2>
        <ul className="flex flex-col gap-2.5">
          {LYRICS.map((line, i) => (
            <li
              key={line}
              className={
                "text-sm leading-relaxed transition-colors " +
                (i === ACTIVE_LYRIC ? "text-emerald-400" : "text-neutral-500")
              }
            >
              {line}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Player;
