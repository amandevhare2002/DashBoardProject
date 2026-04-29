"use client";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEnableMobileMenu } from "../../../reducers/ThemeOptions";
import { createPortal } from "react-dom";
import MetisMenu from "../Common/MetisMenu";
import { ModalComponent } from "../Common/Modal";

// ─── Lazy AutoCallPage ────────────────────────────────────────────────────────
const AutoCallPage = dynamic(() => import("../autocall"), { ssr: false });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMenuData(): any {
  try {
    return JSON.parse(sessionStorage.getItem("appsideData") || "{}");
  } catch {
    return {};
  }
}

function isEditMode(): boolean {
  try {
    return sessionStorage.getItem("IsSubMenuEdit") === "true";
  } catch {
    return false;
  }
}

// Build CSS text style from any backend item (MenuHeader / menuitem / submenuitem)
function buildTextStyle(item: any): React.CSSProperties {
  if (!item) return {};
  return {
    ...(item.FontColor ? { color: item.FontColor } : {}),
    ...(item.BgColor ? { backgroundColor: item.BgColor } : {}),
    ...(item.FontSize ? { fontSize: `${item.FontSize}px` } : {}),
    ...(item.FontName ? { fontFamily: item.FontName } : {}),
    ...(item.IsBold ? { fontWeight: "bold" } : {}),
    ...(item.IsItalic || item.IsItallic ? { fontStyle: "italic" } : {}),
    ...(item.IsUnderline ? { textDecoration: "underline" } : {}),
  };
}

// Main-menu icon: color from IconClscolor, size from FontSize, dimensions from IconWidth/Height
function buildMainIconStyle(item: any): React.CSSProperties {
  if (!item) return {};
  return {
    color: item.IconClscolor || item.FontColor || undefined,
    ...(item.FontSize ? { fontSize: `${item.FontSize}px` } : {}),
    ...(item.IconWidth
      ? { width: item.IconWidth, height: item.IconHeight || item.IconWidth }
      : {}),
  };
}

// Sub-menu icon: color from SubMenuIconClscolor, size from FontSize
function buildSubIconStyle(item: any): React.CSSProperties {
  if (!item) return {};
  return {
    color: item.SubMenuIconClscolor || item.FontColor || undefined,
    ...(item.FontSize ? { fontSize: `${item.FontSize}px` } : {}),
  };
}

// ─── HoverableRow ─────────────────────────────────────────────────────────────
// Tracks hover locally to apply Hovercolor / activecolor without polluting parent state.

interface HoverableRowProps {
  hoverColor?: string | null;
  activeColor?: string | null;
  isActive?: boolean;
  className: string;
  baseStyle?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
  children: React.ReactNode;
  rowRef?: (el: HTMLDivElement | null) => void;
}

