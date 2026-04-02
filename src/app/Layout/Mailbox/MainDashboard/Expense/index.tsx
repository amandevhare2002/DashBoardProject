import { decryptText, isNamePresentInArray } from "@/utils";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import { Button, Card, CardBody, Col, ListGroup, ListGroupItem, Row } from "reactstrap";
import MultiTabs from "../MultiTabs";
import { AssetValue, ITransactions } from "../interface";
import MainTable from "@/utils/table";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import Loading from '@/app/loading';
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
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
      className="flex w-full"
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
export const ExpenseComponent = () => {
  const token = useSelector((state: any) => state.authReducer.token);
  const [expenseArray, setExpenseArray] = useState<any>([]);
  const [selectedStat, setSelectedStat] = useState({});
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [tabs, setTabs] = useState<any>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<AssetValue | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<ITransactions>(
    [])


  useEffect(() => {
    if (token) {
      getExpenseArray();
    }
  }, [token]);

  useEffect(() => {
    if (tabs.length === 0 && expenseArray.length > 0) {
      setTabs((): any => {
        const _tabs = [
          {
            id: 0,
            name: 'Dashboard',
            content: () => renderDashboard(),
            isShowTxn: false
          }
        ]
        // setSelectedTab(0)
        return _tabs
      })
    }
  }, [expenseArray])


  const renderDashboard = () => {
    const [value, setValue] = useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    };

    const getAssetDetail = (result: any, stat: any, year: any) => {
      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetStatsDetailsENC",
          {
            Userid: localStorage.getItem("username"),
            Company: result?.Companyname,
            RecordID: stat?.StatCode,
            "Year": year
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {

          const decrypted = decryptText(res.data)
          const data = decrypted.subHeadDetails
          handleTabCreation(result?.Companyname, stat, data, year)
        })
        .catch((error) => {
          console.log("error", error)
        });
    };
    return (<div>
      <h3 style={{ margin: "20px 0px" }}>Expense</h3>
      <Tabs value={value} onChange={handleChange} aria-label="tabs expense">
        {
          expenseArray.map((item: any, index: number) => (
            <Tab
              label={item?.YearName}
              {...a11yProps(index)}
              key={index}
            />
          ))
        }
      </Tabs>
      <div className="flex w-full">
        {
          expenseArray.map((item: any, i: number) => (
            <CustomTabPanel value={value} index={i}>
              <Row>
                {
                  item?.companiesNames && item?.companiesNames.length > 0 && item?.companiesNames.map((res: any, index: number) => (
                    <Col sm="12" lg="6" xl="4">
                      <Card
                        key={`banlDetails${index}`}
                        className="mb-3 profile-responsive"
                      >
                        <div className="dropdown-menu-header">
                          <div className="dropdown-menu-header-inner">
                            <div className="menu-header-image opacity-2" />
                            <div className="menu-header-content btn-pane-right">
                              <div>
                                <h5 className="menu-header-title" style={{ color: '#6c757d' }}>{res.Companyname}</h5>
                              </div>
                            </div>
                          </div>
                        </div>
                        <ListGroup flush>
                          <ListGroupItem className="p-0">
                            <div className="grid-menu">
                              <Row className="g-0">
                                {res.stats?.map(
                                  (stat: any, assetIndex: number) => (
                                    <Col sm="6">
                                      <Button
                                        className="btn-icon-vertical btn-square btn-transition br-bl"
                                        key={`assetIndex${assetIndex}`}
                                        outline
                                        // onClick={() => handleTabCreation(res.Companyname, stat)}
                                        onClick={() => getAssetDetail(res, stat, item?.YearName)}
                                        color="link"
                                      >
                                        <span>

                                          <h5 className="m-0" style={{ fontSize: '15px' }}>
                                            {parseInt(stat.Amount)}
                                          </h5>
                                          <p className="m-0">
                                            {stat.StatName}
                                          </p>
                                        </span>
                                      </Button>
                                    </Col>
                                  )
                                )}
                              </Row>
                            </div>
                          </ListGroupItem>
                        </ListGroup>
                      </Card>
                    </Col>
                  ))
                }
              </Row>
            </CustomTabPanel>
          ))
        }
      </div>
    </div>)
  }

  const [isLoading, setIsLoading] = useState(false);
  const getExpenseArray = () => {
    setIsLoading(true);
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetStatsENC1",
        {
          Userid: localStorage.getItem("username"),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {

        const decrypted = decryptText(res.data)
        setExpenseArray(decrypted?.Years);
      })
      .catch((error) => {
        setExpenseArray([]);
      })
      .finally(() => {
        setIsLoading(false);
      })
  };




  const renderableTabAssetDetails = (companyname: string, assetId: string, assetValues: any, year: any, tabs: any) => {

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
      return tabs[tabs?.length - 1].innerTab ?? 0
    }

    const handleHeadDetails = async (row: any) => {
      handleTabCreation(companyname, {
        "newTab": true,
        "newTabName": row?.SubheadName,
        "Assetname": assetId,
      },
        row?.headDetails,
        year
      )
      // let index: any;
      // [...getTabsFieldData('subHeadDetails')].forEach((ele: any, idx: number) => {
      //   if (ele.SubheadCode === row.SubheadCode) {
      //     index = idx
      //   }
      // })
      // setTabsFieldData('headDetails', ([...getTabsFieldData('subHeadDetails')[index].headDetails] ?? []))
      setInnerTab(1)
    }

    const handleTxnDetails = (row: any) => {

      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetStatsTransDetailsENC",
          {
            Userid: localStorage.getItem("username"),
            Company: companyname,
            RecordID: row?.HeadCode, // assetId
            Year: year
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          const decrypted = decryptText(res.data);
          const data = decrypted.Transactions;
          handleTabCreation(companyname, {
            "newTab": true,
            "newTabName": row?.Headname,
            "Assetname": assetId,
          },
            data,
            year
          )
          setInnerTab(2)
        })
        .catch((error) => {
          setTabsFieldData('transactionDetails', [])
        });
    };


    const columnsDefinition: any = Object.keys(assetValues).length > 0 ? Object.keys(assetValues[0]).map(
      (column) => {
        if (column === "headDetails") {
          return null
        } else
          if (column === "SubheadAmount") {
            return {
              name: column,
              selector: (row: any) => {
                return (
                  <div
                    style={{ color: "#0088ff", cursor: "pointer" }}
                    onClick={() => handleHeadDetails(row)}
                  >
                    {typeof (row.SubheadAmount) === 'string' && row.SubheadAmount}
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
      }).filter((val) => val !== null) : [];

    const columnsDefinition2: any =
      assetValues && assetValues.length > 0
        ? Object.keys(assetValues[0])
          .map((column) => {
            if (column === "Headname") {
              return {
                name: column,
                selector: (row: any) => {
                  return (
                    <div
                      style={{ color: "#0088ff", cursor: "pointer" }}
                      onClick={() => handleTxnDetails(row)}
                    >
                      {row.Headname}
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




    const columnsDefinitionTxnDetail: any = assetValues && assetValues.length > 0 ? Object.keys(assetValues[0])
      .map((column) => {
        if (column === "VC_VOUCHDT") {
          return {
            name: column,
            selector: column,
            wrap: true,
            sortable: true,
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
              TableArray={Array.isArray(assetValues) && assetValues}
              columns={columnsDefinition}
            />
          </CardBody>
        </Card>
      </>
    ) : getInnerTab() === 1 ? (
      <>
        <h3
          style={{
            margin: "20px 0px",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <i onClick={() => setInnerTab(0)} className="lnr-arrow-left-circle" />
          {companyname}
        </h3>
        <Card>
          <CardBody>
            <MainTable
              TableArray={assetValues}
              columns={columnsDefinition2}
            />
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
          <i onClick={() => setInnerTab(1)} className="lnr-arrow-left-circle" />
          {companyname}
        </h3>
        <Card>
          <CardBody>
            <MainTable
              columns={columnsDefinitionTxnDetail}
              TableArray={assetValues}
            />
          </CardBody>
        </Card>
      </>
    ) : (
      <></>
    );
  };


  const handleTabCreation = (companyName: string, selectedItem: any, assetValues?: any, year?: any) => {
    setTabs((prev: any): any => {
      const _tabs = [...prev]
      const tab_name = !selectedItem.newTab ? `${selectedItem.StatName} | ${companyName}` : `${selectedItem.newTabName}`
      const present = isNamePresentInArray(tab_name, _tabs)

      if (present) {
        handleTabChange(present)
        return _tabs;
      }
      _tabs.push({
        id: _tabs.length,
        name: tab_name,
        content: () => renderableTabAssetDetails(companyName, selectedItem.newTab ? selectedItem?.Assetname : selectedItem.StatCode, assetValues, year, _tabs),
        isShowTxn: false
      })
      setSelectedTab(_tabs.length - 1)
      return _tabs
    })
  }



  const closeTab = (tabToDeleteId: number) => {
    if (tabToDeleteId === 0) return
    // setIsbankCompany(true);
    // setIsBank(false);
    // setIsCreditCard(false)
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
      {isLoading && <Loading />}
      <MultiTabs tabs={tabs} closeTab={closeTab} selectedTab={selectedTab} setSelectedTab={setSelectedTab} handleTabChange={handleTabChange} />
    </div>

  );
};