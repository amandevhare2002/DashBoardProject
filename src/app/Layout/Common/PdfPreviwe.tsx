import React, { CSSProperties, useState, useMemo, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, CardHeader, CardTitle, FormGroup, Label } from 'reactstrap';
import { PDFSettings } from './pdfSizeModal';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { DateField } from '@mui/x-date-pickers';
import { Editor } from '@tinymce/tinymce-react';
import { Resizable } from 're-resizable';
import { AiFillInfoCircle, AiFillEdit } from 'react-icons/ai';
import { BoxComponent } from '../autocall/_components/dnd/Box';
import { BoxField } from '../autocall/_components/Fields/Box';
import { ButtonField } from '../autocall/_components/Fields/ButtonField';
import { ChartField } from '../autocall/_components/Fields/Chart';
import { CheckBoxField } from '../autocall/_components/Fields/CheckBoxField';
import { IframeField } from '../autocall/_components/Fields/Iframe';
import { LableField } from '../autocall/_components/Fields/Lable';
import { RadioField } from '../autocall/_components/Fields/RadioField';
import { TableField } from '../autocall/_components/Fields/Table';
import { TextAreaField } from '../autocall/_components/Fields/TextAreaField';
import { TextBoxField } from '../autocall/_components/Fields/TextBox';
import { TimelineField } from '../autocall/_components/Fields/TimelineField';
import { UploadField } from '../autocall/_components/Fields/UploadField';
import Tooltip from "rc-tooltip";
import { DndProvider, useDrop, XYCoord } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PDFLableField } from '../autocall/_components/Fields/PDFLabelField';
import { PDFTableField } from '../autocall/_components/Fields/PDFTableField';
import { original } from '@reduxjs/toolkit';
import { tr } from 'date-fns/locale';

