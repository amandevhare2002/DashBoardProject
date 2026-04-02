import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardBody, Collapse } from "reactstrap";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Line,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export const GraphComponent = ({
  setIsGraphCollapsed,
  isGraphCollapsed,
  graphData,
}: any) => {


  const [graphArrayData, setGraphArrayData] = useState([]);
  useEffect(() => {
    if (graphData) {
      const graphArray: any = [];
      Object.keys(graphData).map((res: any) => {
        if (res !== "Query Executed" && res !== "Report") {
          graphArray.push({ key: res, data: graphData[res] });
        }
      });
      setGraphArrayData(graphArray);
    }
  }, [graphData]);

  return (
    <Card style={{ marginTop: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {graphArrayData.map((response: any) => {
            const BarData: any = [];
            console.log("response",response)
            response.data.map((data: any) =>
            {
              const convertedObject = data.Columns.reduce((obj: any, item: any) => {
                obj[item.Colname] = Number(item.Value);
                return obj;
            }, {});
            console.log("BarData",BarData)
             BarData.push({...data, ...convertedObject})
            }
            );
            return (
              <CardBody style={{ width: "40%", textAlign: "center" }}>
                <CardTitle>{response.key}</CardTitle>
                {response?.data && response?.data[0]?.ChartColumnType.split(",").includes("LINE") && (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      width={500}
                      height={300}
                      data={BarData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />

                      {response.data[0].Columns.map(
                        (column: any, index: number) => {
                          return (
                            <Line
                              type="monotone"
                              dataKey={column.Colname}
                              stroke="#82ca9d"
                            />
                          );
                        }
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {response?.data && response?.data[0]?.ChartColumnType.split(",").includes("BAR") && (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart width={800} height={400} data={BarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {response.data[0].Columns.map(
                        (column: any, index: number) => {
                          return (
                            <Bar
                              dataKey={column.Colname}
                              label='hello'
                              fill={`#${((Math.random() * 0xffffff) << 0)
                                .toString(16)
                                .padStart(6, "0")}`}
                            />
                          );
                        }
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardBody>
            );
          })}
      </div> 
    </Card>
  );
};
