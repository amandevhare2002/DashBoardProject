import { useEffect } from "react";
import { useState } from "react";

export const GETableFieldDataExpense = () => {
  const [tableFieldData, setTableFieldData] = useState("");
  const tabsFieldDataFunction = () => {
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetStatsDetailsENC",
        {
          Userid: localStorage.getItem("username"),
          Company:"Pinki Tours(Regd.)",
          RecordID: "1",
          "Year":"2023"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        const decrypted = decryptText(res.data);
        const data = decrypted.subHeadDetails;
        setTableFieldData(data)
        // console.log("data in getAsse", { data })
        // setTabsFieldData('subHeadDetails', data)
        // setInnerTab(1)
      })
      .catch((error) => {
        // setTabsFieldData('subHeadDetails', [])
        return [];
      });
  };
  useEffect(() => {
    tabsFieldDataFunction()
  }, []);

  return {tableFieldData};
};
