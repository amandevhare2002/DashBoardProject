"use client";
import "@/styles/table.css";
import { decryptText, isNamePresentInArray } from "@/utils";
import MainTable from "@/utils/table";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  IconButton,
  InputBase,
  Paper,
  Typography
} from "@mui/material";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
  Row
} from "reactstrap";
import MultiTabs from "../../Mailbox/MainDashboard/MultiTabs";
import RecordInput from "./recordInput";

export const AllApprovalComponent = () => {
  const token = useSelector((state: any) => state.authReducer.token);
  // const [expenseArray, setExpenseArray] = useState<any>([]);
  // const [selectedStat, setSelectedStat] = useState({});
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [tabs, setTabs] = useState<any>([]);
  const [approvalList, setApprovalList] = useState<any | undefined>();
  const [isLoader, setIsLoader] = useState(false);

  useEffect(() => {
    if (token) {
      handleApprovalDashboard();
    }
  }, [token]);
  useEffect(() => {
    if (tabs.length === 0 && approvalList?.length > 0) {
      setTabs((): any => {
        const _tabs = [
          {
            id: 0,
            name: "Dashboard",
            content: () => renderDashboard(),
            isShowTxn: false,
          },
        ];
        setSelectedTab(0);
        return _tabs;
      });
    }
  }, [approvalList]);

  const renderDashboard = () => {
    return (
      <div>
        <Row>
          {isLoader}
          {approvalList.map((res: any, index: number) => (
            <Col
              sm="12"
              md="6"
              lg="4"
              xl="4"
              key={index}
              onClick={() => handleTabCreation(res?.CompanyName, res?.Count)}
            >
              <div key={index} className="category-item">
                <Card
                  className="mb-2 px-2 py-3"
                  style={{
                    borderBottom: `3px solid ${(index + 1) % 6 === 0
                      ? "#C70039"
                      : (index + 1) % 4 === 0
                        ? "#08A045"
                        : (index + 1) % 3 === 0
                          ? "#0E3386"
                          : (index + 1) % 2 === 0
                            ? "#F400A1"
                            : "#FFB000"
                      }`,
                  }}
                >
                  <h5 className="menu-header-title py-3">{res?.CompanyName}</h5>
                  <Row className="g-0">
                    <Col
                      sm="12"
                      md="12"
                      lg="12"
                      className="py-2"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="row">
                        <div className="col-6">
                          <div style={{ fontSize: "20px" }}>Count</div>
                        </div>
                        <div className="col-6">
                          <h5>
                            <strong>{res.Count}</strong>
                          </h5>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const handleApprovalDashboard = async () => {
    try {
      setIsLoader(true);
      let UserName = localStorage.getItem("username");
      let data = {
        Userid: UserName,
      };
      const resp = await axios.post(
        `https://logpanel.insurancepolicy4u.com/api/Login/ApprovalDashBoardENC`,
        data,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (resp) {
        const decrypt = decryptText(resp?.data);

        setApprovalList(
          decrypt &&
          decrypt.AllApprovals &&
          decrypt.AllApprovals[0] &&
          decrypt.AllApprovals[0].companies
        );
      } else {
        const result = await axios.post(
          `https://logpanel.insurancepolicy4u.com/api/Login/ApprovalDashBoard`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (result?.data) {
          setApprovalList(result?.data);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoader(false);
    }
  };
  const renderableTabAssetDetails = (
    companyname: any,
    assetId: any,
    assetValues: any,
    tabs: any
  ) => {
    const [details, setDetails] = useState<any>([]);
    const [recordData, setRecordData] = useState<any>([]);
    const [fullview, setFullView] = useState<any>([]);
    const [expanded, setExpanded] = useState<string | false>(false);
    const componentRef = useRef<HTMLDivElement | null>(null);
    const [expandedRows, setExpandedRows] = useState<any>();
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [dropDownArray, setDropDownArray] = useState<any>();
    const [fieldArray, setFieldArray] = useState<any>([]);
    const [searchKey, setSearchKey] = useState<string>("");


    const setTabsFieldData = (fieldName: string, data: any) => {
      setTabs((prev: any) => {
        const _prev = [...prev];
        _prev[_prev.length - 1][fieldName] = data;

        return _prev;
      });
    };

    const getTabsFieldData = (fieldName: string) => {
      return tabs[tabs.length - 1][fieldName] ?? [];
    };

    const setInnerTab = (innerTab: number) => {
      setTabs((prev: any) => {
        const _prev = [...prev];
        _prev[_prev.length - 1].innerTab = innerTab;
        return _prev;
      });
    };

    const getInnerTab = () => {
      return tabs[tabs.length - 1].innerTab ?? 0;
    };

    const handleGetApprovalDetails = async () => {
      setLoading(true);
      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/ApprovalDetailsENC",
          {
            Userid: localStorage.getItem("username"),
            Company: companyname,
            InputType: "ALL",
            SearchKey: searchKey ? searchKey : "",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          if (res) {
            const decrypted = decryptText(res?.data);

            setDetails(decrypted?.years);
            // const data = decrypted.subHeadDetails
            // setTabsFieldData('ApprovalDetails', data)
            setLoading(false);
            setInnerTab(1);
          } else {
            axios
              .post(
                "https://logpanel.insurancepolicy4u.com/api/Login/ApprovalDetails",
                {
                  Userid: localStorage.getItem("username"),
                  Company: companyname,
                  InputType: "ALL",
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then((res) => {
                const decrypted = decryptText(res.data);
                setDetails(decrypted?.years);
                //   const data = decrypted.subHeadDetails
                //   setTabsFieldData('ApprovalDetails', data)
                setInnerTab(1);
                setLoading(false);
              })
              .catch((error) => {
                setTabsFieldData("ApprovalDetails", []);
              });
          }
        })
        .catch((error) => {
          setLoading(false);
          setTabsFieldData("ApprovalDetails", []);
        });
    };

    useEffect(() => {
      if (!edit) {
        handleGetApprovalDetails();
      }
    }, []);

    useEffect(() => {
      setLoading(true);
      let timer: any;
      if (searchKey !== "") {
        timer = setTimeout(() => {
          handleGetApprovalDetails();
        }, 5000);
      } else {
        setLoading(false);
      }
      return () => {
        clearTimeout(timer);
      };
    }, [searchKey]);
    // console.log("details",details)
    const handleGetApprovalRecords = async (row: any) => {
      const userName = localStorage.getItem("username");
      try {
        setIsLoader(true);
        // console.log(userName, companyname, row?.SubHead, expanded, row, expandedRows)
        if (!userName || !companyname || !expanded) {
          return;
        }
        const data = {
          Userid: userName,
          InputType: "ALL", //ALL or STATUS
          Company: companyname,
          Year: expanded,
          SubHead: assetId, // assetId is SubHead
          PaymentFor: row?.PaymentFor,
          Value1: row?.Value1,
          SearchKey: "",
        };
        handleTabCreation(assetId, expanded, []);
        const resp = await axios.post(
          "https://logpanel.insurancepolicy4u.com/api/Login/ApprovalRecordsENC",
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (resp) {
          const decrypted = decryptText(resp?.data);

          const mergeArrays = (data1: any, data2: any) => {
            // Create a map to store objects based on the common key
            const map = new Map();

            // Populate the map with objects from data1
            data1.forEach((item: any) => {
              const key = item.app_id;
              map.set(key, { ...map.get(key), ...item });
            });

            // Merge objects from data2 into the map
            data2.forEach((item: any) => {
              const key = item.APID;
              map.set(key, { ...map.get(key), ...item });
            });

            // Convert the map values to an array
            const resultArray = Array.from(map.values());

            return resultArray;
          };

          const finalApprovalArray = mergeArrays(
            decrypted.Approvals,
            decrypted.Table1
          );
          setRecordData(finalApprovalArray);

          setInnerTab(3);
        } else {
          const resp = await axios.post(
            "https://logpanel.insurancepolicy4u.com/api/Login/ApprovalRecords",
            { data },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (resp) {
            setRecordData(resp?.data?.Approvals);
            setInnerTab(3);
          } else {
            return false;
          }
        }
      } catch (error) {
        console.log(error);
      }
      setIsLoader(false);
    };
    const columnsSubHeads = [
      {
        name: "SubHead",
        selector: (val: any) => {
          return (
            <div
              style={{ color: "#0088ff", cursor: "pointer" }}
              onClick={() => {
                handleTabCreation(
                  companyname,
                  val?.SubHead,
                  val?.approvalHeadData
                );
                setInnerTab(2);
              }}
            >
              {val.SubHead}
            </div>
          );
        },
        sortable: true,
        reorder: true,
        wrap: true,
      },
      {
        name: "SubHeadCount",
        selector: (row: any) => row.SubHeadCount,
        sortable: true,
        reorder: true,
        wrap: true,
      },
    ];

    const handleGETDynamicFields = async () => {
      try {
        if (fieldArray.length > 0) {
          return;
        }
        let data = {
          Userid: localStorage.getItem("username"),
          ModuleID: 228,
          RecordID: "0",
        };
        const result = await axios.post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetDynamicFieldsModuleWise",
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (result?.data) {
          setFieldArray(result?.data?.Fields);
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    useEffect(() => {
      handleGETDynamicFields();
    }, []);

    const AddDropDownData = async () => {
      try {
        let data = {
          Userid: localStorage.getItem("username"),
          valueReqs:
            fieldArray &&
            fieldArray.length > 0 &&
            fieldArray
              .filter((field: any) => field.FieldType === "DROPDOWN")
              .map(({ Dbname, TabName, Colname, ServerName }: any) => ({
                Dbname,
                TabName,
                Colname,
                ServerName,
              })),
        };
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
      if (fieldArray && fieldArray.length > 0) {
        AddDropDownData();
      }
    }, [fieldArray]);

    const columnsRecord = useMemo(() => {
      setLoading(!loading);

      if (!recordData || recordData.length === 0) {
        setLoading(false);
        return [];
      }

      let columnsRes =
        recordData && recordData.length > 0
          ? Object.keys(recordData && recordData[0])
            .map((column, i: number) => {
              if (column === "Link") {
                return null;
              } else if (column === "APID") {
                return null;
              } else if (column === "app_id") {
                return {
                  name: column,
                  selector: (row: any) => {
                    return (
                      <a
                        style={{
                          color: "#0088ff",
                          cursor: "pointer",
                          width: "150px !important",
                          minWidth: "150px",
                        }}
                        href={row?.Link}
                      >
                        {row?.app_id}
                      </a>
                    );
                  },
                  cell: (row: any) => {
                    return edit ? (
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
                    );
                  },

                  sortable: true,
                  wrap: true,
                  reorder: true,
                };
              } else if (column === "DownloadLink") {
                return {
                  name: column,
                  selector: (row: any, index: number) => {
                    return (
                      <a
                        style={{
                          color: "#0088ff",
                          cursor: "pointer",
                          minWidth: "150px",
                        }}
                        href={row?.DownloadLink}
                        onDoubleClick={() =>
                          setFullView((prev: any) => {
                            const newValue = `${index}${i}`;
                            // if()
                            if (prev.includes(newValue)) {
                              // If it's already present, remove it
                              return prev.filter(
                                (item: any) => item !== newValue
                              );
                            } else {
                              // If it's not present, add it
                              return [...prev, newValue];
                            }
                          })
                        }
                      >
                        {/* {row?.DownloadLink.slice(0,18)+'..'} */}
                        {!fullview.includes(`${index}${i}`)
                          ? row?.DownloadLink && row?.DownloadLink.length > 50
                            ? row?.DownloadLink.slice(0, 50) + ".."
                            : row?.DownloadLink
                          : row?.DownloadLink}
                      </a>
                    );
                  },
                  cell: (row: any, index: number) => {
                    return edit ? (
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
                        onDoubleClick={() =>
                          setFullView((prev: any) => {
                            const newValue = `${index}${i}`;
                            // if()
                            if (prev.includes(newValue)) {
                              // If it's already present, remove it
                              return prev.filter(
                                (item: any) => item !== newValue
                              );
                            } else {
                              // If it's not present, add it
                              return [...prev, newValue];
                            }
                          })
                        }
                      >
                        {/* {fullview.includes(`${index}${i}`) ? row?.DownloadLink : ( row?.DownloadLink && row?.DownloadLink?.length > 50 ? row?.DownloadLink.slice(0,50)+'..' : row?.DownloadLink) } */}
                        {!fullview.includes(`${index}${i}`)
                          ? row?.DownloadLink && row?.DownloadLink.length > 50
                            ? row?.DownloadLink.slice(0, 50) + ".."
                            : row?.DownloadLink
                          : row?.DownloadLink}
                      </a>
                    );
                  },
                  sortable: true,
                  wrap: true,
                  reorder: true,
                };
              } else {
                return {
                  name: column,
                  selector: (row: any, index: number) => {
                    return (
                      <div
                        style={{
                          // color: "#0088ff",
                          cursor: "pointer",
                          minWidth: "180px !important",
                          width: "180px!important",
                        }}
                        // href={row?.Link}
                        onDoubleClick={() =>
                          setFullView((prev: any) => {
                            const newValue = `${index}${i}`;
                            // if()
                            if (prev.includes(newValue)) {
                              // If it's already present, remove it
                              return prev.filter(
                                (item: any) => item !== newValue
                              );
                            } else {
                              // If it's not present, add it
                              return [...prev, newValue];
                            }
                          })
                        }
                      >
                        {/* {row[column]} */}
                        {fullview.includes(`${index}${i}`)
                          ? row[column]
                          : row[column] && row[column]?.length > 30
                            ? row[column].slice(0, 30) + ".."
                            : row[column]}
                      </div>
                    );
                  },
                  sortable: true,
                  wrap: true,
                  reorder: true,
                  cell: (row: any, index: number) => {
                    return edit ? (
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
                        onDoubleClick={() =>
                          setFullView((prev: any) => {
                            const newValue = `${index}${i}`;
                            if (prev.includes(newValue)) {
                              return prev.filter(
                                (item: any) => item !== newValue
                              );
                            } else {
                              return [...prev, newValue];
                            }
                          })
                        }
                      >
                        {/* {row[column]} */}
                        {/* {!fullview.includes(`${index}${i}`) ? ( row[column] && row[column]?.length > 50 ? row[column].slice(0,50)+'..' : row[column]) : row[column]} */}
                        {fullview.includes(`${index}${i}`)
                          ? row[column]
                          : row[column] && row[column]?.length > 30
                            ? row[column].slice(0, 30) + ".."
                            : row[column]}

                        {/* row[column]?.length > 50 ? row[column].slice(0, 50) + '..' : row[column] */}
                      </div>
                    );
                  },
                };
              }
            })
            .filter((column) => column !== null)
          : [];
      setLoading(false);
      return columnsRes;
    }, [recordData, edit, fullview]);

    const handleChange =
      (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
      };

    const columnsHeadData =
      assetValues && assetValues.length > 0
        ? Object.keys(assetValues[0]).map((column) => {
          if (column === "PaymentFor") {
            return {
              name: column,
              selector: (row: any) => {
                return (
                  <div
                    style={{ color: "#0088ff", cursor: "pointer" }}
                    onClick={() => handleGetApprovalRecords(row)}
                  >
                    {row.PaymentFor}
                  </div>  
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
            };
          } else {
            return {
              name: column,
              selector: column,
              sortable: true,
              wrap: true,
              reorder: true,
            };
          }
        })
        : [];

    function getMainValue(val: any) {
      if (fieldArray && fieldArray.length > 0) {
        const foundField = fieldArray.find((fld: any) => fld.FieldName === val);
        if (foundField) {
          let obj = {
            mainValue: foundField?.IsMainCol,
            colName: foundField?.Colname,
          };
          return obj;
        }
      }
      return { mainValue: false, colName: "" };
    }
    const handleSaveData = async () => {
      try {
        setLoading(true);

        let fieldNewData =
          recordData &&
          recordData.length > 0 &&
          recordData.map((record: any) => {
            const fieldsDatanew = Object.entries(record).map(([key, value]) => {
              const isMain: any = getMainValue(key);
              if (isMain?.colName) {
                return {
                  Fieldname: key,
                  FieldValue: value,
                  Colname: isMain?.colName,
                  IsMain: isMain?.mainValue,
                };
              }
            });
            return {
              fieldsDatanew: fieldsDatanew.filter((item) => item !== undefined),
            };
          });

        let data = {
          Userid: localStorage.getItem("username"),
          ModuleID: 228,
          Operation: "UPDATE",
          recordsbulk: fieldNewData,
        };
        const resp = await axios.post(
          "https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldBulk",
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (resp?.data) {
          return true;
        }
      } catch (error) {
        console.log("error", error);
      } finally {
        setEdit(false);
        setLoading(false);
      }
    };

    return getInnerTab() === 1 ? (
      <>
        <h3
          style={{
            margin: "20px 0px",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          {companyname}
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: 400,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search Google Maps"
              inputProps={{ "aria-label": "search" }}
              name="SearchKey"
              onChange={(e) => setSearchKey(e.target.value)}
            />
            <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
              <SearchIcon className="text-2xl" />
            </IconButton>
          </Paper>
        </h3>
        <Card>
          <CardBody>
            {loading ? (
              <div className="w-full justify-center items-center flex">
                <CircularProgress />
              </div>
            ) : (
              details &&
              details?.map((detail: any, i: number) => (
                <Accordion
                  key={i}
                  onChange={handleChange(detail.Year)}
                  expanded={expanded === detail.Year}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    sx={{ width: "100%" }}
                  >
                    <div className="flex justify-between w-[96%]">
                      <Typography>{detail.Year}</Typography>

                      <Button color="primary">count:{detail?.YearCount}</Button>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div>
                      <MainTable
                        TableArray={detail?.subHeads}
                        columns={columnsSubHeads}

                      />
                    </div>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </CardBody>
        </Card>
      </>
    ) : getInnerTab() === 2 ? (
      <>
        <h3
          style={{
            margin: "20px 0px",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          {companyname}
        </h3>
        <Card>
          <CardBody>
            <MainTable
              TableArray={assetValues}
              columns={columnsHeadData}
            />
          </CardBody>
        </Card>
      </>
    ) : getInnerTab() === 3 ? (
      <>
        <h3
          style={{
            margin: "20px 0px",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
          className="text-3xl"
        >
          {/* <i onClick={() => setInnerTab(1)} className="lnr-arrow-left-circle" /> */}
          {companyname}
        </h3>
        <MainTable
          title={"Record Table"}
          TableArray={recordData}
          columns={columnsRecord}
          // newClass={lciOTt}
          setEditBtn={setEdit}
          editBtn={edit}
          newClass="!w-[190%] !max-w-[200%]"
          isLoading={loading}
          handleSaveData={handleSaveData}
        />
      </>
    ) : (
      <></>
    );
  };

  const handleTabCreation = (
    companyName: any,
    count: any,
    assetArray: any = []
  ) => {
    setTabs((prev: any): any => {
      const _tabs = [...prev];
      const tab_name = `${companyName} |  ${count} `;
      const present = isNamePresentInArray(tab_name, _tabs);

      if (present) {
        handleTabChange(present);
        return _tabs;
      }
      _tabs.push({
        id: _tabs.length,
        name: tab_name,
        content: () =>
          renderableTabAssetDetails(companyName, count, assetArray, _tabs),
        isShowTxn: false,
      });
      setSelectedTab(_tabs.length - 1);
      return _tabs;
    });
  };

  const closeTab = (tabToDeleteId: number) => {
    if (tabToDeleteId === 0) return;
    setTabs(tabs.filter((tab: any) => tab.id !== tabToDeleteId));
    setTabs((prev: any) =>
      prev.map((tab: any, index: number) => ({ ...tab, id: index }))
    );
    setSelectedTab(tabToDeleteId > 0 ? tabToDeleteId - 1 : 0);
  };

  const handleTabChange = (id: number) => {
    setSelectedTab(id);
    // setIstransaction(false)
  };

  return (
    <div>
      <MultiTabs
        tabs={tabs}
        closeTab={closeTab}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        handleTabChange={handleTabChange}
      />
    </div>
  );
};
