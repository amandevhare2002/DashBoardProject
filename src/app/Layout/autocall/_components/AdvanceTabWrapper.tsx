"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { AdvancedTabs, AdvancedTab as IAdvancedTab } from "./AdvancedTabs";
import { debounce } from "lodash";

interface DynamicAdvancedTabsProps {
  tabs: Array<{
    id: string | number;
    label: string;
    TabAliasName: string;
    TabType?: string;
    TabBackground?: string;
    DefaultVisible?: boolean;
    disabled?: boolean;
    icon?: string; // For icon variant
    badge?: string | number;
    dot?: boolean;
    online?: boolean;
    closable?: boolean;
    children?: any[]; // For nested tabs
    _originalData?: any; // Original data for reference
  }>;
  activeId: string | number;
  onTabChange: (id: string | number) => void;

  // Style props from backend
  styleProps?: {
    Bgcolor?: string;
    ActiveColor?: string;
    InActiveColor?: string;
    ActivetabBordercolor?: string;
    fontcolor?: string;
    fontname?: string;
    TabBackground?: string;
    fontsize?: string;
    nestdtabsecbgcolor?: string; // For nested tab container background
    Isbold?: boolean; // For font weight
    IsItalic?: boolean; // For font style
    IsUnderline?: boolean; // For text decoration
    Hovercolor?: string; // For hover color
    clsicon?: string;
    clscolor?: string;
  };

  // For advanced features
  closeable?: boolean;
  reorderable?: boolean;
  searchable?: boolean;
  isLoading?: boolean;
}

