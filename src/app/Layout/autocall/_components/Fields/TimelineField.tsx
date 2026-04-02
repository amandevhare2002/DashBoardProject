// Timeline.tsx
import { Resizable } from "re-resizable";
import React, { useState } from "react";
import user from "../../../../../../public/images/user.png";
import Image from "next/image";
import { formatDate } from "@/app/Layout/Mailbox/utils";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { Label } from "reactstrap";
import { BoxComponent } from "../dnd/Box";
import Tooltip from "rc-tooltip";

export function TimelineField({
  style,
  field,
  onResize,
  i,
  isDrag,
  setModalData,
  setIsModalOpen,
  handleInputChange,
  isModify,
  information,
  saveData,
  timelineData,
  isMobile,
  isPDFPreviewOpen,
}: any) {
  const hasError = field.hasError || false;
  const [visibleItems, setVisibleItems] = useState(10);
  const [notification, setNotification] = useState();

  const grouped = timelineData.reduce((acc: any, item: any) => {
    acc[item.dateGroup] = acc[item.dateGroup] || [];
    acc[item.dateGroup].push(item);
    return acc;
  }, {});

  const MIN_VISIBLE_ITEMS = 10;

  const handleToggle = () => {
    setVisibleItems((prev) =>
      prev >= timelineData.length
        ? MIN_VISIBLE_ITEMS
        : Math.min(prev + 10, timelineData.length),
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
        <div className="p-6 min-h-screen flex justify-center">
          <div className="relative w-full max-w-5xl">
            {/*Timeline Sections */}
            {Object.entries(grouped).map(([group, items]: any) => (
              <div key={group} className="relative">
                <div className="absolute left-[115px] top-0 bottom-0 w-0.5 bg-purple-400 z-0"></div>
                {items.slice(0, visibleItems).map((item: any) => (
                  <div className="mb-10 flex items-start relative">
                    {/* Column 1: Time */}
                    <div className="w-[100px] mt-7 text-right shrink-0">
                      <div className="ml-auto text-sm">{item.ActivityDate}</div>
                      <div className="text-xl font-bold">{item.Hoursmin}</div>
                    </div>

                    {/* Column 2: Timeline Dot */}
                    <div className="w-[30px] flex justify-center relative z-10 shrink-0">
                      <div className="w-5 h-5 bg-white border-4 border-purple-400 rounded-full mt-[2.5rem]"></div>
                    </div>

                    {/* Column 3: Notification Card */}
                    <div className="flex relative">
                      {/* Arrow pointing to circle */}
                      <div className="w-0 h-0 mt-[2.3rem] border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[10px] border-r-rgb(234,237,247)"></div>

                      {/* Card */}
                      <div className="bg-white p-4 rounded-md shadow-md w-[500px]">
                        <div className="flex items-center">
                          <Image
                            src={user || item.IMGUrl}
                            alt="avatar"
                            width={40}
                            height={40}
                            className="rounded-full mr-4"
                          />
                          <div>
                            <div className="text-[14px] font-semibold text-gray-800">
                              {item.Name}
                            </div>
                            <div className="text-[13px] text-gray-500">
                              {item.Remarks}
                            </div>
                          </div>
                          <div className="ml-auto text-sm text-gray-400">
                            {item.Hoursmin}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* 🔘 Load More Button */}

            {timelineData.length > MIN_VISIBLE_ITEMS && (
              <div className="text-center mt-10">
                <button
                  type="button"
                  onClick={handleToggle}
                  className="text-purple-600 hover:underline"
                >
                  {visibleItems >= timelineData.length
                    ? "Load Less"
                    : "Load More"}
                </button>
              </div>
            )}
          </div>
        </div>
      </BoxComponent>
    </Resizable>
  );
}
