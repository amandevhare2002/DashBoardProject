import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Card,
  CardBody,
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Modal,
  ModalBody,
} from "reactstrap";
import {
  Box,
  Checkbox,
  CircularProgress,
  Drawer,
  FormControlLabel,
  List,
  ListItem,
  Popover,
} from "@mui/material";
import { FaSave } from "react-icons/fa";
import AutoCallPage from "@/app/Layout/autocall";
import AsyncSelect from "react-select/async";
import ReactDatePicker from "react-datepicker";
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import HtmlContentModal from "./htmlContent";

// Utility functions
function clsx(...a: any[]) {
  return a.filter(Boolean).join(" ");
}
function downloadBlob(filename: string, mime: string, data: any) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (m) =>
      (
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }) as any
      )[m],
  );
}

// Badge component for status
function Badge({
  tone,
  children,
}: {
  tone: "success" | "warn" | "danger" | "neutral";
  children: React.ReactNode;
}) {
  const map: any = {
    success: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    neutral: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        map[tone || "neutral"],
      )}
    >
      {children}
    </span>
  );
}

// Sort icon component
function SortIcon({ active, desc }: { active: any; desc?: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      className={clsx(active ? (desc ? "rotate-180" : "") : "opacity-30")}
      viewBox="0 0 24 24"
    >
      <path fill="currentColor" d="M7 14l5-5 5 5z" />
    </svg>
  );
}

// Add these interfaces to your existing interfaces section
interface ApplyToAllState {
  [columnId: string]: {
    enabled: boolean;
    value: any;
    originalFilterValue?: any;
  };
}

interface ButtonConfig {
  ButtonID: number;
  Buttonname: string;
  buttoncolor?: string;
  buttonfontcolor?: string;
  buttonshape?: string;
  buttonfontsize?: string;
  buttonfontname?: string;
  ButtonURL?: string;
  iconcls?: string;
  iconclscolor?: string;
  visibility?: boolean;
  buttonFields?: any[];
  handler?: (button: any, row?: any) => void; // Dynamic handler function
  condition?: (state: any) => boolean; // Condition to show/enable button
  tooltip?: string; // Tooltip text
}

interface NewTableProps {
  TableArray: any[];
  columns?: any[];
  title?: string;
  editingRow?: boolean;
  handleSaveChanges?: any;
  editBtn?: boolean;
  setEditBtn?: (edit: boolean) => void;
  isLoading?: boolean;
  handleSaveData?: any;
  height?: string;
  tableFooter?: any[];
  moduleID?: string;
  buttonID?: string;
  handleTableLinkClick?: (
    recordID: string,
    moduleID: string,
    defaultVisible?: any,
  ) => void;
  menuID?: string;
  IsDetailPopupOpen?: boolean;
  onChangeInput?: any;
  promiseOptions?: any;
  dropDownArray?: any[];
  onInputChange?: any;
  reportData?: any;
  loadingDropdown?: boolean;
  defaultTabSelected?: any;
  defaultVisible?: any;
  field?: any;
  information?: any;
  onSelectionChanged?: (selectedRows: any[]) => void;
  selectedRows?: any[];
  filename?: string;
  // ischeckBoxReq?: boolean;
  logo?: any;
  tableproperty?: any;
  insideBorder?: boolean;
  outsideBorder?: boolean;
  tableFormatting?: any;
  orientation?: any;
  headerRows?: any[];
  footerRows?: any[];
  tableheaderfooterCSS?: any;
  onSelectedColumnsChange?: (selectedColumns: string[]) => void;
  userEmail?: string;
  tablebuttons?: any[]; // Add tablebuttons prop
  uploadedFiles?: any[]; // Add uploadedFiles prop
  setUploadedFiles?: (files: any[]) => void; // Add setUploadedFiles prop
  currentRecordID?: string; // Add currentRecordID prop
  fieldID?: string;
  onTableDataUpdate?: (updatedData: any[], fieldID?: string) => void;
  tableBtnInfo?: any[];
  isPagination?: boolean;
  pageitemscnt?: number;
  columnOrder?: string[];
  onLinkClick?: (rowData: any) => void;
  isFreezeHeader?: boolean;
  isEditMode?: boolean; // Add this prop
  onEditModeChange?: (isEditMode: boolean) => void;
  updatedPersonalDetails?: any;
  saveData?: any;
  popupdrawersettings?: any;
  autopopupdrawer?: any;
  setTableMetadata?: any;
  setSaveData?: any;
}

interface LinkModalData {
  htmlContent: string;
  title?: string;
}

interface Logo {
  LogoURL: string;
  Align: "LEFT" | "CENTER" | "RIGHT";
  Height: string;
  Width: string;
}

interface Column {
  name: string;
  omit?: boolean;
}

interface DataItem {
  [key: string]: any;
}

interface HistoryState {
  rows: any[];
  selected: Record<string, boolean>;
  selectedRows: any[];
  editedValues?: Record<string, Record<string, any>>;
}