export function DynamicAdvancedTabs({
  tabs,
  activeId,
  onTabChange,
  styleProps = {},
  closeable = false,
  reorderable = false,
  searchable = false,
  isLoading = false,
}: DynamicAdvancedTabsProps) {
  const [internalActiveId, setInternalActiveId] = useState<string>(
    String(activeId),
  );
  const [processedTabs, setProcessedTabs] = useState<IAdvancedTab[]>([]);

  // Update internal state when prop changes
  useEffect(() => {
    const stringActiveId = String(activeId);
    if (stringActiveId !== internalActiveId) {
      setInternalActiveId(stringActiveId);
    }
  }, [activeId]);

  // In DynamicAdvancedTabs component, update the advancedTabs memo:
  const advancedTabs = useMemo((): IAdvancedTab[] => {
    const filteredTabs = tabs.filter((tab) => tab.DefaultVisible !== false);

    return filteredTabs.map((tab, index) => {
      const tabId = String(tab.id || index);

      // Get tab-specific data from _originalData
      const tabOriginalData = tab._originalData || {};
      const tabValues = tabOriginalData.Values?.[0] || {};

      // Use tab-specific icon (from clsicon or ClsIcon)
      const tabIcon = tab.icon || tabValues.clsicon || tabValues.ClsIcon;

      // Get tab-specific formatting
      const tabFontColor = tabValues.fontcolor || styleProps.fontcolor;
      const tabIsBold = tabValues.Isbold || styleProps.Isbold;
      const tabIsItalic = tabValues.IsItalic || styleProps.IsItalic;
      const tabIsUnderline = tabValues.IsUnderline || styleProps.IsUnderline;

      return {
        _originalData: tabOriginalData,
        id: tabId,
        label: tab.TabAliasName || tab.label || `Tab ${index + 1}`,
        disabled: tab.disabled || tab.DefaultVisible === false,
        icon: tabIcon ? tabIcon : undefined,
        badge: tab.badge,
        dot: tab.dot,
        online: tab.online,
        closable: tab.closable ?? closeable,

        // Store tab-specific styling
        _tabStyle: {
          // Icon color can be provided via clscolor (backend) or fontcolor
          iconColor: tabValues.clscolor || styleProps.clscolor || tabFontColor,
          fontColor: tabFontColor,
          activeColor: tabValues.ActiveColor || styleProps.ActiveColor,
          inactiveColor: tabValues.InActiveColor || styleProps.InActiveColor,
          bgColor: tabValues.Bgcolor || styleProps.Bgcolor,
          background: tabValues.TabBackground || styleProps.TabBackground,
          borderColor:
            tabValues.ActivetabBordercolor || styleProps.ActivetabBordercolor,
          isBold: tabIsBold,
          isItalic: tabIsItalic,
          isUnderline: tabIsUnderline,
          hoverColor: tabValues.Hovercolor || styleProps.Hovercolor,
          icon: tabIcon,
        },

        children: tab.children,
        searchText: tab.TabAliasName,
      };
    });
  }, [tabs, styleProps, closeable]);
  // Update processed tabs only when advancedTabs actually changes
  useEffect(() => {
    setProcessedTabs(advancedTabs);
  }, [advancedTabs]);

  // Determine variant based on TabType
  const getVariant = useCallback((tabType?: string): any => {
    if (!tabType) return "underline"; // Default variant

    const variantMap: Record<string, any> = {
      underline: "underline",
      pill: "pill",
      slider: "slider",
      vertical: "vertical",
      icon: "icon",
      scroll: "scroll",
      step: "step",
      dropdown: "dropdown",
      closeable: "closeable",
      nested: "nested",
      status: "status",
      draggable: "draggable",
      search: "search",
    };

    const variant = variantMap[tabType.toLowerCase()] || "underline";
    return variant;
  }, []);

  // Get variant from first tab's TabType
  const variant = useMemo(() => {
    return getVariant(tabs[0]?.TabType);
  }, [tabs, getVariant]);

  // Handle tab change
  const handleTabChange = useCallback(
    (id: string) => {
      onTabChange(id); // call directly, no debounce
    },
    [onTabChange],
  );

  const customStyles = useMemo(() => {
    return {
      // Active tab styles
      activeTab: {
        background: styleProps.ActiveColor,
        color: styleProps.clscolor || styleProps.fontcolor,
        borderColor: styleProps.ActivetabBordercolor,
        fontWeight: styleProps.Isbold ? "bold" : "normal",
        fontStyle: styleProps.IsItalic ? "italic" : "normal",
        textDecoration: styleProps.IsUnderline ? "underline" : "none",
        fontSize: styleProps.fontsize,
      },
      // Inactive tab styles
      inactiveTab: {
        background: styleProps.InActiveColor,
        color: styleProps.fontcolor,
        fontWeight: styleProps.Isbold ? "bold" : "normal",
        fontStyle: styleProps.IsItalic ? "italic" : "normal",
        textDecoration: styleProps.IsUnderline ? "underline" : "none",
      },
      // Container styles
      container: {
        background: styleProps.Bgcolor,
        fontFamily: styleProps.fontname,
      },
      // Nested container background
      nestedContainer: {
        background: styleProps.nestdtabsecbgcolor,
      },
      // Hover styles
      hoverStyles: {
        hoverColor: styleProps.Hovercolor,
      },
    };
  }, [styleProps]);
  // Don't render if no tabs
  if (!processedTabs.length) {
    return (
      <div className="p-4 text-center text-gray-500">No tabs available</div>
    );
  }

  return (
    <div style={{ fontFamily: styleProps.fontname || "inherit" }}>
      <AdvancedTabs
        key={`tabs-${processedTabs.length}-${variant}`}
        variant={variant}
        tabs={processedTabs}
        activeId={internalActiveId}
        onActiveChange={handleTabChange}
        closeable={closeable || variant === "closeable"}
        reorderable={reorderable || variant === "draggable"}
        searchable={searchable || variant === "search"}
        className="custom-tabs-container"
        // Pass custom style props
        styleProps={customStyles}
      />
      {/* Custom CSS to override default styles with backend props */}
      <style jsx global>{`
        .custom-tabs-container {
          --active-bg: ${styleProps.ActiveColor};
          --active-text: ${styleProps.fontcolor};
          --inactive-bg: ${styleProps.InActiveColor};
          --inactive-text: ${styleProps.fontcolor};
          --border-color: ${styleProps.ActivetabBordercolor};
          --font-family: ${styleProps.fontname};
          --font-size: ${styleProps.fontsize};
          --nested-bg: ${styleProps.nestdtabsecbgcolor};
          --hover-color: ${styleProps.Hovercolor};
          --font-weight: ${styleProps.Isbold ? "bold" : "normal"};
          --font-style: ${styleProps.IsItalic ? "italic" : "normal"};
          --text-decoration: ${styleProps.IsUnderline ? "underline" : "none"};

          font-family: var(--font-family) !important;
          background-color: var(--nested-bg, var(--bg-color)) !important;
        }

        /* Override active tab styles */
        .custom-tabs-container [role="tab"][aria-selected="true"] {
          background-color: var(--active-bg) !important;
          color: var(--active-text) !important;
          border: 2px solid var(--border-color) !important;
          font-weight: var(--font-weight) !important;
          font-style: var(--font-style) !important;
          text-decoration: var(--text-decoration) !important;
        }

        /* Override inactive tab styles */
        .custom-tabs-container [role="tab"]:not([aria-selected="true"]) {
          background-color: var(--inactive-bg) !important;
          color: var(--inactive-text) !important;
          border: 1px solid transparent !important;
          font-weight: var(--font-weight) !important;
          font-style: var(--font-style) !important;
          text-decoration: var(--text-decoration) !important;
        }
        .custom-tabs-container [role="tab"]:not([aria-selected="true"]):hover {
          background-color: var(
            --hover-color,
            rgba(255, 255, 255, 0.05)
          ) !important;
        }

        /* Loading state */
        .custom-tabs-container .animate-spin {
          border-top-color: transparent;
          border-right-color: transparent;
          border-bottom-color: var(--active-text);
          border-left-color: var(--active-text);
        }
      `}</style>
    </div>
  );
}