function HoverableRow({
  hoverColor,
  activeColor,
  isActive,
  className,
  baseStyle,
  onClick,
  children,
  rowRef,
}: HoverableRowProps) {
  const [hovered, setHovered] = useState(false);

  const resolvedBg =
    isActive && activeColor
      ? activeColor
      : hovered && hoverColor
        ? hoverColor
        : baseStyle?.backgroundColor || "transparent";

  return (
    <div
      ref={rowRef}
      className={className}
      style={{ ...baseStyle, backgroundColor: resolvedBg }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

// ─── Portal: L1 dropdown (drops below a header tab button) ───────────────────

interface DropdownPortalProps {
  anchorRef: React.RefObject<HTMLButtonElement>;
  children: React.ReactNode;
  onClose: () => void;
  bgColor: string;
}

const DropdownPortal = ({
  anchorRef,
  children,
  onClose,
  bgColor,
}: DropdownPortalProps) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setCoords({
      top: r.bottom + window.scrollY + 2,
      left: r.left + window.scrollX,
    });
  }, [anchorRef]);

  useEffect(() => {
    const onScroll = () => onClose();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      data-hn-portal="l1"
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
        zIndex: 99999,
        background: bgColor,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        minWidth: 240,
        padding: "6px 0",
        animation: "hn-slide-down 0.14s ease",
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

// ─── Portal: L2 flyout (opens to the right of a main-menu row) ───────────────

interface FlyoutPortalProps {
  anchorRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  bgColor: string;
}

const FlyoutPortal = ({ anchorRef, children, bgColor }: FlyoutPortalProps) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setCoords({
      top: r.top + window.scrollY,
      left: r.right + window.scrollX + 4,
    });
  }, [anchorRef]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      data-hn-portal="l2"
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
        zIndex: 99999,
        background: bgColor,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        minWidth: 240,
        padding: "6px 0",
        animation: "hn-slide-right 0.14s ease",
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

// ─── HorizontalNav ─────────────────────────────────────────────────────────────
// Desktop-only horizontal menu bar. Only rendered when DisplayVertical === false.

interface HorizontalNavProps {
  menuItems: any[];
  callBackMenu: () => void;
  headerList: any[];
  onEditMenuItem?: (
    menuId: any,
    mainMenuId: any,
    moduleId: any,
    subMenus?: any[],
  ) => void;
  onEditSubMenu?: (sub: any) => void;
  onAddSubMenu?: (mainMenuId: any, moduleId: any) => void;
  onAddNewMenu?: () => void;
}

export const HorizontalNav = ({
  menuItems,
  callBackMenu,
  headerList,
  onEditMenuItem,
  onEditSubMenu,
  onAddSubMenu,
  onAddNewMenu,
}: HorizontalNavProps) => {
  const [activeHeader, setActiveHeader] = useState<string | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);

  const headerBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const menuItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const dispatch = useDispatch();

  // Parse all style data from sessionStorage once on mount
  const sd = useMemo(() => {
    const data = getMenuData();

    const sidebarBg: string = data?.Menubgcolor || "#0f1923";
    const hoverColor: string = data?.Hovercolor || "";
    const editMode: boolean = isEditMode();

    // MenuHeader name → raw header object
    const headerMap: Record<string, any> = {};
    (data?.MenuHeaders || []).forEach((h: any) => {
      headerMap[h.MenuHeaderName] = h;
    });

    // MainMenuID → raw menuitem; MenuID → raw submenuitem
    const mainMap: Record<string, any> = {};
    const subMap: Record<string, any> = {};
    (data?.menuitems || []).forEach((item: any) => {
      mainMap[String(item.MainMenuID)] = item;
      (item.submenuitems || []).forEach((sub: any) => {
        subMap[String(sub.MenuID)] = sub;
      });
    });

    return {
      data,
      sidebarBg,
      hoverColor,
      editMode,
      headerMap,
      mainMap,
      subMap,
    };
  }, []);

  const { sidebarBg, hoverColor, editMode, headerMap, mainMap, subMap } = sd;

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const t = e.target as Node;
      if (navRef.current?.contains(t)) return;
      for (const p of document.querySelectorAll("[data-hn-portal]")) {
        if (p.contains(t)) return;
      }
      setActiveHeader(null);
      setActiveMenuItem(null);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const closeAll = useCallback(() => {
    setActiveHeader(null);
    setActiveMenuItem(null);
  }, []);

  const getItemsForHeader = useCallback(
    (hName: string): any[] => {
      if (!Array.isArray(menuItems)) return [];
      const needle = hName?.toLowerCase().trim();
      return menuItems.filter((m: any) =>
        [m.MenuHeaderName, m.menuHeaderName, m.HeaderName, m.headerName].some(
          (c) => typeof c === "string" && c.toLowerCase().trim() === needle,
        ),
      );
    },
    [menuItems],
  );

  const handleSubMenuClick = useCallback(
    (sub: any) => {
      closeAll();
      dispatch(setEnableMobileMenu(false));
      if (sub.to) router.push(sub.to);
      callBackMenu?.();
    },
    [dispatch, router, callBackMenu, closeAll],
  );

  const headers: any[] = Array.isArray(headerList) ? headerList : [];

  return (
    <>
      <style>{`
        @keyframes hn-slide-down  {from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes hn-slide-right {from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
        .hn-nav {
          width: 100%;
          background: ${sidebarBg};
          border-bottom: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
          position: sticky;
          top: 0;
          z-index: 1050;
        }
        .hn-bar {
          display: flex;
          align-items: center;
          padding: 0 8px;
          height: 50px;
          gap: 2px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .hn-bar::-webkit-scrollbar { display: none; }
        .hn-header-btn {
          display: flex; align-items: center; gap: 5px;
          background: transparent;
          border: none; border-bottom: 2px solid transparent;
          padding: 6px 12px; cursor: pointer; white-space: nowrap;
          letter-spacing: 0.4px; text-transform: uppercase;
          transition: opacity 0.15s, border-color 0.15s, background 0.15s;
          height: 50px; border-radius: 0;
        }
        .hn-header-btn:hover { opacity: 0.8; }
        .hn-header-btn.hn-active { border-bottom-color: currentColor !important; }
        .hn-chevron {
          font-size: 9px; opacity: 0.55;
          transition: transform 0.2s; display: inline-block; margin-left: 2px;
        }
        .hn-chevron.open { transform: rotate(180deg); }
        .hn-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 4px; flex-shrink: 0; }
        .hn-menu-item {
          display: flex; align-items: center;
          padding: 9px 14px; cursor: pointer; white-space: nowrap;
          gap: 8px; user-select: none; transition: background 0.1s; position: relative;
        }
        .hn-menu-item .hn-icon  { flex-shrink: 0; display: flex; align-items: center; justify-content: center; min-width: 20px; }
        .hn-menu-item .hn-label { flex: 1; }
        .hn-menu-item .hn-arrow { font-size: 9px; opacity: 0.4; flex-shrink: 0; }
        .hn-sub-item {
          display: flex; align-items: center;
          padding: 9px 14px; cursor: pointer; white-space: nowrap;
          gap: 8px; transition: background 0.1s; position: relative;
        }
        .hn-sub-item .hn-icon  { flex-shrink: 0; display: flex; align-items: center; justify-content: center; min-width: 20px; }
        .hn-sub-item .hn-label { flex: 1; }
        .hn-edit-btn {
          display: flex; align-items: center; justify-content: center;
          width: 22px; height: 22px; border-radius: 4px;
          opacity: 0; transition: opacity 0.15s; cursor: pointer; flex-shrink: 0;
          background: rgba(255,255,255,0.1);
        }
        .hn-menu-item:hover .hn-edit-btn,
        .hn-sub-item:hover  .hn-edit-btn { opacity: 1; }
        .hn-add-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; font-size: 12px; font-weight: 600;
          color: #0088ff; cursor: pointer; white-space: nowrap;
          border-top: 1px solid rgba(255,255,255,0.06); margin-top: 4px;
          transition: background 0.1s;
        }
        .hn-add-btn:hover { background: rgba(0,136,255,0.08); }
      `}</style>

      <nav className="hn-nav" ref={navRef}>
        <div className="hn-bar">
          {headers.map((header, idx) => {
            const hName = header.HeaderName as string;
            const isOpen = activeHeader === hName;
            const hRaw = headerMap[hName] || {};
            const itemsForHdr = getItemsForHeader(hName);

            const hTextStyle = buildTextStyle({
              FontColor: hRaw.HeaderFontColor,
              FontSize: hRaw.FontSize,
              FontName: hRaw.FontName,
              IsBold: hRaw.IsBold,
              IsItalic: hRaw.IsItalic,
              IsUnderline: hRaw.IsUnderline,
            });

            const dropdownBg = hRaw.Headerbgcolor || sidebarBg;
            const btnColor = hTextStyle.color || "rgba(255,255,255,0.78)";
            const btnBg = isOpen
              ? hRaw.Headerbgcolor || "rgba(255,255,255,0.06)"
              : "transparent";

            return (
              <Fragment key={String(header.MenuHeaderID ?? idx)}>
                {idx > 0 && <div className="hn-divider" />}

                <button
                  ref={(el) => {
                    headerBtnRefs.current[hName] = el;
                  }}
                  className={`hn-header-btn${isOpen ? " hn-active" : ""}`}
                  style={{
                    color: btnColor,
                    background: btnBg,
                    fontSize: hTextStyle.fontSize || "11px",
                    fontFamily: hTextStyle.fontFamily,
                    fontWeight: hTextStyle.fontWeight || "700",
                    fontStyle: hTextStyle.fontStyle,
                    textDecoration: hTextStyle.textDecoration,
                  }}
                  onClick={() =>
                    setActiveHeader((p) => (p === hName ? null : hName))
                  }
                >
                  {hName}
                  <span className={`hn-chevron${isOpen ? " open" : ""}`}>
                    ▾
                  </span>
                </button>

                {/* ── L1 Dropdown ─────────────────────────────────────── */}
                {isOpen && headerBtnRefs.current[hName] && (
                  <DropdownPortal
                    anchorRef={
                      {
                        current: headerBtnRefs.current[hName],
                      } as React.RefObject<HTMLButtonElement>
                    }
                    onClose={closeAll}
                    bgColor={dropdownBg}
                  >
                    <>
                      {itemsForHdr.map((menuItem: any) => {
                        const mId = String(
                          menuItem.mainMenuId ??
                            menuItem.MainMenuID ??
                            menuItem.label,
                        );
                        const isMenuOpen = activeMenuItem === mId;
                        const subs: any[] =
                          menuItem.subMenu ?? menuItem.content ?? [];
                        const hasSubs = subs.length > 0;

                        // sessionStorage data wins for all style fields
                        const ssItem =
                          mainMap[
                            String(menuItem.mainMenuId ?? menuItem.MainMenuID)
                          ] || {};
                        const merged = { ...menuItem, ...ssItem };

                        const labelStyle = buildTextStyle(merged);
                        const iconStyle = buildMainIconStyle(merged);
                        const activeColor = merged.activecolor || "";

                        return (
                          <div key={mId}>
                            <HoverableRow
                              hoverColor={hoverColor || null}
                              activeColor={activeColor || null}
                              isActive={isMenuOpen && hasSubs}
                              className="hn-menu-item"
                              baseStyle={{
                                color:
                                  labelStyle.color || "rgba(255,255,255,0.85)",
                                backgroundColor:
                                  merged.BgColor || "transparent",
                                fontSize: labelStyle.fontSize,
                                fontFamily: labelStyle.fontFamily,
                                fontWeight: labelStyle.fontWeight,
                                fontStyle: labelStyle.fontStyle,
                                textDecoration: labelStyle.textDecoration,
                              }}
                              rowRef={(el) => {
                                menuItemRefs.current[mId] = el;
                              }}
                              onClick={() => {
                                if (hasSubs) {
                                  setActiveMenuItem((p) =>
                                    p === mId ? null : mId,
                                  );
                                } else {
                                  dispatch(setEnableMobileMenu(false));
                                  if (menuItem.to) router.push(menuItem.to);
                                  closeAll();
                                  callBackMenu?.();
                                }
                              }}
                            >
                              {/* Icon — uses IconClassName (from ss) or menuItem.icon */}
                              {(merged.IconClassName || merged.icon) && (
                                <span
                                  className={`hn-icon ${merged.IconClassName || merged.icon || ""}`}
                                  style={iconStyle}
                                />
                              )}

                              <span
                                className="hn-label"
                                style={{ color: labelStyle.color }}
                              >
                                {menuItem.label}
                              </span>

                              {hasSubs && <span className="hn-arrow">▶</span>}

                              {editMode && (
                                <span
                                  className="hn-edit-btn"
                                  title="Edit menu item"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEditMenuItem?.(
                                      menuItem.menuId,
                                      menuItem.mainMenuId ??
                                        menuItem.MainMenuID,
                                      menuItem.ModuleID,
                                      subs,
                                    );
                                  }}
                                >
                                  <i
                                    className="pe-7s-pen"
                                    style={{
                                      color:
                                        iconStyle.color || labelStyle.color,
                                      fontSize: 13,
                                    }}
                                  />
                                </span>
                              )}
                            </HoverableRow>

                            {/* ── L2 Flyout ──────────────────────────── */}
                            {hasSubs &&
                              isMenuOpen &&
                              menuItemRefs.current[mId] && (
                                <FlyoutPortal
                                  anchorRef={
                                    {
                                      current: menuItemRefs.current[mId],
                                    } as React.RefObject<HTMLDivElement>
                                  }
                                  bgColor={dropdownBg}
                                >
                                  <>
                                    {subs.map((sub: any, si: number) => {
                                      const ssSub =
                                        subMap[
                                          String(sub.menuId ?? sub.MenuID)
                                        ] || {};
                                      const mSub = { ...sub, ...ssSub };

                                      const subLabelStyle =
                                        buildTextStyle(mSub);
                                      const subIconStyle =
                                        buildSubIconStyle(mSub);

                                      return (
                                        <HoverableRow
                                          key={sub.to ?? sub.label ?? si}
                                          hoverColor={hoverColor || null}
                                          activeColor={mSub.activecolor || null}
                                          className="hn-sub-item"
                                          baseStyle={{
                                            color:
                                              subLabelStyle.color ||
                                              "rgba(255,255,255,0.82)",
                                            backgroundColor:
                                              mSub.BgColor || "transparent",
                                            fontSize: subLabelStyle.fontSize,
                                            fontFamily:
                                              subLabelStyle.fontFamily,
                                            fontWeight:
                                              subLabelStyle.fontWeight,
                                            fontStyle: subLabelStyle.fontStyle,
                                            textDecoration:
                                              subLabelStyle.textDecoration,
                                          }}
                                          onClick={() =>
                                            handleSubMenuClick(sub)
                                          }
                                        >
                                          {/* Submenu icon — SubMenuIconClsName or sub.icon */}
                                          {(mSub.SubMenuIconClsName ||
                                            mSub.icon) && (
                                            <span
                                              className={`hn-icon ${mSub.SubMenuIconClsName || mSub.icon || ""}`}
                                              style={subIconStyle}
                                            />
                                          )}

                                          <span
                                            className="hn-label"
                                            style={{
                                              color: subLabelStyle.color,
                                            }}
                                          >
                                            {sub.label}
                                          </span>

                                          {editMode && (
                                            <span
                                              className="hn-edit-btn"
                                              title="Edit submenu item"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onEditSubMenu?.(sub);
                                              }}
                                            >
                                              <i
                                                className="pe-7s-pen"
                                                style={{
                                                  color:
                                                    subIconStyle.color ||
                                                    subLabelStyle.color,
                                                  fontSize: 13,
                                                }}
                                              />
                                            </span>
                                          )}
                                        </HoverableRow>
                                      );
                                    })}

                                    {editMode && (
                                      <div
                                        className="hn-add-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const lastSub = subs[subs.length - 1];
                                          onAddSubMenu?.(
                                            menuItem.mainMenuId ??
                                              menuItem.MainMenuID,
                                            lastSub?.ModuleID,
                                          );
                                        }}
                                      >
                                        + Add Sub Menu
                                      </div>
                                    )}
                                  </>
                                </FlyoutPortal>
                              )}
                          </div>
                        );
                      })}

                      {editMode && (
                        <div
                          className="hn-add-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddNewMenu?.();
                          }}
                        >
                          + Add New Menu
                        </div>
                      )}
                    </>
                  </DropdownPortal>
                )}
              </Fragment>
            );
          })}
        </div>
      </nav>
    </>
  );
};

