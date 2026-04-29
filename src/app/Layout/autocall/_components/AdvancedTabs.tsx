"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

export type AdvancedTabsVariant =
  | "underline"
  | "pill"
  | "slider"
  | "vertical"
  | "icon"
  | "scroll"
  | "step"
  | "dropdown"
  | "closeable"
  | "nested"
  | "status"
  | "draggable"
  | "search";

export type AdvancedTab = {
  id: string;
  label: string;
  content?: React.ReactNode;

  // optional UI
  badge?: string | number;
  icon?: React.ReactNode;
  dot?: boolean; // unread dot
  online?: boolean; // live status dot

  // behavior
  disabled?: boolean;
  closable?: boolean;

  // for nested
  children?: AdvancedTab[];

  // optional: can be used by parent to filter data (not used internally)
  searchText?: string;
  _tabStyle?: {
    fontColor?: string;
    activeColor?: string;
    inactiveColor?: string;
    bgColor?: string;
    background?: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    hoverColor?: string;
    icon?: string;
    iconColor?: string;
    borderColor?: string;
    // Add any other styling properties you need
  };

  // Store original data for reference
  _originalData?: any;
};

export type AdvancedTabsProps = {
  variant: AdvancedTabsVariant;
  tabs: AdvancedTab[];
  defaultActiveId?: string;
  className?: string;
  activeId?: string; // for controlled mode
  styleProps?: {
    activeTab?: React.CSSProperties;
    inactiveTab?: React.CSSProperties;
    container?: React.CSSProperties;
  };
  /** show a search box (used in variant="search" automatically) */
  searchable?: boolean;
  searchPlaceholder?: string;

  /** enable drag reorder (used in variant="draggable" automatically) */
  reorderable?: boolean;

  /** show close buttons (used in variant="closeable" automatically) */
  closeable?: boolean;

  /**
   * Called when tabs change due to close/reorder/status update.
   * If omitted, component manages internal state.
   */
  onTabsChange?: (nextTabs: AdvancedTab[]) => void;

  /** called on active tab change */
  onActiveChange?: (activeId: string) => void;

  /** optional: render panel yourself */
  renderPanel?: (
    activeTab: AdvancedTab | undefined,
    ctx: { query?: string },
  ) => React.ReactNode;

  /** Optional: only allow these ids; others become disabled */
  allowedIds?: string[];
  styleOverrides?: {
    activeTab?: {
      backgroundColor?: string;
      color?: string;
      borderColor?: string;
      backgroundImage?: string;
    };
    inactiveTab?: {
      backgroundColor?: string;
      color?: string;
    };
    container?: {
      backgroundColor?: string;
      fontFamily?: string;
    };
  };

  /** Custom CSS class name for styling */
  customClassName?: string;
};

