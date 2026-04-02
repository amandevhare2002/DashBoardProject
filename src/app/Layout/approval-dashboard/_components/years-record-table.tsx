import { useMemo, useState } from "react";
import RecordInput from "./recordInput";
import MainTable from "@/utils/table";

const YearsRecordTable= ({
    recordData,
    setRecordData
}:any) => {

    const [loading, setLoading] = useState(false);
    const [edit, setEdit] = useState(false);
    const [fullview, setFullView] = useState<any>([]);
    const [fieldArray, setFieldArray] = useState([]);
    const [dropDownArray, setDropDownArray] = useState([]);

    const columnsRecord = useMemo(() => {

        setLoading(!loading);
      
        if (!recordData || recordData.length === 0) {
          setLoading(false);
          return [];
        }
      
        const columnsRes = recordData.length > 0 ? 
          Object.keys(recordData[0]).map((column, i) => {
      
            if (column === "Link" || column === "APID") {
              return null;
            } else if (column === "app_id") {
              return {
                name: column,
                selector: (row: any) => (
                  <a
                    style={{ color: "#0088ff", cursor: "pointer", width: "150px !important", minWidth: "150px" }}
                    href={row?.Link}
                  >
                    {row?.app_id}
                  </a>
                ),
                cell: (row: any) => (
                  edit ? (
                    <RecordInput
                      inputName={column}
                      row={row}
                      setRecordData={setRecordData}
                      recordData={recordData}
                      fieldArray={fieldArray}
                      dropDownArray={dropDownArray}
                    />
                  ) : (
                    <a
                      style={{ color: "#0088ff", cursor: "pointer" }}
                      href={row?.Link}
                    >
                      {row?.app_id}
                    </a>
                  )
                ),
                sortable: true,
                wrap: true,
                reorder: true,
              };
            } else if (column === "DownloadLink") {
              return {
                name: column,
                selector: (row: any, index: number) => (
                  <a
                    style={{ color: "#0088ff", cursor: "pointer", minWidth: "150px" }}
                    href={row?.DownloadLink}
                    onDoubleClick={() => toggleFullView(index, i)}
                  >
                    {!fullview.includes(`${index}${i}`) ? (
                      row?.DownloadLink && row?.DownloadLink.length > 50
                        ? row?.DownloadLink.slice(0, 50) + '..'
                        : row?.DownloadLink
                    ) : row?.DownloadLink}
                  </a>
                ),
                cell: (row: any, index: number) => (
                  edit ? (
                    <RecordInput
                      inputName={column}
                      row={row}
                      setRecordData={setRecordData}
                      recordData={recordData}
                      fieldArray={fieldArray}
                      dropDownArray={dropDownArray}
                    />
                  ) : (
                    <a
                      style={{ color: "#0088ff", cursor: "pointer" }}
                      href={row?.DownloadLink}
                      onDoubleClick={() => toggleFullView(index, i)}
                    >
                      {!fullview.includes(`${index}${i}`) ? (
                        row?.DownloadLink && row?.DownloadLink.length > 50
                          ? row?.DownloadLink.slice(0, 50) + '..'
                          : row?.DownloadLink
                      ) : row?.DownloadLink}
                    </a>
                  )
                ),
                sortable: true,
                wrap: true,
                reorder: true,
              };
            } else {
              return {
                name: column,
                selector: (row: any, index: number) => (
                  <div
                    style={{ color: "#0088ff", cursor: "pointer", minWidth: "180px !important", width: "180px!important" }}
                    onDoubleClick={() => toggleFullView(index, i)}
                  >
                    {fullview.includes(`${index}${i}`) ? row[column] : (
                      row[column] && row[column]?.length > 30
                        ? row[column].slice(0, 30) + '..'
                        : row[column]
                    )}
                  </div>
                ),
                cell: (row: any, index: number) => (
                  edit ? (
                    <RecordInput
                      inputName={column}
                      row={row}
                      setRecordData={setRecordData}
                      recordData={recordData}
                      fieldArray={fieldArray}
                      dropDownArray={dropDownArray}
                    />
                  ) : (
                    <div
                      onDoubleClick={() => toggleFullView(index, i)}
                    >
                      {fullview.includes(`${index}${i}`) ? row[column] : (
                        row[column] && row[column]?.length > 30
                          ? row[column].slice(0, 30) + '..'
                          : row[column]
                      )}
                    </div>
                  )
                ),
                sortable: true,
                wrap: true,
                reorder: true,
              };
            }
      
          }).filter((column) => column !== null) : [];
      
        setLoading(false);
        return columnsRes;
      }, [recordData, edit, fullview]);
      
      // Toggle full view logic for cleaner code
      const toggleFullView = (index: number, i: number) => {
        setFullView((prev: any) => {
          const newValue = `${index}${i}`;
          return prev.includes(newValue)
            ? prev.filter((item: any) => item !== newValue)
            : [...prev, newValue];
        });
      };
      
    return (
        <>
            <MainTable
                title={"Record Table Years"}
                TableArray={recordData}
                columns={columnsRecord}
                edit={true}
            />
        </>
    )
}

export default YearsRecordTable;