// ─── ModalWrapper ─────────────────────────────────────────────────────────────

function ModalWrapper({
  recordID,
  moduleID,
  onClose,
}: {
  recordID: string;
  moduleID: string;
  onClose: () => void;
}) {
  return (
    <ModalComponent
      visible={true}
      width={"100%"}
      isfullscreen={true}
      showFooter={false}
      onClose={onClose}
      title="Menu"
      content={() => (
        <AutoCallPage
          recordID={recordID}
          moduleID={moduleID}
          isModalOpen={true}
        />
      )}
    />
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
//
// Routing logic:
//   isMobile (≤991px)            → ALWAYS vertical MetisMenu
//   !isMobile && DisplayVertical → vertical MetisMenu  (+ adds class "nav-mode-vertical" to body)
//   !isMobile && !DisplayVertical → HorizontalNav       (+ adds class "nav-mode-horizontal" to body)
//
// The body class is what the SCSS uses to switch between the two CSS rule sets.

export const Nav = ({ menuItems, callBackMenu, headerList }: any) => {
  const [globalApiCache, setGlobalApiCache] = useState(new Map());
  const [globalCacheTimestamp, setGlobalCacheTimestamp] = useState(new Map());
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isDisplayVertical, setIsDisplayVertical] = useState(false);
  const [modalState, setModalState] = useState<{
    open: boolean;
    recordID: string;
    moduleID: string;
  }>({ open: false, recordID: "0", moduleID: "" });

  const pathName = usePathname();
  const enableMobileMenu = useSelector(
    (state: any) => state?.ThemeOptions?.enableMobileMenu,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    setHydrated(true);

    // Viewport listener
    const mq = window.matchMedia("(max-width: 991px)");
    setIsMobile(mq.matches);
    const mqHandler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", mqHandler);

    // Read DisplayVertical from sessionStorage
    const data = getMenuData();
    setIsDisplayVertical(!!data?.DisplayVertical);

    return () => mq.removeEventListener("change", mqHandler);
  }, []);

  // Keep a body class in sync so SCSS can use it as a toggle switch.
  // nav-mode-vertical  → old vertical sidebar CSS takes effect
  // nav-mode-horizontal → new horizontal CSS takes effect
  useEffect(() => {
    if (!hydrated) return;
    const useVertical = isMobile || isDisplayVertical;
    document.body.classList.toggle("nav-mode-vertical", useVertical);
    document.body.classList.toggle("nav-mode-horizontal", !useVertical);
  }, [hydrated, isMobile, isDisplayVertical]);

  const toggleMobileSidebar = useCallback(() => {
    dispatch(setEnableMobileMenu(!enableMobileMenu));
  }, [dispatch, enableMobileMenu]);

  const openModal = useCallback((recordID: string, moduleID: string) => {
    setModalState({ open: true, recordID, moduleID });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ open: false, recordID: "0", moduleID: "" });
    callBackMenu?.();
    try {
      sessionStorage.removeItem("appsideData");
      sessionStorage.removeItem("headerList");
    } catch {}
  }, [callBackMenu]);

  const handleEditMenuItem = useCallback(
    (_mId: any, mainMenuId: any, moduleId: any) => {
      openModal(String(mainMenuId ?? "0"), String(moduleId ?? ""));
    },
    [openModal],
  );

  const handleEditSubMenu = useCallback(
    (sub: any) => {
      openModal(
        String(sub.menuId ?? sub.MenuID ?? "0"),
        String(sub.ModuleID ?? ""),
      );
    },
    [openModal],
  );

  const handleAddSubMenu = useCallback(
    (_mainMenuId: any, moduleId: any) => {
      openModal("0", String(moduleId ?? ""));
    },
    [openModal],
  );

  const handleAddNewMenu = useCallback(() => {
    const data = getMenuData();
    openModal("0", String(data?.menuitems?.[0]?.ModuleID ?? ""));
  }, [openModal]);

  if (!menuItems?.length) return null;
  if (!hydrated) return null; // prevent SSR/hydration mismatch

  // ── Vertical path (mobile OR DisplayVertical === true) ───────────────────
  if (isMobile || isDisplayVertical) {
    return (
      <Fragment>
        {menuItems?.length > 0 && (
          <MetisMenu
            content={menuItems}
            onSelected={toggleMobileSidebar}
            activeLinkTo={`/${Number(pathName?.split("/")[1])}/${Number(pathName?.split("/")[2])}`}
            className="vertical-nav-menu"
            iconNamePrefix=""
            classNameStateIcon="pe-7s-angle-down"
            callBackMenu={callBackMenu}
            headerList={headerList}
            globalApiCache={globalApiCache}
            setGlobalApiCache={setGlobalApiCache}
            globalCacheTimestamp={globalCacheTimestamp}
            setGlobalCacheTimestamp={setGlobalCacheTimestamp}
            originalMenuData={menuItems}
            menuData={getMenuData()}
          />
        )}
      </Fragment>
    );
  }

  // ── Horizontal path (desktop + DisplayVertical === false) ────────────────
  return (
    <Fragment>
      <HorizontalNav
        menuItems={menuItems}
        callBackMenu={callBackMenu}
        headerList={headerList}
        onEditMenuItem={handleEditMenuItem}
        onEditSubMenu={handleEditSubMenu}
        onAddSubMenu={handleAddSubMenu}
        onAddNewMenu={handleAddNewMenu}
      />

      {modalState.open && (
        <ModalWrapper
          recordID={modalState.recordID}
          moduleID={modalState.moduleID}
          onClose={closeModal}
        />
      )}
    </Fragment>
  );
};