export function AdvancedTabs(props: AdvancedTabsProps) {
  const {
    variant,
    tabs: tabsProp,
    defaultActiveId,
    activeId: controlledActiveId,
    className,
    onTabsChange,
    onActiveChange,
    renderPanel,
    allowedIds,
    styleProps,
    styleOverrides,
    customClassName,
  } = props;
  const isCloseable = props.closeable ?? variant === "closeable";
  const isReorderable = props.reorderable ?? variant === "draggable";
  const isSearch = props.searchable ?? variant === "search";

  // internal tabs state (sync from props)
  const [tabsState, setTabsState] = useState<AdvancedTab[]>(tabsProp);
  // useEffect(() => setTabsState(tabsProp), [tabsProp]);
  useEffect(() => {
    const prevIds = tabsState.map((t) => t.id).join(",");
    const nextIds = tabsProp.map((t) => t.id).join(",");
    // Only do a full reset if tabs were added from outside (new ids appeared)
    // Never reset if we only have fewer or reordered — those are internal mutations
    const prevSet = new Set(tabsState.map((t) => t.id));
    const nextHasNew = tabsProp.some((t) => !prevSet.has(t.id));
    if (nextHasNew) {
      setTabsState(tabsProp);
    }
  }, [tabsProp]);
  const tabs = tabsState;

  // active
  const initialActive = useMemo(() => {
    const candidate = defaultActiveId ?? tabs[0]?.id;
    return tabs.some((t) => t.id === candidate) ? candidate : tabs[0]?.id;
  }, [defaultActiveId, tabs]);

  const [activeId, setActiveId] = useState<string>(initialActive ?? "");
  const isUserActionRef = useRef(false);

  useEffect(() => {
    if (
      controlledActiveId !== undefined &&
      controlledActiveId !== activeId &&
      tabs.some((t) => t.id === controlledActiveId)
    ) {
      isUserActionRef.current = false;
      setActiveId(controlledActiveId);
    }
  }, [controlledActiveId]);

  useEffect(() => {
    if (!activeId && tabsState[0]?.id) {
      setActiveId(tabsState[0].id);
    } else if (activeId && !tabsState.some((t) => t.id === activeId)) {
      setActiveId(tabsState[0]?.id ?? "");
    }
  }, [tabsState.length]);

  // Only notify parent when it's a USER action, not a prop sync
  useEffect(() => {
    if (activeId && isUserActionRef.current) {
      onActiveChange?.(activeId);
    }
  }, [activeId, onActiveChange]);

  useEffect(() => {
    if (!activeId && tabsState[0]?.id) {
      setActiveId(tabsState[0].id);
    } else if (activeId && !tabsState.some((t) => t.id === activeId)) {
      setActiveId(tabsState[0]?.id ?? "");
    }
  }, [tabsState.length]);

  const tabIsDisabled = (t: AdvancedTab) => {
    if (t.disabled) return true;
    if (allowedIds && !allowedIds.includes(t.id)) return true;
    return false;
  };

  // unread dot auto-clear for status variant
  useEffect(() => {
    if (variant !== "status") return;
    setTabsState((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, dot: false } : t)),
    );
  }, [activeId, variant]);

  function requestTabsChange(next: AdvancedTab[]) {
    setTabsState(next);
    onTabsChange?.(next);
  }

  function closeTab(id: string) {
    const idx = tabs.findIndex((t) => t.id === id);
    const next = tabs.filter((t) => t.id !== id);
    requestTabsChange(next);

    if (id === activeId) {
      const fallback = next[Math.max(0, idx - 1)] ?? next[0];
      setActiveId(fallback?.id ?? "");
    }
  }

  // drag reorder (HTML5)
  const dragId = useRef<string | null>(null);
  function moveTab(fromId: string, toId: string) {
    if (fromId === toId) return;
    const fromIndex = tabs.findIndex((t) => t.id === fromId);
    const toIndex = tabs.findIndex((t) => t.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;

    const next = [...tabs];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    requestTabsChange(next);
  }

  // search
  const [query, setQuery] = useState("");

  // ARIA + keyboard
  const listId = useMemo(
    () => `tablist-${Math.random().toString(16).slice(2)}`,
    [],
  );
  const idsInOrder = useMemo(() => tabs.map((t) => t.id), [tabs]);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [verticalIndicator, setVerticalIndicator] = useState({
    top: 0,
    height: 44,
  });

  useLayoutEffect(() => {
    if (variant !== "vertical") return;
    const activeButton = tabRefs.current[activeId];
    if (activeButton) {
      setVerticalIndicator({
        top: activeButton.offsetTop,
        height: activeButton.offsetHeight,
      });
    }
  }, [activeId, tabs, variant]);

  function focusNext(currentId: string, dir: 1 | -1) {
    if (!idsInOrder.length) return;
    const start = idsInOrder.indexOf(currentId);
    for (let step = 1; step <= idsInOrder.length; step++) {
      const idx = (start + dir * step + idsInOrder.length) % idsInOrder.length;
      const id = idsInOrder[idx];
      const t = tabs.find((x) => x.id === id);
      if (t && !tabIsDisabled(t)) {
        setActiveId(id);
        return;
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (variant === "dropdown") return;
    if (variant === "vertical") {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusNext(activeId, 1);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        focusNext(activeId, -1);
      }
    } else {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        focusNext(activeId, 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusNext(activeId, -1);
      }
    }
    if (e.key === "Home") {
      e.preventDefault();
      const first = tabs.find((t) => !tabIsDisabled(t));
      if (first) setActiveId(first.id);
    }
    if (e.key === "End") {
      e.preventDefault();
      const last = [...tabs].reverse().find((t) => !tabIsDisabled(t));
      if (last) setActiveId(last.id);
    }
  }

  // nested
  const outerTabs = tabs;
  const outerActive = outerTabs.find((t) => t.id === activeId) ?? outerTabs[0];
  const innerTabs = outerActive?.children ?? [];
  const [innerActiveId, setInnerActiveId] = useState<string>(
    innerTabs[0]?.id ?? "",
  );
  useEffect(() => {
    if (variant !== "nested") return;
    setInnerActiveId(innerTabs[0]?.id ?? "");
  }, [variant, activeId, innerTabs]);

  const activeTab = tabs.find((t) => t.id === activeId);

  // styling helpers
  const wrap = `p-2 ${className ?? ""}`;
  const btnBase =
    "group relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400/40";
  const fontSize =
    `${styleProps?.activeTab?.fontSize}px` ||
    `${styleProps?.inactiveTab?.fontSize}px` ||
    "14px";

  // State for tracking hovered tab
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

  // Helper function to get tab colors and styles
  const getTabColors = (t: AdvancedTab, isActive: boolean) => {
    const tabStyle = t._tabStyle || {};
    const activeBgColor = String(
      tabStyle.activeColor ||
        styleProps?.activeTab?.background ||
        styleOverrides?.activeTab?.backgroundColor ||
        "",
    );
    const inactiveBgColor = String(
      tabStyle.inactiveColor ||
        styleProps?.inactiveTab?.background ||
        styleOverrides?.inactiveTab?.backgroundColor ||
        "",
    );
    const fontColor =
      tabStyle.fontColor ||
      styleProps?.activeTab?.color ||
      styleOverrides?.activeTab?.color ||
      "";
    const hoverColor = tabStyle.hoverColor;

    const fontStyles: React.CSSProperties = {
      fontWeight: tabStyle.isBold ? "bold" : "normal",
      fontStyle: tabStyle.isItalic ? "italic" : "normal",
      textDecoration: tabStyle.isUnderline ? "underline" : "none",
    };

    return {
      bgColor: isActive ? activeBgColor : inactiveBgColor,
      fontColor,
      hoverColor,
      fontStyles,
      activeBgColor,
      inactiveBgColor,
    };
  };

  const renderTabButton = (t: AdvancedTab) => {
    const active = t.id === activeId;
    const disabled = tabIsDisabled(t);
    const tabStyle = t._tabStyle || {};
    const { bgColor, fontColor, hoverColor, fontStyles } = getTabColors(
      t,
      active,
    );

    let iconElement: React.ReactNode = t.icon;
    if (typeof t.icon === "string") {
      const iconColor =
        tabStyle.iconColor ||
        tabStyle.fontColor ||
        styleProps?.activeTab?.color;
      iconElement = (
        <i
          className={t.icon}
          style={{ fontSize, color: iconColor, marginRight: "8px" }}
        />
      );
    }

    const activeBgColor = String(
      tabStyle.activeColor || styleProps?.activeTab?.background || "",
    );
    const inactiveBgColor = String(
      tabStyle.inactiveColor || styleProps?.inactiveTab?.background || "",
    );
    const tabFontColor = tabStyle.fontColor || styleProps?.activeTab?.color;
    const borderColor = active
      ? tabStyle.borderColor || styleProps?.activeTab?.borderColor
      : undefined;

    const buttonStyle: React.CSSProperties = {
      backgroundColor:
        hoveredTabId === t.id && hoverColor
          ? hoverColor
          : bgColor || (active ? activeBgColor : inactiveBgColor),
      color: fontColor || tabFontColor,
      border: active
        ? `2px solid ${borderColor ?? "transparent"}`
        : "1px solid transparent",
      ...fontStyles,
      cursor: isReorderable ? "grab" : "pointer", // ← visual cue
    };

    return (
      // ↓ Remove `layout` when reorderable — it fights HTML5 DnD
      <motion.div
        key={t.id}
        {...(isReorderable ? {} : { layout: true })}
        draggable={isReorderable}
        onDragStart={(e) => {
          if (!isReorderable) return;
          dragId.current = t.id;
          // ↓ Required: set drag data so browser activates DnD
          (e as any).dataTransfer.effectAllowed = "move";
          (e as any).dataTransfer.setData("text/plain", t.id);
        }}
        onDragEnd={() => {
          dragId.current = null;
        }}
        onDragOver={(e) => {
          if (!isReorderable) return;
          e.preventDefault();
          (e as any).dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (!isReorderable || !dragId.current || dragId.current === t.id)
            return;
          moveTab(dragId.current, t.id);
          dragId.current = null;
        }}
      >
        <button
          id={`tab-${t.id}`}
          role="tab"
          aria-selected={active}
          aria-controls={`panel-${t.id}`}
          disabled={disabled}
          tabIndex={active ? 0 : -1}
          onClick={() => {
            if (!disabled) {
              isUserActionRef.current = true;
              setActiveId(t.id);
              onActiveChange?.(t.id);
            }
          }}
          onMouseEnter={() => setHoveredTabId(t.id)}
          onMouseLeave={() => setHoveredTabId(null)}
          onKeyDown={onKeyDown}
          className="group relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          style={buttonStyle}
          // ↓ Do NOT put drag handlers here — they belong on the wrapper div
        >
          {variant === "draggable" && (
            <span style={{ opacity: active ? 0.9 : 0.6, userSelect: "none" }}>
              ⠿
            </span>
          )}
          {iconElement && (
            <span className="flex items-center justify-center">
              {iconElement}
            </span>
          )}
          <span className="max-w-full whitespace-nowrap" style={{ fontSize }}>
            {t.label}
          </span>
          {(t.badge ?? t.badge === 0) && variant !== "slider" && (
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-black/10 text-black" : "bg-white/10 text-slate-100"}`}
            >
              {t.badge}
            </span>
          )}
          {isCloseable && (t.closable ?? true) && tabs.length > 1 && (
            <span
              role="button"
              aria-label={`Close ${t.label}`}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(t.id);
              }}
              className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-xs transition ${
                active
                  ? "bg-black/10 text-black hover:bg-black/15"
                  : "bg-white/10 text-slate-100 hover:bg-white/15"
              }`}
            >
              ×
            </span>
          )}
          {variant === "underline" && active && (
            <motion.div
              layoutId={`${listId}-underline`}
              style={{
                background:
                  bgColor ||
                  "linear-gradient(to right, rgb(34,211,238), rgb(192,132,250), rgb(16,185,129))",
              }}
              className="absolute inset-x-2 -bottom-2 h-[2px] rounded-full"
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
            />
          )}
          <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10 opacity-0 transition group-hover:opacity-100" />
        </button>
      </motion.div>
    );
  };

  const listCommonProps = {
    role: "tablist" as const,
    "aria-label": "Tabs",
  };

  const renderTabList = () => {
    // dropdown
    if (variant === "dropdown") {
      return (
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-200">Select section</label>
          <div className="relative">
            <select
              value={activeId}
              onChange={(e) => {
                const id = e.target.value;
                isUserActionRef.current = true;
                setActiveId(id);
                onActiveChange?.(id);
              }}
              className="rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none"
            >
              {tabs.map((t) => (
                <option key={t.id} value={t.id} disabled={tabIsDisabled(t)}>
                  {t.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
              ▾
            </span>
          </div>
        </div>
      );
    }

    // vertical
    if (variant === "vertical") {
      return (
        <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
          <div className="relative rounded-2xl border">
            <motion.div
              className="absolute left-2 right-2 rounded-xl"
              animate={{
                top: verticalIndicator.top,
                height: verticalIndicator.height,
              }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
            <div className="relative space-y-2" {...listCommonProps}>
              {tabs.map((t) => {
                const isActive = t.id === activeId;
                const { bgColor, fontColor, hoverColor, fontStyles } =
                  getTabColors(t, isActive);
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={t.id === activeId}
                    disabled={tabIsDisabled(t)}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => {
                      if (!tabIsDisabled(t)) {
                        isUserActionRef.current = true;
                        setActiveId(t.id);
                        onActiveChange?.(t.id);
                      }
                    }}
                    onKeyDown={onKeyDown}
                    ref={(el) => {
                      if (el) tabRefs.current[t.id] = el;
                    }}
                    onMouseEnter={() => setHoveredTabId(t.id)}
                    onMouseLeave={() => setHoveredTabId(null)}
                    className={`relative z-10 w-full rounded-xl px-3 py-3 text-left text-sm font-semibold transition inline-flex items-center gap-2 ${
                      tabIsDisabled(t) ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                    style={{
                      backgroundColor:
                        hoveredTabId === t.id && hoverColor
                          ? hoverColor
                          : bgColor,
                      color: fontColor,
                      fontSize: fontSize,
                      ...fontStyles,
                    }}
                  >
                    {typeof t.icon === "string" ? (
                      <i
                        className={t.icon}
                        style={{ fontSize: fontSize, color: fontColor }}
                      />
                    ) : t.icon ? (
                      <span className="flex items-center justify-center">
                        {t.icon}
                      </span>
                    ) : null}
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            {renderPanel
              ? renderPanel(activeTab, { query: isSearch ? query : undefined })
              : ""}
          </div>
        </div>
      );
    }

    // step
    if (variant === "step") {
      const activeIndex = Math.max(
        0,
        tabs.findIndex((t) => t.id === activeId),
      );
      return (
        <div className="grid gap-2 sm:grid-cols-4 mt-2" {...listCommonProps}>
          {tabs.map((t, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            const { bgColor, fontColor, hoverColor, fontStyles } = getTabColors(
              t,
              active,
            );
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                disabled={tabIsDisabled(t)}
                onClick={() => {
                  if (!tabIsDisabled(t)) {
                    isUserActionRef.current = true;
                    setActiveId(t.id);
                    onActiveChange?.(t.id);
                  }
                }}
                onKeyDown={onKeyDown}
                onMouseEnter={() => setHoveredTabId(t.id)}
                onMouseLeave={() => setHoveredTabId(null)}
                className={`relative rounded-2xl border border-white/15 p-3 text-left transition ${
                  tabIsDisabled(t) ? "opacity-40 cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor:
                    hoveredTabId === t.id && hoverColor
                      ? hoverColor
                      : bgColor ||
                        (active ? "rgb(15, 23, 42)" : "rgba(15, 23, 42, 0.5)"),
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {typeof t.icon === "string" ? (
                      <i
                        className={t.icon}
                        style={{ fontSize: fontSize, color: fontColor }}
                      />
                    ) : t.icon ? (
                      <span className="flex items-center justify-center">
                        {t.icon}
                      </span>
                    ) : null}
                    <div className="text-xs text-slate-200">Step {i + 1}</div>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full text-center text-xs leading-6 ${
                      done
                        ? "bg-emerald-400/20 text-emerald-200"
                        : active
                          ? "bg-cyan-400/20 text-cyan-200"
                          : "bg-white/10 text-slate-200"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                </div>
                <div
                  className="mt-2 text-sm font-semibold inline-flex items-center gap-2"
                  style={{
                    color: fontColor || "white",
                    fontSize: fontSize,
                    ...fontStyles,
                  }}
                >
                  {typeof t.icon === "string" ? (
                    <i
                      className={t.icon}
                      style={{ fontSize: fontSize, color: fontColor }}
                    />
                  ) : null}
                  <span>{t.label}</span>
                </div>
                {active && (
                  <motion.div
                    layoutId={`${listId}-step`}
                    className="absolute inset-0 rounded-2xl ring-2 ring-cyan-400/30"
                  />
                )}
              </button>
            );
          })}
        </div>
      );
    }

    // scroll
    if (variant === "scroll") {
      return (
        <div className="relative">
          <div
            className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-2xl border border-white/15 bg-slate-900/50 p-2"
            {...listCommonProps}
          >
            {tabs.map((t) => {
              const active = t.id === activeId;
              const disabled = tabIsDisabled(t);
              const { bgColor, fontColor, hoverColor, fontStyles } =
                getTabColors(t, active);
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) {
                      isUserActionRef.current = true;
                      setActiveId(t.id);
                      onActiveChange?.(t.id);
                    }
                  }}
                  onMouseEnter={() => setHoveredTabId(t.id)}
                  onMouseLeave={() => setHoveredTabId(null)}
                  onKeyDown={onKeyDown}
                  className={`snap-start whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition inline-flex items-center gap-2 ${
                    disabled ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                  style={{
                    backgroundColor:
                      hoveredTabId === t.id && hoverColor
                        ? hoverColor
                        : bgColor,
                    color: fontColor,
                    fontSize: fontSize,
                    ...fontStyles,
                  }}
                >
                  {typeof t.icon === "string" ? (
                    <i
                      className={t.icon}
                      style={{ fontSize: fontSize, color: fontColor }}
                    />
                  ) : t.icon ? (
                    <span className="flex items-center justify-center">
                      {t.icon}
                    </span>
                  ) : null}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 rounded-l-2xl bg-gradient-to-r from-slate-950 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 rounded-r-2xl bg-gradient-to-l from-slate-950 to-transparent" />
          <style jsx global>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>
      );
    }

    // slider
    if (variant === "slider") {
      const idx = Math.max(
        0,
        tabs.findIndex((t) => t.id === activeId),
      );
      const activeTabForSlider = tabs[idx];
      const sliderColors = activeTabForSlider
        ? getTabColors(activeTabForSlider, true)
        : null;
      const sliderHasCustomColors = Boolean(
        sliderColors?.activeBgColor || sliderColors?.inactiveBgColor,
      );

      return (
        <div
          className="relative flex flex-wrap gap-2 rounded-2xl border border-white/15 bg-slate-900/50 p-2"
          {...listCommonProps}
        >
          <motion.div
            style={{
              width: `calc(${100 / Math.max(1, tabs.length)}% - 8px)`,
              background:
                sliderHasCustomColors && sliderColors?.bgColor
                  ? sliderColors.bgColor
                  : "linear-gradient(to right, rgb(34, 211, 238), rgb(192, 132, 250), rgb(16, 185, 129))",
            }}
            className="absolute inset-y-2 rounded-xl"
            animate={{ x: `calc(${idx * 100}% + ${idx * 8}px)` }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
          {tabs.map((t) => {
            const active = t.id === activeId;
            const disabled = tabIsDisabled(t);
            const {
              bgColor,
              fontColor,
              hoverColor,
              fontStyles,
              activeBgColor,
              inactiveBgColor,
            } = getTabColors(t, active);
            // Only show gradient if no custom colors are set
            const hasCustomColors = Boolean(activeBgColor || inactiveBgColor);
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    isUserActionRef.current = true;
                    setActiveId(t.id);
                    onActiveChange?.(t.id);
                  }
                }}
                onMouseEnter={() => setHoveredTabId(t.id)}
                onMouseLeave={() => setHoveredTabId(null)}
                onKeyDown={onKeyDown}
                className={`relative z-10 flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition inline-flex items-center gap-2 ${
                  disabled ? "opacity-40 cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: hasCustomColors
                    ? hoveredTabId === t.id && hoverColor
                      ? hoverColor
                      : bgColor
                    : undefined,
                  color: fontColor || (active ? "black" : "rgb(226, 232, 240)"),
                  fontSize: fontSize,
                  ...fontStyles,
                }}
              >
                {typeof t.icon === "string" ? (
                  <i
                    className={t.icon}
                    style={{ fontSize: fontSize, color: fontColor }}
                  />
                ) : t.icon ? (
                  <span className="flex items-center justify-center">
                    {t.icon}
                  </span>
                ) : null}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    // default horizontal list
    return (
      <div className={wrap} {...listCommonProps}>
        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence initial={false}>
            {tabs.map(renderTabButton)}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // nested special render
  if (variant === "nested") {
    return (
      <div className="space-y-4">
        <div
          className="flex flex-wrap gap-2 rounded-2xl border border-white/15 bg-slate-900/50 p-2"
          role="tablist"
          aria-label="Outer tabs"
        >
          {outerTabs.map((t) => {
            const active = t.id === activeId;
            const disabled = tabIsDisabled(t);
            const { bgColor, fontColor, hoverColor, fontStyles } = getTabColors(
              t,
              active,
            );
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    isUserActionRef.current = true;
                    setActiveId(t.id);
                    onActiveChange?.(t.id);
                  }
                }}
                onMouseEnter={() => setHoveredTabId(t.id)}
                onMouseLeave={() => setHoveredTabId(null)}
                onKeyDown={onKeyDown}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition inline-flex items-center gap-2 ${
                  disabled ? "opacity-40 cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor:
                    hoveredTabId === t.id && hoverColor ? hoverColor : bgColor,
                  color: fontColor,
                  fontSize: fontSize,
                  ...fontStyles,
                }}
              >
                {typeof t.icon === "string" ? (
                  <i
                    className={t.icon}
                    style={{ fontSize: fontSize, color: fontColor }}
                  />
                ) : t.icon ? (
                  <span className="flex items-center justify-center">
                    {t.icon}
                  </span>
                ) : null}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/15 bg-slate-900/60 p-4">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Inner tabs"
          >
            {innerTabs.map((t) => {
              const active = t.id === innerActiveId;
              const { bgColor, fontColor, hoverColor, fontStyles } =
                getTabColors(t, active);
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setInnerActiveId(t.id);
                  }}
                  onMouseEnter={() => setHoveredTabId(t.id)}
                  onMouseLeave={() => setHoveredTabId(null)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition inline-flex items-center gap-2`}
                  style={{
                    backgroundColor:
                      hoveredTabId === t.id && hoverColor
                        ? hoverColor
                        : bgColor,
                    color: fontColor,
                    ...fontStyles,
                  }}
                >
                  {typeof t.icon === "string" ? (
                    <i className={t.icon} style={{ color: fontColor }} />
                  ) : t.icon ? (
                    <span className="flex items-center justify-center">
                      {t.icon}
                    </span>
                  ) : null}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeId}-${innerActiveId}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mt-4"
            >
              {renderPanel
                ? renderPanel(
                    innerTabs.find((x) => x.id === innerActiveId),
                    { query: undefined },
                  )
                : (innerTabs.find((x) => x.id === innerActiveId)?.content ?? (
                    <div className="rounded-2xl border border-white/15 bg-slate-900/70 p-4 text-sm text-slate-200">
                      Inner panel
                    </div>
                  ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  const showSearch = isSearch;

  return (
    <div className="space-y-4">
      {showSearch ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">{renderTabList()}</div>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={props.searchPlaceholder ?? "Search in tab…"}
              className="w-full rounded-2xl border border-white/15 bg-slate-900/60 px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400 sm:w-72"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              ⌘K
            </span>
          </div>
        </div>
      ) : (
        renderTabList()
      )}

      {variant !== "vertical" && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId + (showSearch ? `:${query}` : "")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {renderPanel
              ? renderPanel(activeTab, {
                  query: showSearch ? query : undefined,
                })
              : ""}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
