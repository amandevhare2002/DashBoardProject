import axios from "axios";
import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
  ListGroup,
  ListGroupItem,
  Button,
  CardBody,
} from "reactstrap";
import { BANKDETILS } from "../constant";
import { AssetValue, BankAndCreditCard, ITransactions } from "../interface";

export const BankAndCreditCardComponent = () => {
  const token = useSelector((state: any) => state.authReducer.token);
  const [bankDetials, setBankDetails] = useState<BankAndCreditCard>(BANKDETILS);
  const [isBankCompany, setIsbankCompany] = useState(true);
  const [isBank, setIsBank] = useState(false);
  const [isCreditCard, setIsCreditCard] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Array<AssetValue>>([]);
  const [isTransaction, setIstransaction] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<AssetValue | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<ITransactions>(
    []
  );

  useEffect(() => {
    if (token) {
      getBankApi();
      getSelectedTransaction();
    }
  }, [token]);

  const getSelectedTransaction = () => {
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetTransactions",
        {
          Userid: localStorage.getItem("username"),
          InputType: isBank ? "BANK" : "CC",
          Value: selectedTransaction?.Value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setTransactionDetails(res.data.Transactions);
      })
      .catch((error) => {
        setTransactionDetails([]);
      });
  };

  useEffect(() => {
    if (selectedTransaction) {
      getSelectedTransaction();
    }
  }, [selectedTransaction]);

  const getBankApi = () => {
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetBalances",
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
        setBankDetails(res.data);
      })
      .catch((error) => {});
  };
  const columnsDefinition =
    selectedAsset.length > 0 ? Object.keys(selectedAsset?.[0]) : [];

  // Create columns definition for the data table
  const columns: any = columnsDefinition.map((column) => {
    if (column === "Value") {
      return {
        name: column,
        selector: (row: any) => {
          return (
            <div
              style={{ color: "#0088ff", cursor: "pointer" }}
              onClick={() => {
                setSelectedTransaction(row);
                setIstransaction(true);
              }}
            >
              {row.Value}
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
  });

  const columnsDefinition2 =
    transactionDetails.length > 0 ? Object.keys(transactionDetails?.[0]) : [];

  // Create columns definition for the data table
  const columns2: any = columnsDefinition2.map((column) => ({
    name: column,
    selector: column,
    sortable: true,
    wrap:true
  }));

  return (
    <div>
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
              setIsbankCompany(true);
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
                                onClick={() => {
                                  setSelectedCompany(res.Companyname);
                                  if (response.Assetname === "CREDIT CARD") {
                                    setIsbankCompany(false);
                                    setIsBank(false);
                                    setIsCreditCard(true);
                                    setSelectedAsset(response.assetValues);
                                  } else {
                                    setIsbankCompany(false);
                                    setIsBank(true);
                                    setIsCreditCard(false);
                                    setSelectedAsset(response.assetValues);
                                  }
                                }}
                                color="link"
                              >
                                <i className="pe-7s-piggy btn-icon-wrapper btn-icon-lg mb-3">
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
      {(isBank || isCreditCard) && !isTransaction && !isBankCompany && (
        <Card>
          <CardBody>
            <DataTable
              data={selectedAsset}
              columns={columns}
              pagination
              fixedHeader
              fixedHeaderScrollHeight="400px"
            />
          </CardBody>
        </Card>
      )}
      {isTransaction && !isBankCompany && (
        <Card>
          <CardBody>
            <DataTable
              data={transactionDetails}
              columns={columns2}
              pagination
              fixedHeader
              fixedHeaderScrollHeight="400px"
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
};
