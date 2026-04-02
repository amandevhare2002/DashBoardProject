import cx from "classnames";
import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { SearchBox } from "./Components/SearchBox";
import { UserBox } from "./Components/UserBox";
import { HeaderLogo } from "../AppLogo";
import { Input } from "reactstrap";
import { PannelListT } from "../Dashboard/DynamicForm/constant";
import { useRouter } from "next/router";
import GlobalIframe, { showIframe } from "../Common/CmnIframe";

export const Header = ({ selectedPannel, selectedPannelId }: any) => {
  const headerBackgroundColor = useSelector(
    (state: any) => state.ThemeOptions.enableHeaderShadow
  );
  const enableMobileMenuSmall = useSelector(
    (state: any) => state.ThemeOptions.enableMobileMenuSmall
  );
  const enableHeaderShadow = useSelector(
    (state: any) => state.ThemeOptions.enableHeaderShadow
  );
  const token = useSelector((state: any) => state.authReducer.token);
  const router = useRouter();
  const [pannelList, setPannelList] = useState<Array<PannelListT>>([]);

  useEffect(() => {
    if (token) {
      GetPannelList();
    }
  }, [token]);

  const GetPannelList = () => {
    const panelList = sessionStorage.getItem("panelList")
    if (panelList && panelList !== "undefined") {
      setPannelList(JSON.parse(panelList))
      return
    }
    fetch("https://logpanel.insurancepolicy4u.com/api/Login/GetPanelList", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Userid: localStorage.getItem("username") }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.Message === 'Authorization has been denied for this request.') {
          router.push('/login');
          return;
        }
        response?.panelLists?.unshift({});
        sessionStorage.setItem("panelList", JSON.stringify(response?.panelLists))
        setPannelList(response?.panelLists);

      })
      .catch((error) => {
        console.log(error);
      });
  };

  const [headerData, setHeaderData] = useState<any>(null);

  useEffect(() => {
    const menuData = JSON.parse(sessionStorage.getItem("appsideData") || "{}");
    setHeaderData(menuData?.headerbar);
  }, []);
  const DialerButton = () => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      console.log('Dialer button clicked'); // Debug log
      showIframe();
    };

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '7px 14px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6'
      }}>
        <button
          onClick={handleClick}
          style={{
            background: 'linear-gradient(135deg, #007bff, #0056b3)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 10px rgba(0,123,255,0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
            const target = e.target as HTMLButtonElement;
            target.style.background = 'linear-gradient(135deg, #0056b3, #004085)';
            target.style.transform = 'translateY(-2px)';
            target.style.boxShadow = '0 4px 15px rgba(0,123,255,0.4)';
          }}
          onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
            const target = e.target as HTMLButtonElement;
            target.style.background = 'linear-gradient(135deg, #007bff, #0056b3)';
            target.style.transform = 'translateY(0)';
            target.style.boxShadow = '0 2px 10px rgba(0,123,255,0.3)';
          }}
        >
          Open Vicidial Dialer
        </button>
      </div>
    );
  };
  return (
    <Fragment>
      <TransitionGroup>
        {
          headerData &&
          <CSSTransition
            component="div"
            className={cx("app-header", headerBackgroundColor, {
              "header-shadow": enableHeaderShadow,
            })}
            style={{ backgroundColor: headerData?.Headerbgcolor }}
            appear={true}
            timeout={1500}
            enter={false}
            exit={false}
          >
            <div>
              <HeaderLogo />
              <div
                className={cx("app-header__content", {
                  "header-mobile-open": enableMobileMenuSmall,
                })}
              >
                <div className="app-header-left">
                  <SearchBox />
                </div>
                <div>
                  <Input
                    type="select"
                    value={selectedPannelId}
                    onChange={(e) => {
                      sessionStorage.removeItem("appsideData")
                      sessionStorage.removeItem("headerList")
                      // sessionStorage.removeItem("panelList")
                      sessionStorage.setItem("panelID", e.target.value)
                      selectedPannel(e.target.value);
                      router.push("/")
                    }}
                  >
                    {pannelList?.map((response) => (
                      <option value={response.PanelID}>
                        {response.PanelName}
                      </option>
                    ))}
                  </Input>
                </div>
                <div className="app-header-right">
                  <UserBox />
                </div>
                <div>
                  <DialerButton />
                  <GlobalIframe/>
                </div>
              </div>
            </div>
          </CSSTransition>
        }
      </TransitionGroup>
    </Fragment>
  );
};
