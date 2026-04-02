import { decryptText, isNamePresentInArray } from '@/utils';
import { Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button, Tab, Tabs, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import "@/styles/approval-dashboard/status.css"
import 'jspdf-autotable';
import MainTable from '@/utils/table';
import MultiTabs from '../../Mailbox/MainDashboard/MultiTabs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Card, CardBody } from 'reactstrap';
import Loading from '@/app/loading';
import api from '../../Mailbox/utils/api';


export const StatusApproval = ({ approvalList }: any) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [tabs, setTabs] = useState<any>([]);
  const [record, setRecord] = useState<any>()
  const [loading, setLoading] = useState(false)


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
  }, [])

  const renderDashboard = () => {
    const [value, setValue] = useState<any>(null);
    const [detail, setDetails] = useState<any>()
    const [expanded, setExpanded] = useState<any>();

    interface TabPanelProps {
      children?: React.ReactNode;
      index: number;
      value: number;
    }

    function CustomTabPanel(props: TabPanelProps) {
      const { children, value, index, ...other } = props;

      return (
        <div
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
        >
          {value === index && (
            <Box sx={{ p: 3 }}>
              <Typography>{children}</Typography>
            </Box>
          )}
        </div>
      );
    }

    function a11yProps(index: number) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
    }


    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      if (expanded) {
        setExpanded(null)
      }
      setValue(newValue);
    };

    const handleApprovalDetails = async () => {
      try {
        setLoading(true)
        const statusName = approvalList && approvalList.length > 0 && approvalList[value] && approvalList[value].Status
        let data = {
          "Userid": localStorage.getItem("username"),
          "InputType": statusName, //ALL or STATUS
          "Company": "",
          "SearchKey": ""
        }
        const result = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/ApprovalDetailsENC", data, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        })
        if (result) {
          const decrypt = decryptText(result?.data)
          setDetails(decrypt?.years)
        } else {
          setLoading(true)
          const result = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/ApprovalDetailsENC", data, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          })
          if (result) {
            const decrypt = (result?.data)
            setDetails(decrypt?.years)
          }
        }
      } catch (error) {
        console.log("error", error)
      }
      finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      if (value !== null) {
        handleApprovalDetails()
      }
    }, [value])

    const handleChangeAccordian = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

    // const columnsSubHeads = useMemo(
    //   () => [
    //     {
    //       accessorKey: 'SubHead',
    //       header: 'SubHead',
    //       muiTableBodyRowProps: (val: any) => {
    //         console.log("val",val)
    //         return (
    //           <div
    //             style={{ color: "#0088ff", cursor: "pointer" }}
    //             onClick={() => {
    //               const statusName = approvalList && approvalList.length > 0 && approvalList[value] && approvalList[value].Status
    //               handleTabCreation(statusName, val?.SubHead, expanded, val?.approvalHeadData)
    //               handleTabChange(1);
    //             }}
    //           >
    //             {val.SubHead}
    //           </div>
    //         )
    //       }
    //     },
    //     {
    //       accessorKey: 'SubHeadCount',
    //       header: 'SubHeadCount',
    //     },
    //   ],
    //   [],
    // );
    const columnsSubHeads = [
      {
        name: 'SubHead',
        selector: (val: any) => {
          return (
            <div
              style={{ color: "#0088ff", cursor: "pointer" }}
              onClick={() => {
                const statusName = approvalList && approvalList.length > 0 && approvalList[value] && approvalList[value].Status
                handleTabCreation(statusName, val?.SubHead, expanded, val?.approvalHeadData)
                handleTabChange(1);
              }}
            >
              {val.SubHead}
            </div>
          )
        },
        sortable: true,
        reorder: true,
        wrap: true,


      },
      {
        name: 'SubHeadCount',
        selector: (row: any) => row.SubHeadCount,
        sortable: true,
        reorder: true,
      },
    ];
    return (<div>
      <div>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
              textColor="primary"
              indicatorColor="primary"
              sx={{ display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center" }}
            >
              {
                approvalList && approvalList.length > 0 && approvalList.map((status: any, i: number) => (
                  <Tab
                    className=''
                    label={
                      <Badge
                        badgeContent={status.Count}
                        color="primary" max={99999}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        className="css-21152c-MuiButtonBase-root-MuiTab-root.Mui-selected"
                      >
                        <div style={{ width: "100%", height: "30px", padding: "10px" }} className=''>
                          {status.Status}
                        </div>
                      </Badge>}
                    {...a11yProps(i)}
                    sx={{ minWidth: "140px", marginLeft: "0px", borderRadius: "2px 2px 0px 0px" }}
                  />
                ))
              }

            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={value}>
            {
              detail && detail.length > 0 && detail.map((perDetail: any) => (
                <Accordion
                  key={perDetail?.Year}
                  onChange={handleChangeAccordian(perDetail?.Year)}
                  expanded={expanded === perDetail?.Year}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    sx={{ width: "100%" }}
                  >
                    <div className="flex justify-between w-[96%]">
                      <Typography>
                        {perDetail.Year}
                      </Typography>

                      <Button color="primary">
                        count:{perDetail?.YearCount}
                      </Button>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div >
                      {/* <MUITable
                        data={perDetail?.subHeads}
                        columns={columnsSubHeads}
                      /> */}
                      <MainTable
                        TableArray={perDetail?.subHeads}
                        columns={columnsSubHeads}
                      />
                    </div>
                  </AccordionDetails>
                </Accordion>
              ))
            }

          </CustomTabPanel>
        </Box>
      </div>
    </div>)
  }



  const renderableTabAssetDetails = (companyname: string, assetId: string, expanded: number, assetValues: any, tabs: any) => {

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
        setLoading(true)
        const data = {
          "Userid": userName,
          "InputType": companyname, //ALL or STATUS
          "Company": "",
          "Year": expanded,
          "SubHead": assetId, // assetId is SubHead
          "PaymentFor": row?.PaymentFor,
          "Value1": row?.Value1,
          "SearchKey": ""
        }

        const resp = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/ApprovalRecordsENC", data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (resp) {
          const decrypted = decryptText(resp?.data)
          console.log("decrypted", decrypted)
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
          }

          const finalApprovalArray = mergeArrays(decrypted.Approvals, decrypted.Table1)
          console.log("Table1", finalApprovalArray)
          handleTabCreation(row?.PaymentFor, assetId, expanded, finalApprovalArray)
          // setRecord(finalApprovalArray)

          setInnerTab(1)
        } else {
          setLoading(true)
          const resp = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/ApprovalRecords", { data }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })

          if (resp) {
            setRecord(resp?.data?.Approvals)
            setInnerTab(1)
          } else {
            return false
          }
        }
        setLoading(false)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
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
    const columnsRecord: any =
      assetValues && assetValues.length > 0 ?
        Object.keys(assetValues?.[0]).map((column) => {
          if (column === "Link") {
            return null
          } else if (column === "APID") {
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
              wrap: true,
              reorder: true,
            };
          } else if (column === "DownloadLink") {
            return {
              name: column,
              selector: (row: any) => {
                return (
                  <Link
                    style={{ color: "#0088ff", cursor: "pointer" }}
                    href={row?.DownloadLink}
                  >
                    {row.DownloadLink}
                  </Link>
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
            };
          }
          else {
            return {
              name: column,
              selector: column,
              sortable: true,
              wrap: true,
              reorder: true,
            }
          }
        }).filter((column) => column !== null) : []

    console.log("record", assetValues)
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
        <MainTable
          TableArray={assetValues}
          columns={columnsHeadData}
        />
      </>
    ) : getInnerTab() === 1 ? (
      <>

        <MainTable
          title={"Record Table"}
          TableArray={assetValues}
          columns={columnsRecord}
        />
      </>
    ) : <></>
  };

  const handleTabCreation = (companyName: string, count: any, expanded: number, assetArray: any = []) => {

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
        content: () => renderableTabAssetDetails(companyName, count, expanded, assetArray, _tabs),
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
      {loading && <Loading />}
      <MultiTabs tabs={tabs} closeTab={closeTab} selectedTab={selectedTab} setSelectedTab={setSelectedTab} handleTabChange={handleTabChange} />
    </div>
  );
}
