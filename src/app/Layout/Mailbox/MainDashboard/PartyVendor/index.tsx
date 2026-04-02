import { decryptText, isNamePresentInArray } from "@/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import { Card, CardBody, Col, Row } from "reactstrap";
import MultiTabs from "../MultiTabs";
import MainTable from "@/utils/table";
import { IconButton, InputBase, Paper } from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';
import Loading from '@/app/loading';
interface Tab {
  id: number;
  name: string;
  content: () => JSX.Element;
  isShowTxn: boolean;
}

const PartyVendorComponent = () => {
  const token = useSelector((state: any) => state.authReducer.token);
  const [partyArray, setPartyArray] = useState<any>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [tabs, setTabs] = useState<Tab[]>([]);

  useEffect(() => {
    if (token) {
      getPartyArray();
    }
  }, [token]);

  useEffect(() => {
    if (tabs.length === 0 && partyArray.length > 0) {
      setTabs((): any => {
        const _tabs = [
          {
            id: 0,
            name: "Dashboard",
            content: () => renderDashboard(),
            isShowTxn: false,
          },
        ];
        // setSelectedTab(0)
        return _tabs;
      });
    }
  }, [partyArray]);


  const renderDashboard = () => {
    return (
      <div>
        <h3 style={{ margin: "20px 0px" }}>Party Vendor</h3>
        <Row>
          {partyArray?.map((res: any, index: number) => (
            <Col sm="12" md='6' lg="4" xl="4" key={index}>
              <div key={index} className="category-item">
                <Card
                  className="mb-2 px-2 py-3"
                  style={{
                    borderBottom: `3px solid ${(index + 1) % 6 === 0 ? "#C70039" : (index + 1) % 4 === 0 ? "#08A045" : (index + 1) % 3 === 0 ? "#0E3386" : (index + 1) % 2 === 0 ? "#F400A1" : "#FFB000"}`,
                 
                  }}
                >
                  <h5 className="menu-header-title py-3">
                    {res.CompanyName}
                  </h5>
                  <Row className="g-0">
                    {res.AssetList?.map((asset: any, assetIndex: number) => (
                      <Col sm="12" md="12" lg="12" className="py-2" style={{ cursor: 'pointer' }} onClick={() => handleTabCreation(res.CompanyName, asset)}>
                        <div className="row">
                          <div className="col-6">
                            <h6>
                              {asset.Assetname}
                            </h6>
                          </div>
                          <div className="col-6">
                            <h5><strong>{asset.Balance}</strong></h5>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const [isLoading, setIsLoading] = useState<any>([]);
  const getPartyArray = () => {
    setIsLoading(true);
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetPartyVendorDetailsENC",
        {
          Userid: localStorage.getItem("username"),
          Value: "BOTH",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        const decrypted = decryptText(res.data);
        const data = decrypted.companies?.map((response: any) => {
          return {
            ...response,
            activetab: "1",
          };
        });
        console.log('data', data)
        setPartyArray(data);
      })
      .catch((error) => {
        setPartyArray([]);
      })
      .finally(() => {
        setIsLoading(false);
      })
  };

  const renderableTabAssetDetails = (companyname: string, assetname: string, tabs: any, assetGroups: any) => {
    console.log("companyname",companyname,"assetname",assetname,tabs,assetGroups)
    const [searchVal,setSearchVal] = useState<string | null>()
    const [searchData,setSearchData] = useState<any>()
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
    // console.log("tab information",tabs)
    const getInnerTab = () => {
      return tabs[tabs.length - 1].innerTab ?? 0;
    };
    const handleSearchData =async () => {
      try {
        const res = await axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/SearchData",
          {
            Userid: localStorage.getItem("username"),
            Company: companyname,
            InputType: assetname?.toLowerCase() === "vendor" ? "VENDOR" : "PARTY",
            "Value": searchVal
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if(res){
          console.log("res?.data",res?.data)
          setSearchData(res?.data?.SearchData)
        }
      } catch (error) {
        console.log("error in search",error)
      }
    }
    const handleYearSelection = (code: any) => {
      handleTabCreation(companyname,{
        "newTab":true,
        "newTabName":code,
        "Assetname":assetname,
        "assetGroups":assetGroups
      })


      
      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetPartyVendorYearWiseENC",
          {
            Userid: localStorage.getItem("username"),
            Company: companyname,
            Type: assetname?.toLowerCase() === "vendor" ? "VENDOR" : "PARTY",
            Code: code,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          const decrypted = decryptText(res.data);
          const data = decrypted.years;
          console.log('data', data)
          setTabsFieldData("yearWiseDetailsWithTransactionType", data);
          setTabsFieldData("yearWiseDetails", data.map((ele: any, index: number) => {
            const tempEle = { ...ele };
            delete tempEle.TransactionType;
            return { ...tempEle };
          }));
          setInnerTab(2);
        })
        .catch((error) => {
          setInnerTab(2)
          setTabsFieldData("yearWiseDetails", []);
        });
    };
    const handleGroupSelection = (group: any) => {
      handleTabCreation(companyname,{
        "newTab":true,
        "newTabName":group,
        "Assetname":assetname,
        "assetGroups":assetGroups
      })

      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetPartyVendorDetailsGroupWiseENC",
          {
            Userid: localStorage.getItem("username"),
            Company: companyname,
            AssetName: assetname,
            GroupName: group,
            Value: "BOTH", //NOTZERO or ZERO or BOTH
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          const decrypted = decryptText(res.data);
          const data = decrypted.accountNames;
          setTabsFieldData("subHeadDetails", data);          
          setInnerTab(1);
        })
        .catch((error) => {
          setTabsFieldData("subHeadDetails", []);
        });
    };
    
    const handleTxnDetails = (row: any) => {
      handleTabCreation(companyname,{
        "newTab":true,
        "newTabName":row?.Name ? row?.Name : `${row?.TransactionType}| ${row?.Amount}`,
        "Assetname":assetname,
        "assetGroups":assetGroups
      })
      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetPartyVendorTransactionsENC",
          {
            Userid: localStorage.getItem("username"),
            Company: companyname,
            Type: assetname?.toLowerCase() === "vendor" ? "VENDOR" : "PARTY",
            Code: getTabsFieldData('currentRowTxn').Code,
            Year: getTabsFieldData('currentRowTxn').Year,
            TransactionType: row.TransactionType,
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
          setTabsFieldData("transactionDetails", data);
          setInnerTab(3);
        })
        .catch((error) => {
          setTabsFieldData("transactionDetails", []);
        });
    };

    const handleTxnTypes = async (row: any) => {
      console.log("row",row)
      let index = -1
      getTabsFieldData("yearWiseDetails").forEach((ele: any, idx: number) => {
        if (ele.Year === row.Year) {
          index = idx
        }
      })
      setTabsFieldData("currentRow", getTabsFieldData("yearWiseDetailsWithTransactionType")[index]?.TransactionType);
      setTabsFieldData("currentRowTxn", getTabsFieldData("yearWiseDetailsWithTransactionType")[index]);
    }

    const columnsDefinition: any =
      getTabsFieldData("subHeadDetails").length > 0
        ? Object.keys(getTabsFieldData("subHeadDetails")?.[0]).map((column) => {
          if (column === "Code") {
            return {
              name: column,
              selector: (row: any) => {
                return (
                  <div style={{ color: "#0088ff", cursor: "pointer" }} onClick={() => handleYearSelection(row.Code)}>
                    {row.Code}
                  </div>
                );
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
    const columnsDefinitionYear: any =
      getTabsFieldData("yearWiseDetails").length > 0
        ? Object.keys(getTabsFieldData("yearWiseDetails")?.[0]).map((column) => {
          if (column === "Code") {
            return {
              name: column,
              selector: (row: any) => {
                return (
                  <div style={{ color: "#0088ff", cursor: "pointer" }}>
                    {row.Code}
                  </div>
                );
              },
              sortable: true,
              wrap:true
            };
          } else {
            return {
              name: column,
              selector: column,
              sortable: true,
              wrap:true
            };
          }
        })
        : [];

    const columnsDefinitionTxnType: any =
      getTabsFieldData("currentRow").length > 0
        ? Object.keys(getTabsFieldData("currentRow")?.[0]).map((column) => {
          if (column === "TransactionType") {
            return {
              name: column,
              selector: (row: any) => {
                return (
                  <div style={{ color: "#0088ff", cursor: "pointer" }} onClick={() => handleTxnDetails(row)}>
                    {row.TransactionType}
                  </div>
                );
              },
              sortable: true,
              wrap:true
            };
          } else {
            return {
              name: column,
              selector: column,
              sortable: true,
              wrap:true
            };
          }
        })
        : [];


    const columnsDefinitionTxnDetail: any =
      getTabsFieldData("transactionDetails").length > 0
        ? Object.keys(getTabsFieldData("transactionDetails")?.[0]).map((column) => {
          if (column === "Code") {
            return {
              name: column,
              selector: (row: any) => {
                return (
                  <div style={{ color: "#0088ff", cursor: "pointer" }} onClick={() => handleTxnDetails(row)}>
                    {row.Code}
                  </div>
                );
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

        const columnsSearch:any = searchData && searchData.length > 0 ? Object.keys(searchData[0]).map((column) => {
          return {
            name: column,
            selector: column,
            sortable: true,
            wrap:true,
            reorder: true,
          };
        }) : []
        
    return getInnerTab() === 0 ? (
      <>
       <Paper
      component="form"
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
      onSubmit={(e) => { e.preventDefault(); handleSearchData(); }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search"
        inputProps={{ 'aria-label': 'search' }}
        onChange={(e:any) => {
          console.log("")
           e.preventDefault()
          setSearchVal(e.target.value)
        }}
        value={searchVal}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchData();
          }
        }}
      />
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleSearchData}>
        <SearchIcon />
      </IconButton>
    </Paper>

    {
      searchData && searchData.length > 0 ? (
        <div className="mt-3">
          <MainTable
              TableArray={searchData}
              columns={columnsSearch}
            />
        </div>
      ) : (<>{searchVal && "No Data" }</>)
    }
      <Row className="mt-3">
        {assetGroups?.map((res: any, index: number) => (
          <Col sm="4" lg="2" xl="2" key={index}>
            <div key={index} className="category-item">
              <Card
                className="mb-2 px-2 py-1"
                onClick={() => handleGroupSelection(res.GroupName)}
                style={{
                  borderBottom: `3px solid ${(index + 1) % 6 === 0 ? "#C70039" : (index + 1) % 4 === 0 ? "#08A045" : (index + 1) % 3 === 0 ? "#0E3386" : (index + 1) % 2 === 0 ? "#F400A1" : "#FFB000"}`,
                }}
              >
                <h5 className="menu-header-title py-3" style={{ cursor: 'pointer' }}>
                  Group: {res.GroupName}
                </h5>
              </Card>
            </div>
          </Col>
        ))}
      </Row>
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
              TableArray={getTabsFieldData("subHeadDetails")}
              columns={columnsDefinition}
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
             
            <DataTable
              data={[...getTabsFieldData("yearWiseDetails")]}
              columns={columnsDefinitionYear}
              pagination
              fixedHeader
              fixedHeaderScrollHeight="55vh"
              expandableRows
              expandableRowExpanded={(row) => (row === getTabsFieldData("currentRow"))}
              onRowExpandToggled={((isExpanded, row) => handleTxnTypes(row))}
              expandableRowsComponent={() => (
                <Card className="m-1 p-1">
                  <CardBody>
                    {getTabsFieldData("currentRow") && getTabsFieldData("currentRow").length > 0 ? <DataTable
                      data={[...getTabsFieldData("currentRow")]}
                      columns={columnsDefinitionTxnType}
                    /> : <p>No data found</p>}
                  </CardBody>
                </Card>
              )}
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
        >
          <i onClick={() => setInnerTab(2)} className="lnr-arrow-left-circle" />
          {companyname}
        </h3>
        <Card>
          <CardBody>

            <MainTable
            TableArray={getTabsFieldData("transactionDetails")}
            columns={columnsDefinitionTxnDetail}
            />
          </CardBody>
        </Card>
      </>
    ) : (
      <></>
    );
  };
  const handleTabCreation = (companyName:string, selectedItem: any) => {
    setTabs((prev: any): any => {
      const _tabs = [...prev];
       const tab_name = !selectedItem.newTab ? `${selectedItem.Assetname} | ${companyName}` : `${selectedItem.newTabName}`
      const present = isNamePresentInArray(tab_name, _tabs)
      
      if(present){
        handleTabChange(present)
        return _tabs;
      }

      _tabs.push({
        id: _tabs.length,
        name:tab_name,
        content: () => renderableTabAssetDetails(companyName, selectedItem.Assetname, _tabs, selectedItem.assetGroups),
        isShowTxn: false,
      });
      setSelectedTab(_tabs.length - 1);
      return _tabs;
    });
  };


  const closeTab = (tabToDeleteId: number) => {
    if (tabToDeleteId === 0) return;
    setTabs(tabs.filter((tab: any) => tab.id !== tabToDeleteId));
    setTabs((prev: any) => prev.map((tab: any, index: number) => ({ ...tab, id: index })));
    setSelectedTab(tabToDeleteId > 0 ? tabToDeleteId - 1 : 0);
  };

  const handleTabChange = (id: number) => {
    setSelectedTab(id);
  };

  return (
    <div>
      {isLoading && <Loading />}
      <MultiTabs tabs={tabs} closeTab={closeTab} selectedTab={selectedTab} setSelectedTab={setSelectedTab} handleTabChange={handleTabChange} />
    </div>
  );
};

export default PartyVendorComponent
