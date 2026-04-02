import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import {
  ButtonDropdown,
  Card,
  CardBody,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ModalBody,
  Modal,
  Input,
  Col,
} from "reactstrap";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  List,
  ListItem,
  Popover,
} from "@mui/material";
import { FaSave } from "react-icons/fa";
import Loading from "@/app/loading";
import AutoCallPage from "@/app/Layout/autocall";
import AsyncSelect from "react-select/async";
import { AsyncSelectEditor } from "./asyncSelectEditor";
import { RCDatePicker } from "@/app/Layout/Common/DatePicker";
import ReactDatePicker from "react-datepicker";
import moment from "moment";
import { Cell } from "recharts";
import axios from "axios";

interface Column {
  name: string;
  omit?: boolean;
}

interface DataItem {
  [key: string]: any;
}

interface HeaderFooterItem {
  ItemValue: string;
  FontSize: string;
  Align: "LEFT" | "CENTER" | "RIGHT";
  IsBold: boolean;
  FontName: string;
  bgcolor?: string;
  FontColor?: string;
  Clsicon?: string;
  Clsiconcolor?: string;
  IsDisplay: boolean;
  InsideBorder?: boolean;
  OutsideBorder?: boolean;
  ImgWidth?: string;
  ImgHeight?: string;
  IMGUrl?: string;
  IsItallic?: boolean;
  IsUnderline?: boolean;
  Padright?: string;
  Padleft?: string;
  Padbottom?: string;
  Padtop?: string;
}

interface Logo {
  LogoURL: string;
  Align: "LEFT" | "CENTER" | "RIGHT";
  Height: string;
  Width: string;
}

