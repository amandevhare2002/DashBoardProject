import { useState } from "react";
import axios from "axios";
import { Button, FormGroup, Input, Label, Modal, ModalFooter, ModalBody, ModalHeader } from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExcelUploadUtility = ({ reportData, token }: { reportData: any, token: string }) => {
    const [excelFile, setExcelFile] = useState<any>();
    const [fileType, setFileType] = useState("");
    const [excelMatchModal, setExcelMatchModal] = useState(false);
    const [columnsMatch, setColumnsMatch] = useState<any>({});
    const [matchedColArray, setMatchColArray] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    const handleFileSelect = async (event: any) => {
        const { files: tempFiles } = event.target;
        const files = [...tempFiles];
        if (files?.length) {
            for await (const file of files) {
                function getFile() {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = function () {
                            const result = {
                                Filename: file["name"],
                                ContentType: file["type"],
                                base64string: reader.result,
                            };
                            resolve(result);
                        };
                        reader.onerror = function (error) {
                            console.log("Error: ", error);
                            reject();
                        };
                    });
                }

                const base64File: any = await getFile();
                setExcelFile(base64File);
            }
        }
    };

    const handleExcelFileUpload = async () => {
        try {
            setLoading(true);
            if (!fileType || !excelFile?.base64string) {
                toast.error("Please select both a file and file type");
                setLoading(false);
                return;
            }
            let data = {
                "Userid": localStorage.getItem("username"),
                "InputType": fileType,
                "Base64string": excelFile?.base64string?.split(",")[1]
            };

            let result = await axios.post(
                "https://logpanel.insurancepolicy4u.com/api/Login/UploadTransactions",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (result?.data?.ErrorMessage) {
                toast.error(result.data.ErrorMessage || "Something went wrong");
                setLoading(false);
                return;
            }

            if (result) {
                setColumnsMatch(result.data);
                setExcelMatchModal(true);
                // Initialize matched columns
                const initialMatches = result.data?.OurColumns?.map((col: any) => ({
                    "OurColumn": col.Colname,
                    "excelcolname": col.MappedColumn
                })) || [];
                setMatchColArray(initialMatches);
            }
        } catch (error: any) {
            toast.error(error.message || "Upload failed");
            console.error("Upload error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadTransWithMapping = async () => {
        setLoading(true);
        try {
            let data = {
                "Userid": localStorage.getItem("username"),
                "InputType": fileType,
                "Recordno": "",
                "Base64string": excelFile?.base64string?.split(",")[1],
                "MappedCols": matchedColArray
            };

            let result = await axios.post(
                "https://logpanel.insurancepolicy4u.com/api/Login/UploadTransWithMapping",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (result.data) {
                toast.success("File data uploaded successfully");
                setExcelMatchModal(false);
            }
        } catch (error) {
            toast.error("Upload with mapping failed");
            console.error("Mapping error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-4">
            <ToastContainer position="top-right" autoClose={5000} />
            <div style={{
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
                alignItems: "center",
                backgroundColor: "white",
                padding: 20
            }}>
                <FormGroup style={{ width: "400px" }}>
                    <Label for="file">File</Label>
                    <Input
                        id="file"
                        name="file"
                        type="file"
                        onChange={handleFileSelect}
                        disabled={loading}
                    />
                </FormGroup>
                <FormGroup style={{ width: "200px" }}>
                    <Label for="fileType">File Type</Label>
                    <Input
                        id="fileType"
                        type="select"
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Select type</option>
                        {reportData?.fileTypes?.map((file: any, index: number) => (
                            <option key={index} value={file.Filetype}>{file.Filetype}</option>
                        ))}
                    </Input>
                </FormGroup>
                <Button
                    color="success"
                    onClick={handleExcelFileUpload}
                    disabled={loading || !fileType || !excelFile}
                    style={{ marginTop: "7px" }}
                >
                    {loading ? "Uploading..." : "Upload"}
                </Button>

                <Modal isOpen={excelMatchModal} toggle={() => setExcelMatchModal(false)}>
                    <ModalHeader toggle={() => setExcelMatchModal(false)}>Match Excel Columns</ModalHeader>
                    <ModalBody>
                        {columnsMatch?.OurColumns?.map((mainCol: any, i: number) => (
                            <FormGroup key={i} className="flex items-center mb-3">
                                <Label className="w-1/2 font-bold">{mainCol.Colname}</Label>
                                <Input
                                    className="w-1/2"
                                    type="select"
                                    name={mainCol.Colname}
                                    value={matchedColArray.find((c: any) => c.OurColumn === mainCol.Colname)?.excelcolname || ""}
                                    onChange={(e) => {
                                        const updatedMatches = matchedColArray.map((col: any) =>
                                            col.OurColumn === mainCol.Colname
                                                ? { ...col, excelcolname: e.target.value }
                                                : col
                                        );
                                        setMatchColArray(updatedMatches);
                                    }}
                                >
                                    <option value="">Select column</option>
                                    {columnsMatch?.ExcelColumns?.map((excelCol: any, index: number) => (
                                        <option key={index} value={excelCol.excelcolname}>
                                            {excelCol.excelcolname}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="primary"
                            onClick={handleUploadTransWithMapping}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Submit"}
                        </Button>
                        <Button
                            color="secondary"
                            onClick={() => setExcelMatchModal(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        </div>
    );
};

export default ExcelUploadUtility;