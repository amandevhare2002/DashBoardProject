"use client";

import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { AdvancedTabs, AdvancedTab as IAdvancedTab } from "./AdvancedTabs";

interface OuterAdvancedTabsProps {
  information: any;
  activeTab: string;
  onTabChange: (tabName: string) => void;
  tabVisibility: { [key: string]: boolean };
  isDrag?: boolean;
}

export function OuterAdvancedTabs({
  information,
  activeTab,
  onTabChange,
  tabVisibility,
  isDrag = false,
}: OuterAdvancedTabsProps) {
  const outerTabType = information?.Data?.[0]?.outertabtype;
  const isUserActionRef = useRef(false);

  const tabs = useMemo((): IAdvancedTab[] => {
    if (!information?.Data) return [];
    return information.Data.filter(
      (dataObj: any) => tabVisibility[dataObj.Tabname] !== false,
    ).map((dataObj: any) => {
      const tabName = dataObj.Tabname;
      const tabIcon = dataObj.clsicon || dataObj.ClsIcon || dataObj.Clsname;
      return {
        id: tabName,
        label: tabName,
        disabled: false,
        icon: tabIcon || undefined,
        _tabStyle: {
          fontColor: dataObj.fontcolor,
          activeColor: dataObj.ActiveColor,
          inactiveColor: dataObj.InActiveColor,
          bgColor: dataObj.Bgcolor,
          isBold: dataObj.Isbold,
          isItalic: dataObj.IsItalic,
          isUnderline: dataObj.IsUnderline,
          hoverColor: dataObj.Hovercolor,
          iconColor: dataObj.clscolor || dataObj.ClsColor,
          icon: tabIcon,
          fontSize: dataObj.FontSize,
        },
        _originalData: dataObj,
      } as IAdvancedTab;
    });
  }, [information?.Data, tabVisibility]);

  const variant = useMemo(() => {
    if (!outerTabType) return "vertical"; // default to vertical for sidebar
    const variantMap: Record<string, any> = {
      underline: "underline",
      pill: "pill",
      slider: "slider",
      vertical: "vertical",
      icon: "icon",
      scroll: "scroll",
      step: "step",
      dropdown: "dropdown",
      nested: "underline", // nested positioning handled by AutoCallPage
      status: "status",
      draggable: "draggable",
      search: "search",
    };
    return variantMap[outerTabType.toLowerCase()] || "vertical";
  }, [outerTabType]);

  const styleProps = useMemo(() => {
    const f = information?.Data?.[0];
    if (!f) return {};
    return {
      activeTab: {
        background: f.ActiveColor,
        color: f.fontcolor,
        borderColor: f.ActivetabBordercolor,
        fontWeight: f.Isbold ? "bold" : "normal",
        fontStyle: f.IsItalic ? "italic" : "normal",
        textDecoration: f.IsUnderline ? "underline" : "none",
        fontSize: f.FontSize ? f.FontSize : undefined,
      } as React.CSSProperties,
      inactiveTab: {
        background: f.InActiveColor,
        color: f.fontcolor,
        fontWeight: f.Isbold ? "bold" : "normal",
      } as React.CSSProperties,
      container: {
        background: f.Bgcolor,
        fontFamily: f.FontName,
      } as React.CSSProperties,
    };
  }, [information?.Data]);

  const [internalActiveId, setInternalActiveId] = useState<string>(activeTab);

  // Sync when parent changes activeTab
  useEffect(() => {
    if (activeTab !== internalActiveId) {
      isUserActionRef.current = false;
      setInternalActiveId(activeTab);
    }
  }, [activeTab]);

  const handleTabChange = useCallback(
    (id: string) => {
      setInternalActiveId(id);
      onTabChange(id);
    },
    [onTabChange],
  );

  if (!tabs.length) return null;

  const f = information?.Data?.[0];

  return (
    <div style={{ fontFamily: f?.FontName || "inherit", width: "100%" }}>
      <AdvancedTabs
        variant={variant}
        tabs={tabs}
        activeId={internalActiveId}
        defaultActiveId={internalActiveId}
        onActiveChange={handleTabChange}
        className="custom-outer-tabs-container"
        styleProps={styleProps}
        closeable={variant === "closeable"}
        reorderable={variant === "draggable"}
        searchable={variant === "search"}
      />
      <style jsx global>{`
        .custom-outer-tabs-container [role="tab"][aria-selected="true"] {
          background-color: ${f?.ActiveColor || ""} !important;
          color: ${f?.fontcolor || ""} !important;
          ${f?.ActivetabBordercolor
            ? `border-color: ${f.ActivetabBordercolor} !important;
               border-width: 2px !important;
               border-style: solid !important;`
            : ""}
          text-decoration: ${f?.IsUnderline ? "underline" : "none"} !important;
          font-weight: ${f?.Isbold ? "bold" : "normal"} !important;
          font-style: ${f?.IsItalic ? "italic" : "normal"} !important;
        }
        .custom-outer-tabs-container [role="tab"]:not([aria-selected="true"]) {
          background-color: ${f?.InActiveColor || ""} !important;
          color: ${f?.fontcolor || ""} !important;
          text-decoration: ${f?.IsUnderline ? "underline" : "none"} !important;
          font-weight: ${f?.Isbold ? "bold" : "normal"} !important;
          font-style: ${f?.IsItalic ? "italic" : "normal"} !important;
        }
        .custom-outer-tabs-container
          [role="tab"]:not([aria-selected="true"]):hover {
          background-color: ${f?.Hovercolor ||
          "rgba(255,255,255,0.1)"} !important;
        }
      `}</style>
    </div>
  );
}
