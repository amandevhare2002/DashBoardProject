import { decryptText, isNamePresentInArray } from "@/utils";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Button, ButtonDropdown, Card, CardBody, Row } from "reactstrap";
import MultiTabs from "../../Mailbox/MainDashboard/MultiTabs";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MainTable from "@/utils/table";
import Link from "next/link";
import YearsRecordTable from "./years-record-table";

export const AllYearComponent = ({ approvalList }: any) => {
    const token = useSelector((state: any) => state.authReducer.token);
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const [tabs, setTabs] = useState<any>([]);

    useEffect(() => {
        if (tabs.length === 0 && approvalList?.length > 0) {
            setTabs((): any => {
                const _tabs = [
                    {
                        id: 0,
                        name: 'Dashboard',
                        content: () => renderDashboard(),
                        isShowTxn: false
                    }
                ]
                // console.log("tabs",_tabs)
                setSelectedTab(0)
                return _tabs
            })
        }
    }, [approvalList])


    const renderDashboard = () => {
        const [expanded, setExpanded] = useState<string | false>(false);
        const handleChange =
            (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
                setExpanded(isExpanded ? panel : false);
            };

        const columnsSubHeads = [
            {
                name: 'SubHead',
                selector: (val: any) => {
                    return (
                        <div
                            style={{ color: "#0088ff", cursor: "pointer" }}
                            onClick={() => {
                                handleTabCreation(val?.SubHead, expanded, val?.approvalHeadData);
                            }}
                        >
                            {val.SubHead}
                        </div>
                    )
                },
                sortable: true,
                reorder: true,
                wrap:true,
              
            },
            {
                name: 'SubHeadCount',
                selector: (row: any) => row.SubHeadCount,
                sortable: true,
                reorder: true,
                wrap:true,
               
            },
        ];

        return (<div>
            <>
                <Card>
                    <CardBody>
                        {
                            approvalList && approvalList?.map((detail: any, i: number) => (
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
                                            <Typography>
                                                {detail.Year}
                                            </Typography>

                                            <Button color="primary">
                                                count:{detail?.YearCount}
                                            </Button>
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div >
                                            <MainTable
                                                TableArray={detail?.subHeads}
                                                columns={columnsSubHeads}
                                            />
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                            ))
                        }
                    </CardBody>
                </Card>
            </>
        </div>)
    }


    const renderableTabAssetDetails = (companyname: string, assetId: string, assetValues: any, tabs: any) => {
        const [recordData, setRecordData] = useState([])
        const setTabsFieldData = (fieldName: string, data: any) => {
            setTabs((prev: any) => {

                const _prev = [...prev]
                _prev[_prev.length - 1][fieldName] = data

                return _prev
            })
        }

        const getTabsFieldData = (fieldName: string) => {
            return tabs[tabs.length - 1][fieldName] ?? []
        }

        const setInnerTab = (innerTab: number) => {

            setTabs((prev: any) => {
                const _prev = [...prev]
                _prev[_prev.length - 1].innerTab = innerTab
                return _prev
            })

        }

        const getInnerTab = () => {
            return tabs[tabs.length - 1].innerTab ?? 0
        }

        const handleGetApprovalRecords = async (row: any) => {
            const userName = localStorage.getItem("username");
            try {
                const data = {
                    "Userid": userName,
                    "InputType": "ALL", //ALL or STATUS
                    "Company": "",
                    "Year": assetId,
                    "SubHead": companyname, // assetId is SubHead
                    "PaymentFor": row?.PaymentFor,
                    "Value1": row?.Value1,
                    "SearchKey":""

                }
                handleTabCreation(row?.PaymentFor, assetId, [])
                const resp = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/ApprovalRecordsENC", data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (resp) {
                    const decrypted = decryptText(resp?.data)

                    setRecordData(decrypted?.Approvals)

                    setInnerTab(1)
                } else {
                    const resp = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/ApprovalRecords", { data }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    if (resp) {
                        setRecordData(resp?.data?.Approvals)
                        setInnerTab(3)
                    } else {
                        return false
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }

        const columnsHeadData = assetValues && assetValues.length > 0
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
                            )
                        },
                        sortable: true,
                        wrap:true,
                        reorder: true,
                    };
                } else {
                    return {
                        name: column,
                        selector: column,
                        sortable: true,
                        wrap:true,
                        reorder: true,
                    };
                }
            })
            : [];

        
    const columnsRecord: any =
    recordData && recordData.length > 0 ?
      Object.keys(recordData?.[0]).map((column) => {
        if (column === "Link") {
          return null
        }
        else if (column === "app_id") {
          return {
            name: column,
            selector: (row: any) => {
              return (
                <Link
                  style={{ color: "#0088ff", cursor: "pointer" }}
                  href={row?.Link}
                >
                  {row.app_id}
                </Link>
              );
            },
            sortable: true,
            wrap:true,
            reorder: true,
          };
        }
        else {
          return {
            name: column,
            selector: column,
            sortable: true,
            wrap:true,
            reorder: true,
          }
        }
      }).filter((column) => column !== null) : []

        return getInnerTab() === 0 ? (
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
        ) : getInnerTab() === 1 ? (
            <>
                {/* <MainTable
                    title={"Record Table"}
                    TableArray={recordData}
                    columns={columnsRecord}
                /> */}

                <YearsRecordTable
                    recordData={recordData}
                    setRecordData={setRecordData}
                />
            </>
        ) : <>

        </>
    };

    const handleTabCreation = (companyName: string, count: any, assetArray: any = []) => {
        setTabs((prev: any): any => {
            const _tabs = [...prev]
            const tab_name = `${companyName} |  ${count} `
            const present = isNamePresentInArray(tab_name, _tabs)

            if (present) {
                handleTabChange(present)
                return _tabs;
            }
            _tabs.push({
                id: _tabs.length,
                name: tab_name,
                content: () => renderableTabAssetDetails(companyName, count, assetArray, _tabs),
                isShowTxn: false
            })
            setSelectedTab(_tabs.length - 1)
            return _tabs
        })
    }

    const closeTab = (tabToDeleteId: number) => {
        if (tabToDeleteId === 0) return
        setTabs(tabs.filter((tab: any) => tab.id !== tabToDeleteId));
        setTabs((prev: any) => prev.map((tab: any, index: number) => ({ ...tab, id: index })))
        setSelectedTab(tabToDeleteId > 0 ? tabToDeleteId - 1 : 0)
    };


    const handleTabChange = (id: number) => {
        setSelectedTab(id);
        // setIstransaction(false)
    };

    return (
        <div>
            <MultiTabs tabs={tabs} closeTab={closeTab} selectedTab={selectedTab} setSelectedTab={setSelectedTab} handleTabChange={handleTabChange} />
        </div>
    );
};
