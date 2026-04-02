import React, { useState } from "react";
import { Resizable } from "re-resizable";
import Image from "next/image";
import user from "../../../../../../public/images/user.png";
import { formatDate } from "@/app/Layout/Mailbox/utils";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { Label } from "reactstrap";
import { BoxComponent } from "../dnd/Box";
import Tooltip from "rc-tooltip";

export function VTimelineField({
  style,
  field,
  onResize,
  i,
  isDrag,
  vTimelineData,
  isMobile,
  isPDFPreviewOpen,
  setModalData,
  setIsModalOpen,
  information,
}: any) {
  const [visibleItems, setVisibleItems] = useState(10);
  const colorMap: any = {
    Booking: "purple",
    PAYMENT: "blue",
    BILLING: "green",
    DEFAULT: "gray",
  };
  const hasError = field.hasError || false;
  const enhancedTimelineData = vTimelineData.map(
    (item: any, index: number) => ({
      ...item,
      side: index % 2 === 0 ? "left" : "right",
      color: colorMap[item.Heading?.toUpperCase()] || colorMap.DEFAULT,
    }),
  );
  const MIN_VISIBLE_ITEMS = 10;

  const handleToggle = () => {
    setVisibleItems((prev) =>
      prev >= vTimelineData.length
        ? MIN_VISIBLE_ITEMS
        : Math.min(prev + 10, vTimelineData.length),
    );
  };

  // Your important positioning calculations
  const rowNum = isPDFPreviewOpen
    ? field.PDFRownum || field.Rownum || 0
    : field.Rownum || 0;
  const colNum = isPDFPreviewOpen
    ? field.PDFColnum || field.Colnum || 0
    : field.Colnum || 0;
  const fieldWidth = isPDFPreviewOpen
    ? field.PDFWidth || field.Width || "100px"
    : field.Width || "100px";
  const fieldHeight = isPDFPreviewOpen
    ? field.PDFHeight || field.Height || "20px"
    : field.Height || "20px";

  // Ensure we have valid numeric values for positioning
  const safeRowNum = Math.max(0, parseInt(rowNum.toString()) || 0);
  const safeColNum = Math.max(0, parseInt(colNum.toString()) || 0);
  const safeWidth = parseInt(fieldWidth.toString().replace("px", "")) || 100;
  const safeHeight = parseInt(fieldHeight.toString().replace("px", "")) || 20;
  const getDisplaySize = () => {
    if (isMobile && !isPDFPreviewOpen) {
      return {
        width: "100%",
        height: `${safeHeight}px`,
      };
    } else {
      return {
        width: `${safeWidth}px`,
        height: `${safeHeight}px`,
      };
    }
  };
  const displaySize = getDisplaySize();

  return (
    <Resizable
      enable={{
        top: isDrag,
        right: isDrag,
        bottom: isDrag,
        left: isDrag,
      }}
      className="resizer"
      style={{ ...style }}
      size={{
        width: isMobile
          ? "100%"
          : `${Number(field?.Width?.toString().split("px")[0] || 100)}`,
        height: `${Number(field?.Height?.toString().split("px")[0] || 100)}`,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <BoxComponent
        key={field.FieldID}
        id={field.FieldID}
        left={safeRowNum}
        top={safeColNum}
        isDrag={isDrag}
        width={displaySize.width}
        height={displaySize.height}
        newStyle={{
          display: "flex",
          alignItems: "center",
          flexDirection: field.LabelDirection,
          gap: 4,
          width: isMobile && !isPDFPreviewOpen ? "100%" : "auto",
        }}
      >
        {field.IsFieldNamePrint ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: field.Align,
              width: "100%",
              marginTop: "-25px",
            }}
          >
            <Label
              for={field?.FieldName}
              className="bold max-w-fit"
              style={{
                color: hasError ? "#dc3545" : field.fontcolor, // Fixed: Added error color
                backgroundColor: field.Bgcolor,
                fontWeight: field.IsBold ? 700 : "normal",
                textDecoration: field.IsUnderline ? "underline" : "none",
                fontStyle: field.IsItallic ? "italic" : "normal",
                fontSize: `${field.FontSize}px`,
                fontFamily: field.Fontname,
              }}
            >
              {field?.FieldName}{" "}
              {field.IsMandatory ? (
                <span
                  style={{
                    color: hasError ? "#dc3545" : "red", // Fixed: Added error color
                  }}
                >
                  *
                </span>
              ) : null}
            </Label>
            {field.ToolTip && (
              <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                <div
                  style={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <AiFillInfoCircle
                    style={{
                      marginBottom: 2,
                      marginLeft: 10,
                      cursor: "pointer",
                    }}
                  />
                </div>
              </Tooltip>
            )}
            {isDrag && (
              <AiFillEdit
                onClick={() => {
                  setModalData({
                    app_id: field.FieldID,
                    ModuleID: information.Data[0]?.StrucureModuleID,
                    IsPopUpOpen: field.IsPopUpOpen,
                    SideDrawerPos: field.SideDrawerPos,
                    SideDrawerWidth: field.SideDrawerWidth,
                  });
                  setIsModalOpen(true);
                }}
                style={{
                  marginBottom: 2,
                  marginLeft: 10,
                  cursor: "pointer",
                }}
              />
            )}
          </div>
        ) : null}
        <div className="relative flex flex-col items-center justify-center py-20 overflow-auto">
          {/* Vertical Line */}
          <div className="absolute w-1 bg-gray-300 h-full left-1/2 transform -translate-x-1/2 z-0"></div>

          {/* Timeline Items */}
          {enhancedTimelineData
            .slice(0, visibleItems)
            .map((item: any, index: number) => {
              const isLeft = item.side === "left";

              return (
                <div
                  key={index}
                  className={`mb-16 flex w-full max-w-5xl ${isLeft ? "justify-start" : "justify-end"}`}
                >
                  <div className="relative w-[45%]">
                    {/* Dot */}
                    <div
                      className={`absolute top-2 ${isLeft ? "right-[-60px]" : "left-[-59px]"} w-4 h-4 rounded-full z-10 border-4 bg-white`}
                      style={{ borderColor: item.color }}
                    ></div>
                    <div
                      className={`absolute text-black top-1 ${
                        item.side === "left"
                          ? "right-[-10px] border-l-[10px] border-l-[rgb(234,237,247)]"
                          : "left-[-10px] border-r-[10px] border-r-[rgb(234,237,247)]"
                      } border-t-[10px] border-b-[10px] border-t-transparent border-b-transparent`}
                    ></div>

                    {/* Notification Card with dynamic top border color */}
                    <div
                      className="bg-white shadow-sm border-gray-200 p-4 border-t-4 "
                      style={{ borderTopColor: item.color }}
                    >
                      <div className="flex">
                        <Image
                          src={user || item.IMGUrl}
                          alt="avatar"
                          width={40}
                          height={40}
                          className="rounded-full mr-4 mb-4"
                        />
                        <span className="mt-2">{item.Name}</span>
                      </div>
                      <h3 className="font-semibold text-[15px] text-gray-800 mb-1">
                        {item.Heading}
                      </h3>
                      <p
                        className="text-gray-500 text-sm"
                        style={{ maxWidth: "410px", wordWrap: "break-word" }}
                      >
                        {item.Remarks}
                      </p>

                      <div className="mt-3 text-end text-sm text-gray-400">
                        <span>{formatDate(item.ActivityDate)}</span>
                        <div>{item.Hoursmin}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          {vTimelineData.length > MIN_VISIBLE_ITEMS && (
            <div className="text-center mt-10">
              <button
                type="button"
                onClick={handleToggle}
                className="text-purple-600 hover:underline"
              >
                {visibleItems >= vTimelineData.length
                  ? "Load Less"
                  : "Load More"}
              </button>
            </div>
          )}
        </div>
      </BoxComponent>
    </Resizable>
  );
}
