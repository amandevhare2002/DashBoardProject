import Loading from "@/pages/loading";
import { Drawer } from "@mui/material";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import DataTable from "react-data-table-component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Form, FormGroup, FormText, Input, Label } from "reactstrap";

const UserUploadFiles = ({ UserUploadedFilesDetails ,recordID}: any) => {
    const [file, setFile] = useState<any>()
    const [fileType, setFileType] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter();
    const { mainMenuID, menuID } = router.query;


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
                // console.log("base64File",base64File.base64string.split(","))

                setFile(base64File)
                // tempAttachment.push(base64File);
            }

            // setAttachments([...Attachments, ...tempAttachment]);
        }
    };

    const handleExcelFileUpload = async () => {
        try {
            setLoading(true)
            if (!fileType || !file?.base64string) {
                setLoading(false)
                return
            }
            let data = {
                "Userid": localStorage.getItem("username"),
                "FileName": file?.Filename,
                "InputType": fileType,
                "Base64string": file && file.base64string && file?.base64string.split(",")[1],
                "ModuleID" : Number(menuID),
                "RecordID": recordID     
                
            }

            let result = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/UploadFile", data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })

            if (result) {
                toast.success("File Data Uploaded Successfully", { style: { top: 80 } });
                setLoading(false)
            }
        } catch (error) {
            toast.error("Something Went Wrong!", { style: { top: 80 } });
            setLoading(false)
            console.log("error", error)
        }
    }
    const columnsUserUploadedFilesDetails: any = UserUploadedFilesDetails && UserUploadedFilesDetails.length > 0 ?
        Object.keys(UserUploadedFilesDetails[0]).map((column) => {
            if (column === "fileTypes") {
                return null;
            } else if (column === "FileLink") {
                return {
                    name: column,
                    selector: (row: any) => (
                        <a href={row?.FileLink} style={{ color: "#0088ff", cursor: "pointer", width: "150px", minWidth: "150px" }}>
                            <button>
                                Download
                            </button>
                        </a>
                    ),
                    sortable: true,
                    wrap: true,
                };
            } else {
                return {
                    name: column,
                    selector: column,
                    sortable: true,
                    wrap: true,
                };
            }
        }).filter((flt) => flt !== null) : [];

    return (
        <>
             

            <ToastContainer
                position="top-right"
                autoClose={5000}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover={false}
                theme="light"
            />
            {loading ? (<Loading />) : (
                <>
                    {
                        UserUploadedFilesDetails && UserUploadedFilesDetails.length > 0 && UserUploadedFilesDetails[0]?.Type && UserUploadedFilesDetails[0]?.Filename && (
                            <DataTable
                                title={"User Uploaded Files Details"}
                                columns={columnsUserUploadedFilesDetails}
                                data={UserUploadedFilesDetails.slice(0,UserUploadedFilesDetails.length-1)}
                                fixedHeader={true}
                                fixedHeaderScrollHeight={"55vh"}
                                pagination
                            />
                        )
                    }
                    <h4>File Upload</h4>
                    <form className="flex w-full justify-between items-center">
                        <FormGroup
                            style={{ width: "300px" }}
                        >
                            <Label for="file" style={{ fontWeight: 700 }}>
                                File
                            </Label>
                            <Input
                                id="file"
                                name="file"
                                type="file"
                                onChange={handleFileSelect}
                            />
                        </FormGroup>
                        <FormGroup style={{ width: "200px" }}>
                            <Label style={{ fontWeight: 700 }}>File Type</Label>
                            <Input type="select"
                                value={fileType}
                                onChange={(e) => setFileType(e.target.value)}
                            >
                                <option>File Type</option>
                                {UserUploadedFilesDetails && UserUploadedFilesDetails.map((file: any, index: number) => (
                                    file?.fileTypes && Array.isArray(file?.fileTypes) && file?.fileTypes.map((type: any, i: number) => (
                                        <option key={i}>{type.FileTypeName}</option>
                                    ))
                                ))}
                            </Input>
                        </FormGroup>
                        <div>
                            <Button color="success" onClick={handleExcelFileUpload} className="">
                                Upload
                            </Button>
                        </div>
                    </form>
                </>)}
        </>
    );
}

export default UserUploadFiles;