const MainTable = ({
  TableArray,
  columns = [],
  title,
  editingRow = false,
  handleSaveChanges,
  editBtn,
  setEditBtn,
  isLoading,
  handleSaveData,
  height = "55vh",
  tableFooter,
  moduleID,
  buttonID,
  handleTableLinkClick,
  menuID,
  IsDetailPopupOpen,
  onChangeInput,
  promiseOptions,
  dropDownArray,
  onInputChange,
  reportData,
  loadingDropdown,
  defaultTabSelected,
  defaultVisible,
  field,
  information,
  onSelectionChanged,
  selectedRows,
  filename,
  ischeckBoxReq,
  logo,
  tableproperty,
  insideBorder,
  outsideBorder,
  tableFormatting,
  orientation,
  headerRows,
  footerRows,
  tableheaderfooterCSS,
  onSelectedColumnsChange
}: any) => {
  const gridRef = useRef<AgGridReact>(null);
  const [onOpen, setOnOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rowCount, setRowCount] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const btnId = sessionStorage.getItem("buttonID");

  // In MainTable component, update the grid options:
  // const gridOptions = {
  //   rowSelection: 'multiple',
  //   suppressRowClickSelection: true,
  //   onSelectionChanged: () => {
  //     const selectedNodes = gridRef.current?.api?.getSelectedNodes() || [];
  //     const selectedRows = selectedNodes.map(node => node.data);
  //     setSelectedRows(selectedRows);
  //     console.log("Selected rows:", selectedRows); // Debug log
  //   },
  // };

  const onSave = handleSaveData?.(() =>
    gridRef.current?.api?.getSelectedNodes() || []
  );

  const [selectedOptions, setSelectedOptions] = useState<string[]>(() => {
    if (tableFooter && tableFooter.length > 0) {
      return tableFooter
        .filter((footer: any) => footer.IsDisplay)
        .map((footer: any) => footer.Fieldname);
    }
    return columns && columns.length > 0 ? columns.map((col: any) => col.name) : [];
  });
  useEffect(() => {
    if (typeof onSelectedColumnsChange === "function") {
      onSelectedColumnsChange(selectedOptions);
    }
  }, [selectedOptions]);

  const [isSavingColumns, setIsSavingColumns] = useState(false);

  const handleCheckboxChange =
    (option: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setSelectedOptions((prevSelected) => [...prevSelected, option]);
      } else {
        setSelectedOptions((prevSelected) =>
          prevSelected.filter((item) => item !== option)
        );
      }
    };

  useEffect(() => {
    if (tableFooter && tableFooter.length > 0) {
      const visibleColumns = tableFooter
        .filter((footer: any) => footer.IsDisplay)
        .map((footer: any) => footer.Fieldname);
      setSelectedOptions(visibleColumns);
    } else if (columns && columns.length > 0) {
      setSelectedOptions(columns.map((col: any) => col.name));
    }
  }, [tableFooter, columns]);

  const filteredColumns = useMemo(() => {
    if (tableFooter && tableFooter.length > 0) {
      return columns.filter((col: any) => {
        const footerItem = tableFooter.find((footer: any) => footer.Fieldname === col.name);
        return footerItem ? footerItem.IsDisplay : true;
      });
    }
    return columns;
  }, [columns, tableFooter]);

  useEffect(() => {
    setLoading(true);
    if (rowCount === 0) {
      setLoading(false);
    }
    for (let i = 0; i <= rowCount && rowCount; i = i + 1) {
      if (i === rowCount) {
        setLoading(false);
      }
    }
  }, [rowCount]);

  const getFilteredData = () => {
    if (!gridRef.current || !gridRef.current.api) return TableArray;
    const filteredRows: any[] = [];
    gridRef.current.api.forEachNodeAfterFilter((node: any) => {
      if (node.data) filteredRows.push(node.data);
    });
    return filteredRows.length > 0 ? filteredRows : TableArray;
  };

  const handleSelectAll = () => {
    if (columns && columns.length > 0) {
      setSelectedOptions(columns.map((col: any) => col.name));
    }
  };

  const handleUnselectAll = () => {
    setSelectedOptions([]);
  };
  const convertToPDF = async (logo?: Logo, headerRowsParam?: any[], footerRowsParam?: any[]): Promise<void> => {
    // Add safe access for headerRows and footerRows
    const safeHeaderRows = headerRowsParam || [];
    const safeFooterRows = footerRowsParam || [];
    const headerBackground = tableheaderfooterCSS?.HeaderBackground || "#C7FFF8";
    const footerBackground = tableheaderfooterCSS?.FooterBackground || "#C7FFF8";
    const headerPosition = tableheaderfooterCSS?.Position || "0";
    const footerPosition = tableheaderfooterCSS?.Position || "0";
    const padLeft = parseFloat(tableheaderfooterCSS?.Padleft || "0.2") * 180 || 2;
    const padRight = parseFloat(tableheaderfooterCSS?.Padright || "0.2") * 180 || 2;
    const padTop = parseFloat(tableheaderfooterCSS?.Padtop || "0.1") * 180 || 1;
    const padBottom = parseFloat(tableheaderfooterCSS?.Padbottom || "0.1") * 180 || 1;
    const borderColor = tableheaderfooterCSS?.BorderColor || "#702421";
    const insideBorder = tableheaderfooterCSS?.InsideBorder || true;
    const outsideBorder = tableheaderfooterCSS?.OutsideBorder || true;
    const filteredData: DataItem[] = getFilteredData();
    const doc = new jsPDF({ orientation: orientation, unit: 'pt', format: 'A4' });

    const filteredPdfColumns: Column[] = filteredColumns.filter(
      (col: Column) => selectedOptions.includes(col.name) && !col.omit
    );

    // Create the table structure with merged cells
    const createMergedTableData = () => {
      const headers = filteredPdfColumns.map((col: Column) => col.name);
      // Transform your original data to handle merged cells
      const transformedData: (string | { content: string; rowSpan?: number; colSpan?: number; styles?: any })[][] = [];
      // Keep track of cells that should be skipped due to rowspan/colspan
      const skipCells: { [key: string]: boolean } = {};
      // Track cell heights for specific cells
      const cellHeights: { [key: string]: number } = {};
      // Process each row of your filtered data
      filteredData.forEach((item: DataItem, rowIndex: number) => {
        const row: (string | { content: string; rowSpan?: number; colSpan?: number; styles?: any })[] = [];
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
            (prop: any) => prop.rowindex === actualRowIndex && prop.colindex === actualColIndex
          );

          if (cellProperty) {
            // Handle alignment conversion
            let halign: "left" | "center" | "right" = "center";
            if (cellProperty.Align === "TOPCENTER" || cellProperty.Align === "BOTTOMCENTER") {
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
                fontStyle: (cellProperty.IsBold ? "bold" : "") + (cellProperty.IsItallic ? "italic" : ""),
                halign: halign,
                valign: cellProperty.Align === "TOPCENTER" ? "top" : cellProperty.Align === "BOTTOMCENTER" ? "bottom" : "middle",
                fillColor: cellProperty.bgcolor || undefined,
                textColor: cellProperty.FontColor || undefined,
                lineWidth: (cellProperty.OutsideBorder || cellProperty.InsideBorder) ? 1 : 0.1,
                lineColor: (cellProperty.OutsideBorder || cellProperty.InsideBorder) ? [0, 0, 0] : [200, 200, 200],
                cellPadding: {
                  top: parseFloat(cellProperty.Padtop || "0") * 10 || 3,
                  right: parseFloat(cellProperty.Padright || "0") * 10 || 3,
                  bottom: parseFloat(cellProperty.Padbottom || "0") * 10 || 3,
                  left: parseFloat(cellProperty.Padleft || "0") * 10 || 3
                },
                // Apply cell-specific height
                minCellHeight: cellProperty.RowHeight ? parseInt(cellProperty.RowHeight, 10) : undefined
              }
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

    const logoHeightVal = logo && logo.LogoURL ? parseInt(logo.Height, 10) || 40 : 0;
    const headerLineHeight = 15;
    const footerLineHeight = 12;

    // Calculate header height based on safeHeaderRows
    const headerHeight = safeHeaderRows.length * headerLineHeight + 40;
    const footerHeight = (safeFooterRows.length || 1) * footerLineHeight + 20;
    const availableContentHeight = pageHeight - topMargin - headerHeight - footerHeight - bottomMargin;

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
          const imageKey = `${row.Index}-${item.ItemValue || 'image'}`;
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
        'F'
      );
      let totalHeaderHeight = safeHeaderRows.length * headerLineHeight + 30;
      const headerOuterPadding = 10;
      const headerPadding = 15;
      const headerY = headerPadding;


      safeHeaderRows.forEach((row: any, rowIndex: number) => {
        const rowY = headerY + (rowIndex * headerLineHeight) + 15 + headerOuterPadding;
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
          const basePositionX = parseInt(positionKey || "0", 10) + leftMargin + headerOuterPadding;

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
                  imgHeight
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

              const paddingTop = parseFloat(item.Padtop || padTop.toString()) || 1;
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
                  'F'
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
          totalHeaderHeight + 10 - headerOuterPadding * 2
        );
      }
    };

    const footerImages: { [key: string]: string } = {};
    for (const row of safeFooterRows) {
      for (const item of row.Data) {
        if (item.IMGUrl) {
          const imageKey = `${row.Index}-${item.ItemValue || 'image'}`;
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
      doc.setFillColor(footerBackground);
      doc.rect(
        leftMargin,
        footerY,
        pageWidth - leftMargin - rightMargin,
        totalFooterHeight + 10,
        'F'
      );

      safeFooterRows.forEach((row: any, rowIndex: number) => {
        const rowY = footerY + (rowIndex * footerLineHeight) + 15 + footerOuterPadding;
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
          const basePositionX = parseInt(positionKey || "0", 10) + leftMargin + footerOuterPadding;

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
                  imgHeight
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

              const paddingTop = parseFloat(item.Padtop || padTop.toString()) || 1;
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
                  'F'
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
          totalFooterHeight + 10 - footerOuterPadding * 2
        );
      }
    };


    // Create columnStyles based on tablefooter ColWidth values
    const tableWidth = pageWidth - leftMargin - rightMargin;
    const columnStyles: { [key: number]: { cellWidth: number } } = {};
    filteredPdfColumns.forEach((col, index) => {
      const colMeta = tableFooter.find((meta: any) => meta.Colname === col.name);
      if (colMeta && colMeta.ColWidth) {
        const widthPercentage = parseFloat(colMeta.ColWidth);
        if (!isNaN(widthPercentage)) {
          const widthInPts = (widthPercentage / 100) * tableWidth;
          columnStyles[index] = { cellWidth: widthInPts };
        }
      }
    });

    const fontStyle: 'normal' | 'bold' | 'italic' | 'bolditalic' =
      tableFormatting?.IsBold && tableFormatting?.IsItallic
        ? 'bolditalic'
        : tableFormatting?.IsBold
          ? 'bold'
          : tableFormatting?.IsItallic
            ? 'italic'
            : 'normal';

    const headerStyles = {
      textColor: tableFormatting?.FontColor || undefined,
      fontStyle: fontStyle,
      font: tableFormatting?.FontName || "helvetica",
      fontSize: parseInt(tableFormatting?.FontSize, 10) || 9,
      halign: tableFormatting?.Align?.toLowerCase() || "center",
      valign: "middle",
      cellPadding: 3,
      fillColor: tableFormatting?.bgcolor || undefined
    };

    autoTable(doc, {
      head: [headers],
      body: body,
      margin: {
        top: headerHeight + topMargin + 10,
        bottom: footerHeight + bottomMargin + 10,
        left: leftMargin,
        right: rightMargin
      },
      startY: headerHeight + topMargin + 10,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineWidth: (outsideBorder || insideBorder) ? 0.1 : 0,
        lineColor: (outsideBorder || insideBorder) ? [0, 0, 0] : [255, 255, 255],
      },
      headStyles: headerStyles, // Apply the formatted header styles
      theme: 'striped',
      columnStyles: columnStyles,
      didParseCell: (data) => {
        // ✅ Only apply custom rowHeight to BODY cells, not header/footer
        if (data.section === 'body') {
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
        if (data.section === 'body') {
          const rowIndex = data.row.index + 1;
          const colIndex = data.column.index + 1;
          const cellKey = `${rowIndex}-${colIndex}`;


          if (cellHeights[cellKey] && data.cell.height < cellHeights[cellKey]) {
            data.row.height = cellHeights[cellKey];
          }
        }


        // ✅ Keep underline for header if needed
        if (data.section === 'head' && tableFormatting?.IsUnderline) {
          doc.setDrawColor(
            tableFormatting?.FontColor
              ? parseInt(tableFormatting.FontColor.substring(1), 16)
              : 0
          );
          doc.setLineWidth(0.5);
          doc.line(
            data.cell.x,
            data.cell.y + data.cell.height - 2,
            data.cell.x + data.cell.width,
            data.cell.y + data.cell.height - 2
          );
        }
      },
      didDrawPage: (data) => {
        addHeader(doc);
        addFooter(doc);

        // Draw the main border AFTER drawing header and footer
        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.rect(
          15,
          15,
          pageWidth - 30,
          pageHeight - 30
        );

        if (outsideBorder && doc.lastAutoTable && doc.lastAutoTable.finalY) {
          const table = doc.lastAutoTable;
          doc.setDrawColor(0);
          doc.setLineWidth(0.5);

          doc.rect(
            table.settings.margin.left,
            table.startY,
            pageWidth - table.settings.margin.left - table.settings.margin.right,
            table.finalY - table.startY
          );
        }
      }
    });

    doc.save(`${filename}.pdf`);
  };


  const convertToExcel = () => {
    const filteredData = getFilteredData();
    const workbook = XLSX.utils.book_new();
    const filteredExcelColumns = filteredColumns.filter((col: any) =>
      selectedOptions.includes(col.name) && !col.omit
    );
    const data = filteredData.map((item: any) => {
      return filteredExcelColumns.map((col: any) => item[col.name] ?? '');
    });
    data.unshift(filteredExcelColumns.map((col: any) => col.name));
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const convertToDocx = () => {
    try {
      const filteredData = getFilteredData();
      const visibleColumns = filteredColumns.filter((col: any) =>
        selectedOptions.includes(col.name) && !col.omit
      );
      const totalWidth = visibleColumns.reduce((sum: number, col: any) => {
        const colDef = gridRef.current?.api.getColumnDef(col.name);
        return sum + (colDef?.width || 100);
      }, 0);
      const columnStyles = visibleColumns.map((col: any) => {
        const colDef = gridRef.current?.api.getColumnDef(col.name);
        const width = colDef?.width || 100;
        return `width: ${(width / totalWidth * 100).toFixed(2)}%;`;
      }).join(' ');
      const htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:w="urn:schemas-microsoft-com:office:word"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8">
          <title>${title || 'Table Export'}</title>
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
              table-layout: fixed;
            }
            th, td {
              border: 1px solid #000;
              padding: 5px;
              ${columnStyles}
              overflow-wrap: break-word;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <table>
            <tr>
              ${visibleColumns.map((col: any) => `<th>${col.name}</th>`).join('')}
            </tr>
            ${filteredData.map((row: any) => `
              <tr>
                ${visibleColumns.map((col: any) => {
        const propPath = typeof col.selector === 'string' ? col.selector : col.name;
        let cellValue = '';
        if (typeof propPath === 'string' && propPath.includes('.')) {
          cellValue = propPath.split('.').reduce((obj: any, key) => obj?.[key], row) || '';
        } else {
          cellValue = row[propPath] ?? '';
        }
        return `<td>${cellValue}</td>`;
      }).join('')}
              </tr>
            `).join('')}
          </table>
        </body>
        </html>
      `;
      const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
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
      const response = await fetch('https://logpanel.insurancepolicy4u.com/api/Login/UpdateReportColumn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to save column preferences');
      }
      const data = await response.json();
    } catch (error) {
      console.error('Error saving column preferences:', error);
    } finally {
      setIsSavingColumns(false);
      setAnchorEl(null);
    }
  };

  const columnDefs = useMemo<ColDef[]>(() => {
    const defs: ColDef[] = [];

    if (ischeckBoxReq) {
      defs.push({
        headerName: '',
        field: 'select',
        width: 50,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        filter: false,
        sortable: false,
        pinned: 'center',
        lockPosition: true,
        lockVisible: true,
        cellStyle: {},
      });
    }

    defs.push(
      ...columns.map((col: any) => {
        const fieldName = typeof col.selector === 'string' ? col.selector : col.name;
        const columnData = reportData?.columnsArray?.find(
          (data: any) => data?.columnName === col.name
        );
        const inputType = columnData?.Inputtype;
        const isDisabled = columnData?.IsMaincol || false;
        const mainColValue = (TableArray[0]?.Maincol || TableArray[0]?.MainCol || TableArray.Maincol || '').trim();
        const colName = col.name?.trim();
        const isMainCol = mainColValue === colName;
        const isColumnEditable = editBtn && selectedOptions.includes(col.name) &&
          (inputType === 'TEXTBOX' || inputType === 'DATE' || inputType === 'DROPDOWN');

        // Preserve original cell renderer if exists
        const originalCellRenderer = col.cell ||
          (col.selector && typeof col.selector === 'function' ? col.selector : null);
        const isActionsColumn = col.alwaysVisible === true;

        return {
          headerName: col.name,
          field: fieldName,
          hide: isActionsColumn ? false : !selectedOptions.includes(col.name),
          sortable: true,
          resizable: true,
          wrapText: col.wrap !== true,
          autoHeight: col.wrap !== true,
          editable: isColumnEditable,
          cellEditor: inputType === 'DROPDOWN' ? AsyncSelectEditor : undefined,
          suppressColumnsToolPanel: isActionsColumn,
          cellEditorParams: inputType === 'DROPDOWN'
            ? {
              onChangeInput,
              promiseOptions,
              dropDownArray,
              onInputChange,
              isLoading: isLoading || loadingDropdown,
              isDisabled,
            }
            : {},
          cellRenderer: (params: any) => {
            const value = params.value ?? '';
            const row = params.data;
            // Handle edit mode first
            if (editBtn) {
              switch (inputType) {
                case 'DROPDOWN':
                  return (
                    <div style={{ width: '100%', height: '100%' }}>
                      <AsyncSelect
                        loadOptions={promiseOptions}
                        defaultOptions={dropDownArray}
                        onChange={(selectedOption: any) => {
                          onChangeInput({
                            target: { name: col.name, value: selectedOption ? selectedOption.value : '' },
                            row: params.data,
                          });
                        }}
                        value={{ label: value, value }}
                        onInputChange={(val) => onInputChange(val, col.name)}
                        isLoading={isLoading || loadingDropdown}
                        isDisabled={isDisabled}
                        noOptionsMessage={() => 'No Suggestions'}
                        onFocus={() => {
                          onInputChange('', col.name);
                        }}
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          container: (base) => ({ ...base, width: '100%' }),
                        }}
                        menuPlacement="auto"
                      />
                    </div>
                  );
                case 'TEXTBOX':
                case 'BOX':
                  return (
                    <Input
                      value={value}
                      name={col.name}
                      onChange={(e: any) => {
                        onChangeInput({
                          target: { name: col.name, value: e.target.value },
                          row: params.data,
                        });
                      }}
                      disabled={isDisabled}
                    />
                  );
                case 'DATE':
                  const [startDate, endDate] = value && typeof value === 'string' && value.includes('|')
                    ? value.split('|').map((d: string) => (d ? new Date(d) : null))
                    : [null, null];
                  return (
                    <div style={{ width: '100%', position: 'relative' }} key={`date-${row.id}-${row.columns}`}>
                      <ReactDatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(dates: [Date | null, Date | null]) => {
                          const [start, end] = dates;
                          onChangeInput({
                            target: {
                              name: columns,
                              value: start && end ? `${moment(start).format('YYYY-MM-DD')}|${moment(end).format('YYYY-MM-DD')}` : '',
                            },
                            row,
                          });
                        }}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select date range"
                        isClearable
                        disabled={isDisabled}
                        className="form-control"
                        withPortal
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                      />
                    </div>
                  );
                default:
                  return value || '-';
              }
            }

            // Check if this is an Actions column (for table buttons)
            if (col.name === "Actions" && originalCellRenderer) {
              return originalCellRenderer(row);
            }

            // Check if this is an uploaded files table (for delete/approve buttons)
            const isUploadedFilesTable =
              col.name === 'Filename' ||
              col.name === 'Dellink' ||
              col.name === 'Approvelink' ||
              (row && row.FileLink !== undefined);

            if ((col.name === 'Filename' || col.name === 'Dellink' || col.name === 'Approvelink') &&
              originalCellRenderer) {
              return originalCellRenderer(row);
            }


            // Special handling for main column links (only for non-Actions columns)
            if (col.name === 'app_id' || isMainCol) {
              const handleLinkClick = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation(); // Important: stop event bubbling

                if (IsDetailPopupOpen) {
                  setIsModalOpen(true);
                  setModalData({
                    app_id: value,
                    ModuleID: params.data?.ModuleID || moduleID || "",
                    defaultVisible: defaultVisible,
                  });
                } else if (handleTableLinkClick) {
                  handleTableLinkClick(
                    value,
                    params.data?.ModuleID || moduleID || "",
                    defaultVisible
                  );
                  console.log("handleTableLinkClick called with:", value,
                    params.data?.ModuleID || moduleID || "",
                    defaultVisible)
                } else {
                  setIsModalOpen(true);
                  setModalData(row);
                }
              };
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
            if (originalCellRenderer) {
              return originalCellRenderer(row);
            }
            // Default rendering for other columns
            return value || row[col.name] || '-';
          },
        };
      })
    );

    return defs;
  }, [
    columns,
    selectedOptions,
    reportData,
    TableArray,
    editBtn,
    IsDetailPopupOpen,
    moduleID,
    handleTableLinkClick,
    onChangeInput,
    promiseOptions,
    dropDownArray,
    onInputChange,
    isLoading,
    loadingDropdown,
    defaultVisible,
    ischeckBoxReq,
  ]);


  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 100,
      resizable: true,
      sortable: true,
      filter: true,
      wrapText: true,
      autoHeight: true,
      editable: false,
    }),
    []
  );

  const open = Boolean(anchorEl);
  const id = open ? 'checkbox-popover' : undefined;

  return (
    <Card>
      <Modal
        isOpen={isModalOpen}
        centered
        size="xl"
        fullscreen={true}
        backdrop={false}
        style={{ boxShadow: 'none', top: '50px' }}
        onClose={() => setIsModalOpen(false)}
      >
        <ModalBody>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: 5 }}>
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
      <CardBody>
        <div style={{ position: 'relative' }}>
          <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
            <AgGridReact
              ref={gridRef}
              rowData={TableArray?.length > 0 ? TableArray : []}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              onPaginationChanged={(params) => {
                setRowCount(params.api.paginationGetPageSize());
                setLoading(false);
              }}
              domLayout="normal"
              animateRows={true}
              stopEditingWhenCellsLoseFocus={false}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              onSelectionChanged={() => {
                const selectedNodes = gridRef.current?.api?.getSelectedNodes() || [];
                const selectedData = selectedNodes.map((node: any) => node.data);
                // setSelectedRows(selectedData);
                onSelectionChanged(selectedData); // Pass selected rows to parent
              }}
            />
          </div>
          {TableArray && TableArray?.length > 0 && (
            <div style={{ position: 'absolute', bottom: '0px', left: '0px' }}>
              <div className="flex">
                <ButtonDropdown isOpen={onOpen} toggle={() => setOnOpen(!onOpen)}>
                  <DropdownToggle caret>Export</DropdownToggle>
                  <DropdownMenu style={{ minWidth: '100%' }}>
                    <DropdownItem onClick={() => convertToPDF(logo, headerRows, footerRows)}>as PDF</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={convertToExcel}>as Excel</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={convertToDocx}>as Word(DOCX)</DropdownItem>
                  </DropdownMenu>
                </ButtonDropdown>
                <Button onClick={(event: any) => setAnchorEl(event.currentTarget)}>
                  Open List
                </Button>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  sx={{ width: '300px', maxHeight: '400px' }}
                >
                  <List>
                    <ListItem style={{ justifyContent: 'space-between', padding: '10px' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleSelectAll}
                        style={{ marginRight: '5px' }}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleUnselectAll}
                      >
                        Unselect All
                      </Button>
                    </ListItem>

                    <ListItem divider /> {/* Divider between buttons and checkboxes */}

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
                          width: '100%',
                          padding: '10px',
                          backgroundColor: 'rgb(0, 136, 255)',
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: '600',
                          boxShadow: '1px',
                          borderRadius: '5px'
                        }}>
                        {isSavingColumns ? (
                          <CircularProgress size={24} />
                        ) : (
                          'Save Columns'
                        )}
                      </button>
                    </ListItem>
                  </List>
                </Popover>
              </div>
            </div>
          )}
          {tableFooter && tableFooter?.length > 0 && (
            <div className="flex justify-end gap-8">
              {tableFooter?.map((footer: any) => (
                <div key={footer.Keyname}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'black' }}>
                    {footer.Keyname}
                  </span>
                  :
                  <span style={{ fontSize: '14px', color: 'black' }}>{footer.KeyValue}</span>
                </div>
              ))}
            </div>
          )}
          {title === 'Record Table' || title === 'Table Report Data' ? (
            !editBtn ? (
              <Button
                className="absolute left-[90%] top-1 text-xl gap-1"
                onClick={() => setEditBtn(!editBtn)}
                style={{
                  color: 'white',
                  backgroundColor: 'blue',
                  // position: 'absolute',
                  left: '90%',
                  top: '4px',
                  gap: '4px',
                  display: 'flex',
                }}
              >
                {isLoading ? (
                  <CircularProgress />
                ) : (
                  <div className="flex space-x-2">Edit</div>
                )}
              </Button>
            ) : (
              // <Button
              //   className="absolute left-[90%] top-1 text-xl gap-1"
              //   variant="contained"
              //   onClick={onSave}
              // >
              //   {isLoading ? (
              //     <CircularProgress />
              //   ) : (
              //     <div className="flex space-x-2">
              //       <FaSave />
              //       {selectedRows.length > 0 ? `Save (${selectedRows.length})` : 'Save'}
              //     </div>
              //   )}
              // </Button>
              <Button
                className="absolute left-[90%] top-1 text-xl gap-1"
                onClick={onSave}
                variant="contained"
              >
                {isLoading ? (
                  <CircularProgress />
                ) : (
                  <div className="flex space-x-2">
                    <FaSave />
                    Save
                  </div>
                )}
              </Button>
            )
          ) : null}
        </div>
      </CardBody>
    </Card >
  );
};

export default MainTable;