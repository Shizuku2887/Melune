import { useState, type ReactNode } from "react";
import SimpleBar from "simplebar-react";

/** 列表密度选项 */
const DENSITY_OPTIONS = [
  { id: "comfortable", label: "舒适" },
  { id: "compact", label: "紧凑" },
] as const;

type Density = (typeof DENSITY_OPTIONS)[number]["id"];

/** 鼠标跟随发光样式选项 */
export const GLOW_OPTIONS = [
  { id: "circle", label: "圆形" },
  { id: "ellipse", label: "椭圆" },
  { id: "sweep", label: "扫光" },
] as const;

export type GlowStyle = (typeof GLOW_OPTIONS)[number]["id"];

/** 开关控件 */
function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={
        "relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors " +
        (checked ? "bg-emerald-500" : "bg-neutral-600")
      }
    >
      <span
        className={
          "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform " +
          (checked ? "translate-x-4" : "translate-x-0")
        }
      />
    </button>
  );
}

/** 设置项行：左侧标题与说明，右侧控件 */
function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

/** 列表分组卡片 */
function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-white/5 overflow-hidden rounded-lg bg-white/5">
      {children}
    </div>
  );
}

/**
 * SettingsPage - 设置页
 *
 * 以选项列表的形式展示设置分类，点击「页面设置」打开具体设置项。
 */
function SettingsPage({
  onOpenPageSettings,
}: {
  onOpenPageSettings: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center px-2 pb-2 pt-2">
        <h1 className="text-base font-semibold">设置</h1>
      </header>

      <SimpleBar className="min-h-0 flex-1">
        {/* 竖屏时底部留出播放器与导航栏的高度 */}
        <div className="px-2 pb-6 portrait:pb-[calc(env(safe-area-inset-bottom)+7rem)]">
          <SettingsCard>
            <button
              type="button"
              onClick={onOpenPageSettings}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-white/5"
            >
              <span className="min-w-0">
                <span className="block text-sm">页面设置</span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  竖屏导航、列表显示等界面选项
                </span>
              </span>
              <span className="shrink-0 text-neutral-500">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 3.5L10.5 8L6 12.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </SettingsCard>
        </div>
      </SimpleBar>
    </div>
  );
}

/**
 * PageSettingsPanel - 页面设置详情
 *
 * 横屏时在右侧分栏打开，竖屏时占据列表区域；通过返回按钮回到设置选项列表。
 */
export function PageSettingsPanel({
  showPortraitLabels,
  onShowPortraitLabelsChange,
  glowStyle,
  onGlowStyleChange,
  onBack,
}: {
  showPortraitLabels: boolean;
  onShowPortraitLabelsChange: (value: boolean) => void;
  glowStyle: GlowStyle;
  onGlowStyleChange: (value: GlowStyle) => void;
  onBack: () => void;
}) {
  const [density, setDensity] = useState<Density>("comfortable");
  const [showIndex, setShowIndex] = useState(true);
  const [showArtist, setShowArtist] = useState(true);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-1 px-2 py-2">
        <button
          type="button"
          aria-label="返回设置"
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3.5L5.5 8L10 12.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-base font-semibold">页面设置</h1>
      </header>

      <SimpleBar className="min-h-0 flex-1">
        <div className="px-2 pb-6 portrait:pb-[calc(env(safe-area-inset-bottom)+7rem)]">
          <SettingsCard>
            <SettingRow
              title="竖屏显示选项名称"
              description="关闭后竖屏底部导航只显示图标"
            >
              <Toggle
                checked={showPortraitLabels}
                label="竖屏显示选项名称"
                onChange={onShowPortraitLabelsChange}
              />
            </SettingRow>

            <SettingRow title="列表密度" description="调整歌曲列表中每一项的高度">
              <div className="flex shrink-0 rounded-md bg-neutral-800 p-0.5">
                {DENSITY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDensity(option.id)}
                    className={
                      "cursor-pointer rounded px-2.5 py-1 text-xs transition-colors " +
                      (density === option.id
                        ? "bg-white/15 text-neutral-100"
                        : "text-neutral-400 hover:text-neutral-200")
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </SettingRow>

            <SettingRow title="显示歌曲编号" description="在歌曲列表左侧显示序号">
              <Toggle
                checked={showIndex}
                label="显示歌曲编号"
                onChange={setShowIndex}
              />
            </SettingRow>

            <SettingRow title="显示歌手名称" description="在歌曲标题下方显示歌手">
              <Toggle
                checked={showArtist}
                label="显示歌手名称"
                onChange={setShowArtist}
              />
            </SettingRow>

            <SettingRow
              title="鼠标发光样式"
              description="悬停玻璃区域时光斑的形状"
            >
              <div className="flex shrink-0 rounded-md bg-neutral-800 p-0.5">
                {GLOW_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onGlowStyleChange(option.id)}
                    className={
                      "cursor-pointer rounded px-2.5 py-1 text-xs transition-colors " +
                      (glowStyle === option.id
                        ? "bg-white/15 text-neutral-100"
                        : "text-neutral-400 hover:text-neutral-200")
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </SettingRow>
          </SettingsCard>
        </div>
      </SimpleBar>
    </div>
  );
}

export default SettingsPage;
