import { ModalComponent } from "@/app/Layout/Common/Modal";
import { Button } from "reactstrap";
import { memo } from "react";
let html2pdf: any;
if (typeof window !== 'undefined') {
  html2pdf = require('html2pdf.js');
}

interface FieldStyle {
  FieldID: string;
  FieldName: string;
  Rownum: number;
  Colnum: number;
  Width: number;
  Height: number;
  Bgcolor?: string;
  fontcolor?: string;
  TextFontSize: number;
  TextAlignment?: string;
  IsTextBold: boolean;
  IsTextItalic: boolean;
  IsTextUnderLine: boolean;
  FieldValue?: string;
  DefaultVisible?: boolean;
}

interface PdfModalProps {
  isOpen: boolean;
  toggle: () => void;
  updatedPersonalDetails: {
    Values: FieldStyle[];
  }[];
  value: number;
  saveData: Record<string, string | number>;
}

const PdfModal = memo(
  ({
    isOpen,
    toggle,
    updatedPersonalDetails,
    value,
    saveData,
  }: PdfModalProps) => {
    console.log(updatedPersonalDetails[value]?.Values);
    const values = updatedPersonalDetails[value]?.Values || [];
    const maxRow = Math.max(...values.map((item) => item.Rownum));
    const maxCol = Math.max(...values.map((item) => item.Colnum));

    // A4 paper dimensions in pixels (1 inch = 96 pixels)
    const A4_WIDTH_MM = 210; // A4 width in millimeters
    const A4_HEIGHT_MM = 297; // A4 height in millimeters
    const MM_TO_PX = 3.7795275591; // 1mm = 3.7795275591 pixels
    const PAGE_MARGIN = 20; // Margin in mm

    // Calculate dimensions with margins
    const modalWidth = (A4_WIDTH_MM - PAGE_MARGIN * 2) * MM_TO_PX;
    const modalHeight = (A4_HEIGHT_MM - PAGE_MARGIN * 2) * MM_TO_PX;

    // Update container style to match A4 dimensions
    const containerStyle = {
      width: `${modalWidth}px`,
      height: `${modalHeight}px`,
      position: "relative",
      padding: "20px",
      overflow: "auto",
    };

    const getCellStyle = (item: FieldStyle) => ({
      position: "absolute",
      top: Math.abs(Number(item.Colnum) * modalHeight) / maxRow,
      left: (Math.abs(item.Rownum) * modalWidth) / maxCol,
      width: "auto",
      height: `${item.Height}`.split("px")[0],
      color: item.fontcolor || "#000",
      boxSizing: "border-box",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    });

    const getLabelStyle = (item: any) => ({
      color: item.fontcolor,
      backgroundColor: item.Bgcolor,
      fontWeight: item.IsBold ? 700 : "normal",
      textDecoration: item.IsUnderline ? "underline" : "none",
      fontStyle: item.IsItallic ? "italic" : "normal",
      fontSize: `${item.FontSize}px`,
    });

    const getTextStyle = (item: FieldStyle) => ({
      fontSize: `${item.TextFontSize}px`,
      fontWeight: item.IsTextBold ? "bold" : "normal",
      fontStyle: item.IsTextItalic ? "italic" : "normal",
      textDecoration: item.IsTextUnderLine ? "underline" : "none",
      textAlign: (item.TextAlignment || "left") as
        | "left"
        | "right"
        | "center"
        | "justify",
      padding: "2px 0" as const,
    });

    return (
      <ModalComponent
        visible={isOpen}
        onClose={toggle}
        title="PDF"
        width={modalWidth}
        showFooter={true}
        onSubmit={() => {
          const element = document.querySelector("#pdfContent");
          if (element) {
            console.log(html2pdf)
            // html2pdf(element, {
            //   margin: 0,
            //   filename: `Report.pdf`,
            //   image: { type: "png" },
            //   html2canvas: { scale: 2 },
            //   jsPDF: { unit: "in", format: "letter", orientation: "p" },
            // });
          }
        }}
        
        content={() => (
          <div id="pdfContent" style={containerStyle as any}>
            {values.map((item: any) => {
              const fieldValue = saveData[item.FieldName] || "-";
              return item.DefaultVisible && item.FieldType !== "BUTTON" ? (
                <div key={item.FieldID} style={getCellStyle(item) as any}>
                  <p style={{ ...getLabelStyle(item), fontWeight: "bold" }}>
                    {item.FieldName} -
                  </p>
                  <p style={getTextStyle(item)}>{fieldValue}</p>
                </div>
              ) : null;
            })}
          </div>
        )}
      />
    );
  }
);

export default PdfModal;
