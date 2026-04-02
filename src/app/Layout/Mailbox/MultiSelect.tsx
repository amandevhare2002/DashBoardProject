import React, { useEffect, useState } from "react";
import { useDebounce } from "./hooks/useDebounce";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { connect, useSelector } from "react-redux";
import axios from "axios";

const animatedComponents = makeAnimated();

export const MultiSelect = ({ name, onChange, value }: any) => {
  const [searchText, setSearchText] = useState("");
  const token = useSelector((state: any) => state.authReducer.token);
  const [selectOptions, setSelectOptions] = useState<any>({});
  const selectedEmailUser = useSelector(
    (state: any) => state.mailReducer.mailUserId
  );

  const searchQuery = useDebounce(searchText, 100);

  const handleSearchEmail = async (text: any) => {
    if (searchQuery.length > 3) {
      try {
        const Params = {
          Userid: localStorage.getItem("username"),
          SearchKeyword: text,
          EmailID: selectedEmailUser || localStorage.getItem('mailUserId')
        };
        const res = await axios.post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetAutoFillTo_CC",
          Params,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result: any = {};
        res.data.autofillItems?.forEach((item: any) => {
          const temp = item["Items"].split(", ");
          if (temp.length > 1) {
            temp.forEach((email: any) => {
              const splitEmail = email.split(" <");
              if (splitEmail[1]) {
                result[splitEmail[1].slice(0, splitEmail[1].length - 1)] = email;
              } else {
                result[email] = email;
              }
            });
          } else {
            const splitEmail = temp[0].split(" <");
            if (splitEmail[1]) {
              result[splitEmail[1].slice(0, splitEmail[1].length - 1)] = temp[0];
            } else {
              result[temp[0]] = temp[0];
            }
          }
        });
        if (result.length > 0) {
          setSelectOptions(result);
        } else {
          result[text] = text;
          setSelectOptions(result);
        }
      } catch (error) {
        console.log("Error with handleSearchMails: ", error);
      }
    }
  };

  useEffect(() => {
    if (searchQuery) {
      handleSearchEmail(searchQuery);
    }
  }, [searchQuery]);

  const handleChange = (text: any) => {
    setSearchText(text);
  };

  const handleMultiSelect = (val: any) => {
    onChange(val, name);
  };

  return (
    <>
      <div className="input-group-prepend d-flex">
        <label className="input-group-text" htmlFor="inputGroupSelect01">
          {name}:{" "}
        </label>
      </div>
      <Select
        closeMenuOnSelect={false}
        components={animatedComponents}
        defaultValue={[]}
        onChange={handleMultiSelect}
        onInputChange={handleChange}
        value={value}
        isMulti
        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
        options={Object.keys(selectOptions).map((key) => ({
          label: selectOptions[key],
          value: key,
        }))}
      />
    </>
  );
};