const NewTablePage: React.FC<NewTableProps> = ({
  TableArray = [],
  columns = [],
  title,
  editBtn,
  setEditBtn,
  isLoading,
  handleSaveData,
  tableFooter,
  moduleID,
  handleTableLinkClick,
  menuID,
  IsDetailPopupOpen,
  onChangeInput,
  promiseOptions,
  dropDownArray = [],
  onInputChange,
  reportData,
  loadingDropdown,
  defaultVisible,
  information,
  onSelectionChanged,
  filename,
  // ischeckBoxReq = false,
  logo,
  tableproperty,
  insideBorder,
  outsideBorder,
  tableFormatting,
  orientation,
  headerRows = [],
  footerRows = [],
  tableheaderfooterCSS,
  onSelectedColumnsChange,
  userEmail,
  tablebuttons = [], // Default to empty array
  uploadedFiles = [], // Default to empty array
  setUploadedFiles, // Optional function
  currentRecordID, // Optional
  fieldID,
  onTableDataUpdate,
  field,
  tableBtnInfo,
  isPagination,
  pageitemscnt,
  isFreezeHeader,
  isEditMode: externalEditMode = false, // New prop
  onEditModeChange,
  updatedPersonalDetails,
  saveData,
  popupdrawersettings,
  autopopupdrawer,
  setTableMetadata,
  setSaveData,
}) => {
  const tableInstanceKey = useMemo(() => {
    return `table_${moduleID}_${fieldID}_${field?.FieldID}_${JSON.stringify(
      columns?.map((c) => c.name),
    )}`;
  }, [moduleID, fieldID, field?.FieldID, columns]);
  const ischeckBoxReq = useMemo(() => {
    const value = sessionStorage.getItem("isCheckBoxReq");
    // Convert string to boolean properly
    return value === "true"; // Only true if string is exactly "true"
  }, []);
  // Load saved selection state BEFORE initializing rows
  useEffect(() => {
    // Try to load saved selection from localStorage
    try {
      const saved = localStorage.getItem(`${tableInstanceKey}_selectedRows`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedTime = parsed._timestamp || 0;
        const currentTime = Date.now();

        // Keep selection for longer (e.g., 2 hours instead of 30 minutes)
        if (currentTime - savedTime < 2 * 60 * 60 * 1000) {
          const savedRows = parsed.rows || [];
          setSelectedRows(savedRows);

          // Sync the selected state with saved rows
          const newSelected: Record<string, boolean> = {};
          savedRows.forEach((row: any) => {
            if (row.id) {
              newSelected[row.id] = true;
            }
          });
          setSelected(newSelected);
        }
      }
    } catch (error) {
      console.error("Error loading saved selected rows:", error);
    }
  }, [tableInstanceKey]);

  const [rows, setRows] = useState<any[]>(() => {
    // Try to load from localStorage first for persistence
    try {
      const saved = localStorage.getItem(tableInstanceKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if saved data is still valid (not too old)
        const savedTime = parsed._timestamp || 0;
        const currentTime = Date.now();
        // Keep data for 30 minutes
        if (currentTime - savedTime < 30 * 60 * 1000) {
          return parsed.rows || [];
        }
      }
    } catch (error) {
      console.error("Error loading saved rows:", error);
    }

    // Initialize from TableArray
    if (TableArray && TableArray.length > 0) {
      return TableArray.map((row, index) => ({
        ...row,
        id: row.id || `row_${index}_${Date.now()}`,
        __originalIndex: index,
        __isFromTableArray: true,
      }));
    }

    return [];
  });
  const [cols, setCols] = useState<any[]>([]);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<any>({
    q: "",
    role: "",
    status: "",
    amountMin: "",
    amountMax: "",
    dateFrom: "",
    dateTo: "",
  });
  const [sortState, setSortState] = useState<{ id: string; desc: boolean }[]>(
    [],
  );
  const [editing, setEditing] = useState<{
    id: string;
    field: string;
    value: any;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageitemscnt || 10);
  const [virtualize, setVirtualize] = useState(false);
  const [qLive, setQLive] = useState("");
  // Per-column filters (keyed by column id)
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSavingColumns, setIsSavingColumns] = useState(false);
  const [columnDropdownData, setColumnDropdownData] = useState<
    Record<string, any[]>
  >({});
  const [loadingColumnDropdown, setLoadingColumnDropdown] = useState<
    Record<string, boolean>
  >({});

  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const dragIndex = useRef<number | null>(null);
  const resizing = useRef<any>(null);
  const [snapX, setSnapX] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const btnId = sessionStorage.getItem("buttonID");
  const [modifiedRows, setModifiedRows] = useState<Record<string, any>>({});
  const [editedValues, setEditedValues] = useState<
    Record<string, Record<string, any>>
  >({});
  const [localEditMode, setLocalEditMode] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const [newRows, setNewRows] = useState<any[]>([]);
  const [tableButtons, setTableButtons] = useState<any[]>([]);
  const [originalColumnOrder, setOriginalColumnOrder] = useState<string[]>([]);
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);
  const [selectedHtmlContent, setSelectedHtmlContent] = useState<string>("");
  const [htmlModalTitle, setHtmlModalTitle] = useState<string>("");
  const isUpdatingRef = useRef(false);
  const lastUpdateTimeRef = useRef(0);

  const [replaceDrawerOpen, setReplaceDrawerOpen] = useState(false);
  const [replaceButtonData, setReplaceButtonData] = useState<any>(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [applyFirstCellMode, setApplyFirstCellMode] = useState<{
    enabled: boolean;
    columnId: string | null;
    value: any;
    rowId: string | null;
  }>({
    enabled: false,
    columnId: null,
    value: null,
    rowId: null,
  });

  // Add state to track edited cell
  const [recentlyEditedCell, setRecentlyEditedCell] = useState<{
    columnId: string | null;
    rowId: string | null;
    value: any;
  } | null>(null);
  const [applyColumnData, setApplyColumnData] = useState<{
    columnId: string | null;
    originalValue: any;
    newValue: any;
  } | null>(null);

  const [selectedRows, setSelectedRows] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(`${tableInstanceKey}_selectedRows`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedTime = parsed._timestamp || 0;
        const currentTime = Date.now();

        if (currentTime - savedTime < 30 * 60 * 1000) {
          if (currentTime - savedTime < 30 * 60 * 1000) {
            return parsed.rows || [];
          }
        }
      }
    } catch (error) {
      console.error("Error loading saved selected rows:", error);
    }

    return [];
  });

  console.log("Initial selected rows:", selectedRows);

  const loadSavedSelection = (): Record<string, boolean> => {
    try {
      const saved = localStorage.getItem(`${tableInstanceKey}_selection`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedTime = parsed._timestamp || 0;
        const currentTime = Date.now();

        if (currentTime - savedTime < 30 * 60 * 1000) {
          return parsed.selected || {};
        }
      }
    } catch (error) {
      console.error("Error loading saved selection:", error);
    }

    return {};
  };
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    return loadSavedSelection();
  });
  console.log("Initial selected:", selected);

  useEffect(() => {
    // When selected changes, update selectedRows to match
    const selectedIds = Object.keys(selected).filter((id) => selected[id]);
    const newSelectedRows = rows.filter((row) => selectedIds.includes(row.id));

    // Only update if there's a mismatch
    if (
      JSON.stringify(newSelectedRows.map((r) => r.id)) !==
      JSON.stringify(selectedRows.map((r) => r.id))
    ) {
      setSelectedRows(newSelectedRows);

      // Save to localStorage
      try {
        localStorage.setItem(
          `${tableInstanceKey}_selectedRows`,
          JSON.stringify({
            rows: newSelectedRows,
            _timestamp: Date.now(),
          }),
        );
      } catch (error) {
        console.error("Error saving selected rows:", error);
      }

      // Notify parent
      if (onSelectionChanged) {
        onSelectionChanged(newSelectedRows);
      }
    }
  }, [selected, rows]);

  useEffect(() => {
    const saveRows = () => {
      try {
        // Only save if we have rows
        if (rows.length > 0) {
          const dataToSave = {
            rows: rows.map((r) => ({
              ...r,
              // Remove temporary properties that shouldn't be persisted
              __isFromTableArray: undefined,
            })),
            _timestamp: Date.now(),
          };
          localStorage.setItem(tableInstanceKey, JSON.stringify(dataToSave));
        }
      } catch (error) {
        console.error("Error saving rows:", error);
      }
    };

    // Debounce the save to prevent too many writes
    const timer = setTimeout(saveRows, 500);
    return () => clearTimeout(timer);
  }, [rows, tableInstanceKey]);

  // Add this useEffect to process the tableBtnInfo prop
  useEffect(() => {
    if (tableBtnInfo && Array.isArray(tableBtnInfo)) {
      // Filter buttons based on visibility
      const visibleButtons = tableBtnInfo.filter(
        (btn) => btn.visibility !== false,
      );
      setTableButtons(visibleButtons);
    }
  }, [tableBtnInfo]);

  useEffect(() => {
    if (isPagination && pageitemscnt) {
      setPageSize(pageitemscnt);
    } else {
      setPageSize(10);
    }
    setPage(1);
  }, [isPagination, pageitemscnt]);

  // Create a helper function to get button styles based on tableBtnInfo
  const getButtonStyle = (
    buttonName: string,
    buttonConfig: any = null,
    isDisabled = false,
  ) => {
    // Find button config if not provided
    const btnConfig =
      buttonConfig ||
      tableButtons.find(
        (btn) => btn.Buttonname.toLowerCase() === buttonName.toLowerCase(),
      );

    if (!btnConfig) {
      return {
        color: "#FFFFFF",
        backgroundColor: "#007bff",
        borderRadius: "4px",
        opacity: isDisabled ? 0.6 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
      };
    }

    // Special styling based on button name
    if (buttonName === "Add Row") {
      if (selectedRows.length > 0) {
        return {
          color: "#FFFFFF",
          backgroundColor: "#28a745",
          borderRadius: "4px",
          opacity: 1,
          cursor: "pointer",
          border: "none",
          padding: "6px 12px",
          fontSize: "14px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          transition: "all 0.2s ease",
          boxShadow: "0 2px 4px rgba(40, 167, 69, 0.3)",
          "&:hover": {
            opacity: 0.9,
            transform: "translateY(-1px)",
          },
        };
      }
    }

    // Handle button shape
    let borderRadius = "4px";
    if (btnConfig.buttonshape === "ROUNDED") {
      borderRadius = "8px";
    } else if (btnConfig.buttonshape === "CIRCLE") {
      borderRadius = "50%";
    } else if (btnConfig.buttonshape === "PILL") {
      borderRadius = "9999px";
    }

    return {
      color: btnConfig.buttonfontcolor || "#FFFFFF",
      backgroundColor: isDisabled
        ? "#6c757d"
        : btnConfig.buttoncolor || "#007bff",
      borderRadius: borderRadius,
      opacity: isDisabled ? 0.6 : 1,
      cursor: isDisabled ? "not-allowed" : "pointer",
      border: "none",
      padding: "6px 12px",
      fontSize: `${btnConfig.buttonfontsize}px` || "14px",
      fontFamily: btnConfig.buttonfontname || "inherit",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      transition: "all 0.2s ease",
      iconcls: btnConfig.iconcls,
      iconclscolor: btnConfig.iconclscolor,
      "&:hover": !isDisabled
        ? {
            opacity: 0.9,
            transform: "translateY(-1px)",
          }
        : {},
    };
  };
  // Helper function to render icon with color
  const renderButtonIcon = (buttonConfig: any) => {
    if (!buttonConfig?.iconcls) return null;

    // You can use react-icons or any other icon library
    // This is a simple example - adjust based on your icon system
    const iconStyle = {
      color:
        buttonConfig.iconclscolor || buttonConfig.buttonfontcolor || "#FFFFFF",
      marginRight: "4px",
      fontSize: buttonConfig.buttonfontsize,
    };

    // If using Font Awesome or similar with class names
    return <i className={buttonConfig.iconcls} style={iconStyle} />;

    // Alternative: If you need to map to specific components
    // const IconComponent = iconMap[buttonConfig.iconcls];
    // return IconComponent ? <IconComponent style={iconStyle} /> : null;
  };
  // Helper function to create a deep copy of rows
  const createSnapshot = (rowsData: any[]): any[] => {
    return rowsData.map((row) => ({ ...row }));
  };

  // Save current state to history
  const saveToHistory = (state: HistoryState) => {
    const snapshot: HistoryState = {
      rows: createSnapshot(state.rows),
      selected: { ...state.selected },
      selectedRows: [...state.selectedRows],
      editedValues: state.editedValues ? { ...state.editedValues } : undefined,
    };

    // If we're not at the latest history index, remove future states
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setFuture([]); // Clear redo stack when new action is performed

    // Limit history size (optional)
    if (newHistory.length > 50) {
      setHistory(newHistory.slice(1));
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      const currentState = {
        rows: rows,
        selected: { ...selected },
        selectedRows: [...selectedRows],
        editedValues: { ...editedValues },
      };

      // Save current state to future (redo) stack
      setFuture((prev) => [currentState, ...prev]);

      setRows(previousState.rows);
      setSelected(previousState.selected);
      setSelectedRows(previousState.selectedRows);
      if (previousState.editedValues) {
        setEditedValues(previousState.editedValues);
      }

      setHistoryIndex((prev) => prev - 1);

      toast.info("Undo performed", { style: { marginTop: 40 } });
    } else {
      toast.info("Nothing to undo", { style: { marginTop: 40 } });
    }
  };

  // Redo function
  const handleRedo = () => {
    if (future.length > 0) {
      const nextState = future[0];
      const currentState = {
        rows: rows,
        selected: { ...selected },
        selectedRows: [...selectedRows],
        editedValues: { ...editedValues },
      };

      // Save current state to history
      const newHistory = [...history.slice(0, historyIndex + 1), currentState];

      // Apply next state from future
      setRows(nextState.rows);
      setSelected(nextState.selected);
      setSelectedRows(nextState.selectedRows);
      if (nextState.editedValues) {
        setEditedValues(nextState.editedValues);
      }

      setFuture((prev) => prev.slice(1));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      toast.info("Redo performed", { style: { marginTop: 40 } });
    } else {
      toast.info("Nothing to redo", { style: { marginTop: 40 } });
    }
  };

  // 6. Memoize the rows data
  const memoizedRows = useMemo(() => rows, [JSON.stringify(rows)]);
  useEffect(() => {
    if (!TableArray || TableArray.length === 0) {
      return;
    }

    // Create a map of existing rows by their original IDs
    const existingRowsMap = new Map();
    rows.forEach((r) => {
      if (r.__originalIndex !== undefined) {
        existingRowsMap.set(r.__originalIndex, r);
      }
      // Also track by actual ID if available
      if (r.id && !r.id.startsWith("new_")) {
        existingRowsMap.set(`id_${r.id}`, r);
      }
    });

    // Track which rows are currently selected
    const currentlySelectedIds = Object.keys(selected).filter(
      (id) => selected[id],
    );

    const mergedRows = TableArray.map((row, index) => {
      const originalRowId = row.id || `row_${index}_${Date.now()}`;

      // Try to find existing row by originalIndex or ID
      let existingRow = existingRowsMap.get(index);
      if (!existingRow && row.id) {
        existingRow = existingRowsMap.get(`id_${row.id}`);
      }

      if (existingRow) {
        // Check if this row was selected
        const wasSelected = selected[existingRow.id];

        // Create new row object preserving selection and edits
        const newRow = {
          ...existingRow,
          // Update with any new data from TableArray (preserve user edits)
          ...Object.fromEntries(
            Object.keys(row)
              .filter(
                (key) =>
                  !key.startsWith("__") && existingRow[key] === undefined,
              )
              .map((key) => [key, row[key]]),
          ),
        };

        // If this row was selected, update the selected state
        if (wasSelected) {
          console.log(
            `Row ${existingRow.id} was selected, preserving selection`,
          );
        }

        return newRow;
      } else {
        // Create new row from TableArray
        return {
          ...row,
          id: originalRowId,
          __originalIndex: index,
          __isFromTableArray: true,
        };
      }
    });

    // Add any new rows that aren't in TableArray (user-added rows)
    const newRowsNotInTableArray = rows.filter(
      (r) =>
        !r.__isFromTableArray &&
        !r.id?.startsWith("row_") &&
        !mergedRows.some((mr) => mr.id === r.id),
    );

    const allRows = [...mergedRows, ...newRowsNotInTableArray];

    // IMPORTANT: Preserve selection state when updating rows
    const newSelected: Record<string, boolean> = { ...selected };
    const newSelectedRows: any[] = [];

    // Rebuild selectedRows array based on current selection state and merged rows
    allRows.forEach((row) => {
      if (newSelected[row.id]) {
        newSelectedRows.push(row);
      }
    });
    // Only update if there's an actual difference
    if (JSON.stringify(allRows) !== JSON.stringify(rows)) {
      setRows(allRows);

      // Update selectedRows if needed (but keep selection state intact)
      if (JSON.stringify(newSelectedRows) !== JSON.stringify(selectedRows)) {
        setSelectedRows(newSelectedRows);
        if (onSelectionChanged) {
          onSelectionChanged(newSelectedRows);
        }
      }

      // Make sure selection state is still saved to localStorage
      try {
        localStorage.setItem(
          `${tableInstanceKey}_selection`,
          JSON.stringify({
            selected: newSelected,
            _timestamp: Date.now(),
          }),
        );
      } catch (error) {
        console.error("Error saving selection after TableArray sync:", error);
      }
    } else {
      console.log("No changes in rows, skipping update");
    }
  }, [TableArray]); // Only depend on TableArray prop
  const generateStableRowId = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `new_${timestamp}_${random}_${moduleID}_${fieldID}`;
  }, [moduleID, fieldID]);

  // Calculate the number of edited rows
  const editedRowsCount = useMemo(() => {
    return Object.keys(editedValues).length;
  }, [editedValues]);

  // Or if you need to count individual cell edits across all rows:
  const totalEditsCount = useMemo(() => {
    let count = 0;
    Object.values(editedValues).forEach((rowEdits) => {
      count += Object.keys(rowEdits).length;
    });
    return count;
  }, [editedValues]);

  // Update buttonHandlers - remove Save and Replace from here since they'll be handled by the new logic
  const buttonHandlers: Record<string, (button: any, row?: any) => void> = {
    Export: () => setExportOpen(!exportOpen),
    "Add Row": () => handleAddNewRow(),
    "Open List": (event: any) => setAnchorEl(event.currentTarget),
    Edit: () => {
      setLocalEditMode(true);
      if (setEditBtn) {
        setEditBtn(true);
      }
      toast.info("Table is now editable", {
        style: { marginTop: "50px" },
      });
    },
    "Cancel Edit": () => handleCancelEdit(),
    // Remove Save and Replace from here - they'll be handled by backend buttons logic
    Undo: () => handleUndo(),
    Redo: () => handleRedo(),
  };

  // Update buttonConditions - remove Save and Replace
  const buttonConditions: Record<string, (state: any) => boolean> = {
    Edit: () => !localEditMode && !isLoading,
    "Cancel Edit": () => localEditMode,
    Undo: () => historyIndex > 0,
    Redo: () => future.length > 0,
  };

  // Update buttonTooltips - remove Save
  const buttonTooltips: Record<string, string> = {
    "Add Row":
      selectedRows.length > 0
        ? `Duplicate ${selectedRows.length} selected row(s) at the top (Ctrl+D)`
        : "Add a blank row at the top",
    Export: "Export table data in various formats",
    Edit: "Enable editing mode",
    "Cancel Edit": "Cancel all edits and revert changes",
    Undo: "Undo last action (Ctrl+Z)",
    Redo: "Redo last undone action (Ctrl+Y)",
  };

  // In NewTablePage.tsx - Add these functions before the return statement

  // Function to handle UpdateDynamicFieldsValuesNew API
  const handleSubmitAPI = async (button: any) => {
    try {
      // Get the field data from saveData
      const fieldData: any[] = [];
      const fieldDataFromState = updatedPersonalDetails || [];

      // Check if we have a specific table field we're working with
      const tableField = field?.buttonFields || [];

      // If button has buttonFields, use those specific fields
      if (button.buttonFields && button.buttonFields.length > 0) {
        fieldDataFromState.forEach((tab: any) => {
          tab?.Values?.forEach((res: any) => {
            button.buttonFields.forEach((btnField: any) => {
              if (
                Number(res.FieldID) === Number(btnField.FieldID) &&
                saveData[res.FieldName]
              ) {
                fieldData.push({
                  FieldID: res.FieldID,
                  FieldName: res.FieldName,
                  FieldValue: saveData[res.FieldName] || "",
                  Colname: res.Colname || "",
                  IsMain: res.IsMainCol || false,
                });
              }
            });
          });
        });
      } else {
        // If no buttonFields, collect all fields from current tab
        const currentTab = fieldDataFromState[0];
        if (currentTab?.Values) {
          currentTab.Values.forEach((res: any) => {
            if (
              !["BUTTON", "UPLOAD", "TABLE", "CHART"].includes(res.FieldType)
            ) {
              fieldData.push({
                FieldID: res.FieldID,
                FieldName: res.FieldName,
                FieldValue: saveData[res.FieldName] || res.FieldValue || "",
                Colname: res.Colname || "",
                IsMain: res.IsMainCol || false,
              });
            }
          });
        }
      }

      // Collect selected table data if any
      const selectedTableData = collectSelectedTableData();

      const payload = {
        Userid: localStorage.getItem("username"),
        ModuleID: menuID || moduleID ? Number(menuID || moduleID) : 0,
        Operation: "UPDATE",
        fieldsDatanew: fieldData,
      };

      // Add table data if exists
      if (selectedTableData && selectedTableData.length > 0) {
        payload.tabledata = selectedTableData;
      }

      const result = await axios.post(button.ButtonURL, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (
        result.data?.Resp?.toLowerCase() === "success" ||
        result.status === 200
      ) {
        toast.success("Data saved successfully!", {
          position: "top-right",
          autoClose: 2000,
          style: { top: "50px" },
        });

        // Clear edited values after successful save
        setEditedValues({});
        setModifiedRows({});

        return result.data;
      } else {
        throw new Error(result.data?.Resp || "Failed to save data");
      }
    } catch (error: any) {
      console.error("Submit API Error:", error);
      toast.error(
        error?.response?.data?.Message ||
          error.message ||
          "Failed to save data",
        {
          position: "top-right",
          autoClose: 3000,
          style: { top: "50px" },
        },
      );
      throw error;
    }
  };

  // Function to handle AutoCall API
  const handleAutoCallAPI = async (button: any) => {
    try {
      // Get the PostedJson data from saveData using the field IDs
      const postedJson: any[] = [];
      const fieldData = information?.Data || [];

      // Collect data from all fields
      if (fieldData && fieldData.length > 0) {
        fieldData.forEach((dataObj: any) => {
          if (dataObj?.Fields && dataObj.Fields.length > 0) {
            dataObj.Fields.forEach((fieldGroup: any) => {
              if (fieldGroup?.Values && fieldGroup.Values.length > 0) {
                fieldGroup.Values.forEach((field: any) => {
                  // Check if this field ID is in the button's buttonFields array
                  const isInButtonFields = button.buttonFields?.some(
                    (btnField: any) =>
                      Number(btnField.FieldID) === Number(field.FieldID),
                  );

                  if (isInButtonFields) {
                    // Try to get the field value from multiple sources
                    const fieldValue =
                      saveData[field.FieldName] ||
                      field.FieldValue ||
                      field.defaultValue ||
                      "";

                    postedJson.push({
                      FieldID: field.FieldID,
                      FieldName: field.FieldName,
                      FieldValue: fieldValue,
                    });
                  }
                });
              }
            });
          }
        });
      }
      // Store the data for the drawer
      setReplaceButtonData({
        buttonId: button.ButtonID,
        moduleID: menuID || moduleID,
        recordID: button.ButtonID.toString(), // Use ButtonID as recordID
        postedJson: postedJson,
        apiUrl: button.ButtonURL,
      });

      // Open the drawer
      setReplaceDrawerOpen(true);

      toast.success("Opening form...", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error: any) {
      console.error("AutoCall API Error:", error);
      toast.error(error?.response?.data?.Message || "Failed to open form", {
        position: "top-right",
        autoClose: 3000,
        style: { top: "50px" },
      });
      throw error;
    }
  };

  // Function to handle PostDynamic API
  const handlePostDynamicAPI = async (button: any) => {
    try {
      // Build payload similar to buttonField component
      const newArray: any = [];

      // Get field data from updatedPersonalDetails
      updatedPersonalDetails?.forEach((resData: any) => {
        resData?.Values?.forEach((res: any) => {
          button.buttonFields?.forEach((response: any) => {
            if (
              Number(res.FieldID) === response.FieldID &&
              saveData[res.FieldName]
            ) {
              newArray.push({
                FieldID: res.FieldID,
                FieldName: res.FieldName,
                FieldValue: saveData[res.FieldName],
              });
            }
          });
        });
      });

      if (newArray.length === 0) {
        toast.error("No valid field data found for this button!", {
          style: { top: 80 },
        });
        return;
      }

      // Validate mandatory fields if needed
      if (button.IsConfirmCheck) {
        const { confirmed } = await confirm({
          title: "Are you sure?",
        });
        if (!confirmed) return;
      }

      const payload = {
        Userid: localStorage.getItem("username"),
        ModuleID: menuID || moduleID,
        PostedJson: newArray,
        ButtonID: button.ButtonID,
      };

      const result = await axios.post(button.ButtonURL, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      // Handle response
      if (result.data) {
        // Update table metadata if needed
        if (result.data.FieldID || result.data.Table || result.data.ChartData) {
          setTableMetadata({
            isDetailPopupOpen: result.data.IsDetailPopupOpen || false,
            moduleID: result.data.Table?.[0]?.ModuleID || null,
            fieldID: result.data.FieldID || null,
            defaultVisible: result.data.DefaultTabSelected || null,
            tablebuttons: result.data.tablebuttons || null,
            tableWidth: result.data.TableWidth || null,
            ischeckBoxReq: result.data.IscheckBoxReq || null,
            headerData: result.data.HeaderData || null,
            footerData: result.data.FooterData || null,
            filename: result.data.Filename || null,
            logo: result.data.logo || null,
            tableproperty: result.data.tableproperty || null,
            outsideBorder: result.data.outsideBorder || null,
            insideBorder: result.data.InsideBorder || null,
            orientation: result.data.Orientation || null,
            tableFormatting: result.data.TableFormatting || null,
            headerRows: result.data.HeaderRows || null,
            footerRows: result.data.FooterRows || null,
            tableheaderfooterCSS: result.data || null,
            pageitemscnt: result.data.Pageitemscnt || null,
            isPagination: result.data.IsPagination || null,
            chartData: result.data.ChartData || null,
            chartIds: result.data.Chartids || null,
            isFreezeHeader: result.data.IsFreezeHeader || null,
            popupdrawersettings: result.data.Popupdrawersettings || null,
          });
        }

        // Update table data if present
        if (result.data.Table && result.data.FieldID) {
          const newUpdatedDetails = updatedPersonalDetails
            ? [...updatedPersonalDetails]
            : [];
          const fieldID = result.data.FieldID;

          newUpdatedDetails.forEach((tab) => {
            if (tab?.Values && Array.isArray(tab.Values)) {
              tab.Values.forEach((fieldItem: any) => {
                if (fieldItem?.FieldID == fieldID) {
                  fieldItem.buttonFields = result.data.Table || [];
                  fieldItem.TableData = result.data.Table || [];
                }
              });
            }
          });

          // Update parent if onTableDataUpdate is available
          if (onTableDataUpdate) {
            onTableDataUpdate(result.data.Table, fieldID);
          }
        }

        // Update fields if present
        if (result.data.fields) {
          result.data.fields.forEach((field: any) => {
            // Update saveData if we have it
            if (setSaveData) {
              setSaveData((prev: any) => ({
                ...prev,
                [field.FieldName]: field.Value,
              }));
            }
          });
        }

        toast.success(result.data.Message || "Success", {
          style: { top: 80 },
        });
      }
    } catch (error: any) {
      console.error("PostDynamic API Error:", error);
      toast.error(error?.response?.data?.Message || "An error occurred", {
        style: { top: 80 },
      });
      throw error;
    }
  };

  // Update the renderDynamicButton function to handle the new API calls
  const renderDynamicButton = (button: any) => {
    const buttonName = button.Buttonname;
    const handler = buttonHandlers[buttonName];
    const condition = buttonConditions[buttonName];
    const tooltip = buttonTooltips[buttonName] || button.Buttonname;

    // Check if this is a special system button that should use existing handlers
    const isSystemButton = [
      "Export",
      "Add Row",
      "Open List",
      "Edit",
      "Cancel Edit",
      "Undo",
      "Redo",
    ].includes(buttonName);

    // Skip if it's a system button with existing handler
    if (isSystemButton) {
      const isDisabled = condition
        ? !condition({
            localEditMode,
            isLoading,
            totalEditsCount,
            historyIndex,
            future,
            selectedRows,
          })
        : false;

      // Special handling for Export button
      if (buttonName === "Export") {
        return (
          <ButtonDropdown
            key={button.ButtonID}
            isOpen={exportOpen}
            toggle={() => setExportOpen(!exportOpen)}
            title={tooltip}
          >
            <DropdownToggle
              caret
              style={{
                ...getButtonStyle(buttonName, button),
                minWidth: "auto",
                padding: "6px 12px",
              }}
            >
              {renderButtonIcon(button)}
              {buttonName}
            </DropdownToggle>
            <DropdownMenu style={{ minWidth: "150px" }}>
              <DropdownItem
                onClick={() => convertToPDF(logo, headerRows, footerRows)}
              >
                as PDF
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={convertToExcel}>as Excel</DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={convertToCSV}>as CSV</DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={exportJSON}>as JSON</DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={exportXML}>as XML</DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={convertToDocx}>as Word(DOCX)</DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={printView}>Print View</DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
        );
      }

      // Special handling for Add Row button
      if (buttonName === "Add Row") {
        return (
          <div className="flex gap-2">
            {selectedRows.length > 0 && (
              <Button
                style={{
                  borderRadius: "8px",
                }}
                color="primary"
                onClick={() => {
                  handler && handler(button);
                }}
              >
                {renderButtonIcon(button)} + Duplicate ({selectedRows.length})
                <span
                  style={{ fontSize: "10px", opacity: 0.8, marginLeft: "4px" }}
                >
                  Ctrl+D
                </span>
              </Button>
            )}
            <Button
              key={button.ButtonID}
              type="button"
              color={selectedRows.length > 0 ? "success" : "primary"}
              onClick={() => handler && handler(button)}
              style={getButtonStyle(buttonName, button, false)}
              title={tooltip}
            >
              {renderButtonIcon(button)} {buttonName}
            </Button>
          </div>
        );
      }

      // Special handling for Save button - but only if it's the system Save, not API Save
      if (buttonName === "Save" && !button.ButtonURL) {
        return (
          <Button
            key={button.ButtonID}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handler && handler(button);
            }}
            disabled={isDisabled}
            style={getButtonStyle(buttonName, button, isDisabled)}
            title={tooltip}
          >
            {isLoading ? (
              <CircularProgress size={16} />
            ) : (
              <>
                {" "}
                {renderButtonIcon(button)}
                <FaSave />
                {buttonName} {totalEditsCount > 0 ? `(${totalEditsCount})` : ""}
              </>
            )}
          </Button>
        );
      }

      // Default system button rendering
      return (
        <Button
          key={button.ButtonID}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handler && handler(e);
          }}
          disabled={isDisabled}
          style={getButtonStyle(buttonName, button, isDisabled)}
          title={tooltip}
        >
          {" "}
          {renderButtonIcon(button)}
          {buttonName === "Undo"
            ? "Undo"
            : buttonName === "Redo"
              ? "Redo"
              : buttonName}
        </Button>
      );
    }

    // For backend buttons with API URLs
    const handleBackendButtonClick = async () => {
      if (buttonLoading) return;

      setButtonLoading(true);

      try {
        // Check if ButtonURL is provided
        if (!button.ButtonURL) {
          toast.error("No API URL configured for this button", {
            style: { top: 80 },
          });
          return;
        }

        // Check for confirmation if needed
        if (button.IsConfirmCheck) {
          const { confirmed } = await confirm({
            title: "Are you sure?",
          });
          if (!confirmed) {
            setButtonLoading(false);
            return;
          }
        }

        // Determine which API to call based on flags
        if (button.IsAutocall) {
          await handleAutoCallAPI(button);
        } else if (button.IsSubmitAPI) {
          await handleSubmitAPI(button);
        } else if (button.IsPostDynamic) {
          await handlePostDynamicAPI(button);
        } else {
          // Default: treat as PostDynamic if URL is provided but no specific flag
          await handlePostDynamicAPI(button);
        }
      } catch (error) {
        console.error(`Error executing button ${button.Buttonname}:`, error);
      } finally {
        setButtonLoading(false);
      }
    };

    return (
      <Button
        key={button.ButtonID}
        onClick={handleBackendButtonClick}
        disabled={buttonLoading}
        style={{
          ...getButtonStyle(button.Buttonname, button, buttonLoading),
          position: "relative",
        }}
        title={tooltip}
      >
        {buttonLoading ? (
          <>
            <CircularProgress
              size={16}
              style={{
                color: getButtonStyle(button.Buttonname, button).color,
                marginRight: "8px",
              }}
            />
            Processing...
          </>
        ) : (
          <>
            {renderButtonIcon(button)}
            {button.Buttonname}
          </>
        )}
      </Button>
    );
  };
  const handleCancelEdit = () => {
    if (!localEditMode) {
      toast.info("Table is not in edit mode", { style: { marginTop: 20 } });
      return;
    }

    // Check if there are unsaved changes
    const hasUnsavedChanges = editedRowsCount > 0;

    if (hasUnsavedChanges) {
      // Show confirmation for unsaved changes
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to cancel?",
        )
      ) {
        performCancelEdit();
      }
    } else {
      performCancelEdit();
    }
  };

  const performCancelEdit = () => {
    // Clear all edited values
    setEditedValues({});

    // Reset to original data
    if (TableArray && TableArray.length > 0) {
      setRows(
        TableArray.map((row, index) => ({
          ...row,
          id: row.id || `row_${index}`,
          __originalIndex: index,
        })),
      );
    }

    // Exit edit mode
    setLocalEditMode(false);
    if (setEditBtn) {
      setEditBtn(false);
    }

    // Clear selections
    setSelectedRows([]);
    setSelected({});

    toast.info("Edit mode cancelled - All changes reverted", {
      style: { marginTop: 40 },
    });
  };

  // In NewTablePage - Fix the table type detection
  const isUploadedFilesTable = useMemo(() => {
    if (!uploadedFiles || uploadedFiles.length === 0) return false;

    const firstRow = uploadedFiles[0];
    // More specific check for uploaded files table
    return (
      firstRow &&
      ((firstRow.FileLink !== undefined && firstRow.Filename !== undefined) ||
        (firstRow.Dellink !== undefined && firstRow.Approvelink !== undefined))
    );
  }, [uploadedFiles]);

  // Add this to properly detect if it's a regular data table
  const isRegularDataTable = useMemo(() => {
    return tablebuttons && tablebuttons.length > 0 && !isUploadedFilesTable;
  }, [tablebuttons, isUploadedFilesTable]);
  // In NewTablePage component - fix the selection logic
  const handleRowSelection = (rowId: string, isSelected: boolean) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;

    let newSelectedRows: any[];

    if (isSelected) {
      // Add row to selection
      newSelectedRows = [...selectedRows, row];
    } else {
      // Remove row from selection
      newSelectedRows = selectedRows.filter((r) => r.id !== rowId);
    }

    setSelectedRows(newSelectedRows);
    setSelected((prev) => ({ ...prev, [rowId]: isSelected }));

    // Notify parent component about selection changes
    if (onSelectionChanged) {
      onSelectionChanged(newSelectedRows);
    }
  };

  const handleSelectAllPage = (isSelected: boolean) => {
    let newSelectedRows: any[];

    if (isSelected) {
      // Add all visible rows to selection
      const newRows = renderRows.filter(
        (r) => !selectedRows.some((sr) => sr.id === r.id),
      );
      newSelectedRows = [...selectedRows, ...newRows];
    } else {
      // Remove all visible rows from selection
      newSelectedRows = selectedRows.filter(
        (sr) => !renderRows.some((r) => r.id === sr.id),
      );
    }

    setSelectedRows(newSelectedRows);

    // Update individual selection state
    const newSelection: Record<string, boolean> = { ...selected };
    renderRows.forEach((r) => {
      newSelection[r.id] = isSelected;
    });
    setSelected(newSelection);

    // Notify parent
    if (onSelectionChanged) {
      onSelectionChanged(newSelectedRows);
    }
  };

  // Add useEffect to sync with external selectedRows prop
  useEffect(() => {
    if (selectedRows && selectedRows !== selectedRows) {
      const newSelection: Record<string, boolean> = {};
      selectedRows.forEach((row: any) => {
        if (row.id) {
          newSelection[row.id] = true;
        }
      });
      setSelected(newSelection);
      setSelectedRows(selectedRows);
    }
  }, [selectedRows]);

  // Initialize selected options based on tableFooter IsDisplay property
  const [selectedOptions, setSelectedOptions] = useState<string[]>(() => {
    if (tableFooter && tableFooter.length > 0) {
      return tableFooter
        .filter((footer: any) => footer.IsDisplay)
        .map((footer: any) => footer.Fieldname);
    }
    return columns && columns.length > 0
      ? columns.map((col: any) => col.name)
      : [];
  });

  useEffect(() => {
    if (typeof onSelectedColumnsChange === "function") {
      onSelectedColumnsChange(selectedOptions);
    }
  }, [selectedOptions]);

  const getColumnConfig = (columnName: string) => {
    // Try to find the config in reportData.columnsArray first
    // const fromReport = reportData?.columnsArray?.find(
    //   (data: any) => data?.columnName === columnName || data?.Fieldname === columnName
    // );
    // if (fromReport) return fromReport;

    // Fallback: some configs may come from tableFooter (Fieldname)
    if (Array.isArray(tableFooter)) {
      const fromFooter = tableFooter.find(
        (f: any) => f?.Fieldname === columnName || f?.columnName === columnName,
      );
      if (fromFooter) return fromFooter;
    }

    return undefined;
  };

  const handleColumnFilterChange = (colId: string, value: any) => {
    setColumnFilters((prev) => ({ ...prev, [colId]: value }));
    // reset to first page when filters change
    setPage(1);
  };

  const fetchDropdownData = async (
    columnName: string,
    searchText: string = "",
  ) => {
    const columnConfig = getColumnConfig(columnName);
    if (!columnConfig) return [];

    try {
      setLoadingColumnDropdown((prev) => ({ ...prev, [columnName]: true }));

      const data = {
        Userid: localStorage.getItem("username"),
        Dbname: columnConfig?.ReadDBName,
        Tabname: columnConfig?.ReadtableName,
        Colname: columnConfig?.ReadcolumnName,
        ServerName: columnConfig?.ReadServerName,
        SearchText: searchText,
      };

      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetDistinctValues",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res?.data?.colvalues) {
        const options = res.data.colvalues.map((value: any) => ({
          value: value.Colvalue,
          label: value.Colvalue,
        }));

        setColumnDropdownData((prev) => ({
          ...prev,
          [columnName]: options,
        }));

        return options;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching dropdown values for ${columnName}:`, error);
      return [];
    } finally {
      setLoadingColumnDropdown((prev) => ({ ...prev, [columnName]: false }));
    }
  };

  const shouldShowActionsColumn = useMemo(() => {
    return tablebuttons && tablebuttons.length > 0 && !isUploadedFilesTable;
  }, [tablebuttons, isUploadedFilesTable]);

  // In NewTablePage component - Update the useEffect that initializes columns

  // Replace the useEffect that initializes columns with this:
  useEffect(() => {
    // Determine the source of column definitions
    const sourceCols =
      columns && columns.length > 0
        ? columns
        : field && field.tableFooter && field.tableFooter.length > 0
          ? field.tableFooter
          : [];

    if (sourceCols && sourceCols.length > 0) {
      let newCols: any[] = [];

      // Handle special case: when TableArray has data, use its keys in the order they appear
      if (TableArray && TableArray.length > 0) {
        const firstRow = TableArray[0];

        // Create a function to preserve the order of keys as they appear in the JSON
        const getKeysInOriginalOrder = (obj: any): string[] => {
          const keys: string[] = [];

          // Use Object.getOwnPropertyNames to get all enumerable and non-enumerable properties
          const allKeys = Object.getOwnPropertyNames(obj);

          // Sort keys to handle mixed numeric/string keys properly
          // But we need to preserve the order they were sent
          // We'll check if keys look like they should be in a specific order
          const hasNumericKeys = allKeys.some((key) => /^\d{4}$/.test(key));

          if (hasNumericKeys) {
            // Separate numeric and non-numeric keys
            const numericKeys = allKeys.filter((key) => /^\d{4}$/.test(key));
            const stringKeys = allKeys.filter((key) => !/^\d{4}$/.test(key));

            // Sort numeric keys in descending order (if they're years)
            numericKeys.sort((a, b) => parseInt(b) - parseInt(a));

            // Combine: string keys first, then sorted numeric keys
            // But for your case, you want numeric keys in original order
            // Let's check the first row to determine order
            const originalOrder = Object.keys(firstRow);

            // Use the order from the first row if it looks sensible
            if (originalOrder.length > 0) {
              // Check if first key is "Code"
              if (originalOrder[0] === "Code") {
                return originalOrder;
              }
              // Otherwise use a more predictable order
              return [...stringKeys, ...numericKeys.sort()];
            }
          }

          // Default: return keys in the order they were received
          return Object.keys(obj);
        };

        const orderedKeys = getKeysInOriginalOrder(firstRow);

        newCols = orderedKeys
          .filter(
            (key) =>
              !key.startsWith("__") &&
              key !== "id" &&
              key !== "select" &&
              key !== "actions",
          )
          .map((key, index) => {
            // Find matching column configuration
            const colConfig = sourceCols.find(
              (col: any) =>
                col.name === key ||
                col.field === key ||
                col.Fieldname === key ||
                col.ColumnName === key,
            );

            return {
              id: key,
              label:
                colConfig?.label ||
                colConfig?.name ||
                colConfig?.Fieldname ||
                key,
              width: 150,
              pin: index === 0 ? "left" : undefined,
              // Preserve original column config
              ...colConfig,
            };
          });
      } else {
        // Fallback to original logic when no TableArray data
        newCols = sourceCols.map((col: any, index: number) => ({
          id: col.name || col.field || col.Fieldname || `col_${index}`,
          label: col.name || col.Fieldname || "Unnamed",
          width: 150,
          pin: index === 0 ? "left" : undefined,
          ...col,
        }));
      }

      // ALWAYS add selection column if ischeckBoxReq is true
      if (ischeckBoxReq === true) {
        const hasSelectCol = newCols.some((col: any) => col.id === "select");
        if (!hasSelectCol) {
          newCols.unshift({
            id: "select",
            label: "",
            width: 36,
            pin: "left",
          });
        }
      }

      // Check if Actions column already exists
      const hasExistingActionsColumn = newCols.some(
        (col: any) => col.id === "actions" || col.label === "Actions",
      );

      // Add Actions column ONLY for regular tables with buttons
      if (shouldShowActionsColumn && !hasExistingActionsColumn) {
        newCols.push({
          id: "actions",
          label: "Actions",
          width: 200,
          pin: undefined,
        });
      }

      setCols(newCols);

      // Prefetch dropdown data for DROPDOWN columns
      newCols.forEach((c: any) => {
        const inputType = c.Inputtype || c.inputType || c.InputType || c.type;
        if (inputType === "DROPDOWN") {
          fetchDropdownData(c.id || c.name || c.Fieldname).catch(() => {});
        }
      });

      // Initialize visibility
      const initialVisible: Record<string, boolean> = {};
      newCols.forEach((col: any) => {
        if (col.id === "select" || col.id === "actions") {
          initialVisible[col.id] = true;
        } else {
          const footerItem = tableFooter?.find(
            (footer: any) =>
              footer.Fieldname === col.id ||
              footer.ColumnName === col.id ||
              footer.name === col.id,
          );
          initialVisible[col.id] = footerItem ? footerItem.IsDisplay : true;
        }
      });
      setVisible(initialVisible);
    }
  }, [
    columns,
    ischeckBoxReq,
    tableFooter,
    shouldShowActionsColumn,
    TableArray,
  ]);

  // Initialize rows from TableArray
  useEffect(() => {
    if (TableArray && TableArray.length > 0) {
      // Merge incoming TableArray with any pending editedValues so edits aren't lost
      const mapped = TableArray.map((row, index) => {
        const id = row.id || `row_${index}`;
        const base = { ...row, id, __originalIndex: index };
        const edits = editedValues[id];
        if (!edits) return base;
        const merged = { ...base };
        Object.keys(edits).forEach((k) => {
          if (k === "__originalData") return;
          merged[k] = edits[k];
        });
        return merged;
      });

      setRows(mapped);
    }
  }, [TableArray]);
  // In NewTablePage.tsx - add this useEffect
  useEffect(() => {
    if (TableArray && TableArray.length === 0) {
      setRows([]);
      setCols([]);
    }
  }, [TableArray]);
  // Update selected options when columns change
  useEffect(() => {
    const visibleCols = cols
      .filter((col) => col.id !== "select" && visible[col.id] !== false)
      .map((col) => col.id);
    setSelectedOptions(visibleCols);
  }, [cols, visible]);

  // Filter visible columns
  const visibleCols = useMemo(() => {
    return cols.filter((col) => visible[col.id] !== false);
  }, [cols, visible]);

  // Handle search with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f: any) => ({ ...f, q: qLive }));
    }, 250);
    return () => clearTimeout(t);
  }, [qLive]);

  // Filter rows based on filters
  const filteredRows = useMemo(() => {
    const q = (filters.q || "").trim().toLowerCase();

    // Combine existing rows and new rows
    const allRows = [...rows];

    return allRows.filter((r) => {
      if (q) {
        const searchableText = Object.values(r).join(" ").toLowerCase();
        if (!searchableText.includes(q)) return false;
      }

      // Add additional filter logic here based on your needs
      if (filters.role && r.role !== filters.role) return false;
      if (filters.status && r.status !== filters.role) return false;

      // Apply per-column filters
      for (const [colId, fVal] of Object.entries(columnFilters)) {
        if (fVal === undefined || fVal === null) continue;
        // treat empty strings as no-filter
        if (typeof fVal === "string" && fVal.trim() === "") continue;

        const cellRaw = r[colId] ?? "";
        const cell = String(cellRaw).toLowerCase();

        // Date range filter format 'YYYY-MM-DD|YYYY-MM-DD'
        if (typeof fVal === "string" && fVal.includes("|")) {
          const [start, end] = fVal.split("|").map((s) => s.trim());
          if (start && end) {
            const cellDate = cellRaw ? moment(cellRaw) : null;
            if (!cellDate || !cellDate.isValid()) return false;
            const sDate = moment(start, "YYYY-MM-DD");
            const eDate = moment(end, "YYYY-MM-DD");
            if (
              !cellDate.isBetween(
                sDate.startOf("day"),
                eDate.endOf("day"),
                undefined,
                "[]",
              )
            )
              return false;
            continue;
          }
        }

        // Dropdown may provide object { value, label }
        if (typeof fVal === "object") {
          const fv = (fVal.value ?? fVal.label ?? "").toString().toLowerCase();
          if (fv && !cell.includes(fv)) return false;
          continue;
        }

        // Default substring match for textbox/box
        if (typeof fVal === "string") {
          if (!cell.includes(fVal.toLowerCase())) return false;
        }
      }

      return true;
    });
  }, [rows, filters, newRows, columnFilters]);
  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortState.length) return filteredRows;
    const order = [...sortState];

    return [...filteredRows].sort((a: any, b: any) => {
      for (const s of order) {
        const av = a[s.id],
          bv = b[s.id];
        if (av === bv) continue;
        if (av > bv) return s.desc ? -1 : 1;
        if (av < bv) return s.desc ? 1 : -1;
      }
      return 0;
    });
  }, [filteredRows, sortState]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil((sortedRows?.length || 0) / pageSize),
  );
  const pageSafe = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    return (sortedRows || []).slice(
      (pageSafe - 1) * pageSize,
      pageSafe * pageSize,
    );
  }, [sortedRows, pageSafe, pageSize]);

  // Virtualization
  const rowH = 40;

  // Always call this hook to respect React hooks rules. It accepts an `enabled`
  // flag so callers can decide whether to actually perform virtualization logic.
  function useSimpleVirtual(
    enabled: boolean,
    count: number,
    rowHeight: number,
    ref: React.RefObject<HTMLDivElement>,
  ) {
    const [range, setRange] = useState({
      start: 0,
      end: 0,
      padTop: 0,
      padBottom: 0,
    });

    useEffect(() => {
      if (!enabled) {
        setRange({ start: 0, end: 0, padTop: 0, padBottom: 0 });
        return;
      }

      const el = ref.current;
      if (!el) return;

      function update() {
        const st = el.scrollTop;
        const vh = el.clientHeight;
        const start = Math.max(0, Math.floor(st / rowHeight) - 5);
        const vis = Math.ceil(vh / rowHeight) + 10;
        const end = Math.min(count, start + vis);
        setRange({
          start,
          end,
          padTop: start * rowHeight,
          padBottom: (count - end) * rowHeight,
        });
      }

      update();
      el.addEventListener("scroll", update, { passive: true });

      const ro = (window as any).ResizeObserver
        ? new (window as any).ResizeObserver(update)
        : null;
      ro?.observe(el);

      return () => {
        el.removeEventListener("scroll", update);
        ro?.disconnect?.();
      };
    }, [enabled, count, rowHeight, ref]);

    return range;
  }

  const virt = useSimpleVirtual(
    virtualize,
    sortedRows.length,
    rowH,
    tableWrapRef, // <-- was containerRef
  );
  // When virtualize is enabled via the toggle, this displays all the rows
  const renderRows = virtualize
    ? sortedRows.slice(virt.start, virt.end)
    : pageRows;

  // switch to the first page and expand pageSize so all rows are visible if needed.
  const handleVirtualizeToggle = () => {
    setVirtualize((prev) => {
      const next = !prev;
      if (!next) {
        // Restore a sensible page size when turning off
        setPageSize(pageitemscnt || 10);
        setPage(1);
      }
      // Do NOT change pageSize when turning ON — keep whatever the user selected
      return next;
    });
  };

  // Selection helpers
  const allPageSelected = useMemo(() => {
    return (
      sortedRows.length > 0 && sortedRows.every((r: any) => selected[r.id])
    );
  }, [sortedRows, selected]);

  // Update the handleTableButtonClick function:
  const handleTableButtonClick = async (button: any, row: any) => {
    // Check if row is selected
    const isRowSelected = selectedRows.some(
      (selectedRow) => selectedRow.id === row.id,
    );
    if (!isRowSelected) {
      toast.error("Please select this row first to perform the action!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      // Prepare the data for the API call - handle column name mapping
      const buttonFieldsData = button.columnnames.map((col: any) => {
        // Try different possible column name formats
        let value = "";

        // Try exact match first
        if (row[col.Colname] !== undefined) {
          value = row[col.Colname];
        }
        // Try with VC_ prefix
        else if (row[`VC_${col.Colname}`] !== undefined) {
          value = row[`VC_${col.Colname}`];
        }
        // Try case-insensitive match
        else {
          const matchingKey = Object.keys(row).find(
            (key) => key.toLowerCase() === col.Colname.toLowerCase(),
          );
          if (matchingKey) {
            value = row[matchingKey];
          }
        }

        return {
          FieldName: col.Colname,
          FieldValue: value || "",
        };
      });

      const payload = [...buttonFieldsData];

      // Get buttonID from multiple possible sources
      const effectiveButtonID = fieldID || button.ButtonID || 0;

      const data = {
        Userid: localStorage.getItem("username"),
        ModuleID: menuID || moduleID,
        PostedJson: payload,
        ButtonID: effectiveButtonID,
      };
      // Make the API call
      const result = await axios.post(button.APIURL, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (result?.data) {
        toast.success(
          result?.data?.Message || "Action completed successfully",
          {
            style: { top: 80 },
          },
        );

        // Refresh the table data if needed
        if (setUploadedFiles && isUploadedFilesTable) {
          setUploadedFiles(result.data.files || uploadedFiles);
        }
      }
    } catch (error: any) {
      console.error("API Error:", error);
      console.error("Error details:", error.response?.data);
      toast.error(
        error?.response?.data?.Message || error?.message || "An error occurred",
        {
          style: { top: 80 },
        },
      );
    }
  };

  const handleUploadedFileAction = async (actionUrl: string, row: any) => {
    if (!actionUrl || !setUploadedFiles) return;

    try {
      const data = {
        Userid: localStorage.getItem("username"),
        RecordID: currentRecordID || 0,
        ModuleID: menuID || moduleID,
      };

      const result = await axios.post(actionUrl, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (result?.data) {
        setUploadedFiles(result.data.files || []);
        toast.success("Action completed successfully", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.Message || "An error occurred", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    // Clean up selected rows that no longer exist in the current data
    const validSelectedRows = selectedRows.filter((selectedRow) =>
      rows.some((row) => {
        // Use a more reliable ID matching
        const rowId = row.id || row.app_id || row.__originalIndex;
        const selectedId =
          selectedRow.id || selectedRow.app_id || selectedRow.__originalIndex;
        return rowId === selectedId;
      }),
    );

    if (validSelectedRows.length !== selectedRows.length) {
      setSelectedRows(validSelectedRows);
      if (onSelectionChanged) {
        onSelectionChanged(validSelectedRows);
      }
    }
  }, [rows]);

  // In NewTablePage.tsx - Update toggleRow function
  const toggleRow = (rowId: string) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;

    const isCurrentlySelected = selected[rowId];
    let newSelectedRows: any[];

    // Check if this row has edits
    const rowEdits = editedValues[rowId];
    const rowWithEdits = rowEdits ? { ...row, ...rowEdits } : row;

    if (isCurrentlySelected) {
      // Remove row from selection
      newSelectedRows = selectedRows.filter((r) => r.id !== rowId);
    } else {
      // Add row WITH EDITS to selection
      newSelectedRows = [...selectedRows, rowWithEdits];
    }

    // Save to history BEFORE making changes
    saveToHistory({
      rows: rows,
      selected: { ...selected },
      selectedRows: [...selectedRows],
    });

    // Update both states
    setSelectedRows(newSelectedRows);
    const newSelected = { ...selected, [rowId]: !isCurrentlySelected };
    setSelected(newSelected);

    // Save to localStorage
    try {
      localStorage.setItem(
        `${tableInstanceKey}_selection`,
        JSON.stringify({
          selected: newSelected,
          _timestamp: Date.now(),
        }),
      );

      localStorage.setItem(
        `${tableInstanceKey}_selectedRows`,
        JSON.stringify({
          rows: newSelectedRows,
          _timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error("Error saving selection:", error);
    }

    // Notify parent
    if (onSelectionChanged) {
      onSelectionChanged(newSelectedRows);
    }
  };
  // Update toggleAllPage function
  const toggleAllPage = () => {
    const on = !allPageSelected;

    // Save current state to history BEFORE making changes
    saveToHistory({
      rows: rows,
      selected: { ...selected },
      selectedRows: [...selectedRows],
    });

    if (on) {
      // Select ALL sorted rows (not just page rows)
      const allRowsSelection: Record<string, boolean> = {};
      const allSelectedRows: any[] = [];

      sortedRows.forEach((row: any) => {
        // Check if this row has edits
        const rowEdits = editedValues[row.id];
        const rowWithEdits = rowEdits ? { ...row, ...rowEdits } : row;

        allRowsSelection[row.id] = true;
        allSelectedRows.push(rowWithEdits);
      });

      // Update both states
      setSelected(allRowsSelection);
      setSelectedRows(allSelectedRows);

      // Save to localStorage
      try {
        localStorage.setItem(
          `${tableInstanceKey}_selection`,
          JSON.stringify({
            selected: allRowsSelection,
            _timestamp: Date.now(),
          }),
        );

        localStorage.setItem(
          `${tableInstanceKey}_selectedRows`,
          JSON.stringify({
            rows: allSelectedRows,
            _timestamp: Date.now(),
          }),
        );
      } catch (error) {
        console.error("Error saving selection:", error);
      }

      // Notify parent with ALL selected rows
      if (onSelectionChanged) {
        onSelectionChanged(allSelectedRows);
      }
    } else {
      // Deselect all rows
      const emptySelection = {};
      setSelected(emptySelection);
      setSelectedRows([]);

      // Save to localStorage
      try {
        localStorage.setItem(
          `${tableInstanceKey}_selection`,
          JSON.stringify({
            selected: emptySelection,
            _timestamp: Date.now(),
          }),
        );

        localStorage.setItem(
          `${tableInstanceKey}_selectedRows`,
          JSON.stringify({
            rows: [],
            _timestamp: Date.now(),
          }),
        );
      } catch (error) {
        console.error("Error saving selection:", error);
      }

      // Notify parent with empty array
      if (onSelectionChanged) {
        onSelectionChanged([]);
      }
    }
  };

  // Add this useEffect to auto-save when selection changes
  useEffect(() => {
    const saveSelection = () => {
      try {
        if (Object.keys(selected).length > 0) {
          const dataToSave = {
            selected,
            _timestamp: Date.now(),
          };
          localStorage.setItem(
            `${tableInstanceKey}_selection`,
            JSON.stringify(dataToSave),
          );
        }
      } catch (error) {
        console.error("Error saving selection:", error);
      }
    };

    // Debounce the save to prevent too many writes
    const timer = setTimeout(saveSelection, 500);
    return () => clearTimeout(timer);
  }, [selected, tableInstanceKey]);

  // Add this useEffect for selectedRows
  useEffect(() => {
    const saveSelectedRows = () => {
      try {
        if (selectedRows.length > 0) {
          const dataToSave = {
            rows: selectedRows,
            _timestamp: Date.now(),
          };
          localStorage.setItem(
            `${tableInstanceKey}_selectedRows`,
            JSON.stringify(dataToSave),
          );
        }
      } catch (error) {
        console.error("Error saving selected rows:", error);
      }
    };

    // Debounce the save
    const timer = setTimeout(saveSelectedRows, 500);
    return () => clearTimeout(timer);
  }, [selectedRows, tableInstanceKey]);
  // Sorting
  function toggleSort(id: string, additive: boolean) {
    setSortState((s) => {
      const i = s.findIndex((x) => x.id === id);
      if (i === -1) {
        return additive ? [...s, { id, desc: false }] : [{ id, desc: false }];
      }
      const next = [...s];
      next[i] = { ...next[i], desc: !next[i].desc };
      return additive ? next : [next[i]];
    });
  }
  // Editing
  function startEdit(id: string, field: string, value: any) {
    setEditing({ id, field, value });
  }

  function cancelEdit() {
    setEditing(null);
  }

  function commitEdit() {
    if (!editing) return;
    const { id, field, value } = editing;

    // Call the parent's onChangeInput if provided
    if (onChangeInput) {
      const row = rows.find((r) => r.id === id);
      if (row) {
        onChangeInput({
          target: { name: field, value },
          row,
        });
      }
    }

    // Update local state
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
    setEditing(null);
  }

  useEffect(() => {
    // When rows change, update selectedRows to remove any rows that no longer exist
    const validSelectedRows = selectedRows.filter((sr) =>
      rows.some((r) => r.id === sr.id),
    );

    if (validSelectedRows.length !== selectedRows.length) {
      setSelectedRows(validSelectedRows);
      if (onSelectionChanged) {
        onSelectionChanged(validSelectedRows);
      }
    }
  }, [rows]);

  // In NewTablePage component, add a useEffect to auto-save when in edit mode
  useEffect(() => {
    if (localEditMode && editedRowsCount > 0) {
      // Debounce auto-save to prevent too many API calls
      const autoSaveTimer = setTimeout(() => {
        if (handleSaveData) {
          const modifiedData = getModifiedDataForSave();
          if (modifiedData.length > 0) {
            handleSaveData(modifiedData);
            // Don't clear editedValues here - let user see what was saved
          }
        }
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [editedValues, localEditMode, handleSaveData]);

  // In NewTablePage.tsx - Update the updateParentTableData function
  const updateParentTableData = useCallback(
    (data: any[], fieldID?: string) => {
      if (!onTableDataUpdate) return;

      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

      // Prevent rapid updates but allow important ones
      if (isUpdatingRef.current && timeSinceLastUpdate < 300) return;

      // Check if data actually changed
      const previousData = rowsForExport();
      if (JSON.stringify(previousData) === JSON.stringify(data)) {
        return;
      }

      isUpdatingRef.current = true;
      lastUpdateTimeRef.current = now;

      // Sanitize data
      const sanitizedData = data.map((row) => {
        const sanitized: any = {};
        Object.keys(row).forEach((key) => {
          // Preserve important flags but clean up temporary ones
          if (key === "__isNew" || key === "__modified") {
            sanitized[key] = row[key];
          } else if (
            !key.startsWith("__") &&
            key !== "id" &&
            key !== "select" &&
            key !== "actions"
          ) {
            sanitized[key] = row[key];
          }
        });
        return sanitized;
      });
      // Call parent update
      onTableDataUpdate(sanitizedData, fieldID);

      // Reset updating flag
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    },
    [onTableDataUpdate, rows],
  );

  const handleAddNewRow = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Check if any rows are selected
      if (selectedRows.length > 0) {
        // DUPLICATE SELECTED ROWS at the top

        // Save to history
        saveToHistory({
          rows: rows,
          selected: { ...selected },
          selectedRows: [...selectedRows],
          editedValues: { ...editedValues },
        });

        // Create duplicates of selected rows
        const newDuplicatedRows = selectedRows.map((row) => {
          // Create a deep copy of the row
          const duplicatedRow = JSON.parse(JSON.stringify(row));

          // Generate a new unique ID
          duplicatedRow.id = `dup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Mark as new and duplicated
          duplicatedRow.__isNew = true;
          duplicatedRow.__isDuplicated = true;
          duplicatedRow.__originalRowId = row.id;
          duplicatedRow.__addedTimestamp = Date.now();
          duplicatedRow.__persistent = true;

          // Remove selection-related properties
          delete duplicatedRow.__selected;
          delete duplicatedRow.__modified;

          return duplicatedRow;
        });

        // Add duplicates at the TOP of the rows array
        const updatedRows = [...newDuplicatedRows, ...rows];

        // Update state
        setRows(updatedRows);
        setNewRows((prev) => [...newDuplicatedRows, ...prev]);

        // Clear selection after duplication (optional)
        // setSelected({});
        // setSelectedRows([]);

        // Update parent after a short delay
        setTimeout(() => {
          updateParentTableData(updatedRows, fieldID);
        }, 100);

        toast.success(
          `Added ${newDuplicatedRows.length} duplicated row(s) at the top`,
          {
            position: "top-right",
            autoClose: 2000,
            style: { top: "50px" },
          },
        );
      } else {
        // ADD BLANK ROW at the top

        // Get column definitions
        let baseCols = [];
        if (cols && cols.length > 0) {
          baseCols = cols;
        } else if (columns && columns.length > 0) {
          baseCols = columns;
        } else if (field?.tableFooter && field.tableFooter.length > 0) {
          baseCols = field.tableFooter;
        }

        const newRow: any = {
          id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          __isNew: true,
          __addedTimestamp: Date.now(),
          __persistent: true,
        };

        // Initialize columns
        baseCols.forEach((col: any) => {
          const colId = col.id || col.name || col.Fieldname;
          if (!colId || colId === "select" || colId === "actions") return;
          newRow[colId] = "";
        });

        // Save to history
        saveToHistory({
          rows: rows,
          selected: { ...selected },
          selectedRows: [...selectedRows],
          editedValues: { ...editedValues },
        });

        // Add new row at the TOP of the rows array
        const updatedRows = [newRow, ...rows];
        setRows(updatedRows);
        setNewRows((prev) => [newRow, ...prev]);

        // Update parent after a short delay
        setTimeout(() => {
          updateParentTableData(updatedRows, fieldID);
        }, 100);

        toast.success("New blank row added at the top", {
          position: "top-right",
          autoClose: 2000,
          style: { top: "50px" },
        });
      }
    },
    [
      rows,
      selectedRows,
      selected,
      editedValues,
      cols,
      columns,
      field,
      fieldID,
      updateParentTableData,
    ],
  );
  // In NewTablePage.tsx - Add this function
  const syncEditsWithSelection = useCallback(() => {
    if (selectedRows.length === 0 || Object.keys(editedValues).length === 0) {
      return;
    }

    const updatedSelectedRows = selectedRows.map((row) => {
      const rowEdits = editedValues[row.id];
      if (rowEdits) {
        // Apply edits to selected row
        const updatedRow = { ...row };
        Object.keys(rowEdits).forEach((key) => {
          if (key !== "__originalData") {
            updatedRow[key] = rowEdits[key];
          }
        });
        updatedRow.__modified = true; // Mark as modified
        return updatedRow;
      }
      return row;
    });

    // Only update if there are changes
    if (JSON.stringify(selectedRows) !== JSON.stringify(updatedSelectedRows)) {
      setSelectedRows(updatedSelectedRows);

      // Save to localStorage
      try {
        const tableKey = `table_${menuID}_${fieldID}`;
        const storageKey = `${tableKey}_selectedRows`;
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            rows: updatedSelectedRows,
            _timestamp: Date.now(),
          }),
        );
      } catch (error) {
        console.error("Error saving synced selection:", error);
      }

      // Notify parent about the updated selection
      if (onSelectionChanged) {
        onSelectionChanged(updatedSelectedRows);
      }
    }
  }, [selectedRows, editedValues, menuID, fieldID, onSelectionChanged]);

  // Call this function whenever editedValues changes
  useEffect(() => {
    const timer = setTimeout(() => {
      syncEditsWithSelection();
    }, 500);

    return () => clearTimeout(timer);
  }, [editedValues, syncEditsWithSelection]);

  const applyFirstCellToAll = useCallback(
    (columnId: string, value: any, excludeRowId: string) => {
      // Check if there are active filters
      const hasActiveFilters = Object.values(columnFilters).some(
        (filterValue) =>
          filterValue !== null &&
          filterValue !== undefined &&
          filterValue !== "",
      );

      // If no active filters, don't apply to all rows
      if (!hasActiveFilters) {
        console.log("No active filters - not applying to all rows");
        return;
      }

      // Get FILTERED rows (from sortedRows, not all rows)
      const filteredRowIds = sortedRows.map((row) => row.id);

      if (filteredRowIds.length === 0) {
        toast.error("No filtered rows found to apply changes to", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Save to history BEFORE making changes
      saveToHistory({
        rows: rows,
        selected: { ...selected },
        selectedRows: [...selectedRows],
        editedValues: { ...editedValues },
      });

      // Update ONLY filtered rows except the first one
      const updatedRows = rows.map((row) => {
        if (filteredRowIds.includes(row.id) && row.id !== excludeRowId) {
          return {
            ...row,
            [columnId]: value,
          };
        }
        return row;
      });

      setRows(updatedRows);

      // Update edited values for tracking
      const newEditedValues = { ...editedValues };

      updatedRows.forEach((row) => {
        if (filteredRowIds.includes(row.id) && row.id !== excludeRowId) {
          if (!newEditedValues[row.id]) {
            newEditedValues[row.id] = {};
          }
          newEditedValues[row.id][columnId] = value;
          newEditedValues[row.id].__originalData = rows.find(
            (r) => r.id === row.id,
          );
        }
      });

      setEditedValues(newEditedValues);

      // Update selected rows if any are selected
      if (selectedRows.length > 0) {
        const updatedSelectedRows = selectedRows.map((row) => {
          if (filteredRowIds.includes(row.id) && row.id !== excludeRowId) {
            return {
              ...row,
              [columnId]: value,
              __modified: true,
            };
          }
          return row;
        });
        setSelectedRows(updatedSelectedRows);

        if (onSelectionChanged) {
          onSelectionChanged(updatedSelectedRows);
        }
      }

      // Update parent component
      updateParentTableData(updatedRows, fieldID);

      toast.success(
        `Applied "${value}" to all ${filteredRowIds.length - 1} filtered rows in ${columnId} column`,
        {
          position: "top-right",
          autoClose: 3000,
        },
      );
    },
    [
      rows,
      selected,
      selectedRows,
      editedValues,
      sortedRows,
      columnFilters,
      fieldID,
      updateParentTableData,
    ],
  );

  // In NewTablePage.tsx - Update handleCellValueChange
  const handleCellValueChange = useCallback(
    (rowId: string, field: string, value: any) => {
      const originalRow = rows.find((r) => r.id === rowId);
      if (!originalRow) return;

      // Save to history BEFORE making changes
      saveToHistory({
        rows: rows,
        selected: { ...selected },
        selectedRows: [...selectedRows],
        editedValues: { ...editedValues },
      });

      // Update rows state
      const updatedRows = rows.map((r) =>
        r.id === rowId ? { ...r, [field]: value } : r,
      );

      setRows(updatedRows);

      const hasActiveFilters = Object.values(columnFilters).some(
        (filterValue) =>
          filterValue !== null &&
          filterValue !== undefined &&
          filterValue !== "",
      );

      // Set recently edited cell for UI feedback
      setRecentlyEditedCell({
        columnId: field,
        rowId: rowId,
        value: value,
      });

      // If apply mode is enabled AND there are active filters, apply to all filtered rows
      if (
        applyFirstCellMode.enabled &&
        hasActiveFilters &&
        sortedRows.length > 0
      ) {
        const firstFilteredRow = sortedRows[0];
        if (rowId === firstFilteredRow.id) {
          applyFirstCellToAll(field, value, firstFilteredRow.id);
        }
      }

      // IMPORTANT: Update selectedRows if this row is selected
      if (selected[rowId]) {
        const updatedSelectedRows = selectedRows.map((r) =>
          r.id === rowId ? { ...r, [field]: value, __modified: true } : r,
        );
        setSelectedRows(updatedSelectedRows);

        // Save updated selection to localStorage
        try {
          localStorage.setItem(
            `${tableInstanceKey}_selectedRows`,
            JSON.stringify({
              rows: updatedSelectedRows,
              _timestamp: Date.now(),
            }),
          );
        } catch (error) {
          console.error("Error saving updated selection:", error);
        }

        // Notify parent of selection change
        if (onSelectionChanged) {
          onSelectionChanged(updatedSelectedRows);
        }
      }

      // Track edited values
      const originalValue = originalRow[field];
      if (originalValue !== value) {
        setEditedValues((prev) => ({
          ...prev,
          [rowId]: {
            ...prev[rowId],
            [field]: value,
            __originalData: prev[rowId]?.__originalData || originalRow,
          },
        }));

        // Update parent
        const isNewRow = originalRow.__isNew;
        if (isNewRow) {
          updateParentTableData(updatedRows, fieldID);
        } else {
          const updateTimer = setTimeout(() => {
            updateParentTableData(updatedRows, fieldID);
          }, 1000);
          return () => clearTimeout(updateTimer);
        }
      }

      // Call parent's onChangeInput if provided
      if (onChangeInput) {
        onChangeInput({
          target: { name: field, value },
          row: { ...originalRow, [field]: value },
        });
      }
    },
    [
      rows,
      selected,
      selectedRows,
      editedValues,
      columnFilters, // Add columnFilters to dependencies
      applyFirstCellMode,
      sortedRows,
      fieldID,
      onChangeInput,
      updateParentTableData,
      applyFirstCellToAll,
    ],
  );
  // Add this useEffect to sync edited values with selected rows
  useEffect(() => {
    // If we have edited values and selected rows, update selected rows with edits
    if (selectedRows.length > 0 && Object.keys(editedValues).length > 0) {
      const updatedSelectedRows = selectedRows.map((row) => {
        const rowEdits = editedValues[row.id];
        if (rowEdits) {
          // Apply edits to selected row
          const updatedRow = { ...row };
          Object.keys(rowEdits).forEach((key) => {
            if (key !== "__originalData") {
              updatedRow[key] = rowEdits[key];
            }
          });
          return updatedRow;
        }
        return row;
      });

      // Only update if there are changes
      if (
        JSON.stringify(selectedRows) !== JSON.stringify(updatedSelectedRows)
      ) {
        setSelectedRows(updatedSelectedRows);

        // Notify parent about the updated selection
        if (onSelectionChanged) {
          onSelectionChanged(updatedSelectedRows);
        }
      }
    }
  }, [editedValues, selectedRows.length]);

  const getModifiedDataForSave = () => {
    const modifiedData = [];

    // Process edited existing rows
    for (const rowId in editedValues) {
      const editedRow = editedValues[rowId];
      const originalRow = editedRow.__originalData;

      if (!originalRow) continue;

      const changedFields: any[] = [];

      for (const field in editedRow) {
        if (field !== "__originalData") {
          const originalValue = originalRow[field];
          const newValue = editedRow[field];

          if (originalValue !== newValue) {
            const columnConfig = getColumnConfig(field);
            changedFields.push({
              Fieldname: field,
              FieldValue: newValue ?? "",
              Colname: columnConfig?.ReadcolumnName || field,
              IsMain: columnConfig?.IsMaincol || false,
            });
          }
        }
      }

      if (changedFields.length > 0) {
        modifiedData.push({
          ...originalRow,
          fieldsDatanew: changedFields,
        });
      }
    }

    // Process new rows
    for (const nr of newRows) {
      const newRowData: any = {
        ...nr,
        isNew: true, // Keep track that this is a new row
        fieldsDatanew: [],
      };

      // Add all fields from the new row
      columns.forEach((col: any) => {
        const colName = col.name || col.field;
        if (colName && colName !== "select" && colName !== "actions") {
          const value = nr[colName] ?? "";
          const columnConfig = getColumnConfig(colName);

          newRowData.fieldsDatanew.push({
            Fieldname: colName,
            FieldValue: value,
            Colname: columnConfig?.ReadcolumnName || colName,
            IsMain: columnConfig?.IsMaincol || false,
          });
        }
      });

      modifiedData.push(newRowData);
    }
    return modifiedData;
  };
  const renderEditableCell = (col: any, row: any) => {
    const rowEdits = editedValues[row.id];
    const cellValue =
      rowEdits && rowEdits[col.id] !== undefined
        ? rowEdits[col.id]
        : (row[col.id] ?? "");
    const columnConfig = getColumnConfig(col.id);
    const inputType = columnConfig?.Inputtype || "BOX";
    const isDisabled = columnConfig?.IsMaincol || false;

    switch (inputType) {
      case "DROPDOWN": {
        const dropdownOptions = columnDropdownData[col.id] || [];
        const isLoading = loadingColumnDropdown[col.id] || false;

        return (
          <div style={{ width: "100%", minWidth: "150px" }}>
            <AsyncSelect
              loadOptions={(inputValue: string) =>
                fetchDropdownData(col.id, inputValue)
              }
              defaultOptions={dropdownOptions}
              onChange={(selectedOption: any) => {
                const value = selectedOption?.value || "";
                if (applyFirstCellMode) {
                  handleCellValueChangeWithApply(row.id, col.id, value);
                } else {
                  handleCellValueChange(row.id, col.id, value);
                }
              }}
              value={cellValue ? { label: cellValue, value: cellValue } : null}
              isLoading={isLoading}
              isDisabled={isDisabled}
              noOptionsMessage={() => "No Suggestions"}
              onFocus={() => fetchDropdownData(col.id, "")}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                container: (base) => ({ ...base, width: "100%" }),
                control: (base) => ({
                  ...base,
                  minHeight: "32px",
                  height: "32px",
                }),
                indicatorsContainer: (base) => ({ ...base, height: "32px" }),
              }}
              menuPlacement="auto"
            />
          </div>
        );
      }

      case "DATE": {
        // Single-date picker: store as 'YYYY-MM-DD'
        let selectedDate: Date | null = null;
        if (
          cellValue &&
          typeof cellValue === "string" &&
          cellValue.trim() !== ""
        ) {
          // If a range string exists accidentally, take the first part
          const part = cellValue.includes("|")
            ? cellValue.split("|")[0]
            : cellValue;
          selectedDate = part ? new Date(part) : null;
        }

        return (
          <div style={{ width: "100%" }}>
            <ReactDatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => {
                const dateValue = date ? moment(date).format("YYYY-MM-DD") : "";
                if (applyFirstCellMode) {
                  handleCellValueChangeWithApply(row.id, col.id, dateValue);
                } else {
                  handleCellValueChange(row.id, col.id, dateValue);
                }
              }}
              dateFormat={"yyyy-MM-dd"}
              placeholderText="Select date"
              isClearable
              disabled={isDisabled}
              className="form-control"
              withPortal
              popperPlacement="auto"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </div>
        );
      }

      case "TEXTBOX":
      case "BOX":
        // Use uncontrolled input to avoid re-rendering parent on every keystroke.
        // Commit edits on blur (or Enter key) which calls the centralized handler.
        return (
          <Input
            defaultValue={cellValue}
            name={col.id}
            onBlur={(e: any) => {
              if (applyFirstCellMode) {
                handleCellValueChangeWithApply(row.id, col.id, e.target.value);
              } else {
                handleCellValueChange(row.id, col.id, e.target.value);
              }
            }}
            onKeyDown={(e: any) => {
              if (e.key === "Enter") {
                if (applyFirstCellMode) {
                  handleCellValueChangeWithApply(
                    row.id,
                    col.id,
                    e.target.value,
                  );
                } else {
                  handleCellValueChange(row.id, col.id, e.target.value);
                }
                (e.target as HTMLInputElement).blur();
              }
            }}
            disabled={isDisabled}
            style={{ width: "100%", height: "32px" }}
          />
        );

      case "BUTTON":
        return (
          <Button
            onClick={() => {
              // Handle button click if needed
              console.log(`Button clicked for ${col.id}`);
            }}
            disabled={isDisabled}
            style={{ height: "32px" }}
          >
            Action
          </Button>
        );

      case "LABEL":
        return <span>{cellValue || "-"}</span>;

      case "IMAGE":
        return cellValue ? (
          <img
            src={cellValue}
            alt="Cell Image"
            style={{ maxWidth: "100px", maxHeight: "60px" }}
          />
        ) : (
          <span>-</span>
        );

      case "HYPERLINK": {
        const cellValue =
          rowEdits && rowEdits[col.id] !== undefined
            ? rowEdits[col.id]
            : (row[col.id] ?? "");

        // In edit mode, show input field for URL
        return (
          <Input
            type="url"
            defaultValue={cellValue}
            placeholder="Enter URL (e.g., https://example.com)"
            onBlur={(e: any) => {
              handleCellValueChange(row.id, col.id, e.target.value);
            }}
            onKeyDown={(e: any) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            disabled={isDisabled}
            style={{ width: "100%", height: "32px" }}
          />
        );
      }

      default:
        return cellValue || "-";
    }
  };

  // Helper function to get color configuration for a specific column and value
  const getCellColorConfig = (columnName: string, cellValue: any) => {
    if (!tableFooter || !cellValue) return null;

    const columnConfig = tableFooter.find(
      (footer: any) => footer.Fieldname === columnName,
    );

    if (columnConfig?.Colors && Array.isArray(columnConfig.Colors)) {
      const colorConfig = columnConfig.Colors.find(
        (color: any) =>
          color.Value?.toString().toLowerCase() ===
          cellValue.toString().toLowerCase(),
      );
      return colorConfig || null;
    }

    return null;
  };
  // Styled component for the colored badge with curved edges
  const ColoredBadge = ({
    color,
    children,
  }: {
    color: string;
    children: React.ReactNode;
  }) => {
    return (
      <div
        style={{
          backgroundColor: `${color}20`,
          color: color,
          borderRadius: "9999px", // Adjust the bord  er radius to create a capsule shape
          padding: "4px 12px",
          minWidth: "60px",
          minHeight: "24px",
          fontSize: "12px",
          fontWeight: "500",
          border: `1px solid ${color}40`, // Optional: subtle border with 25% opacity
          textAlign: "center" as const,
          lineHeight: "1.2",
        }}
      >
        {children}
      </div>
    );
  };
  const renderCell = useCallback((col: any, row: any) => {
    const value = row[col.id] ?? "";
    const colorConfig = getCellColorConfig(col.id, value);

    const rowEdits = editedValues[row.id];
    const cellValue =
      rowEdits && rowEdits[col.id] !== undefined
        ? rowEdits[col.id]
        : (row[col.id] ?? "");

    // Check if this is an uploaded files table
    const isUploadedFilesCell =
      isUploadedFilesTable &&
      (col.id === "Filename" ||
        col.id === "Dellink" ||
        col.id === "Approvelink");

    if (col.id === "select" && ischeckBoxReq) {
      return (
        <input
          type="checkbox"
          checked={!!selected[row.id]}
          onChange={() => toggleRow(row.id)}
          aria-label={`Select ${row.name || row.id}`}
          disabled={!localEditMode && !ischeckBoxReq}
          style={{
            cursor: localEditMode || ischeckBoxReq ? "pointer" : "not-allowed",
            opacity: localEditMode || ischeckBoxReq ? 1 : 0.5,
          }}
        />
      );
    }
    // Handle uploaded files table cells
    if (isUploadedFilesCell) {
      switch (col.id) {
        case "Filename":
          // Always show as link for uploaded files
          return (
            <a
              href={row.FileLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#007bff",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {value}
            </a>
          );
        case "Dellink":
          // Show delete button - check if the link exists
          const hasDellink =
            row[col.id] &&
            typeof row[col.id] === "string" &&
            row[col.id].trim() !== "";
          // For delete, don't require selection - just check if link exists
          return (
            <Button
              color="danger"
              size="sm"
              style={{
                minWidth: "60px",
                padding: "2px 8px",
                fontSize: "12px",
                backgroundColor: hasDellink ? "#dc3545" : "#cccccc",
                borderColor: hasDellink ? "#dc3545" : "#cccccc",
                color: "white",
                cursor: hasDellink ? "pointer" : "not-allowed",
              }}
              disabled={!hasDellink}
              onClick={(e) => {
                e.stopPropagation();
                if (hasDellink) {
                  handleUploadedFileAction(value, row);
                }
              }}
            >
              {hasDellink ? "Delete" : "N/A"}
            </Button>
          );
        case "Approvelink":
          // Show approve button - check if the link exists
          const hasApprovelink =
            row[col.id] &&
            typeof row[col.id] === "string" &&
            row[col.id].trim() !== "";
          // For approve, DO require selection
          const isApproveSelected = selectedRows.some(
            (selectedRow) => selectedRow.id === row.id,
          );
          return (
            <Button
              color="success"
              size="sm"
              style={{
                minWidth: "60px",
                padding: "2px 8px",
                fontSize: "12px",
                backgroundColor:
                  hasApprovelink && isApproveSelected ? "#28a745" : "#cccccc",
                borderColor:
                  hasApprovelink && isApproveSelected ? "#28a745" : "#cccccc",
                color: "white",
                cursor:
                  hasApprovelink && isApproveSelected
                    ? "pointer"
                    : "not-allowed",
              }}
              disabled={!hasApprovelink || !isApproveSelected}
              onClick={(e) => {
                e.stopPropagation();
                if (hasApprovelink && isApproveSelected) {
                  handleUploadedFileAction(value, row);
                } else if (!isApproveSelected) {
                  toast.error("Please select this row first to approve", {
                    position: "top-right",
                    autoClose: 3000,
                  });
                }
              }}
            >
              {hasApprovelink ? "Approve" : "N/A"}
            </Button>
          );
      }
      return value || "-";
    }

    if (col.id === "select") {
      return (
        <input
          type="checkbox"
          checked={!!selected[row.id]}
          onChange={() => toggleRow(row.id)}
          aria-label={`Select ${row.name || row.id}`}
        />
      );
    }

    // Check if this is an Actions column
    const isActionsColumn = col.id === "actions" || col.label === "Actions";

    if (isActionsColumn) {
      const isRowSelected = selectedRows.some(
        (selectedRow) => selectedRow.id === row.id,
      );

      return (
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {/* Table buttons (ADD, etc.) */}
          {tablebuttons &&
            tablebuttons.length > 0 &&
            tablebuttons.map((button: any) => (
              <Button
                key={button.ButtonName}
                color="primary"
                size="sm"
                style={{
                  minWidth: "60px",
                  padding: "2px 8px",
                  fontSize: "12px",
                  backgroundColor: isRowSelected ? "#007bff" : "#cccccc",
                  borderColor: isRowSelected ? "#007bff" : "#cccccc",
                  color: "white",
                  cursor: isRowSelected ? "pointer" : "not-allowed",
                }}
                disabled={!isRowSelected}
                onClick={() => handleTableButtonClick(button, row)}
              >
                {button.ButtonName}
              </Button>
            ))}

          {/* Uploaded files actions */}
          {isUploadedFilesTable && (
            <>
              {row.Dellink && (
                <Button
                  color="danger"
                  size="sm"
                  style={{
                    minWidth: "60px",
                    padding: "2px 8px",
                    fontSize: "12px",
                    backgroundColor: isRowSelected ? "#dc3545" : "#cccccc",
                    borderColor: isRowSelected ? "#dc3545" : "#cccccc",
                    color: "white",
                    cursor: isRowSelected ? "pointer" : "not-allowed",
                  }}
                  disabled={!isRowSelected}
                  onClick={() => handleUploadedFileAction(row.Dellink, row)}
                >
                  Delete
                </Button>
              )}
              {row.Approvelink && (
                <Button
                  color="success"
                  size="sm"
                  style={{
                    minWidth: "60px",
                    padding: "2px 8px",
                    fontSize: "12px",
                    backgroundColor: isRowSelected ? "#28a745" : "#cccccc",
                    borderColor: isRowSelected ? "#28a745" : "#cccccc",
                    color: "white",
                    cursor: isRowSelected ? "pointer" : "not-allowed",
                  }}
                  disabled={!isRowSelected}
                  onClick={() => handleUploadedFileAction(row.Approvelink, row)}
                >
                  Approve
                </Button>
              )}
            </>
          )}
        </div>
      );
    }

    // Handle main column links
    const columnConfig = getColumnConfig(col.id);
    const inputType = columnConfig?.Inputtype || "BOX";
    const imgheight = columnConfig?.height || "BOX";
    const isMainCol = columnConfig?.IsMaincol;
    const mainColValue = (
      TableArray[0]?.Maincol ||
      TableArray[0]?.MainCol ||
      TableArray.Maincol ||
      ""
    ).trim();

    if (inputType === "HYPERLINK") {
      const hyperlinkValue = cellValue;

      // Helper function to format URL
      const formatUrl = (
        value: string,
      ): { url: string; displayText: string; isValid: boolean } => {
        if (!value || value.trim() === "") {
          return { url: "", displayText: "", isValid: false };
        }

        const trimmed = value.trim();

        try {
          const url = new URL(
            trimmed.includes("://") ? trimmed : `https://${trimmed}`,
          );
          return {
            url: url.toString(),
            displayText:
              trimmed.length > 50 ? trimmed.substring(0, 50) + "..." : trimmed,
            isValid: true,
          };
        } catch {
          // Check for relative paths
          if (
            trimmed.startsWith("/") ||
            trimmed.startsWith("#") ||
            trimmed.startsWith("?")
          ) {
            return {
              url: trimmed,
              displayText: trimmed,
              isValid: true,
            };
          }

          // Check for email
          if (trimmed.includes("@")) {
            return {
              url: `mailto:${trimmed}`,
              displayText: trimmed,
              isValid: true,
            };
          }

          // Default: treat as potential URL
          return {
            url: `//${trimmed}`,
            displayText: trimmed,
            isValid: false,
          };
        }
      };

      const formattedUrl = formatUrl(hyperlinkValue);

      // If value is empty, show dash
      if (!hyperlinkValue || hyperlinkValue.trim() === "") {
        return <span className="text-muted">-</span>;
      }

      // If URL is valid, create a clickable link
      if (formattedUrl.isValid) {
        // Determine icon based on URL type
        const getUrlIcon = (url: string) => {
          if (url.startsWith("mailto:")) return "📧";
          if (url.includes("youtube.com") || url.includes("youtu.be"))
            return "🎬";
          if (url.includes("github.com")) return "🐙";
          if (url.includes("linkedin.com")) return "💼";
          if (url.includes("twitter.com") || url.includes("x.com")) return "🐦";
          if (url.startsWith("tel:")) return "📞";
          if (url.includes(".pdf")) return "📄";
          if (url.includes(".doc") || url.includes(".docx")) return "📝";
          if (url.includes(".xls") || url.includes(".xlsx")) return "📊";
          return "🔗";
        };

        const icon = getUrlIcon(formattedUrl.url);

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px" }}>{icon}</span>
            <a
              href={formattedUrl.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#007bff",
                textDecoration: "none",
                cursor: "pointer",
                wordBreak: "break-all",
                fontSize: "13px",
                display: "inline-block",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                padding: "2px 4px",
                borderRadius: "3px",
                transition: "all 0.2s ease",
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              title={`Click to open: ${formattedUrl.url}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
                e.currentTarget.style.backgroundColor =
                  "rgba(0, 123, 255, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {formattedUrl.displayText}
            </a>
            <span
              className="text-muted"
              style={{
                fontSize: "10px",
                marginLeft: "2px",
                opacity: 0.7,
              }}
              title={`${
                formattedUrl.isValid ? "Valid URL" : "Click to open link"
              }`}
            >
              ↗
            </span>
          </div>
        );
      }

      // For invalid URLs in view mode, still make it clickable but with warning
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "12px", color: "#ffc107" }}>⚠️</span>
          <a
            href={formattedUrl.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#ffc107",
              textDecoration: "none",
              cursor: "pointer",
              wordBreak: "break-all",
              fontSize: "13px",
              display: "inline-block",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              padding: "2px 4px",
              borderRadius: "3px",
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            title={`Potentially invalid URL: ${hyperlinkValue}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = "underline";
              e.currentTarget.style.backgroundColor = "rgba(255, 193, 7, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = "none";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {hyperlinkValue.length > 50
              ? hyperlinkValue.substring(0, 50) + "..."
              : hyperlinkValue}
          </a>
        </div>
      );
    }
    // Handle IMAGE input type for both edit and non-edit modes
    if (inputType === "IMAGE") {
      // Check if value is a URL, base64 string, or image object
      let imageSrc = "";

      if (typeof cellValue === "string") {
        // Check if it's a base64 string
        if (cellValue.startsWith("data:image/")) {
          imageSrc = cellValue;
        }
        // Check if it's a URL
        else if (
          cellValue.startsWith("http://") ||
          cellValue.startsWith("https://")
        ) {
          imageSrc = cellValue;
        }
        // If it's a simple string, assume it's a base64 string from database
        else if (cellValue) {
          imageSrc = `data:image/jpeg;base64,${cellValue}`;
        }
      }
      // If it's an object with image properties
      else if (cellValue && typeof cellValue === "object") {
        imageSrc =
          cellValue.ImageURL || cellValue.base64String || cellValue.url || "";
      }

      if (imageSrc) {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              minHeight: "60px",
            }}
          >
            <img
              src={imageSrc}
              alt={`Image for ${col.label}`}
              style={{
                maxWidth: "100px",
                maxHeight: "60px",
                objectFit: "contain",
                borderRadius: "4px",
                border: "1px solid #ddd",
                backgroundColor: "#f5f5f5",
              }}
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  `<div style="text-align:center;color:#999;font-size:12px">No Image</div>`;
              }}
            />
          </div>
        );
      } else {
        return (
          <div style={{ textAlign: "center", color: "#999", fontSize: "12px" }}>
            No Image
          </div>
        );
      }
    }
    if (
      (col.name === "app_id" || col.id === mainColValue || isMainCol) &&
      value
    ) {
      const handleLinkClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (popupdrawersettings?.IsPopup) {
          setIsModalOpen(true);
          setModalData({
            app_id: value,
            ModuleID: row?.Moduleid || row?.ModuleID || moduleID || "",
            defaultVisible: defaultVisible,
          });
        } else if (handleTableLinkClick) {
          handleTableLinkClick(
            value,
            row?.ModuleID || moduleID || "",
            defaultVisible,
          );
        } else {
          setIsModalOpen(true);
          setModalData(row);
        }
      };

      // Apply color to linked cells if configured
      if (colorConfig) {
        return (
          <a
            href="#"
            onClick={handleLinkClick}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ textDecoration: "none" }}
          >
            <ColoredBadge color={colorConfig.Color}>
              {value || "-"}
            </ColoredBadge>
          </a>
        );
      }

      return (
        <a
          href="#"
          style={{
            color: "#0088ff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={handleLinkClick}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {value || "-"}
        </a>
      );
    }

    // Handle IsLink columns
    if (columnConfig?.IsLink && value) {
      const handleLinkClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Use the new function that handles HTML content
        handleLinkWithHtmlClick(row, columnConfig, value);
      };

      // Apply color to linked cells if configured
      if (colorConfig) {
        return (
          <a
            href="#"
            onClick={handleLinkClick}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ textDecoration: "none", cursor: "pointer" }}
            title="Click to view details"
          >
            <ColoredBadge color={colorConfig.Color}>
              {value || "-"}
            </ColoredBadge>
          </a>
        );
      }

      return (
        <a
          href="#"
          style={{
            color: "#0088ff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={handleLinkClick}
          onMouseDown={(e) => e.stopPropagation()}
          title="Click to view details"
        >
          {value || "-"}
        </a>
      );
    }
    // Default rendering for edit mode
    if (editBtn) {
      // For editable cells, show the colored badge if configured
      if (colorConfig) {
        return (
          <ColoredBadge color={colorConfig.Color}>
            {renderEditableCell(col, row)}
          </ColoredBadge>
        );
      }
      return renderEditableCell(col, row);
    }

    // Default rendering for other columns with color if configured
    if (colorConfig) {
      return (
        <ColoredBadge color={colorConfig.Color}>
          {value || row[col.name] || "-"}
        </ColoredBadge>
      );
    }

    // Default rendering without color
    const displayValue = value || row[col.name];
    if (displayValue && typeof displayValue === "object") {
      return displayValue.FileTypeName || JSON.stringify(displayValue) || "-";
    }
    return displayValue || "-";
  });

  const memoizedRenderCell = useCallback(
    (col: any, row: any) => {
      // Your renderCell logic here
      return renderCell(col, row);
    },
    [renderCell],
  );
  // Column reordering and resizing functions (keep your existing implementations)
  function onDragStartHeader(i: number, e: React.DragEvent) {
    dragIndex.current = i;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(i));
  }

  function onDropHeader(i: number, e: React.DragEvent) {
    e.preventDefault();
    const from = dragIndex.current;
    if (from == null || from === i) return;
    setCols((c) => {
      const n = [...c];
      const [m] = n.splice(from, 1);
      n.splice(i, 0, m);
      return n;
    });
    dragIndex.current = null;
  }

  function startResize(colId: string, ev: React.MouseEvent) {
    ev.preventDefault();
    const startX = ev.clientX;
    const colIndex = cols.findIndex((c) => c.id === colId);
    const startW = cols[colIndex].width || 120;
    const wrapRect = tableWrapRef.current
      ? tableWrapRef.current.getBoundingClientRect()
      : ({ left: 0 } as any);
    resizing.current = { colId, startX, startW, left: wrapRect.left };
    setSnapX(startX);

    const onMove = (e: MouseEvent) => {
      const r = resizing.current;
      if (!r) return;
      const dx = e.clientX - r.startX;
      const w = Math.max(80, r.startW + dx);
      setCols((c) =>
        c.map((col) => (col.id === r.colId ? { ...col, width: w } : col)),
      );
      setSnapX(e.clientX);
    };

    const onUp = () => {
      resizing.current = null;
      setSnapX(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
  const exportCols = useMemo(() => {
    // Take visibleCols and remove the select column
    const orderedExportCols = visibleCols
      .filter((col) => col.id !== "select" && col.id !== "actions")
      .map((col) => ({ ...col })); // Create a copy to avoid reference issues

    return orderedExportCols;
  }, [visibleCols]); //
  // Fix rowsForExport function
  function rowsForExport() {
    const ids = new Set(Object.keys(selected).filter((k) => selected[k]));
    const arr = Array.from(ids);
    const dataRows = arr.length
      ? sortedRows.filter((r) => ids.has(r.id))
      : sortedRows;

    // Return data with columns in the same order as visibleCols
    return dataRows.map((row) => {
      const orderedRow: any = {};
      exportCols.forEach((col) => {
        orderedRow[col.id] = row[col.id] ?? "";
      });
      return orderedRow;
    });
  }
  function toTableHtml(data: any[]) {
    const head =
      "<tr>" +
      exportCols
        .map(
          (c) =>
            `<th style="text-align:left;padding:8px;border:1px solid #ddd">${escapeHtml(
              String(c.label),
            )}</th>`,
        )
        .join("") +
      "</tr>";

    const body = data
      .map(
        (r) =>
          "<tr>" +
          exportCols
            .map(
              (c) =>
                `<td style="padding:8px;border:1px solid #ddd">${escapeHtml(
                  String((r as any)[c.id] ?? ""),
                )}</td>`,
            )
            .join("") +
          "</tr>",
      )
      .join("");

    return `<table style="border-collapse:collapse;width:100%">${head}${body}</table>`;
  }
  const getFilteredData = () => {
    return sortedRows;
  };
  const getFilteredPdfColumns = () => {
    return columns.filter(
      (col: Column) => selectedOptions.includes(col.name) && !col.omit,
    );
  };

  const filteredColumns = useMemo(() => {
    if (tableFooter && tableFooter.length > 0) {
      return columns.filter((col: any) => {
        const footerItem = tableFooter.find(
          (footer: any) => footer.Fieldname === col.name,
        );
        return footerItem ? footerItem.IsDisplay : true;
      });
    }
    return columns;
  }, [columns, tableFooter]);

  const convertToPDF = async (
    logo?: Logo,
    headerRowsParam?: any[],
    footerRowsParam?: any[],
  ): Promise<void> => {
    // Add safe access for headerRows and footerRows
    const safeHeaderRows = headerRowsParam || [];
    const safeFooterRows = footerRowsParam || [];
    const headerBackground = tableheaderfooterCSS?.HeaderBackground;
    const footerBackground = tableheaderfooterCSS?.FooterBackground;
    const headerPosition = tableheaderfooterCSS?.Position || "0";
    const footerPosition = tableheaderfooterCSS?.Position || "0";
    const padLeft =
      parseFloat(tableheaderfooterCSS?.Padleft || "0.2") * 180 || 2;
    const padRight =
      parseFloat(tableheaderfooterCSS?.Padright || "0.2") * 180 || 2;
    const padTop = parseFloat(tableheaderfooterCSS?.Padtop || "0.1") * 180 || 1;
    const padBottom =
      parseFloat(tableheaderfooterCSS?.Padbottom || "0.1") * 180 || 1;
    const borderColor = tableheaderfooterCSS?.BorderColor;
    const insideBorder = tableheaderfooterCSS?.InsideBorder;
    const outsideBorder = tableheaderfooterCSS?.OutsideBorder;
    const filteredData: DataItem[] = getFilteredData();
    const doc = new jsPDF({
      orientation: orientation,
      unit: "pt",
      format: "A4",
    });
    const isValidColor = (color?: string) =>
      typeof color === "string" && color.trim().length > 0;

    const filteredPdfColumns: Column[] = exportCols.filter(
      (col: Column) => selectedOptions.includes(col.name) && !col.omit,
    ) as Column[];

    // Create the table structure with merged cells
    const createMergedTableData = () => {
      const headers = filteredPdfColumns.map((col: Column) => col.name);
      // Transform your original data to handle merged cells
      const transformedData: (
        | string
        | { content: string; rowSpan?: number; colSpan?: number; styles?: any }
      )[][] = [];
      // Keep track of cells that should be skipped due to rowspan/colspan
      const skipCells: { [key: string]: boolean } = {};
      // Track cell heights for specific cells
      const cellHeights: { [key: string]: number } = {};
      // Process each row of your filtered data
      filteredData.forEach((item: DataItem, rowIndex: number) => {
        const row: (
          | string
          | {
              content: string;
              rowSpan?: number;
              colSpan?: number;
              styles?: any;
            }
        )[] = [];
        let colIndex = 0;

        filteredPdfColumns.forEach((col: Column, originalColIndex: number) => {
          const actualRowIndex = rowIndex + 1; // +1 because header is row 0
          const actualColIndex = originalColIndex + 1; // +1 because your tableproperty uses 1-based indexing

          // Check if this cell should be skipped
          const cellKey = `${rowIndex}-${originalColIndex}`;
          if (skipCells[cellKey]) {
            return;
          }

          // Check if this cell has special properties
          const cellProperty = tableproperty?.find(
            (prop: any) =>
              prop.rowindex === actualRowIndex &&
              prop.colindex === actualColIndex,
          );

          if (cellProperty) {
            // Handle alignment conversion
            let halign: "left" | "center" | "right" = "center";
            if (
              cellProperty.Align === "TOPCENTER" ||
              cellProperty.Align === "BOTTOMCENTER"
            ) {
              halign = "center";
            } else if (cellProperty.Align === "LEFT") {
              halign = "left";
            } else if (cellProperty.Align === "RIGHT") {
              halign = "right";
            }

            // Store cell height if specified
            if (cellProperty.RowHeight) {
              const cellHeight = parseInt(cellProperty.RowHeight, 10);
              if (!isNaN(cellHeight)) {
                cellHeights[`${actualRowIndex}-${actualColIndex}`] = cellHeight;
              }
            }

            // Create cell with special properties
            const cellData = {
              content: item[col.name] ?? "",
              rowSpan: cellProperty.rowspan || 1,
              colSpan: cellProperty.colspan || 1,
              styles: {
                fontSize: parseInt(cellProperty.FontSize, 10) || 9,
                font: cellProperty.FontName || "helvetica",
                fontStyle:
                  (cellProperty.IsBold ? "bold" : "") +
                  (cellProperty.IsItallic ? "italic" : ""),
                halign: halign,
                valign:
                  cellProperty.Align === "TOPCENTER"
                    ? "top"
                    : cellProperty.Align === "BOTTOMCENTER"
                      ? "bottom"
                      : "middle",
                fillColor: cellProperty.bgcolor || undefined,
                textColor: cellProperty.FontColor || undefined,
                lineWidth:
                  cellProperty.OutsideBorder || cellProperty.InsideBorder
                    ? 1
                    : 0.1,
                lineColor:
                  cellProperty.OutsideBorder || cellProperty.InsideBorder
                    ? [0, 0, 0]
                    : [200, 200, 200],
                cellPadding: {
                  top: parseFloat(cellProperty.Padtop || "0") * 10 || 3,
                  right: parseFloat(cellProperty.Padright || "0") * 10 || 3,
                  bottom: parseFloat(cellProperty.Padbottom || "0") * 10 || 3,
                  left: parseFloat(cellProperty.Padleft || "0") * 10 || 3,
                },
                // Apply cell-specific height
                minCellHeight: cellProperty.RowHeight
                  ? parseInt(cellProperty.RowHeight, 10)
                  : undefined,
              },
            };

            row.push(cellData);

            // Mark cells that will be covered by this rowspan/colspan
            const rowSpan = cellProperty.rowspan || 1;
            const colSpan = cellProperty.colspan || 1;

            for (let r = 0; r < rowSpan; r++) {
              for (let c = 0; c < colSpan; c++) {
                if (r === 0 && c === 0) continue;
                const skipRow = rowIndex + r;
                const skipCol = originalColIndex + c;
                skipCells[`${skipRow}-${skipCol}`] = true;
              }
            }
          } else {
            // Regular cell
            row.push(item[col.name] ?? "");
          }
          colIndex++;
        });
        transformedData.push(row);
      });
      return { headers, body: transformedData, cellHeights };
    };

    const { headers, body, cellHeights } = createMergedTableData();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const topMargin = 20;
    const bottomMargin = 5;
    const leftMargin = 40;
    const rightMargin = 40;

    const logoHeightVal =
      logo && logo.LogoURL ? parseInt(logo.Height, 10) || 40 : 0;
    const headerLineHeight = 15;
    const footerLineHeight = 12;

    // Calculate header height based on safeHeaderRows
    const headerHeight = safeHeaderRows.length * headerLineHeight + 40;
    const footerHeight = (safeFooterRows.length || 1) * footerLineHeight + 20;
    const availableContentHeight =
      pageHeight - topMargin - headerHeight - footerHeight - bottomMargin;

    // ✅ base64 string comes directly from backend
    let base64Image: string | null = null;
    if (logo && logo.LogoURL) {
      base64Image = logo.LogoURL;
    }

    // // ✅ Header images from headerRows
    const headerImages: { [key: string]: string } = {};
    for (const row of safeHeaderRows) {
      for (const item of row.Data) {
        if (item.IMGUrl) {
          const imageKey = `${row.Index}-${item.ItemValue || "image"}`;
          headerImages[imageKey] = item.IMGUrl;
        }
      }
    }

    const addHeader = (doc: jsPDF) => {
      let y = topMargin;

      doc.setFillColor(headerBackground || "#FFFFFF");
      doc.rect(
        leftMargin,
        topMargin,
        pageWidth - leftMargin - rightMargin,
        headerHeight + 5,
        "F",
      );
      let totalHeaderHeight = safeHeaderRows.length * headerLineHeight + 30;
      const headerOuterPadding = 10;
      const headerPadding = 15;
      const headerY = headerPadding;

      safeHeaderRows.forEach((row: any, rowIndex: number) => {
        const rowY =
          headerY + rowIndex * headerLineHeight + 15 + headerOuterPadding;
        const positionGroups: { [key: string]: any[] } = {};

        // Group items by position
        row.Data.forEach((item: any) => {
          const positionKey = item.Position || "0";
          if (!positionGroups[positionKey]) {
            positionGroups[positionKey] = [];
          }
          positionGroups[positionKey].push(item);
        });

        Object.keys(positionGroups).forEach((positionKey) => {
          const items = positionGroups[positionKey];
          const basePositionX =
            parseInt(positionKey || "0", 10) + leftMargin + headerOuterPadding;

          items.forEach((item: any) => {
            if (item.IsDisplay === false) return;

            // Handle image
            if (item.IMGUrl) {
              const imageKey = `${row.Index}-${item.ItemValue || "image"}`;
              if (headerImages[imageKey]) {
                const imgWidth = parseInt(item.ImgWidth || "60", 10);
                const imgHeight = parseInt(item.ImgHeight || "40", 10);
                doc.addImage(
                  headerImages[imageKey],
                  "PNG",
                  basePositionX,
                  rowY - 5,
                  imgWidth,
                  imgHeight,
                );
              }
            }

            // Handle text
            if (item.ItemValue) {
              const fontStyle =
                (item.IsBold ? "bold" : "") + (item.IsItallic ? "italic" : "");
              doc.setFont(item.FontName || "helvetica", fontStyle);
              if (item.IsUnderline) {
                doc.setLineWidth(0.5);
              }
              doc.setFontSize(parseInt(item.FontSize, 10) || 12);

              const text = item.ItemValue || "";
              const textWidth = doc.getTextWidth(text);
              const textHeight = parseInt(item.FontSize, 10) || 12;

              const paddingTop =
                parseFloat(item.Padtop || padTop.toString()) || 1;
              const paddingBottom =
                parseFloat(item.Padbottom || padBottom.toString()) || 1;
              const paddingLeft =
                parseFloat(item.Padleft || padLeft.toString()) || 2;
              const paddingRight =
                parseFloat(item.Padright || padRight.toString()) || 2;

              // Calculate usable text area
              const maxTextWidth =
                pageWidth -
                leftMargin -
                rightMargin -
                headerOuterPadding * 2 -
                (paddingLeft + paddingRight);

              let textX = basePositionX + paddingLeft;
              if (item.Align === "CENTER") {
                textX =
                  leftMargin +
                  headerOuterPadding +
                  (maxTextWidth - doc.getTextWidth(text)) / 2;
              } else if (item.Align === "RIGHT") {
                textX =
                  pageWidth -
                  rightMargin -
                  headerOuterPadding -
                  doc.getTextWidth(text) -
                  paddingRight;
              }

              const textY = rowY + paddingTop;

              // Background for text
              if (item.bgcolor && text) {
                doc.setFillColor(item.bgcolor);
                doc.rect(
                  textX - paddingLeft,
                  rowY - textHeight / 2 - paddingTop,
                  textWidth + paddingLeft + paddingRight,
                  textHeight + paddingTop + paddingBottom,
                  "F",
                );
              }

              if (item.FontColor) doc.setTextColor(item.FontColor);

              // Wrap long text
              const wrappedText = doc.splitTextToSize(text, maxTextWidth);
              doc.text(wrappedText, textX, textY);

              if (item.IsUnderline && text) {
                const underlineWidth = doc.getTextWidth(wrappedText.join(" "));
                doc.line(textX, textY + 2, textX + underlineWidth, textY + 2);
              }

              doc.setTextColor(0);
            }
          });
        });
      });

      // Draw header border if needed
      if (outsideBorder) {
        doc.setDrawColor(parseInt(borderColor.substring(1), 16) || 0);
        doc.setLineWidth(0.5);
        doc.rect(
          leftMargin + headerOuterPadding,
          headerY + headerOuterPadding,
          pageWidth - leftMargin - rightMargin - headerOuterPadding * 2,
          totalHeaderHeight + 10 - headerOuterPadding * 2,
        );
      }
    };

    const footerImages: { [key: string]: string } = {};
    for (const row of safeFooterRows) {
      for (const item of row.Data) {
        if (item.IMGUrl) {
          const imageKey = `${row.Index}-${item.ItemValue || "image"}`;
          footerImages[imageKey] = item.IMGUrl;
        }
      }
    }

    const addFooter = (doc: jsPDF) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const footerLineHeight = 20;
      const footerPadding = 15;

      // Outer padding inside footer box
      const footerOuterPadding = 10;

      let totalFooterHeight = safeFooterRows.length * footerLineHeight + 30;
      const footerY = pageHeight - totalFooterHeight - footerPadding - 15;

      // Draw footer background box with padding
      if (isValidColor(footerBackground)) {
        doc.setFillColor(footerBackground);
        doc.rect(
          leftMargin,
          footerY,
          pageWidth - leftMargin - rightMargin,
          totalFooterHeight + 10,
          "F",
        );
      }

      safeFooterRows.forEach((row: any, rowIndex: number) => {
        const rowY =
          footerY + rowIndex * footerLineHeight + 15 + footerOuterPadding;
        const positionGroups: { [key: string]: any[] } = {};

        // Group items by position
        row.Data.forEach((item: any) => {
          const positionKey = item.Position || "0";
          if (!positionGroups[positionKey]) {
            positionGroups[positionKey] = [];
          }
          positionGroups[positionKey].push(item);
        });

        Object.keys(positionGroups).forEach((positionKey) => {
          const items = positionGroups[positionKey];
          const basePositionX =
            parseInt(positionKey || "0", 10) + leftMargin + footerOuterPadding;

          items.forEach((item: any) => {
            if (item.IsDisplay === false) return;

            // Handle image
            if (item.IMGUrl) {
              const imageKey = `${row.Index}-${item.ItemValue || "image"}`;
              if (footerImages[imageKey]) {
                const imgWidth = parseInt(item.ImgWidth || "60", 10);
                const imgHeight = parseInt(item.ImgHeight || "40", 10);
                doc.addImage(
                  footerImages[imageKey],
                  "PNG",
                  basePositionX,
                  rowY - 5,
                  imgWidth,
                  imgHeight,
                );
              }
            }

            // Handle text
            if (item.ItemValue) {
              const fontStyle =
                (item.IsBold ? "bold" : "") + (item.IsItallic ? "italic" : "");
              doc.setFont(item.FontName || "helvetica", fontStyle);
              if (item.IsUnderline) {
                doc.setLineWidth(0.5);
              }
              doc.setFontSize(parseInt(item.FontSize, 10) || 12);

              const text = item.ItemValue || "";
              const textWidth = doc.getTextWidth(text);
              const textHeight = parseInt(item.FontSize, 10) || 12;

              const paddingTop =
                parseFloat(item.Padtop || padTop.toString()) || 1;
              const paddingBottom =
                parseFloat(item.Padbottom || padBottom.toString()) || 1;
              const paddingLeft =
                parseFloat(item.Padleft || padLeft.toString()) || 2;
              const paddingRight =
                parseFloat(item.Padright || padRight.toString()) || 2;

              // Calculate text area inside footer box
              const maxTextWidth =
                pageWidth -
                leftMargin -
                rightMargin -
                footerOuterPadding * 2 -
                (paddingLeft + paddingRight);

              let textX = basePositionX + paddingLeft;
              if (item.Align === "CENTER") {
                textX =
                  leftMargin +
                  footerOuterPadding +
                  (maxTextWidth - doc.getTextWidth(text)) / 2;
              } else if (item.Align === "RIGHT") {
                textX =
                  pageWidth -
                  rightMargin -
                  footerOuterPadding -
                  doc.getTextWidth(text) -
                  paddingRight;
              }

              const textY = rowY + paddingTop;

              // Background for text
              if (item.bgcolor && text) {
                doc.setFillColor(item.bgcolor);
                doc.rect(
                  textX - paddingLeft,
                  rowY - textHeight / 2 - paddingTop,
                  textWidth + paddingLeft + paddingRight,
                  textHeight + paddingTop + paddingBottom,
                  "F",
                );
              }

              if (item.FontColor) doc.setTextColor(item.FontColor);

              // Wrap text if too long
              const wrappedText = doc.splitTextToSize(text, maxTextWidth);
              doc.text(wrappedText, textX, textY);

              if (item.IsUnderline && text) {
                const underlineWidth = doc.getTextWidth(wrappedText.join(" "));
                doc.line(textX, textY + 2, textX + underlineWidth, textY + 2);
              }

              doc.setTextColor(0);
            }
          });
        });
      });

      // Draw footer border if needed
      if (outsideBorder) {
        doc.setDrawColor(parseInt(borderColor.substring(1), 16) || 0);
        doc.setLineWidth(0.5);
        doc.rect(
          leftMargin + footerOuterPadding,
          footerY + footerOuterPadding,
          pageWidth - leftMargin - rightMargin - footerOuterPadding * 2,
          totalFooterHeight + 10 - footerOuterPadding * 2,
        );
      }
    };

    // Create columnStyles based on tablefooter ColWidth values
    const tableWidth = pageWidth - leftMargin - rightMargin;
    const columnStyles: { [key: number]: { cellWidth: number } } = {};
    filteredPdfColumns.forEach((col, index) => {
      const colMeta = tableFooter.find(
        (meta: any) => meta.Colname === col.name,
      );
      if (colMeta && colMeta.ColWidth) {
        const widthPercentage = parseFloat(colMeta.ColWidth);
        if (!isNaN(widthPercentage)) {
          const widthInPts = (widthPercentage / 100) * tableWidth;
          columnStyles[index] = { cellWidth: widthInPts };
        }
      }
    });

    const fontStyle: "normal" | "bold" | "italic" | "bolditalic" =
      tableFormatting?.IsBold && tableFormatting?.IsItallic
        ? "bolditalic"
        : tableFormatting?.IsBold
          ? "bold"
          : tableFormatting?.IsItallic
            ? "italic"
            : "normal";

    const headerStyles = {
      textColor: tableFormatting?.FontColor || undefined,
      fontStyle: fontStyle,
      font: tableFormatting?.FontName || "helvetica",
      fontSize: parseInt(tableFormatting?.FontSize, 10) || 9,
      halign: tableFormatting?.Align?.toLowerCase() || "center",
      valign: "middle",
      cellPadding: 3,
      fillColor: tableFormatting?.bgcolor || undefined,
    };

    autoTable(doc, {
      head: [headers],
      body: body,
      margin: {
        top: headerHeight + topMargin + 10,
        bottom: footerHeight + bottomMargin + 10,
        left: leftMargin,
        right: rightMargin,
      },
      startY: headerHeight + topMargin + 10,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineWidth: outsideBorder || insideBorder ? 0.1 : 0,
        lineColor: outsideBorder || insideBorder ? [0, 0, 0] : [255, 255, 255],
      },
      headStyles: headerStyles, // Apply the formatted header styles
      theme: "striped",
      columnStyles: columnStyles,
      didParseCell: (data) => {
        // ✅ Only apply custom rowHeight to BODY cells, not header/footer
        if (data.section === "body") {
          const rowIndex = data.row.index + 1;
          const colIndex = data.column.index + 1;
          const cellKey = `${rowIndex}-${colIndex}`;

          if (cellHeights[cellKey]) {
            data.cell.styles.minCellHeight = cellHeights[cellKey];
          }
        }
      },
      didDrawCell: (data) => {
        // ✅ Apply custom row height only for body cells
        if (data.section === "body") {
          const rowIndex = data.row.index + 1;
          const colIndex = data.column.index + 1;
          const cellKey = `${rowIndex}-${colIndex}`;

          if (cellHeights[cellKey] && data.cell.height < cellHeights[cellKey]) {
            data.row.height = cellHeights[cellKey];
          }
        }

        // ✅ Keep underline for header if needed
        if (data.section === "head" && tableFormatting?.IsUnderline) {
          doc.setDrawColor(
            tableFormatting?.FontColor
              ? parseInt(tableFormatting.FontColor.substring(1), 16)
              : 0,
          );
          doc.setLineWidth(0.5);
          doc.line(
            data.cell.x,
            data.cell.y + data.cell.height - 2,
            data.cell.x + data.cell.width,
            data.cell.y + data.cell.height - 2,
          );
        }
      },
      didDrawPage: (data) => {
        addHeader(doc);
        addFooter(doc);

        // Draw the main border AFTER drawing header and footer
        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        if (outsideBorder && doc.lastAutoTable && doc.lastAutoTable.finalY) {
          const table = doc.lastAutoTable;
          doc.setDrawColor(0);
          doc.setLineWidth(0.5);

          doc.rect(
            table.settings.margin.left,
            table.startY,
            pageWidth -
              table.settings.margin.left -
              table.settings.margin.right,
            table.finalY - table.startY,
          );
        }
      },
    });

    doc.save(`${filename}.pdf`);
  };

  const convertToExcel = () => {
    const filteredData = rowsForExport();
    const workbook = XLSX.utils.book_new();

    // Use exportCols for headers (same order as table)
    const headers = exportCols.map((col: any) => col.label);

    // Map data in the same order as exportCols
    const data = filteredData.map((item: any) => {
      return exportCols.map((col: any) => item[col.id] ?? "");
    });

    data.unshift(headers);
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };
  const convertToDocx = () => {
    try {
      const filteredData = rowsForExport();
      const htmlContent = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                xmlns:w="urn:schemas-microsoft-com:office:word"
                xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="UTF-8">
            <title>${title || "Table Export"}</title>
            <style>
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #000; padding: 5px; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            ${toTableHtml(filteredData)}
          </body>
          </html>
        `;
      const blob = new Blob(["\ufeff", htmlContent], {
        type: "application/msword",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.docx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("DOCX export error:", error);
      alert("Error generating Word document. Please try again.");
    }
  };

  // Add this function near your other export functions (convertToPDF, convertToExcel, convertToDocx)
  const convertToCSV = () => {
    try {
      const filteredData = rowsForExport();
      const headers = exportCols.map((col) => escapeCsv(col.label));

      const rows = filteredData.map((item: any) => {
        return exportCols
          .map((col) => {
            const value = item[col.id] ?? "";
            return escapeCsv(value);
          })
          .join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");

      const blob = new Blob(["\ufeff", csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename || "export"}.csv`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Error generating CSV file. Please try again.");
    }
  };

  // Add these functions after your existing export functions (convertToPDF, convertToExcel, etc.)

  const exportJSON = () => {
    const data = rowsForExport();
    // Create ordered JSON output matching table order
    const orderedData = data.map((row: any) => {
      const orderedRow: any = {};
      // Add columns in export order (same as table order)
      exportCols.forEach((col) => {
        orderedRow[col.id] = row[col.id] ?? "";
      });
      return orderedRow;
    });

    downloadBlob(
      `${filename || "table"}.json`,
      "application/json",
      JSON.stringify(orderedData, null, 2),
    );
  };
  const exportXML = () => {
    const data = rowsForExport();
    const xml =
      "<rows>" +
      data
        .map(
          (r) =>
            "<row>" +
            exportCols
              .map(
                (c) =>
                  `<${c.id}>${escapeHtml(String(r[c.id] ?? ""))}</${c.id}>`,
              )
              .join("") +
            "</row>",
        )
        .join("") +
      "</rows>";

    downloadBlob(`${filename || "table"}.xml`, "application/xml", xml);
  };

  const printView = () => {
    const html =
      '<!doctype html><html><head><meta charset="UTF-8"><title>Print</title>' +
      "<style>body{font-family:system-ui,Arial,sans-serif} " +
      "table{border-collapse:collapse;width:100%} " +
      "th,td{border:1px solid #ddd;padding:6px}</style></head><body>" +
      toTableHtml(rowsForExport()) +
      "</body></html>";

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank", "noopener,noreferrer");

    if (!w) {
      downloadBlob(`${filename || "print"}.html`, "text/html", html);
    }
  };
  // Make sure escapeCsv function exists - if not, add it near other utility functions
  function escapeCsv(s: any): string {
    if (s == null || s === undefined) return "";
    const str = String(s);
    // Escape quotes by doubling them
    const escaped = str.replace(/"/g, '""');
    // Wrap in quotes if contains comma, newline, or quote
    if (/[",\n]/.test(escaped)) {
      return `"${escaped}"`;
    }
    return escaped;
  }

  // Column visibility management
  const handleCheckboxChange =
    (option: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setSelectedOptions((prevSelected) => [...prevSelected, option]);
        setVisible((prev) => ({ ...prev, [option]: true }));
      } else {
        setSelectedOptions((prevSelected) =>
          prevSelected.filter((item) => item !== option),
        );
        setVisible((prev) => ({ ...prev, [option]: false }));
      }
    };

  const handleSelectAll = () => {
    const allCols = cols
      .filter((col) => col.id !== "select")
      .map((col) => col.id);
    setSelectedOptions(allCols);
    const newVisible: Record<string, boolean> = {};
    cols.forEach((col) => {
      newVisible[col.id] = true;
    });
    setVisible(newVisible);
  };

  const handleUnselectAll = () => {
    setSelectedOptions([]);
    const newVisible: Record<string, boolean> = {};
    cols.forEach((col) => {
      newVisible[col.id] = col.id === "select";
    });
    setVisible(newVisible);
  };

  const saveColumnPreferences = async () => {
    try {
      setIsSavingColumns(true);
      const payload = {
        Userid: localStorage.getItem("username"),
        ModuleID: menuID || moduleID,
        ButtonID: btnId || 0,
        columnslist: columns.map((col: any) => ({
          colname: col.name,
          IsDisplay: selectedOptions.includes(col.name),
        })),
      };

      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://logpanel.insurancepolicy4u.com/api/Login/UpdateReportColumn",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save column preferences");
      }

      const data = await response.json();
    } catch (error) {
      console.error("Error saving column preferences:", error);
    } finally {
      setIsSavingColumns(false);
      setAnchorEl(null);
    }
  };
  const open = Boolean(anchorEl);
  const id = open ? "checkbox-popover" : undefined;

  const handleSaveClick = () => {
    if (!localEditMode) {
      toast.error("Table is not in edit mode");
      return;
    }

    const modifiedData = getModifiedDataForSave();

    if (modifiedData.length === 0) {
      toast.info("No changes to save");
      return;
    }

    if (handleSaveData) {
      // Call the parent's save function
      handleSaveData(modifiedData);

      // Clear new rows after successful save
      setNewRows([]);

      // Reset edit states
      setEditedValues({});
      setModifiedRows({});
      setLocalEditMode(false);
      if (setEditBtn) {
        setEditBtn(false);
      }
      localStorage.removeItem(tableInstanceKey);

      setNewRows([]);
    } else {
      toast.error("Save functionality not available");
    }
  };

  useEffect(() => {
    return () => {
      // Only clean up if we're not in edit mode
      if (!localEditMode) {
        localStorage.removeItem(tableInstanceKey);
      }
    };
  }, [localEditMode, tableInstanceKey]);
  // Add this useEffect after your other useEffect hooks
  useEffect(() => {
    const saveSelection = () => {
      try {
        if (Object.keys(selected).length > 0) {
          const dataToSave = {
            selected,
            _timestamp: Date.now(),
          };
          localStorage.setItem(
            `${tableInstanceKey}_selection`,
            JSON.stringify(dataToSave),
          );
        }
      } catch (error) {
        console.error("Error saving selection:", error);
      }
    };

    // Debounce the save to prevent too many writes
    const timer = setTimeout(saveSelection, 500);
    return () => clearTimeout(timer);
  }, [selected, tableInstanceKey]);

  const handleLinkWithHtmlClick = (row: any, columnConfig: any, value: any) => {
    // Check for HTMLBODY in various possible field names
    const htmlBody =
      row.HTMLBODY ||
      row.htmlbody ||
      row.HtmlBody ||
      row.Htmlbody ||
      row.HtmlBodyContent ||
      row.html_content ||
      "";

    // ALWAYS open the modal when IsLink is true
    setSelectedHtmlContent(htmlBody);
    setHtmlModalTitle(`${columnConfig?.label || "Content"}: ${value || ""}`);
    setHtmlModalOpen(true);
  };

  // Also, update the handleCellValueChangeWithApply function to use sortedRows
  const handleCellValueChangeWithApply = useCallback(
    (rowId: string, field: string, value: any) => {
      // First, call the original handleCellValueChange
      handleCellValueChange(rowId, field, value);

      // If we're in apply-first-cell mode
      if (applyFirstCellMode && sortedRows.length > 0) {
        const firstFilteredRow = sortedRows[0];

        // Check if this is the first FILTERED row's cell being edited
        if (rowId === firstFilteredRow.id) {
          // Save the original and new value
          setApplyColumnData({
            columnId: field,
            originalValue: firstFilteredRow[field],
            newValue: value,
          });

          // Apply to all other filtered rows (excluding the first one)
          applyFirstCellToAll(field, value, firstFilteredRow.id);
        }
      }
    },
    [
      applyFirstCellMode,
      sortedRows,
      handleCellValueChange,
      applyFirstCellToAll,
    ],
  );

  const applyRecentEditToAllFiltered = () => {
    if (!recentlyEditedCell || sortedRows.length === 0) {
      toast.error("No recent edit found or no filtered rows", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const { columnId, rowId, value } = recentlyEditedCell;

    // Find if the edited row is in filtered rows
    const editedRowIndex = sortedRows.findIndex((row) => row.id === rowId);

    if (editedRowIndex === -1) {
      toast.error("Edited row is not in filtered results", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Apply to all filtered rows
    applyFirstCellToAll(columnId!, value, rowId!);

    // Disable the apply mode
    setApplyFirstCellMode({
      enabled: false,
      columnId: null,
      value: null,
      rowId: null,
    });
  };

  const handleReplaceButtonClick = async (button: any) => {
    try {
      // Get the PostedJson data from saveData using the field IDs
      const postedJson: any[] = [];
      const fieldData = information?.Data || [];

      // Collect data from all fields
      if (fieldData && fieldData.length > 0) {
        fieldData.forEach((dataObj: any) => {
          if (dataObj?.Fields && dataObj.Fields.length > 0) {
            dataObj.Fields.forEach((fieldGroup: any) => {
              if (fieldGroup?.Values && fieldGroup.Values.length > 0) {
                fieldGroup.Values.forEach((field: any) => {
                  // Check if this field ID is in the button's buttonFields array
                  const isInButtonFields = button.buttonFields.some(
                    (btnField: any) =>
                      Number(btnField.FieldID) === Number(field.FieldID),
                  );

                  if (isInButtonFields) {
                    // Try to get the field value from multiple sources
                    const fieldValue =
                      saveData[field.FieldName] ||
                      field.FieldValue ||
                      field.defaultValue ||
                      "";

                    postedJson.push({
                      FieldID: field.FieldID,
                      FieldName: field.FieldName,
                      FieldValue: fieldValue,
                    });
                  }
                });
              }
            });
          }
        });
      }

      // Store the data for the drawer
      setReplaceButtonData({
        buttonId: button.ButtonID,
        moduleID: menuID || moduleID,
        recordID: button.ButtonID.toString(), // Use ButtonID as recordID
        postedJson: postedJson,
        apiUrl: button.ButtonURL, // Store the API URL
      });

      // Open the drawer
      setReplaceDrawerOpen(true);

      toast.success("Opening REPLACE form...", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error preparing REPLACE button:", error);
      toast.error("Failed to prepare REPLACE form", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
    }
  };
  // Add this function to close the drawer
  const handleCloseReplaceDrawer = () => {
    setReplaceDrawerOpen(false);
    setReplaceButtonData(null);
  };
  return (
    <Card
      className={field?.IsBorderApply ? "border-1" : ""}
      style={
        field?.IsBorderApply
          ? {
              borderStyle: "solid",
              borderColor: field?.bordercolor,
            }
          : {
              borderStyle: "",
              borderColor: "",
            }
      }
    >
      <Modal
        isOpen={isModalOpen}
        centered
        size="xl"
        fullscreen={true}
        backdrop={true}
        style={{
          top: "50px",
          height: `${popupdrawersettings?.popheight}vh`,
          width: `${popupdrawersettings?.popupwidth}%`,
          ...(popupdrawersettings?.Pos_Trans === "CENTER" && {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }),
        }}
        onClose={() => setIsModalOpen(false)}
      >
        <ModalBody>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 5,
            }}
          >
            <Button className="b0" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
          <div>
            <AutoCallPage
              recordID={modalData?.app_id}
              moduleID={modalData?.ModuleID}
              isModalOpen={true}
              defaultVisible={modalData?.defaultVisible}
              timelineData={modalData?.timelineData}
            />
          </div>
        </ModalBody>
      </Modal>
      <HtmlContentModal
        isOpen={htmlModalOpen}
        onClose={() => setHtmlModalOpen(false)}
        htmlContent={selectedHtmlContent}
        title={htmlModalTitle}
      />
      <CardBody>
        <div style={{ position: "relative" }}>
          {/* Toolbar */}
          <div
            className="mb-3 flex flex-wrap items-center gap-2"
            style={{ position: "relative" }}
          >
            <input
              value={qLive}
              onChange={(e) => setQLive(e.target.value)}
              placeholder="Global search…"
              className="h-9 w-64 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div
              className="ml-auto flex flex-wrap gap-2"
              style={{ position: "relative" }}
            >
              {/* <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={virtualize}
                    onChange={e => setVirtualize(e.target.checked)}
                  />
                  Virtualize
                </label> */}
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                <input
                  type="checkbox"
                  id="apply-first-cell-mode"
                  checked={applyFirstCellMode.enabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;

                    if (enabled) {
                      // Check if we have a recent edit
                      if (!recentlyEditedCell) {
                        toast.error(
                          <div>
                            <strong>No recent edit found!</strong>
                            <br />
                            <small>
                              1. Edit a cell in a filtered column
                              <br />
                              2. Then check this box to apply to all filtered
                              rows
                            </small>
                          </div>,
                          {
                            position: "top-right",
                            autoClose: 5000,
                            style: { top: "50px" },
                          },
                        );
                        return;
                      }

                      // Check if the edited cell is in filtered rows
                      const isInFiltered = sortedRows.some(
                        (row) => row.id === recentlyEditedCell.rowId,
                      );
                      if (!isInFiltered) {
                        toast.error(
                          "Edited cell is not in filtered results. Please edit a visible cell first.",
                          {
                            position: "top-right",
                            autoClose: 4000,
                          },
                        );
                        return;
                      }

                      // Enable apply mode and apply immediately
                      setApplyFirstCellMode({
                        enabled: true,
                        columnId: recentlyEditedCell.columnId,
                        value: recentlyEditedCell.value,
                        rowId: recentlyEditedCell.rowId,
                      });

                      // Apply to all filtered rows
                      applyRecentEditToAllFiltered();
                    } else {
                      // Disable mode
                      setApplyFirstCellMode({
                        enabled: false,
                        columnId: null,
                        value: null,
                        rowId: null,
                      });
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  title="Apply recent edit to all filtered rows"
                />
                <label
                  htmlFor="apply-first-cell-mode"
                  className="text-sm font-medium text-blue-700 whitespace-nowrap cursor-pointer"
                  title="1. Edit a cell → 2. Check this to apply to all filtered rows"
                >
                  Apply First Cell
                </label>

                {/* Show what will be applied */}
                {recentlyEditedCell && (
                  <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    <div>
                      Recent edit:{" "}
                      <strong>{recentlyEditedCell.columnId}</strong> = "
                      {recentlyEditedCell.value}"
                    </div>
                  </div>
                )}
              </div>

              {recentlyEditedCell && (
                <Button
                  onClick={() => {
                    setRecentlyEditedCell(null);
                    setApplyFirstCellMode({
                      enabled: false,
                      columnId: null,
                      value: null,
                      rowId: null,
                    });
                    toast.info("Cleared recent edit", {
                      position: "top-right",
                      autoClose: 2000,
                    });
                  }}
                  style={{
                    backgroundColor: "#f8f9fa",
                    color: "#6c757d",
                    border: "1px solid #dee2e6",
                  }}
                  size="sm"
                >
                  Clear Edit
                </Button>
              )}

              {/* In the toolbar section, update the ButtonDropdown component */}
              {tableButtons
                .filter((btn) => btn.visibility !== false)
                .map(renderDynamicButton)}
            </div>
          </div>

          {/* Table */}
          <div
            ref={tableWrapRef}
            className={clsx(
              "relative rounded-xl border bg-white overflow-auto",
            )}
            style={
              virtualize
                ? { maxHeight: `${pageSize * rowH + 56}px`, overflowY: "auto" }
                : isFreezeHeader
                  ? { maxHeight: "calc(100vh - 300px)", overflowY: "auto" }
                  : undefined
            }
          >
            <div ref={containerRef} className="relative">
              <table className="w-full border-collapse">
                <thead
                  className={isFreezeHeader ? "sticky top-0 z-30 bg-white" : ""}
                >
                  {/* Column header row */}
                  {/* Column header row */}
                  <tr className="bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-pink-50">
                    {visibleCols.map((c, i) => (
                      <th
                        key={c.id}
                        draggable={c.id !== "select"}
                        onDragStart={(e) => onDragStartHeader(i, e as any)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => onDropHeader(i, e as any)}
                        onClick={(e) =>
                          c.id !== "select" &&
                          toggleSort(c.id, (e as any).shiftKey)
                        }
                        className={clsx(
                          "relative px-3 py-2 text-sm font-semibold whitespace-nowrap group",
                          c.pin === "left" && "sticky left-0 z-40",
                          c.pin === "right" && "sticky right-0 z-40",
                        )}
                        style={{ width: c.width, minWidth: c.width }}
                        title="Click to sort • Shift+Click for multi-sort • Drag edge to resize • Drag to reorder"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span>{c.label || ""}</span>
                          {c.id !== "select" && (
                            <SortIcon
                              active={sortState.find((s) => s.id === c.id)}
                              desc={sortState.find((s) => s.id === c.id)?.desc}
                            />
                          )}
                        </span>

                        {c.id === "select" && (
                          <input
                            type="checkbox"
                            aria-label="Select page rows"
                            checked={allPageSelected}
                            onChange={toggleAllPage}
                          />
                        )}
                        {c.id !== "select" && c.id !== "actions" && (
                          <>
                            {/* Resize handle - visible on hover */}
                            <div
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                startResize(c.id, e as any);
                              }}
                              className={clsx(
                                "absolute right-0 top-0 h-full w-1.5 cursor-col-resize transition-all duration-150",
                                "hover:w-2 hover:bg-indigo-500",
                                "active:w-2 active:bg-indigo-600",
                                "group-hover:bg-indigo-300/50",
                                snapX !== null &&
                                  resizing.current?.colId === c.id &&
                                  "bg-indigo-600 w-2",
                              )}
                              style={{
                                backgroundColor:
                                  snapX !== null &&
                                  resizing.current?.colId === c.id
                                    ? "rgb(79, 70, 229)"
                                    : undefined,
                                boxShadow:
                                  snapX !== null &&
                                  resizing.current?.colId === c.id
                                    ? "0 0 0 2px rgba(79, 70, 229, 0.2)"
                                    : undefined,
                              }}
                              title="Drag to resize column"
                            />
                          </>
                        )}
                      </th>
                    ))}
                  </tr>

                  {/* Filters row: per-column filter inputs */}
                  <tr className="bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-pink-50">
                    {visibleCols.map((c) => {
                      const colConfig = getColumnConfig(c.id);
                      const inputType = colConfig?.Inputtype || "BOX";
                      const fVal = columnFilters[c.id];

                      return (
                        <th
                          key={c.id + "_filter"}
                          className={clsx(
                            "px-3 py-2 text-left text-sm",
                            c.pin === "left" && "sticky left-0 z-30",
                            c.pin === "right" && "sticky right-0 z-30",
                          )}
                          style={{ width: c.width, minWidth: c.width }}
                        >
                          {c.id !== "select" && c.id !== "actions" && (
                            <>
                              {inputType === "DROPDOWN" ? (
                                <AsyncSelect
                                  cacheOptions
                                  loadOptions={(inputValue: string) =>
                                    fetchDropdownData(c.id, inputValue)
                                  }
                                  defaultOptions={
                                    columnDropdownData[c.id] || []
                                  }
                                  value={
                                    fVal
                                      ? typeof fVal === "object"
                                        ? fVal
                                        : { label: fVal, value: fVal }
                                      : null
                                  }
                                  onChange={(opt: any) =>
                                    handleColumnFilterChange(c.id, opt)
                                  }
                                  isClearable
                                />
                              ) : inputType === "DATE" ? (
                                <ReactDatePicker
                                  selectsRange
                                  onChange={([start, end]) => {
                                    const value =
                                      start && end
                                        ? `${moment(start).format("YYYY-MM-DD")}|${moment(end).format("YYYY-MM-DD")}`
                                        : "";
                                    handleColumnFilterChange(c.id, value);
                                  }}
                                  isClearable
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={fVal ?? ""}
                                  onChange={(e) =>
                                    handleColumnFilterChange(
                                      c.id,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full rounded border px-2 py-1 text-sm"
                                  placeholder={`Filter ${c.label || ""}`}
                                />
                              )}
                            </>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {virtualize && (
                    <tr>
                      <td
                        colSpan={visibleCols.length}
                        style={{ height: virt.padTop }}
                      />
                    </tr>
                  )}

                  {renderRows.map((r, rowIdx) => (
                    <tr
                      key={r.id}
                      className={clsx(
                        "text-sm",
                        rowIdx % 2 ? "bg-gray-50" : undefined,
                      )}
                    >
                      {visibleCols.map((c) => {
                        const value = r[c.id] ?? "";
                        const colorConfig = getCellColorConfig(c.id, value);

                        return (
                          <td
                            key={c.id}
                            className={clsx(
                              "px-3 py-2",
                              c.pin === "left" &&
                                "sticky left-0 z-[5] bg-white shadow-[2px_0_0_#e5e7eb]",
                              c.pin === "right" &&
                                "sticky right-0 z-[5] bg-white shadow-[-2px_0_0_#e5e7eb]",
                            )}
                            style={{
                              width: c.width,
                              minWidth: c.width,
                              textAlign: colorConfig ? "center" : "left",
                              verticalAlign: "middle",
                            }}
                          >
                            {renderCell(c, r)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {virtualize && (
                    <tr>
                      <td
                        colSpan={visibleCols.length}
                        style={{ height: virt.padBottom }}
                      />
                    </tr>
                  )}
                </tbody>
              </table>

              {snapX != null && tableWrapRef.current && (
                <div
                  className="pointer-events-none absolute top-0 bottom-0 w-px bg-indigo-500/60"
                  style={{
                    left:
                      snapX -
                      (tableWrapRef.current?.getBoundingClientRect().left ||
                        0) +
                      "px",
                  }}
                />
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border px-2 py-1 text-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe === 1}
              >
                Prev
              </button>
              <div className="text-sm">
                Page {pageSafe} / {totalPages}
              </div>
              <button
                type="button"
                className="rounded-md border px-2 py-1 text-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe === totalPages}
              >
                Next
              </button>
              {/* Virtualize / Show all toggle button */}
              <button
                type="button"
                className={
                  "ml-2 rounded-md border px-2 py-1 text-sm " +
                  (virtualize ? "bg-indigo-600 text-white" : "bg-white")
                }
                onClick={handleVirtualizeToggle}
                title={
                  virtualize
                    ? "Showing all rows (click to paginate)"
                    : "Show all rows"
                }
              >
                {virtualize ? "Showing all" : "Show all"}
              </button>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number((e.target as any).value))}
                className="ml-2 h-9 rounded-md border bg-white px-2 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="rounded bg-gray-100 px-2 py-1">
                {Object.values(selected).filter(Boolean).length} selected
              </span>
            </div>
          </div>

          {/* Footer stats */}
          {tableFooter && tableFooter?.length > 0 && (
            <div className="flex justify-end gap-8 mt-3">
              {tableFooter?.map((footer: any) => (
                <div key={footer.Keyname}>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "black",
                    }}
                  >
                    {footer.Keyname}
                  </span>
                  :
                  <span style={{ fontSize: "14px", color: "black" }}>
                    {footer.KeyValue}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="sticky bottom-2 mt-4 inline-flex items-center gap-3 rounded-xl border bg-white px-3 py-2 text-sm shadow">
            <div>
              <b>{sortedRows.length}</b> rows
            </div>
            <div className="hidden sm:block">
              Virtualized: <b>{String(virtualize)}</b>
            </div>
          </div>
        </div>
      </CardBody>

      {/* Column visibility popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{ width: "300px", maxHeight: "400px" }}
      >
        <List>
          <ListItem
            style={{ justifyContent: "space-between", padding: "10px" }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={handleSelectAll}
              style={{ marginRight: "5px" }}
            >
              Select All
            </Button>
            <Button variant="outlined" size="small" onClick={handleUnselectAll}>
              Unselect All
            </Button>
          </ListItem>

          <ListItem divider />

          {columns &&
            columns.length > 0 &&
            columns.map((option: any) => (
              <ListItem key={option.name}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedOptions.includes(option?.name)}
                      onChange={handleCheckboxChange(option?.name)}
                      color="primary"
                    />
                  }
                  label={option.name}
                />
              </ListItem>
            ))}
          <ListItem>
            <button
              className="black"
              onClick={saveColumnPreferences}
              disabled={isSavingColumns}
              color="primary"
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "rgb(0, 136, 255)",
                color: "white",
                fontSize: "18px",
                fontWeight: "600",
                boxShadow: "1px",
                borderRadius: "5px",
              }}
            >
              {isSavingColumns ? (
                <CircularProgress size={24} />
              ) : (
                "Save Columns"
              )}
            </button>
          </ListItem>
        </List>
      </Popover>

      <Drawer
        anchor={autopopupdrawer?.Pos_Trans.toLowerCase()}
        open={replaceDrawerOpen}
        onClose={handleCloseReplaceDrawer}
        PaperProps={{
          sx: {
            width: `${autopopupdrawer?.popupwidth}%`,
            height: `${autopopupdrawer?.popheight}%`,
            boxShadow: "none",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <h3>REPLACE</h3>
            <Button
              onClick={handleCloseReplaceDrawer}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
              }}
            >
              Close
            </Button>
          </Box>

          {/* Content */}
          {replaceButtonData && (
            <div style={{ height: "calc(100% - 60px)" }}>
              <AutoCallPage
                recordID={replaceButtonData.recordID}
                moduleID={replaceButtonData.moduleID}
                isModalOpen={replaceDrawerOpen}
                postedJson={replaceButtonData.postedJson}
                replaceApiUrl={replaceButtonData.apiUrl}
              />
            </div>
          )}
        </Box>
      </Drawer>
    </Card>
  );
};

export default NewTablePage;