const PDFPreviewModal = ({
  isPDFPreviewOpen,
  toggle,
  pdfSettings,
  updatedPersonalDetails,
  value,
  isDrag,
  onResize,
  setModalData,
  setIsModalOpen,
  saveData,
  information,
  isOpen,
  promiseOptions,
  handleInputChange,
  onInputChange,
  setColumnSelect,
  handleCalculateData,
  calculateFormula,
  isModify,
  setValue,
  mainColField,
  menuID,
  menuIDQuery,
  currentRecordID,
  setUpdatedPersonalDetails,
  setHideSubmit,
  handleProfileInformation,
  setLoading,
  setSavePersonalData,
  savePersonalData,
  handleSubmit,
  handleExcelFileUpload,
  getCalculatorData,
  confirm,
  isMobile,
  setSaveData,
  editorRef,
  getCardFields,
  handleTableLinkClick,
  uploadedFiles,
  setUploadedFiles,
  tableMetadata,
  setTableMetadata,
  timelineData,
  vTimelineData,
  edit,
  setEdit,
  reportData,
  onChangeInput,
  dropDownArray,
  loadingDropdown,
  tableheaderfooterCSS,
  selectedPdfSettings,
  drop,
  tableproperty
}: any) => {
  const [selectedRowsByTable, setSelectedRowsByTable] = useState<{ [key: string]: any[] }>({});
  const containerRef = React.useRef(null);
  const pxToPt = (px: number) => (px * 72) / 96;
  const ptToPx = (pt: number) => (pt * 96) / 72;

  // Always show sections when modal is open
  const showSections = isPDFPreviewOpen;

  const { PageWidth, PageHeight } = pdfSettings.size;
  const isLandscape = pdfSettings.orientation === 'landscape';

  const modalWidth = ptToPx(isLandscape ? PageHeight : PageWidth);
  const modalHeight = ptToPx(isLandscape ? PageWidth : PageHeight);

  const getDimensions = () => {
    let heightPx: number;
    let widthPx: number;

    if (!selectedPdfSettings || !selectedPdfSettings.size) {
      heightPx = window.innerHeight * (Number(information.Data[0]?.PageHeight || 100) / 100);
      widthPx = window.innerWidth; // fallback
    } else {
      const { size, orientation } = selectedPdfSettings;

      // Convert pt to px
      const sizeHeightPx = ptToPx(size.PageHeight);
      const sizeWidthPx = ptToPx(size.PageWidth);

      if (orientation === 'portrait') {
        heightPx = sizeHeightPx;
        widthPx = sizeWidthPx;
      } else {
        // For landscape, swap width and height
        heightPx = sizeWidthPx;
        widthPx = sizeHeightPx;
      }
    }

    const heightPt = pxToPt(heightPx);
    const widthPt = pxToPt(widthPx);

    return {
      heightPx,
      widthPx,
      heightPt,
      widthPt,
      style: {
        height: `${heightPx}px`,
        width: `${widthPx}px`
      }
    };
  };

  const dimensions = getDimensions();

  // Calculate PDF layout sections - ALWAYS calculate when modal is open
  const pdfLayout = useMemo(() => {
    // Always show sections in preview, even if no data
    const baseLayout = {
      // For PREVIEW - always show with minimum heights
      previewHeaderHeight: 100,
      previewFooterHeight: 80,
      previewHasHeader: true,
      previewHasFooter: true,
      previewHeaderFields: [],
      previewFooterFields: [],
      previewBodyFields: [],

      // For PDF export - only if fields exist
      pdfHeaderFields: [],
      pdfFooterFields: [],
      pdfBodyFields: [],
      pdfHeaderHeight: 0,
      pdfFooterHeight: 0,

      headerBackground: selectedPdfSettings?.HeaderBackground || "#C7FFF8",
      footerBackground: selectedPdfSettings?.FooterBackground || "#C7FFF8",
      contentTop: 0,
      contentBottom: dimensions.heightPx,
      contentLeft: 0,
      contentRight: dimensions.widthPx
    };

    if (!updatedPersonalDetails || !updatedPersonalDetails[value]) {
      return baseLayout;
    }

    const currentTab = updatedPersonalDetails[value];
    const fields = currentTab.Values || [];

    // Get PDF settings for padding
    const Padbottom = selectedPdfSettings?.Padbottom || "0.1";
    const Padtop = selectedPdfSettings?.Padtop || "0.1";
    const Padleft = selectedPdfSettings?.Padleft || "0.2";
    const Padright = selectedPdfSettings?.Padright || "0.2";

    // Convert padding from inches to pixels (1 inch = 96 pixels)
    const padTopPx = parseFloat(Padtop) * 96;
    const padBottomPx = parseFloat(Padbottom) * 96;
    const padLeftPx = parseFloat(Padleft) * 96;
    const padRightPx = parseFloat(Padright) * 96;

    const contentTop = padTopPx;
    const contentBottom = dimensions.heightPx - padBottomPx;
    const contentLeft = padLeftPx;
    const contentRight = dimensions.widthPx - padRightPx;

    // Separate fields by section
    const previewHeaderFields: any[] = [];
    const previewFooterFields: any[] = [];
    const previewBodyFields: any[] = [];

    const pdfHeaderFields: any[] = [];
    const pdfFooterFields: any[] = [];
    const pdfBodyFields: any[] = [];

    // Define header and footer boundaries (top 25% and bottom 25% of content area)
    const headerThreshold = contentTop + ((contentBottom - contentTop) * 0.25);
    const footerThreshold = contentBottom - ((contentBottom - contentTop) * 0.25);

    fields.forEach((field: any) => {
      if (!field.DefaultVisible) return;

      const y = field.PDFColnum || field.Colnum || 0;

      // Check if field is in header area (top 25%)
      if (y < headerThreshold) {
        previewHeaderFields.push(field);
        pdfHeaderFields.push(field);
      }
      // Check if field is in footer area (bottom 25%)
      else if (y > footerThreshold) {
        previewFooterFields.push(field);
        pdfFooterFields.push(field);
      }
      // Otherwise it's in body
      else {
        previewBodyFields.push(field);
        pdfBodyFields.push(field);
      }
    });

    // Calculate DYNAMIC heights for PREVIEW - expand based on content
    let previewHeaderHeight = 100; // Minimum height
    let previewFooterHeight = 80; // Minimum height

    if (previewHeaderFields.length > 0) {
      const headerTops = previewHeaderFields.map(f => f.PDFColnum || f.Colnum || 0);
      const headerBottoms = previewHeaderFields.map(f => (f.PDFColnum || f.Colnum || 0) + parseInt((f.PDFHeight || f.Height || '20').toString().replace('px', '')));
      const headerTop = Math.min(...headerTops);
      const headerBottom = Math.max(...headerBottoms);
      previewHeaderHeight = Math.max(headerBottom - headerTop + 60, 100);
    }

    if (previewFooterFields.length > 0) {
      const footerTops = previewFooterFields.map(f => f.PDFColnum || f.Colnum || 0);
      const footerBottoms = previewFooterFields.map(f => (f.PDFColnum || f.Colnum || 0) + parseInt((f.PDFHeight || f.Height || '20').toString().replace('px', '')));
      const footerTop = Math.min(...footerTops);
      const footerBottom = Math.max(...footerBottoms);
      previewFooterHeight = Math.max(footerBottom - footerTop + 60, 80);
    }

    // Calculate heights for PDF export - ONLY if fields exist
    let pdfHeaderHeight = 0;
    let pdfFooterHeight = 0;

    if (pdfHeaderFields.length > 0) {
      const headerTops = pdfHeaderFields.map(f => f.PDFColnum || f.Colnum || 0);
      const headerBottoms = pdfHeaderFields.map(f => (f.PDFColnum || f.Colnum || 0) + parseInt((f.PDFHeight || f.Height || '20').toString().replace('px', '')));
      const headerTop = Math.min(...headerTops);
      const headerBottom = Math.max(...headerBottoms);
      pdfHeaderHeight = headerBottom - headerTop + 40;
    }

    if (pdfFooterFields.length > 0) {
      const footerTops = pdfFooterFields.map(f => f.PDFColnum || f.Colnum || 0);
      const footerBottoms = pdfFooterFields.map(f => (f.PDFColnum || f.Colnum || 0) + parseInt((f.PDFHeight || f.Height || '20').toString().replace('px', '')));
      const footerTop = Math.min(...footerTops);
      const footerBottom = Math.max(...footerBottoms);
      pdfFooterHeight = footerBottom - footerTop + 40;
    }

    return {
      ...baseLayout,
      // Override with calculated values
      previewHeaderHeight,
      previewFooterHeight,
      previewHeaderFields,
      previewFooterFields,
      previewBodyFields,
      pdfHeaderFields,
      pdfFooterFields,
      pdfBodyFields,
      pdfHeaderHeight,
      pdfFooterHeight,
      contentTop,
      contentBottom,
      contentLeft,
      contentRight
    };
  }, [updatedPersonalDetails, value, selectedPdfSettings, dimensions, isPDFPreviewOpen]);

  const handleTableSelectionChanged = (fieldID: string, selectedRows: any[]) => {
    setSelectedRowsByTable((prev) => {
      const newState = { ...prev, [fieldID]: selectedRows };
      return newState;
    });
  };

  // Function to determine field section for styling
  const getFieldSection = (field: Field) => {
    const y = field.PDFColnum || field.Colnum || 0;

    if (pdfLayout.previewHeaderFields.includes(field)) {
      return 'header';
    } else if (pdfLayout.previewFooterFields.includes(field)) {
      return 'footer';
    } else {
      return 'body';
    }
  };

  // Get field style based on section
  const getFieldStyle = (field: any, baseStyle: CSSProperties) => {
    const section = getFieldSection(field);
    const sectionStyle: CSSProperties = { ...baseStyle };

    switch (section) {
      case 'header':
        sectionStyle.border = '1px dashed #007bff';
        sectionStyle.backgroundColor = pdfLayout.headerBackground + '15';
        break;
      case 'footer':
        sectionStyle.border = '1px dashed #28a745';
        sectionStyle.backgroundColor = pdfLayout.footerBackground + '15';
        break;
      case 'body':
        sectionStyle.border = '1px dashed #6c757d';
        sectionStyle.backgroundColor = 'transparent';
        break;
    }

    return sectionStyle;
  };

  const exportTabToPDF = () => {
    if (!updatedPersonalDetails || !updatedPersonalDetails[value]) return;

    // helper: px → pt
    const pxToPt = (px: string | number | undefined, fallback = 0): number => {
      if (!px) return fallback;
      const val = typeof px === "string" ? parseInt(px.replace("px", ""), 10) : px;
      return (val || fallback) * 0.75;
    };

    // Helper function to convert hex to RGB
    const hexToRgb = (hex: string) => {
      if (!hex) return null;
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Get available fonts in jsPDF
    const getAvailableFont = (requestedFont: string, style: string = 'normal') => {
      const availableFonts = doc.getFontList();
      const fontKeys = Object.keys(availableFonts);

      // Check if requested font is available in the desired style
      const fontVariants = availableFonts[requestedFont];
      if (fontVariants) {
        // Check if the specific style variant exists
        if (fontVariants[style] || fontVariants.includes(style)) {
          return requestedFont;
        }
        // Fallback to normal if specific style not available
        return requestedFont;
      }

      // Fallback to standard fonts
      const standardFonts = ['helvetica', 'times', 'courier'];
      for (const font of standardFonts) {
        if (fontKeys.includes(font)) {
          return font;
        }
      }

      // Default fallback
      return 'helvetica';
    };

    const format = selectedPdfSettings?.size?.PageType || 'A4';
    const orientation = selectedPdfSettings?.orientation || 'portrait';

    const doc = new jsPDF({
      orientation: orientation,
      unit: 'pt',
      format: format as any
    });

    const currentTab = updatedPersonalDetails[value];
    const fields = currentTab.Values || [];

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // PDF Settings - Make dynamic from selectedPdfSettings
    const OutsideBorder = selectedPdfSettings?.OutsideBorder ?? false;
    const Padbottom = selectedPdfSettings?.Padbottom || "0.1";
    const Padleft = selectedPdfSettings?.Padleft || "0.2";
    const Padright = selectedPdfSettings?.Padright || "0.2";
    const Padtop = selectedPdfSettings?.Padtop || "0.1";
    const InsideBorder = selectedPdfSettings?.InsideBorder ?? true;
    const HeaderBackground = selectedPdfSettings?.HeaderBackground;
    const FooterBackground = selectedPdfSettings?.FooterBackground;

    // Convert padding from inches to points (1 inch = 72 points)
    const padTop = parseFloat(Padtop) * 72;
    const padBottom = parseFloat(Padbottom) * 72;
    const padLeft = parseFloat(Padleft) * 72;
    const padRight = parseFloat(Padright) * 72;

    // Define usable content area
    const contentLeft = padLeft;
    const contentRight = pageWidth - padRight;
    const contentTop = padTop;
    const contentBottom = pageHeight - padBottom;

    // Separate fields by section for PDF export - ONLY include fields that actually exist
    const headerFields: any[] = [];
    const footerFields: any[] = [];
    const bodyFields: any[] = [];
    const tableFields: any[] = [];

    // Define header and footer boundaries (same as preview logic)
    const headerThreshold = contentTop + ((contentBottom - contentTop) * 0.25);
    const footerThreshold = contentBottom - ((contentBottom - contentTop) * 0.25);

    fields.forEach((field: any) => {
      if (!field.DefaultVisible) return;

      const y = pxToPt(field.PDFColnum || field.Colnum || 0) + contentTop;

      // Separate table fields for special handling
      if (field.FieldType === 'TABLE') {
        tableFields.push(field);
        return;
      }

      // Check if field is in header area (top 25%)
      if (y < headerThreshold) {
        headerFields.push(field);
      }
      // Check if field is in footer area (bottom 25%)
      else if (y > footerThreshold) {
        footerFields.push(field);
      }
      // Otherwise it's in body
      else {
        bodyFields.push(field);
      }
    });

    // Calculate actual header and footer heights based on content for PDF
    let headerHeight = 0;
    let footerHeight = 0;

    if (headerFields.length > 0) {
      const headerTops = headerFields.map(f => pxToPt(f.PDFColnum || f.Colnum || 0) + contentTop);
      const headerBottoms = headerFields.map(f => (pxToPt(f.PDFColnum || f.Colnum || 0) + contentTop) + pxToPt(f.PDFHeight || f.Height || 20));
      const headerTop = Math.min(...headerTops);
      const headerBottom = Math.max(...headerBottoms);
      headerHeight = headerBottom - headerTop + 20; // Add padding
    }

    if (footerFields.length > 0) {
      const footerTops = footerFields.map(f => pxToPt(f.PDFColnum || f.Colnum || 0) + contentTop);
      const footerBottoms = footerFields.map(f => (pxToPt(f.PDFColnum || f.Colnum || 0) + contentTop) + pxToPt(f.PDFHeight || f.Height || 20));
      const footerTop = Math.min(...footerTops);
      const footerBottom = Math.max(...footerBottoms);
      footerHeight = footerBottom - footerTop + 20; // Add padding
    }

    // Function to add header to each page
    const addHeader = (doc: jsPDF, currentPage: number = 1) => {
      if (headerFields.length === 0) return;

      // For subsequent pages, reset to top
      const headerY = contentTop;

      // Draw header background
      const headerBgColor = hexToRgb(HeaderBackground);
      if (headerBgColor) {
        doc.setFillColor(headerBgColor.r, headerBgColor.g, headerBgColor.b);
        doc.rect(contentLeft, headerY, contentRight - contentLeft, headerHeight, 'F');
      }

      // Draw header border if enabled
      if (InsideBorder) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(contentLeft, headerY, contentRight, headerY);
        doc.line(contentLeft, headerY + headerHeight, contentRight, headerY + headerHeight);
      }

      // Render header fields
      headerFields.forEach((field: any) => {
        const x = pxToPt(field.PDFRownum || field.Rownum || 0) + contentLeft;
        const y = pxToPt(field.PDFColnum || field.Colnum || 0) + headerY;

        // Skip if field would be outside header area
        if (y < headerY || y > headerY + headerHeight) {
          return;
        }

        renderPDFField(field, 'header');
      });
    };

    // Function to add footer to each page
    const addFooter = (doc: jsPDF, currentPage: number = 1) => {
      if (footerFields.length === 0) return;

      // Draw footer background
      const footerBgColor = hexToRgb(FooterBackground);
      if (footerBgColor) {
        doc.setFillColor(footerBgColor.r, footerBgColor.g, footerBgColor.b);
        doc.rect(contentLeft, contentBottom - footerHeight, contentRight - contentLeft, footerHeight, 'F');
      }

      // Draw footer border if enabled
      if (InsideBorder) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(contentLeft, contentBottom - footerHeight, contentRight, contentBottom - footerHeight);
        doc.line(contentLeft, contentBottom, contentRight, contentBottom);
      }

      // Render footer fields
      footerFields.forEach((field: any) => {
        renderPDFField(field, 'footer');
      });
    };

    // Function to render a field in PDF
    const renderPDFField = (field: any, section: string = 'body') => {
      try {
        const fieldType = field.FieldType;

        // Skip interactive elements that shouldn't be in PDF
        const skipFieldTypes = ['BUTTON', 'CHECKBOX', 'RADIO', 'DROPDOWN', 'SELECT'];
        if (skipFieldTypes.includes(fieldType)) {
          return;
        }

        // Convert positions and sizes from pixels to points
        const x = pxToPt(field.PDFRownum || field.Rownum || 0) + contentLeft;
        const y = pxToPt(field.PDFColnum || field.Colnum || 0) + contentTop;
        const width = pxToPt(parseInt((field.PDFWidth || field.Width || '100').toString().replace('px', '')));
        const height = pxToPt(parseInt((field.PDFHeight || field.Height || '20').toString().replace('px', '')));

        // Get field value
        const fieldValue = saveData[field.FieldName] || field.FieldValue || '';

        switch (fieldType) {
          case 'LABEL':
          case 'BOX':
            // Set font properties
            const fontSize = parseInt(field.FontSize || field.TextFontSize || '12');
            const availableFont = getAvailableFont(field.Fontname || 'helvetica');

            // Set font style
            const isBold = field.IsBold || field.IsTextBold;
            const isItalic = field.IsItalic || field.IsTextItalic;

            if (isBold && isItalic) {
              try {
                doc.setFont(availableFont, 'bolditalic');
              } catch (e) {
                doc.setFont(availableFont, 'bold');
              }
            } else if (isBold) {
              doc.setFont(availableFont, 'bold');
            } else if (isItalic) {
              doc.setFont(availableFont, 'italic');
            } else {
              doc.setFont(availableFont, 'normal');
            }

            doc.setFontSize(fontSize);

            // Set text color
            if (field.TextFontColor || field.fontcolor) {
              const tHex = field.TextFontColor || field.fontcolor;
              const trgb = hexToRgb(tHex);
              if (trgb) doc.setTextColor(trgb.r, trgb.g, trgb.b);
            } else {
              doc.setTextColor(0, 0, 0);
            }

            // Handle background color for BOX fields
            if (fieldType === 'BOX' && (field.TextBgcolor || field.Bgcolor)) {
              const bgHex = field.TextBgcolor || field.Bgcolor;
              const rgb = hexToRgb(bgHex);
              if (rgb) {
                doc.setFillColor(rgb.r, rgb.g, rgb.b);
                doc.rect(x, y, width, height, 'F');
              }
            }

            // Handle border for BOX fields
            if (fieldType === 'BOX' && (field.ShowBorder || field.OutsideBorder || field.BoxBorder)) {
              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.5);
              doc.rect(x, y, width, height);
            }

            // Handle text alignment
            const alignment = (field.TextAlignment || field.Align || "left").toString().trim().toLowerCase();
            const text = String(fieldValue);
            const textWidth = doc.getTextWidth(text);

            let textX = x + 4;
            if (alignment.includes('center')) {
              textX = x + (width / 2) - (textWidth / 2);
            } else if (alignment.includes('right')) {
              textX = x + width - textWidth - 4;
            }

            // Handle vertical alignment
            let textY = y + fontSize + 4;
            const valign = (field.VerticalAlignment || field.Valign || "top").toString().toLowerCase();
            if (valign.includes('middle') || valign.includes('center')) {
              textY = y + (height / 2) + (fontSize / 3);
            } else if (valign.includes('bottom')) {
              textY = y + height - 4;
            }

            // Split text if needed
            let lines = [text];
            const availableTextWidth = width - 8;
            if (textWidth > availableTextWidth) {
              lines = doc.splitTextToSize(text, availableTextWidth);
            }

            // Draw each line of text
            const lineHeight = fontSize * 1.15;
            lines.forEach((line: string, idx: number) => {
              const thisLineY = textY + (idx * lineHeight);
              doc.text(line, textX, thisLineY);
            });
            break;

          case 'IMAGE':
            if (fieldValue && (fieldValue.startsWith('data:image/') || fieldValue.startsWith('iVBORw0KGgo'))) {
              try {
                doc.addImage(fieldValue, 'PNG', x, y, width, height);
              } catch (error) {
                console.error('Error adding image:', error);
                doc.setFontSize(10);
                doc.text(`[Image: ${field.FieldName}]`, x, y);
              }
            } else if (field.ControlImageUrl) {
              try {
                doc.addImage(field.ControlImageUrl, 'PNG', x, y, width, height);
              } catch (error) {
                console.error('Error adding image from ControlImageUrl:', error);
                doc.setFontSize(10);
                doc.text(`[Image: ${field.FieldName}]`, x, y);
              }
            } else {
              doc.setFontSize(10);
              doc.text(`[Image: ${field.FieldName}]`, x, y);
            }
            break;

          default:
            // Default rendering for other field types as text
            if (fieldValue) {
              doc.setFontSize(10);
              doc.text(String(fieldValue), x, y + 10);
            }
            break;
        }

      } catch (error) {
        console.error('Error rendering field in PDF:', field.FieldName, error);
        const x = pxToPt(field.PDFRownum || field.Rownum || 0) + contentLeft;
        const y = pxToPt(field.PDFColnum || field.Colnum || 0) + contentTop;
        doc.setFontSize(8);
        doc.setTextColor(255, 0, 0);
        doc.text(`Error: ${field.FieldName}`, x, y);
      }
    };

    // Function to render table fields with autoTable
    const renderTableField = (field: any) => {
      try {
        let tableData: any[] = field.TableData || field.ds || field.buttonFields || [];
        if (!tableData.length) {
          console.log("No table data available for field:", field.FieldName);
          return;
        }

        // Get table properties from tableMetadata
        const tableProperties = tableMetadata?.tableproperty || [];
        const tableWidths = tableMetadata?.tableWidth || [];
        const tableFormatting = tableMetadata?.tableFormatting || {};

        console.log("Table field:", field.FieldName);
        console.log("Table data rows:", tableData.length);

        let selectedHeaders: string[] = field?.SelectedColumns || field?.selectedColumns || [];
        if (!selectedHeaders || !selectedHeaders.length) {
          selectedHeaders = Object.keys(tableData[0] || {});
        }

        let columns = selectedHeaders.map((key: string) => ({
          header: key,
          dataKey: key,
        }));

        if (tableWidths.length > 0) {
          columns = columns.filter(col => {
            const meta = tableWidths.find((m: any) => m.Colname === col.dataKey);
            return meta?.IsDisplay === true;
          });
        }

        console.log("Columns:", columns.map(c => c.dataKey));

        // Calculate table position
        const tableX = pxToPt(field.PDFRownum || field.Rownum || 0) + contentLeft;
        const headerSpace = headerFields.length > 0 ? headerHeight : 0;
        const tableStartY = contentTop + headerSpace + 20;

        // Convert provided dimensions to points
        const tableWidthPx = parseInt(field.PDFWidth || "418"); // 418px
        const tableHeightPx = parseInt(field.PDFHeight || "129"); // 129px
        const tableWidthPt = pxToPt(tableWidthPx); // 313.5pt
        const tableHeightPt = pxToPt(tableHeightPx); // 96.75pt
        console.log(`Table dimensions: ${tableWidthPt}pt x ${tableHeightPt}pt`);

        // Create columnStyles based on percentages
        const columnStyles: { [key: number]: { cellWidth: number } } = {};
        columns.forEach((col, index) => {
          const colMeta = tableWidths.find((meta: any) => meta.Colname === col.dataKey);
          if (colMeta && colMeta.ColWidth) {
            const widthPercentage = parseFloat(colMeta.ColWidth);
            if (!isNaN(widthPercentage)) {
              const widthInPts = (widthPercentage / 100) * tableWidthPt;
              columnStyles[index] = { cellWidth: widthInPts };
            }
          }
        });

        // Function to apply table properties to specific cells
        const applyTableProperties = (data: any[], columns: any[]) => {
          const processedData: any[] = [];
          const skipCells: Set<string> = new Set();
          const cellHeights: { [key: string]: number } = {};

          data.forEach((row, rowIndex) => {
            const processedRow: (string | { content: string; rowSpan?: number; colSpan?: number; styles?: any })[] = [];

            columns.forEach((col, colIndex) => {
              const cellKey = `${rowIndex}-${colIndex}`;

              if (skipCells.has(cellKey)) {
                processedRow.push(null);
                return;
              }

              const cellProperty = tableProperties.find(
                (prop: any) => prop.rowindex === rowIndex + 1 && prop.colindex === colIndex + 1
              );

              if (cellProperty) {
                let halign: "left" | "center" | "right" = "center";
                if (cellProperty.Align?.includes("CENTER")) halign = "center";
                else if (cellProperty.Align?.includes("LEFT")) halign = "left";
                else if (cellProperty.Align?.includes("RIGHT")) halign = "right";

                let valign: "top" | "middle" | "bottom" = "middle";
                if (cellProperty.Align?.includes("TOP")) valign = "top";
                else if (cellProperty.Align?.includes("BOTTOM")) valign = "bottom";

                const fontStyle = (cellProperty.IsBold ? "bold" : "") + (cellProperty.IsItallic ? "italic" : "");

                if (cellProperty.RowHeight) {
                  const cellHeight = parseInt(cellProperty.RowHeight, 10);
                  if (!isNaN(cellHeight)) {
                    cellHeights[`${rowIndex + 1}-${colIndex + 1}`] = cellHeight;
                  }
                }

                const bgRgb = hexToRgb(cellProperty.bgcolor);
                const textRgb = hexToRgb(cellProperty.FontColor);

                const cellStyles = {
                  fontSize: parseInt(cellProperty.FontSize, 10) || 9,
                  font: getAvailableFont(cellProperty.FontName || "helvetica"),
                  fontStyle: fontStyle || "normal",
                  halign,
                  valign,
                  fillColor: bgRgb ? [bgRgb.r, bgRgb.g, bgRgb.b] : undefined,
                  textColor: textRgb ? [textRgb.r, textRgb.g, textRgb.b] : undefined,
                  lineWidth: (cellProperty.OutsideBorder || cellProperty.InsideBorder || OutsideBorder || InsideBorder) ? 0.1 : 0,
                  lineColor: (cellProperty.OutsideBorder || cellProperty.InsideBorder || OutsideBorder || InsideBorder) ? [0, 0, 0] : [200, 200, 200],
                  cellPadding: {
                    top: parseFloat(cellProperty.Padtop || Padtop) * 72 || 3,
                    right: parseFloat(cellProperty.Padright || Padright) * 72 || 3,
                    bottom: parseFloat(cellProperty.Padbottom || Padbottom) * 72 || 3,
                    left: parseFloat(cellProperty.Padleft || Padleft) * 72 || 3
                  },
                  minCellHeight: cellProperty.RowHeight ? parseInt(cellProperty.RowHeight, 10) : undefined
                };

                const cellObject = {
                  content: row[col.dataKey] ?? "",
                  rowSpan: cellProperty.rowspan || cellProperty.rowSpan || 1,
                  colSpan: cellProperty.colspan || cellProperty.colSpan || 1,
                  styles: cellStyles
                };

                processedRow.push(cellObject);

                const rowSpan = cellObject.rowSpan;
                const colSpan = cellObject.colSpan;
                for (let r = 0; r < rowSpan; r++) {
                  for (let c = 0; c < colSpan; c++) {
                    if (r === 0 && c === 0) continue;
                    skipCells.add(`${rowIndex + r}-${colIndex + c}`);
                  }
                }
              } else {
                processedRow.push(row[col.dataKey] ?? "");
              }
            });

            processedData.push(processedRow);
          });

          return { processedData, cellHeights };
        };

        // Process ALL data
        const { processedData: fullBody, cellHeights } = applyTableProperties(tableData, columns);
        const headers = columns.map(col => col.header);

        // Prepare headStyles from tableFormatting
        let headFontStyle = 'normal';
        if (tableFormatting.IsBold && tableFormatting.IsItallic) {
          headFontStyle = 'bolditalic';
        } else if (tableFormatting.IsBold) {
          headFontStyle = 'bold';
        } else if (tableFormatting.IsItallic) {
          headFontStyle = 'italic';
        }

        const headFillRgb = hexToRgb(tableFormatting.bgcolor);
        const headTextRgb = hexToRgb(tableFormatting.FontColor);

        const headStyles = {
          fillColor: headFillRgb ? [headFillRgb.r, headFillRgb.g, headFillRgb.b] : [241, 241, 241],
          textColor: headTextRgb ? [headTextRgb.r, headTextRgb.g, headTextRgb.b] : [0, 0, 0],
          fontStyle: headFontStyle,
          font: getAvailableFont(tableFormatting.FontName || 'helvetica'),
          fontSize: parseInt(tableFormatting.FontSize, 10) || 9,
          halign: (tableFormatting.Align || 'CENTER').toLowerCase(),
          valign: 'middle',
          cellPadding: 3
        };

        // Estimate row height
        const defaultRowHeight = 15; // Base height per row (font size 9 + padding)
        const headerHeightPt = 20; // Approximate height for header row
        const maxRowsInHeight = Math.floor((tableHeightPt - headerHeightPt) / defaultRowHeight);
        console.log(`Max rows that fit in ${tableHeightPt}pt (after header): ${maxRowsInHeight}`);

        // Split data into chunks of maxRowsInHeight
        const chunks = [];
        for (let i = 0; i < fullBody.length; i += maxRowsInHeight) {
          chunks.push(fullBody.slice(i, i + maxRowsInHeight));
        }

        console.log("Rendering table with autoTable - Chunks:", chunks.length);

        // Render each chunk on a new page with header
        chunks.forEach((chunk, index) => {
          if (index > 0) {
            doc.addPage(); // Start a new page for remaining chunks
          }

          autoTable(doc, {
            head: [headers], // Include header on every page
            body: chunk,
            startY: tableStartY,
            margin: { left: tableX },
            tableWidth: tableWidthPt,
            theme: 'striped',
            columnStyles,
            headStyles,
            bodyStyles: {
              fontSize: 9,
              cellPadding: 3,
              minCellHeight: 15,
              overflow: 'linebreak',
            },
            styles: {
              fontSize: 9,
              cellPadding: 3,
              lineWidth: (OutsideBorder || InsideBorder) ? 0.1 : 0,
              lineColor: (OutsideBorder || InsideBorder) ? [0, 0, 0] : [255, 255, 255],
              overflow: 'linebreak',
            },
            didParseCell: (data) => {
              if (data.section === 'body') {
                const rowIndex = data.row.index + 1 + (index * maxRowsInHeight);
                const colIndex = data.column.index + 1;
                const cellKey = `${rowIndex}-${colIndex}`;
                if (cellHeights[cellKey]) {
                  data.cell.styles.minCellHeight = cellHeights[cellKey];
                }
              }
            },
            didDrawPage: (data) => {
              addHeader(doc, data.pageNumber);
              addFooter(doc, data.pageNumber);

              if (OutsideBorder && doc.lastAutoTable && doc.lastAutoTable.finalY) {
                const table = doc.lastAutoTable;
                doc.setDrawColor(0);
                doc.setLineWidth(0.5);
                doc.rect(
                  table.settings.margin.left,
                  data.settings.startY,
                  pageWidth - table.settings.margin.left - table.settings.margin.right,
                  data.cursor.y - data.settings.startY
                );
              }

              console.log(`Page ${data.pageNumber} drawn, final Y: ${data.cursor.y}`);
            },
            pageBreak: 'avoid' // Ensure each chunk stays within its page
          });
        });

        console.log("Table rendering completed successfully for field:", field.FieldName);

      } catch (err) {
        console.error("Error rendering table:", err);
        const x = pxToPt(field.PDFRownum || field.Rownum || 0) + contentLeft;
        const y = pxToPt(field.PDFColnum || field.Colnum || 0) + contentTop;
        doc.setFontSize(10);
        doc.setTextColor(255, 0, 0);
        doc.text("Error rendering table: " + field.FieldName, x, y + 20);
      }
    };
    // Calculate starting position for tables - after header if header exists
    const tableStartY = headerFields.length > 0 ? contentTop + headerHeight + 10 : contentTop;

    // Add header to first page
    addHeader(doc, 1);

    // Render body fields first (they won't interfere with table positioning)
    bodyFields.forEach((field: any) => {
      renderPDFField(field, 'body');
    });

    // Render table fields - they will start after header on first page
    tableFields.forEach((field: any) => {
      renderTableField(field);
    });

    // Add footer to first page
    addFooter(doc, 1);

    doc.save(`${currentTab.TabAliasName || 'form'}-export.pdf`);
  };
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Modal isOpen={isPDFPreviewOpen} toggle={toggle} size="lg" style={{ maxWidth: `${modalWidth}px` }}>
        <ModalHeader toggle={toggle}>
          PDF Layout Editor
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            <span style={{ color: '#007bff' }}>■ Header</span> |
            <span style={{ color: '#6c757d' }}> ■ Body</span> |
            <span style={{ color: '#28a745' }}> ■ Footer</span>
          </div>
        </ModalHeader>

        <ModalBody style={{ padding: '10px', overflow: 'auto' }}>
          <div
            ref={drop}
            style={{
              width: `${dimensions.style.width}`,
              height: `${dimensions.style.height}`,
              position: 'relative',
              backgroundColor: '#fff',
              border: '2px solid #333',
              margin: '0 auto',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Header Section - ALWAYS show when modal is open */}
            {showSections && (
              <div
                style={{
                  position: 'absolute',
                  top: `${pdfLayout.contentTop}px`,
                  left: '0',
                  right: '0',
                  height: `${pdfLayout.previewHeaderHeight}px`,
                  backgroundColor: pdfLayout.headerBackground + '20',
                  borderBottom: '2px solid #007bff',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    background: '#007bff',
                    color: 'white',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    borderRadius: '0 0 4px 0'
                  }}
                >
                  HEADER {pdfLayout.previewHeaderFields.length > 0 ?
                    `(${pdfLayout.previewHeaderFields.length} fields - ${pdfLayout.previewHeaderHeight}px)` :
                    '(empty - will not appear in PDF)'}
                </div>
              </div>
            )}

            {/* Footer Section - ALWAYS show when modal is open */}
            {showSections && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: `${pdfLayout.previewFooterHeight}px`,
                  backgroundColor: pdfLayout.footerBackground + '20',
                  borderTop: '2px solid #28a745',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    background: '#28a745',
                    color: 'white',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    borderRadius: '0 0 4px 0'
                  }}
                >
                  FOOTER {pdfLayout.previewFooterFields.length > 0 ?
                    `(${pdfLayout.previewFooterFields.length} fields - ${pdfLayout.previewFooterHeight}px)` :
                    '(empty - will not appear in PDF)'}
                </div>
              </div>
            )}

            {/* Body Section - ALWAYS show when modal is open */}
            {showSections && (
              <div
                style={{
                  position: 'absolute',
                  top: `${pdfLayout.contentTop + pdfLayout.previewHeaderHeight}px`,
                  bottom: `${pdfLayout.previewFooterHeight}px`,
                  left: '0',
                  right: '0',
                  border: '1px dashed #6c757d',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    background: '#6c757d',
                    color: 'white',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    borderRadius: '0 0 4px 0'
                  }}
                >
                  BODY {pdfLayout.previewBodyFields.length > 0 ?
                    `(${pdfLayout.previewBodyFields.length} fields)` :
                    '(empty)'}
                </div>
              </div>
            )}

            {isModify && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000
              }}>
                <Button color="primary" onClick={exportTabToPDF} size="sm">
                  Export to PDF
                </Button>
              </div>
            )}

            {/* Render Fields */}
            {updatedPersonalDetails &&
              updatedPersonalDetails[value] &&
              updatedPersonalDetails[value]?.Values &&
              updatedPersonalDetails[value]?.Values.map((field: any, i: number) => {
                const baseStyle: CSSProperties = {
                  position: "absolute",
                  cursor: isDrag ? "move" : "default",
                  border: isDrag ? "1px dashed gray" : "0px",
                  backgroundColor: isDrag ? "white" : "transparent",
                  paddingLeft: isDrag ? "0.5rem" : "0rem",
                  left: `${field.PDFRownum || field.Rownum}px`,
                  top: `${field.PDFColnum || field.Colnum}px`,
                  width: `${field.PDFWidth || field.Width}`,
                  height: `${field.PDFHeight || field.Height}`,
                  zIndex: 10
                };

                const finalStyle = getFieldStyle(field, baseStyle);

                // Handle BOX fields as LABEL fields in preview
                const fieldType = field?.FieldType;
                const displayFieldType = fieldType === "BOX" ? "LABEL" : fieldType;

                switch (displayFieldType) {
                  case "LABEL":
                    return field.DefaultVisible ? (
                      <LableField
                        style={finalStyle}
                        field={field}
                        onResize={onResize}
                        className={field.ClsIcon}
                        i={i}
                        isDrag={isDrag}
                        setModalData={setModalData}
                        setIsModalOpen={setIsModalOpen}
                        saveData={saveData}
                        information={information}
                        isPDFPreviewOpen={true}
                      />
                    ) : null;
                  // case "BUTTON":
                  //   return (
                  //     <ButtonField
                  //       field={field}
                  //       isDrag={isDrag}
                  //       onResize={onResize}
                  //       style={finalStyle}
                  //       isModify={isModify}
                  //       saveData={saveData}
                  //       setSaveData={setSaveData}
                  //       setModalData={setModalData}
                  //       setIsModalOpen={setIsModalOpen}
                  //       setValue={setValue}
                  //       value={value}
                  //       mainColField={mainColField}
                  //       menuID={menuID}
                  //       menuIDQuery={menuIDQuery}
                  //       currentRecordID={currentRecordID}
                  //       updatedPersonalDetails={updatedPersonalDetails}
                  //       setUpdatedPersonalDetails={setUpdatedPersonalDetails}
                  //       setHideSubmit={setHideSubmit}
                  //       handleProfileInformation={handleProfileInformation}
                  //       isOpen={isOpen}
                  //       setLoading={setLoading}
                  //       setSavePersonalData={setSavePersonalData}
                  //       savePersonalData={savePersonalData}
                  //       handleSubmit={handleSubmit}
                  //       handleExcelFileUpload={handleExcelFileUpload}
                  //       getCalculatorData={getCalculatorData}
                  //       confirm={confirm}
                  //       className={field.ClsIcon}
                  //       setTableMetadata={setTableMetadata}
                  //       selectedRowsByTable={selectedRowsByTable}
                  //       isPDFPreviewOpen={isPDFPreviewOpen}
                  //     />
                  //   );
                  case "TABLE":
                    return field.DefaultVisible ? (
                      <TableField
                        style={finalStyle}
                        field={field}
                        onResize={onResize}
                        isModify={isModify}
                        isDrag={isDrag}
                        i={i}
                        saveData={saveData}
                        updatedPersonalDetails={updatedPersonalDetails}
                        className={field.ClsIcon}
                        handleTableLinkClick={handleTableLinkClick}
                        menuID={menuID}
                        currentRecordID={currentRecordID}
                        isDetailPopupOpen={tableMetadata.isDetailPopupOpen}
                        moduleID={tableMetadata.moduleID}
                        fieldID={tableMetadata.fieldID}
                        defaultVisible={tableMetadata.defaultVisible}
                        tablebuttons={tableMetadata.tablebuttons}
                        tableWidth={tableMetadata.tableWidth}
                        ischeckBoxReq={tableMetadata.ischeckBoxReq}
                        headerData={tableMetadata.headerData}
                        footerData={tableMetadata.footerData}
                        logo={tableMetadata.logo}
                        tableproperty={tableMetadata.tableproperty}
                        outsideBorder={tableMetadata.outsideBorder}
                        insideBorder={tableMetadata.insideBorder}
                        filename={tableMetadata.filename}
                        tableFormatting={tableMetadata.tableFormatting}
                        orientation={tableMetadata.orientation}
                        headerRows={tableMetadata.headerRows}
                        footerRows={tableMetadata.footerRows}
                        tableheaderfooterCSS={tableMetadata.tableheaderfooterCSS}
                        uploadedFiles={uploadedFiles}
                        setUploadedFiles={setUploadedFiles}
                        handleSubmit={handleSubmit}
                        mainColField={mainColField}
                        savePersonalData={savePersonalData}
                        setSavePersonalData={setSavePersonalData}
                        setLoading={setLoading}
                        isOpen={isOpen}
                        onSelectionChanged={(selectedRows: any[]) =>
                          handleTableSelectionChanged(field.FieldID, selectedRows)
                        }
                        setEdit={setEdit}
                        edit={edit}
                        reportData={reportData}
                        onChangeInput={onChangeInput}
                        promiseOptions={promiseOptions}
                        dropDownArray={dropDownArray}
                        onInputChange={onInputChange}
                        loadingDropdown={loadingDropdown}
                        handleProfileInformation={handleProfileInformation}
                        tableMetadata={tableMetadata}
                        isPDFPreviewOpen={true}
                      />
                    ) : null;

                  case "IMAGE":
                    return (
                      <Resizable
                        enable={{
                          top: isDrag,
                          right: isDrag,
                          bottom: isDrag,
                          left: isDrag,
                        }}
                        className="resizer"
                        style={{ ...finalStyle }}
                        size={{
                          width: `${Number(
                            field?.Width?.toString().split("px")[0] || 100
                          )}`,
                          height: `${Number(
                            field?.Height?.toString().split("px")[0] || 100
                          )}`,
                        }}
                        key={field.FieldID}
                        onResizeStop={(e, direction, ref, d) =>
                          onResize(e, direction, ref, d, field)
                        }
                      >
                        <BoxComponent
                          key={field.FieldID}
                          id={field.FieldID}
                          left={isPDFPreviewOpen ? ptToPx(field.PDFRownum) : field.Rownum}
                          top={isPDFPreviewOpen ? ptToPx(field.PDFColnum) : field.Colnum}
                          isDrag={isDrag}
                          width={isPDFPreviewOpen ? `${ptToPx(field.PDFWidth)}px` : `${field.Width}px`}
                          height={isPDFPreviewOpen ? `${ptToPx(field.PDFHeight)}px` : `${field.Height}px`}
                          newStyle={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: field.LabelDirection,
                            gap: 4,
                          }}
                        >
                          <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                            <img
                              src={field.ControlImageUrl || `data:image/jpeg;base64,${field.FieldValue}`}
                              style={{
                                height: `100%`,
                                width: `100%`,
                              }}
                            />
                          </Tooltip>
                        </BoxComponent>
                      </Resizable>
                    );
                  default:
                    return null;
                }
              })}
          </div>
        </ModalBody>
        <ModalFooter>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Preview: Header: {pdfLayout.previewHeaderHeight}px | Body: {dimensions.heightPx - pdfLayout.previewHeaderHeight - pdfLayout.previewFooterHeight}px | Footer: {pdfLayout.previewFooterHeight}px
            <br />
            PDF Export: Header: {pdfLayout.pdfHeaderHeight}px | Footer: {pdfLayout.pdfFooterHeight}px
          </div>
          <Button color="secondary" onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    </DndProvider >
  );
};

export default PDFPreviewModal;