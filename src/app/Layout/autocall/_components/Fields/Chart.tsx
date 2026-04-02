import { Resizable } from "re-resizable";
import { Label } from "reactstrap";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { BoxComponent } from "../dnd/Box";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import Tooltip from "rc-tooltip";

interface CellProps {
  key: string;
  fill: string;
}

export function ChartField({
  style,
  field,
  onResize,
  isDrag,
  isMobile,
  setModalData,
  setIsModalOpen,
  information,
}: any) {
  const hasError = field.hasError || false;
  const showBorder = field.IsBorderApply !== false;
  const borderColor = hasError ? "#dc3545" : field.bordercolor;
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
      onResizeStop={(e, direction, ref, d) => {
        const newWidth =
          Number(field.Width?.toString().split("px")[0] || 100) + d.width;
        const newHeight =
          Number(field.Height?.toString().split("px")[0] || 100) + d.height;
        onResize(e, direction, ref, d, {
          ...field,
          Width: `${newWidth}px`,
          Height: `${newHeight}px`,
        });
      }}
    >
      <BoxComponent
        key={field.FieldID}
        id={field.FieldID}
        left={field.Rownum}
        top={field.Colnum}
        isDrag={isDrag}
        width={`${field.Width}px`}
        height={`${field.Height}px`}
        newStyle={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "100%",
          width: "100%",
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
                padding: "5px",
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

        <div
          style={{
            width: "100%",
            height: field.IsFieldNamePrint ? "calc(100% - 40px)" : "100%",
            position: "relative",
            border: showBorder ? `1px solid ${borderColor}` : "none",
          }}
        >
          {/* Check if ChartData exists and render appropriate chart */}
          {field.ChartData && field.ChartData.length > 0 ? (
            renderChart(field)
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#999",
                fontStyle: "italic",
              }}
            >
              No chart data available
            </div>
          )}
        </div>
      </BoxComponent>
    </Resizable>
  );
}

// Helper function to render different chart types
function renderChart(field: any) {
  const { ChartData, ValueType } = field;

  // Ensure ChartData is an array
  const chartDataArray = Array.isArray(ChartData) ? ChartData : [ChartData];

  switch (ValueType) {
    case "PIE":
    case "DOUGHNUT":
      return renderPieChart(chartDataArray, ValueType);
    case "BAR":
      return renderBarChart(chartDataArray);
    case "LINE":
      return renderLineChart(chartDataArray);
    default:
      return <div>Unsupported chart type: {ValueType}</div>;
  }
}

function renderPieChart(chartDataArray: any[], chartType: string) {
  // Flatten the data for pie/doughnut charts
  const pieData = chartDataArray.flatMap(
    (item: any) =>
      item?.Columns?.map((col: any) => ({
        name: col.Colname,
        value: col.Value,
        color: col.Color || getRandomColor(),
      })) || [],
  );
  if (pieData.length === 0) {
    return <div>No pie chart data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius="80%"
          innerRadius={chartType === "DOUGHNUT" ? "40%" : "0%"}
          dataKey="value"
          nameKey="name"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {pieData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function renderBarChart(chartDataArray: any[]) {
  // For bar charts, use the data directly
  const barData = chartDataArray.map((item: any) => ({
    Name: item.Name,
    ...item.Columns.reduce((acc: any, col: any, index: number) => {
      acc[`Column${index}`] = col.Value;
      acc[`Color${index}`] = col.Color || getRandomColor();
      return acc;
    }, {}),
  }));

  if (barData.length === 0) {
    return <div>No bar chart data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={barData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Name" />
        <YAxis />
        <Legend />
        {chartDataArray[0]?.Columns?.map((column: any, index: number) => (
          <Bar
            key={`bar-${index}`}
            dataKey={`Column${index}`}
            name={column.Colname}
            fill={column.Color || getRandomColor()}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function renderLineChart(chartDataArray: any[]) {
  // Similar to bar chart but with lines
  const lineData = chartDataArray.map((item: any) => ({
    Name: item.Name,
    ...item.Columns.reduce((acc: any, col: any, index: number) => {
      acc[`Column${index}`] = col.Value;
      return acc;
    }, {}),
  }));

  if (lineData.length === 0) {
    return <div>No line chart data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={lineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Name" />
        <YAxis />
        <Legend />
        {chartDataArray[0]?.Columns?.map((column: any, index: number) => (
          <Line
            key={`line-${index}`}
            type="monotone"
            dataKey={`Column${index}`}
            name={column.Colname}
            stroke={column.Color || getRandomColor()}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Helper function for random colors
function getRandomColor() {
  const colors = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
