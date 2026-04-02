import { useEffect, useMemo, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import {
    ButtonDropdown,
    Card,
    CardBody,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    ModalBody,
    Modal,
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
import { GrEdit } from "react-icons/gr";
import { FaEdit, FaSave } from "react-icons/fa";
import Loading from "@/app/loading";
import AutoCallPage from "@/app/Layout/autocall";
import { customSort } from "@/app/Layout/Mailbox/utils";

const MainTable = ({
    TableArray,
    columns,
    title,
    expandableRows,
    editingRow = false,
    handleSaveChanges,
    editBtn,
    setEditBtn,
    isLoading,
    handleSaveData,
    height = "55vh",
    tableFooter
}: any) => {
    const componentRef = useRef(null);
    const [onOpen, setOnOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [rowCount, setRowCount] = useState<number>(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>(
        columns && columns.length > 0 ? columns.map((col: any) => col.name) : ""
    );
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
        if (columns && columns.length > 0) {
            setSelectedOptions(
                columns && columns.length > 0 && columns.map((col: any) => col.name)
            );
        }
    }, [columns]);

    const convertToPDF = () => {
        const doc = new jsPDF("p", "pt", [1000, 1000]);
        // doc.text("Records Data",20,10)
        const header = Object.keys(TableArray[0]);
        // const headers:any = [header]
        // console.log("headers",header)
        const data: any = TableArray.map((item: any) => Object.values(item));
        // console.log("data",data)
        // doc.table(1,1,data,header,{autoSize:true})

        autoTable(doc, {
            head: [header],
            body: data,
        });

        doc.save("file.pdf");
    };
    const convertToExcel = () => {
        const workbook = XLSX.utils.book_new();
        const header = Object.keys(TableArray[0]);
        const data = TableArray.map((item: any) => Object.values(item));
        data.unshift(header);
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, "report.xlsx");
    };

    const convertToDocx = () => {
        try {
            // Get visible columns
            const visibleColumns = columns.filter((col: { name: string; omit: any; }) =>
                selectedOptions.includes(col.name) && !col.omit
            );

            // Create HTML content with Word-compatible markup
            const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <title>${title || 'Exported Data'}</title>
        <style>
          @page WordSection1 {
            size: 8.5in 11.0in;
            margin: 1.0in 1.0in 1.0in 1.0in;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #000;
            padding: 5px;
          }
          th {
            background-color: #EEE;
          }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          <h1>${title || 'Exported Data'}</h1>
          <table>
            <tr>${visibleColumns.map((col: { name: any; }) => `<th>${col.name}</th>`).join('')}</tr>
            ${TableArray.map((row: any) => `
              <tr>
                ${visibleColumns.map((col: { selector: any; name: any; }) => {
                const propPath = typeof col.selector === 'string' ? col.selector : col.name;
                let cellValue = '';
                if (typeof propPath === 'string' && propPath.includes('.')) {
                    cellValue = propPath.split('.').reduce((obj: any, key) => obj?.[key], row) || '';
                } else {
                    cellValue = row[propPath] || '';
                }
                return `<td>${cellValue}</td>`;
            }).join('')}
              </tr>
            `).join('')}
          </table>
        </div>
      </body>
      </html>
    `;

            // Create blob with Word MIME type
            const blob = new Blob(
                ['\ufeff', htmlContent], // UTF-8 BOM for proper encoding
                { type: 'application/msword' }
            );

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'export.doc'; // Using .doc extension for wider compatibility
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("DOC export error:", error);
            alert("Error generating DOC file. Please check console for details.");
        }
    };

    const paginationComponentOptions = {
        rowsPerPageText: "Rows per page:",
        rangeSeparatorText: "of",
        selectAllRowsItem: true,
        selectAllRowsItemText: TableArray && TableArray.length > 30 ? "ALL" : "",
    };

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
    }, [loading, rowCount]);

    const newColumns = editingRow
        ? [
            ...columns,
            {
                cell: (row: any) => (
                    <Button onClick={() => handleSaveChanges(row)}>
                        <GrEdit />
                        Edit
                    </Button>
                ),
                ignoreRowClick: true,
                allowOverflow: true,
                button: true,
            },
        ]
        : columns;

    const open = Boolean(anchorEl);
    const id = open ? "checkbox-popover" : undefined;

    let HideShowColumns = useMemo(() => {
        if (!open) {
            return newColumns;
        }
        const updatedColumns = [...newColumns];
        updatedColumns?.forEach((newCol) => {
            if (!selectedOptions.includes(newCol.name)) {
                newCol.omit = true;
            } else {
                newCol.omit = false;
            }
            newCol.sortable = true;
        });
        return updatedColumns;
    }, [selectedOptions, editBtn]);


    return (
        <Card>
            <Modal
                isOpen={isModalOpen}
                centered
                size="xl"
                fullscreen={true}
                backdrop={false}
                style={{ boxShadow: "none", top: "50px" }}
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
                        />
                    </div>
                </ModalBody>
            </Modal>
            <CardBody>
                <div ref={componentRef} style={{ position: "relative" }}>
                    <DataTable
                        title={title}
                        sortFunction={customSort}
                        columns={HideShowColumns?.map((col: any) => {
                            return {
                                name: col.name,
                                selector: col.selector,
                                cell: col.name === "app_id"
                                    ? (row: any, index: number, column: any) => {
                                        return (
                                            <a
                                                style={{
                                                    color: "#0088ff",
                                                    cursor: "pointer",
                                                    width: "150px !important",
                                                    minWidth: "150px",
                                                }}
                                                onClick={() => {
                                                    setIsModalOpen(true);
                                                    setModalData(row);
                                                }}
                                            >
                                                {row[col.name]}
                                            </a>
                                        );
                                    } : TableArray?.[0]?.['Maincol'] === col.name ? (row: any, index: number, column: any) => {
                                        return (
                                            <a style={{
                                                color: "#0088ff",
                                                cursor: "pointer",
                                                width: "150px !important",
                                                minWidth: "150px",
                                            }}
                                                onClick={() => {
                                                    setIsModalOpen(true);
                                                    setModalData({
                                                        app_id: row[col.name],
                                                        ModuleID: row['ModuleID'],
                                                    });
                                                }}
                                            >{row[col.name]}</a>
                                        );
                                    } : col.cell,
                                sortable: true,
                                omit: col.omit,
                                wrap: true,
                                reorder: true,
                            };
                        })}
                        data={TableArray?.length > 0 ? TableArray : []}
                        fixedHeader={true}
                        fixedHeaderScrollHeight={height}
                        pagination
                        progressPending={loading}
                        onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                            setRowCount(currentRowsPerPage);
                            setLoading(true);
                        }}
                        progressComponent={<Loading />}
                        paginationComponentOptions={paginationComponentOptions}
                    // customStyles={customStyles}
                    />
                    {TableArray && TableArray?.length > 0 && (
                        <div style={{ position: "absolute", bottom: "0px", left: "0px" }}>
                            <div className="flex">
                                <ButtonDropdown
                                    isOpen={onOpen}
                                    toggle={() => setOnOpen(!onOpen)}
                                >
                                    <DropdownToggle caret>Export</DropdownToggle>
                                    <DropdownMenu style={{ minWidth: "100%" }}>
                                        <DropdownItem onClick={convertToPDF}>as PDF</DropdownItem>
                                        <DropdownItem divider />
                                        <DropdownItem onClick={convertToExcel}>
                                            as Excel
                                        </DropdownItem>
                                        <DropdownItem divider />
                                        <DropdownItem onClick={convertToDocx}>
                                            as Word(DOCX)
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>

                                <Button
                                    onClick={(event: any) => setAnchorEl(event.currentTarget)}
                                >
                                    Open List
                                </Button>
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
                                    sx={{ width: "250px", maxHeight: "350" }}
                                >
                                    <List>
                                        {columns &&
                                            columns.length > 0 &&
                                            columns.map((option: any) => (
                                                <ListItem key={option}>
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
                                    </List>
                                </Popover>
                            </div>
                        </div>
                    )}
                    {tableFooter && tableFooter?.length > 0 && (
                        <div className="flex justify-end gap-8">
                            {tableFooter?.map((footer: any) => (
                                <div key={footer.Keyname}><span style={{ fontWeight: "bold", fontSize: "14px", color: "black" }}>{footer.Keyname}</span>:<span style={{ fontSize: "14px", color: "black" }}>{footer.KeyValue}</span></div>
                            ))}
                        </div>
                    )}
                    {title === "Record Table" || title === "Table Report Data" ? (
                        !editBtn ? (
                            <>
                                <Button
                                    className="absolute left-[90%] top-1 text-xl gap-1"
                                    onClick={() => setEditBtn(!editBtn)}
                                    style={{
                                        color: "white",
                                        backgroundColor: "blue",
                                        position: "absolute",
                                        left: "90%",
                                        top: "4px",
                                        gap: "4px",
                                        display: "flex",
                                    }}
                                >
                                    {isLoading ? (
                                        <CircularProgress />
                                    ) : (
                                        <div className="flex space-x-2">
                                            {/* <FaEdit /> */}
                                            Edit
                                        </div>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    className="absolute left-[90%] top-1 text-xl gap-1"
                                    onClick={handleSaveData}
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
                            </>
                        )
                    ) : null}
                </div>
            </CardBody>
        </Card>
    );
};

export default MainTable;
