
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useEffect, useState } from "react";

export const getDropDownData = ({ fieldArray }: any) => {
  const [dropDownArray, setDropDownArray] = useState<any>([]);
  const AddDropDownData = async () => {
    try {
      let data: any = {
        Userid: localStorage.getItem("username"),
        valueReqs:
          fieldArray &&
          fieldArray.flatMap((fld: any) =>
            fld.Fields.flatMap((flds: any) =>
              flds.Values.filter(
                (field: any) => field.FieldType === "DROPDOWN"
              ).map(({ Dbname, Tabname, Colname }: any) => ({
                Dbname,
                Tabname,
                Colname,
              }))
            )
          ),
      };
      if (!data || !data.valueReqs || !data.Userid) {
        return;
      }
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetDistinctValuesBulk",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res?.data?.valueResps) {
        setDropDownArray(res?.data?.valueResps);
      }
    } catch (error) {
      console.log("error in calender-event", error);
    }
  };
  useEffect(() => {
    AddDropDownData();
  }, [fieldArray]);
  return { dropDownArray };
};

export const handleSubmit = async ({
  Details,
  saveData,
  main,
  moduleID,
  setSavePersonalData,
  newValue,
  savePersonalData,
  length,
  currentRecordID,
  setLoading,
  isTab,
  setHideSubmit,
  isSubmit = false,
  isOpen,
  information,
  tableData = [],
}: any) => {
  console.log("tableData", tableData);
  try {
    // setLoading(true);
    let fieldData: any[] = [];
    let fieldArray: number[] = [];

    console.log("Details:", JSON.stringify(Details, null, 2));

    Details?.forEach((fld: any) => {
      if (fld.FieldType === "UPLOAD" && fld.buttonFields) {
        fld.buttonFields.forEach((res: any) => {
          if (res.FieldID) {
            fieldArray.push(Number(res.FieldID));
          }
        });
      }
    });
    console.log("fieldArray (excluded FieldIDs):", fieldArray);

    Details?.forEach((fld: any) => {
      const isExcluded = fieldArray.includes(Number(fld.FieldID));
      console.log(`Processing field ${fld.FieldName}: isExcluded=${isExcluded}, FieldType=${fld.FieldType}`);

      if (isExcluded) return;

      const baseField = {
        FieldName: fld.FieldName,
        FieldID: fld.FieldID,
        FieldValue:
          fld.ValueType === "NUMERIC"
            ? saveData[fld?.FieldName] || "0"
            : saveData[fld?.FieldName] || "",
        Colname: fld.Colname || "",
        IsAddMore: fld.IsAddMore || false,
        buttonFields: fld.buttonFields || [],
        AddMoreGroup: fld.AddMoreGroup || "",
        addmorevalues:
          fld?.addmorevalues?.length > 0
            ? fld.addmorevalues.map((res: any) => ({
              ValIndex: res.ValIndex,
              Value: res.FieldValue,
            }))
            : [],
      };

      if (fld.IsMainCol) {
        fieldData.push({ ...baseField, IsMain: fld.IsMainCol });
      } else if (!["BUTTON", "UPLOAD", "TABLE"].includes(fld.FieldType)) {
        fieldData.push(baseField);
      }
    });

    console.log("fieldData:", JSON.stringify(fieldData, null, 2));

    const isUpdateTabWise = information?.Data?.[0]?.IsUpdateTabWise;

    const updatedArray: any = [...savePersonalData];
    updatedArray[newValue || 0] = fieldData;
    setSavePersonalData(updatedArray);

    console.log("Received tableData:", JSON.stringify(tableData, null, 2));

    // Format table data if it exists
    let formattedTableData = [];
    if (tableData && tableData.length > 0) {
      formattedTableData = tableData.map((table: any) => ({
        FieldID: table.FieldID,
        Cols: table.Cols.map((col: any) => ({
          Colname: col.Colname,
          Values: col.Values.map((val: any) => ({
            Values: isNumericField(col.Colname)
              ? Number(val.Values) || 0
              : val.Values,
          })),
        })),
      }));
    }

    console.log("formattedTableData:", JSON.stringify(formattedTableData, null, 2));

    function isNumericField(colName: string): boolean {
      const numericFields = ['Amount', 'Quantity', 'Price', 'Total'];
      return numericFields.includes(colName);
    }

    if (isSubmit) {


      // Always include fieldsDatanew, conditionally include tabledata
      let submitData: any = {
        Userid: localStorage.getItem("username"),
        ModuleID: moduleID ? Number(moduleID) : 0,
        Operation: isOpen ? "UPDATE" : currentRecordID ? "INSERT" : "UPDATE",
        fieldsDatanew: isUpdateTabWise ? fieldData : updatedArray.flat(),
      };

      // Only add tabledata if it exists and has content
      if (formattedTableData && formattedTableData.length > 0) {
        submitData.tabledata = formattedTableData.map((table: any) => ({
          FieldID: table.FieldID,
          Cols: table.Cols.map((col: any) => ({
            Colname: col.Colname,
            Values: col.Values.map((val: any) => ({
              Values: typeof val.Values === 'number' ? val.Values.toString() : val.Values,
            })),
          })),
        }));
      }

      console.log("Submitting data:", JSON.stringify(submitData, null, 2));
      let res = await axios.post(
        `https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldsValuesNew`,
        submitData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (res?.status === 201 && res?.data?.Resp?.toLowerCase() === "success") {
        const newData = updatedArray.flat();
        const mainColValue = newData.find((res: any) => res.IsMain);
        setHideSubmit?.(true, mainColValue?.FieldValue || "");
        toast.success(res?.data?.Resp || "Submission successful", { style: { top: 80 } });
      } else {
        toast.error(res?.data?.Resp || "Submission failed", { style: { top: 80 } });
      }
      setLoading(false);
    }
  } catch (error: any) {
    setLoading(false);
    console.error("Submission error:", error);
    if (error.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }
  }
  finally {
    setLoading(false);
  }
};

// export const handleSubmit = async ({
//   Details,
//   saveData,
//   main,
//   moduleID,
//   setSavePersonalData,
//   newValue,
//   savePersonalData,
//   length,
//   currentRecordID,
//   setLoading,
//   isTab,
//   setHideSubmit,
//   isSubmit = false,
//   isOpen,
// }: any) => {
//   try {
//     let fieldData: any[] = [];
//     let fieldArray: number[] = [];

//     Details?.forEach((fld: any) => {
//       // Collect button field IDs
//       if (fld.FieldType === "UPLOAD") {
//         fld?.buttonFields?.forEach((res: any) => {
//           fieldArray.push(Number(res.FieldID));
//         });
//       }

//     });

//     // Build fieldData excluding fieldArray IDs
//     Details?.forEach((fld: any) => {
//       const isExcluded = fieldArray.includes(Number(fld.FieldID));
//       if (isExcluded) return;

//       const baseField = {
//         FieldName: fld.FieldName,
//         FieldID: fld.FieldID,
//         FieldValue:
//           fld.ValueType === "NUMERIC"
//             ? saveData[fld?.FieldName] || "0"
//             : saveData[fld?.FieldName] || "",
//         Colname: fld.Colname,
//         IsAddMore: fld.IsAddMore,
//         buttonFields: fld.buttonFields,
//         AddMoreGroup: fld.AddMoreGroup,
//         addmorevalues:
//           fld?.addmorevalues?.length > 0
//             ? fld.addmorevalues.map((res: any) => ({
//               ValIndex: res.ValIndex,
//               Value: res.FieldValue,
//             }))
//             : [],
//       };

//       if (fld.IsMainCol) {
//         fieldData.push({ ...baseField, IsMain: fld.IsMainCol });
//       } else if (fld.FieldType !== "BUTTON" && fld.FieldType !== "UPLOAD") {
//         fieldData.push(baseField);
//       }
//     });
//     let data = {
//       Userid: localStorage.getItem("username"),
//       ModuleID: moduleID ? Number(moduleID) : 0,
//       Operation: "UPDATE",
//       fieldsDatanew: fieldData,
//     };
//     const updatedArray: any = [...savePersonalData];
//     updatedArray[newValue || 0] = data.fieldsDatanew;
//     setSavePersonalData(updatedArray);
//     if (isSubmit && !isTab) {
//       setLoading(true);
//       let data = {
//         Userid: localStorage.getItem("username"),
//         ModuleID: moduleID ? Number(moduleID) : 0,
//         Operation: isOpen ? "UPDATE" : currentRecordID ? "INSERT" : "UPDATE",
//         fieldsDatanew: updatedArray.flat(),
//       };
//       let res = await axios.post(
//         `https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldsValuesNew`,
//         data,
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         }
//       );
//       if (res?.data?.Resp === "Success") {
//         toast.success("Successful", { style: { top: 80 } });
//         const newData = updatedArray.flat();
//         const mainColValue = newData.find((res: any) => res.IsMain);
//         setHideSubmit?.(true, mainColValue.FieldValue);
//       } else {
//         toast.error("error", { style: { top: 80 } });
//       }
//       setLoading(false);
//     }
//   } catch (error: any) {
//     setLoading(false);
//     toast.error("Something Went Wrong!", { style: { top: 80 } });
//     if (error.status === 401) {
//       localStorage.clear();
//       sessionStorage.clear();
//       window.location.href = "/";
//     }
//   }
// };

export const getDynmicModuleData = ({ moduleID, recordID }: any) => {
  const [dynmicData, setDynmicData] = useState<any>([]);
  const dynmicDataFunction = async () => {
    try {
      let data: any = {
        Userid: localStorage.getItem("username"),
        ModuleID: Number(moduleID),
        RecordID: recordID,
      };
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetDynamicFieldsModuleWise",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res?.data?.Fields) {
        setDynmicData(res?.data?.Fields);
      }
    } catch (error) { }
  };
  useEffect(() => {
    dynmicDataFunction();
  }, [moduleID]);
  return { dynmicData, setDynmicData };
};

