import { decryptText, isNamePresentInArray } from "@/utils";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
  ListGroup,
  ListGroupItem,
  Row,
} from "reactstrap";
import MultiTabs from "./MultiTabs";
import { BANKDETILS } from "./constant";
import { AssetValue, BankAndCreditCard, ITransactions } from "./interface";
import MainTable from "@/utils/table";
import Loading from '@/app/loading';
interface Tab {
  id: number;
  name: string;
  content: () => JSX.Element;
  isShowTxn: boolean;
}

const BankAndCreditCardComponent = () => {
  const token = useSelector((state: any) => state.authReducer.token);
  const [bankDetials, setBankDetails] = useState<BankAndCreditCard>(BANKDETILS);
  const [isBankCompany, setIsbankCompany] = useState(true);
  const [isBank, setIsBank] = useState(false);
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Array<AssetValue>>([]);
  const [isTransaction, setIstransaction] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<AssetValue | null>(null);

  const [selectedTab, setSelectedTab] = useState<number>(0);
  console.log("selectedTab",selectedTab)
  const [tabs, setTabs] = useState<Tab[]>([]);

  useEffect(() => {
    if (token) {
      getBankApi();
      // getSelectedTransaction();
    }
  }, [token]);



  // useEffect(() => {
  //   if (selectedTransaction) {
  //     getSelectedTransaction();
  //   }
  // }, [selectedTransaction]);

  const [isLoading, setIsLoading] = useState(true);
  const getBankApi = () => {
    setIsLoading(true);
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetBalancesENC",
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
        setBankDetails(decryptText(res.data));
      })
      .catch((error) => { })
      .finally(() => {
        setIsLoading(false);
      })
  };
  const columnsDefinition =
    selectedAsset.length > 0 ? Object.keys(selectedAsset?.[0]) : [];

  const closeTab = (tabToDeleteId: number) => {
    if (tabToDeleteId === 0) return
    setIsbankCompany(true);
    setIsBank(false);
    setIsCreditCard(false)
    setTabs(tabs.filter((tab:any) => tab.id !== tabToDeleteId));
    setTabs((prev: any) => prev.map((tab: any, index: number) => ({ ...tab, id: index })))
    setSelectedTab(tabToDeleteId > 0 ? tabToDeleteId - 1 : 0)
  };


  const handleTabChange = (id: number) => {
    setSelectedTab(id);
    // setIstransaction(false)
  };

  // const handleTxnDetails = async (isExpanded: boolean, row: any) => {
  //   setCurrentRow(row)
  //   if (isExpanded) {
  //     setSelectedTransaction(row);
  //     setIstransaction(true);
  //     const txnDetail = await getSelectedTransaction(row)
  //     setTabs((prev: any): any => {
  //       const _tabs = [...prev]
  //       _tabs[_tabs.length - 1].isShowTxn = true
  //       _tabs[_tabs.length - 1].transactionDetails = txnDetail
  //       return _tabs
  //     })
  //   }
  // }
  console.log('isBank',isBank)
  const renderableTabCCOrBank = (companyname: string, responseAssetValues: any, tabs: any) => {
    console.log("companyname",companyname,responseAssetValues)
    const [transactionDetails, setTransactionDetails] = useState<ITransactions>(
      []
    );
    const setInnerTab = (innerTab: number) => {
      setTabs((prev: any) => {
        const _prev = [...prev];
        _prev[_prev.length - 1].innerTab = innerTab;
        return _prev;
      });
    };
    
    const getInnerTab = () => {
      return tabs[tabs.length - 1].innerTab ?? 0;
    }
    const getSelectedTransaction = (selectedTransaction: any) => {
        console.log("rwo",selectedTransaction,isBank)
        handleTabCreation({
          Companyname:selectedTransaction?.Value

        },{...selectedTransaction,"Assetname":responseAssetValues?.Assetname})
        axios
          .post(
            "https://logpanel.insurancepolicy4u.com/api/Login/GetTransactionsENC",
            {
              Userid: localStorage.getItem("username"),
              InputType:  responseAssetValues?.Assetname === "CREDIT CARD" ? "CC" : "BANK",
              Value: selectedTransaction?.Value,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((res) => {
            setTransactionDetails(decryptText(res.data).Transactions);
            setInnerTab(2)
            // resolve(decryptText(res.data).Transactions)
          })
          .catch((error) => {
            setTransactionDetails([]);
            // resolve([])
          });
    };

    const columnsDefinition: any =
    responseAssetValues && responseAssetValues?.assetValues &&responseAssetValues?.assetValues.length > 0 ? Object.keys(responseAssetValues?.assetValues?.[0]).map(
        (column) => {
          if (column === "Value") {
            return {
              name: column,
              selector: (row: any) => {
                return (
                  <div
                    style={{ color: "#0088ff", cursor: "pointer" }}
                    onClick={() => getSelectedTransaction(row)}
                  >
                    {row.Value}
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
        }) : []
 
    const columnsDefinition2: any = transactionDetails.length > 0 ? Object.keys(transactionDetails?.[0]).map((column) => ({
      name: column,
      selector: column,
      sortable: true,
      wrap:true,
      reorder: true,
    })) : []
     
    return getInnerTab() === 0 ? (
      <>
        {(
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
        )}

        <Card>
          <CardBody>
            <MainTable
              columns={columnsDefinition}
              TableArray={responseAssetValues?.assetValues}
            />
            
          </CardBody>
        </Card>
      </>
    ): getInnerTab() === 2 ?(
      <>
        <Card>
          <CardBody>
            <MainTable
              columns={columnsDefinition2}
              TableArray={transactionDetails}
            />
          </CardBody>
        </Card>
      </>
    ) : (
      <>
        No Data
      </>
    )
  }

  useEffect(() => {
    if (tabs.length === 0 && bankDetials?.companiesLists.length > 0) {
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
  }, [isBank, isCreditCard, isTransaction, isBankCompany, bankDetials?.companiesLists])



  const handleTabCreation = (res: any, response: any) => {
    setSelectedCompany(res);
    const _isCC = response.Assetname === "CREDIT CARD" 
    setIsbankCompany(false);
    setIsBank(_isCC ? false : true);
    setIsCreditCard(_isCC);
    setTabs((prev: any): any => {
      const _tabs = [...prev]
      const tab_name = (_isCC ? 'CC' : 'Bank') + ` | ${res.Companyname}`
      const present = isNamePresentInArray(tab_name, _tabs)
      
      if(present){
        handleTabChange(present)
        return _tabs;
      }
      _tabs.push({
        id: _tabs.length,
        name: tab_name,
        content: () => renderableTabCCOrBank(res.Companyname ? res.Companyname :res, response, _tabs),
        isShowTxn: false
      })
      setSelectedTab(_tabs.length - 1)
      return _tabs
    })
  }

  const renderDashboard = () => (
    <>
      {isBankCompany && !isTransaction && (
        <h3 style={{ margin: "20px 0px" }}>Bank and Credit Card</h3>
      )}
      {(isBank || isCreditCard) && !isBankCompany && !isTransaction && (
        <h3
          style={{
            margin: "20px 0px",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <i
            onClick={() => {
              console.log('logger')
              setIsbankCompany(true);
              setIsBank(false);
              setIsCreditCard(false)
            }}
            className="lnr-arrow-left-circle"
          />
          {selectedCompany}
        </h3>
      )}
      {isTransaction && (
        <h3
          style={{
            margin: "20px 0px",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <i
            onClick={() => {
              setIstransaction(false);
            }}
            className="lnr-arrow-left-circle"
          />
          {selectedTransaction?.AssetName} {isBank ? `(Bank)` : `(Credit Card)`}
        </h3>
      )}
      {isBankCompany && !isTransaction && (
        <Row>
          {bankDetials?.companiesLists.map((res: any, index: number) => (
            <Col sm="12" lg="6" xl="4">
              <Card
                key={`banlDetails${index}`}
                className="mb-3 profile-responsive"
              >
                <div className="dropdown-menu-header">
                  <div className="dropdown-menu-header-inner bg-dark">
                    <div className="menu-header-image opacity-2" />
                    <div className="menu-header-content btn-pane-right">
                      <div>
                        <h5 className="menu-header-title">{res.Companyname}</h5>
                      </div>
                    </div>
                  </div>
                </div>
                <ListGroup flush>
                  <ListGroupItem className="p-0">
                    <div className="grid-menu grid-menu-2col">
                      <Row className="g-0">
                        {res.assetTypes.map(
                          (response: any, assetIndex: number) => (
                            <Col sm="6">
                              <Button
                                className="btn-icon-vertical btn-square btn-transition br-bl"
                                key={`assetIndex${assetIndex}`}
                                outline
                                onClick={() => handleTabCreation(res, response)}
                                color="link"
                              >
                                <i className="pe-7s-piggy btn-icon-wrapper btn-icon-lg mb-3" >
                                  {" "}
                                </i>
                                {response.Assetname}
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
          ))}
        </Row>
      )}
    </>
  )

  return (
    <div>
      {isLoading && <Loading />}
      <MultiTabs tabs={tabs} closeTab={closeTab} selectedTab={selectedTab} setSelectedTab={setSelectedTab} handleTabChange={handleTabChange} />

      {/* {isTransaction && !isBankCompany && (
        <Card>
          <CardBody>
            <DataTable
              data={transactionDetails}
              columns={columns2}
              pagination
              fixedHeader
              fixedHeaderScrollHeight="55vh"
            />
          </CardBody>
        </Card>
      )} */}
    </div>
  )
};

export default BankAndCreditCardComponent