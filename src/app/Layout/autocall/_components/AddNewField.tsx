import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Tooltip from "rc-tooltip";
import { useEffect, useRef, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { AiFillInfoCircle } from "react-icons/ai";
import Select from "react-select";
import {
  Button,
  FormGroup,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { Editor } from "@tinymce/tinymce-react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import moment from "moment";
import { useRouter } from "next/router";
import Loading from "@/app/loading";

export const AddNewField = ({
  isAddNewField,
  setIsAddNewField,
  editData,
  menuID
}: any) => {
  const [tabData, setTabData] = useState<any>([]);
  const editorRef = useRef(null);
  const [value, setValue] = useState<any>(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAutoCallFields();
  }, []);

  useEffect(() => {
    if (isDataLoaded && editData && tabData?.Tabdata?.length > 0) {
      console.log('Edit Data:', editData);
      console.log('Tab Data:', tabData);

      const newTabObject = JSON.parse(JSON.stringify(tabData));
      let hasChanges = false;

      newTabObject.Tabdata.forEach((response: any) => {
        response.fieldProperty.forEach((res: any) => {
          if (res.Keyname === 'ModuleID') {
            res.KeyValue = menuID;
            hasChanges = true;
          }
          if (editData[res.Keyname] !== undefined) {
            if (editData[res.Keyname] === false || editData[res.Keyname] === true) {
              res.KeyValue = editData[res.Keyname] === false ? '0' : '1';
              hasChanges = true;
            } else {
              res.KeyValue = editData[res.Keyname];
              hasChanges = true;
            }
          }
        });
      });

      if (hasChanges) {
        console.log('Setting new tab data:', newTabObject);
        setTabData(newTabObject);
      }
    }
  }, [editData, isDataLoaded]);

  const onSubmit = async () => {
    setLoading(true);
    const array: any = [];
    const newata = tabData.Tabdata.map((response: any) => {
      response.fieldProperty.map((res: any) => {
        array.push({
          Keyname: res.Keyname,
          KeyValue: res.KeyValue,
        });
      });
    });
    const data = {
      Userid: localStorage.getItem("username"),
      fieldProperty: array,
    };
    try {
      let result = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/Updatefieldpropertyv2",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setIsAddNewField(false);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  const renderFields = (valueIndex: number) => {
    return tabData?.Tabdata?.[valueIndex]?.fieldProperty?.map(
      (field: any, i: number) => {
        switch (field?.KeyType) {
          case "BOX":
            return (
              <div key={i} className="" style={{ width: "30%" }}>
                <FormGroup
                  key={field?.Keyname}
                  style={{ textAlign: field.Align }}
                >
                  <div key={field.FieldID} id={field.FieldID}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: field.Align,
                      }}
                    >
                      <Label
                        for={field?.Keyname}
                        className="bold max-w-fit"
                        style={{
                          color: field.fontcolor,
                          backgroundColor: field.Bgcolor,
                        }}
                      >
                        {field?.Keyname}{" "}
                        {field.IsMandatory ? (
                          <span style={{ color: "red" }}>*</span>
                        ) : null}
                      </Label>
                      {field.ToolTip && (
                        <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                          <AiFillInfoCircle
                            style={{ marginBottom: 2, marginLeft: 10 }}
                          />
                        </Tooltip>
                      )}
                    </div>

                    <Input
                      id={field?.Keyname}
                      name={field?.Keyname}
                      value={field.KeyValue}
                      placeholder={
                        field.IsWatermarkPrint ? field.WatermarkText : ""
                      }
                      type={
                        field.FieldName === "DateofBirth"
                          ? "date"
                          : field.ValueType === "TEXT"
                            ? "text"
                            : field.ValueType === "NUMERIC"
                              ? "number"
                              : "text"
                      }
                      onChange={(e) => {
                        const nextState = { ...tabData };
                        if (nextState.Tabdata[value]?.fieldProperty?.[i]) {
                          nextState.Tabdata[value].fieldProperty[i].KeyValue =
                            e.target.value;
                        }
                        setTabData(nextState);
                      }}
                      style={{
                        textAlign: field.TextAlignment,
                        backgroundColor: field.TextBgcolor,
                        color: field.TextFontColor,
                        fontSize: field.TextFontSize,
                      }}
                      disabled={field?.IsReadonly}
                    />
                  </div>
                </FormGroup>
              </div>
            );
          case "DROPDOWN":
            return (
              <FormGroup
                key={field?.Keyname}
                style={{
                  textAlign: field.Align,
                  width: "30%",
                }}
              >
                <div>
                  <div key={i}>
                    <div style={{ textAlign: field.Align }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: field.Align,
                        }}
                      >
                        <Label
                          for={field?.Keyname}
                          className="bold max-w-fit"
                          style={{
                            color: field.fontcolor,
                            backgroundColor: field.Bgcolor,
                          }}
                        >
                          {field?.Keyname}{" "}
                          {field.IsMandatory ? (
                            <span style={{ color: "red" }}>*</span>
                          ) : null}
                        </Label>
                        {field.ToolTip && (
                          <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                            <AiFillInfoCircle
                              style={{ marginBottom: 2, marginLeft: 10 }}
                            />
                          </Tooltip>
                        )}
                      </div>
                      <Select
                        isClearable={true}
                        value={{ label: field.KeyValue, value: field.KeyValue }}
                        onChange={(newValue: any) => {
                          const nextState = { ...tabData };
                          if (nextState.Tabdata[value]?.fieldProperty?.[i]) {
                            nextState.Tabdata[value].fieldProperty[i].KeyValue =
                              newValue.value;
                          }
                          setTabData(nextState);
                        }}
                        options={field?.values.map((res: any) => {
                          return {
                            label: res.Value,
                            value: res.Value,
                          };
                        })}
                      />
                    </div>
                  </div>
                </div>
              </FormGroup>
            );
          case "TEXTAREA":
            return (
              <FormGroup key={field?.Keyname}>
                <div key={field.FieldID} id={field.FieldID}>
                  <div key={i}>
                    <FormGroup key={field?.Keyname}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Label
                          for={field?.Keyname}
                          className="bold max-w-fit"
                          style={{ color: field.fontcolor }}
                        >
                          {field?.Keyname}{" "}
                          {field.IsMandatory ? (
                            <span style={{ color: "red" }}>*</span>
                          ) : null}
                        </Label>
                        {field.ToolTip && (
                          <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                            <AiFillInfoCircle
                              style={{ marginBottom: 2, marginLeft: 10 }}
                            />
                          </Tooltip>
                        )}
                      </div>
                      <Input
                        id={field?.Keyname}
                        name={field?.Keyname}
                        value={""}
                        placeholder={field?.Keyname}
                        type="textarea"
                        onChange={(e) => {
                          const nextState = { ...tabData };
                          if (nextState.Tabdata[value]?.fieldProperty?.[i]) {
                            nextState.Tabdata[value].fieldProperty[i].KeyValue =
                              e.target.value;
                          }
                          setTabData(nextState);
                        }}
                      />
                    </FormGroup>
                  </div>
                </div>
              </FormGroup>
            );
          case "DATE":
            const date = field?.KeyValue
              ? moment(field?.KeyValue).format("YYYY-MM-DD")
              : null;
            return (
              <div>
                <div key={field.FieldID} id={field.FieldID}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Label
                      for={field?.Keyname}
                      className="bold max-w-fit"
                      style={{ color: field.fontcolor }}
                    >
                      {field?.Keyname}{" "}
                      {field.IsMandatory ? (
                        <span style={{ color: "red" }}>*</span>
                      ) : null}
                    </Label>
                    {field.ToolTip && (
                      <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                        <AiFillInfoCircle
                          style={{ marginBottom: 2, marginLeft: 10 }}
                        />
                      </Tooltip>
                    )}
                  </div>
                  <InputGroup>
                    <div className="input-group-text ">
                      <FontAwesomeIcon icon={faCalendarAlt as any} />
                    </div>
                    <ReactDatePicker
                      className="form-control"
                      dateFormat="yyyy-MM-dd"
                      withPortal
                      selected={date ? new Date(date) : null}
                      onChange={(e: any) => {
                        const nextState = { ...tabData };
                        if (nextState.Tabdata[value]?.fieldProperty?.[i]) {
                          nextState.Tabdata[value].fieldProperty[i].KeyValue =
                            e;
                        }
                        setTabData(nextState);
                      }}
                      name={field?.Keyname}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      placeholderText={field?.Keyname}
                    />
                  </InputGroup>
                </div>
              </div>
            );
          case "UPLOAD":
            return (
              <FormGroup>
                <div key={field.FieldID}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Label
                      for={field?.Keyname}
                      className="bold max-w-fit"
                      style={{ color: field.fontcolor }}
                    >
                      {field?.Keyname}{" "}
                      {field.IsMandatory ? (
                        <span style={{ color: "red" }}>*</span>
                      ) : null}
                    </Label>
                    {field.ToolTip && (
                      <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                        <AiFillInfoCircle
                          style={{ marginBottom: 2, marginLeft: 10 }}
                        />
                      </Tooltip>
                    )}
                  </div>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    onChange={async (event: any) => { }}
                  />
                </div>
              </FormGroup>
            );
          case "BUTTON":
            return field.APIURL ? (
              <div className="flex w-full items-center">
                <div key={field.FieldID}>
                  <Button
                    className="h-10 w-full"
                    color="primary"
                    onClick={async () => { }}
                  >
                    {field?.Keyname}
                  </Button>
                </div>
              </div>
            ) : field.DefaultVisible && field.ValueType !== "UPLOAD" ? (
              <div key={field.FieldID}>
                <Button
                  className="h-10 w-full"
                  color="primary"
                  onClick={() => { }}
                >
                  {field?.Keyname}
                </Button>
              </div>
            ) : (
              <div key={field.FieldID}>
                <Button
                  className="h-10 w-[200px]"
                  color="primary"
                  onClick={() => { }}
                >
                  {field?.Keyname}
                </Button>
              </div>
            );
          case "TEXTEDITOR":
            return (
              <FormGroup
                key={field?.Keyname}
                style={{
                  textAlign: field.Align,
                }}
              >
                <div key={field.FieldID}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Label
                      for={field?.Keyname}
                      className="bold max-w-fit"
                      style={{ color: field.fontcolor }}
                    >
                      {field?.Keyname}{" "}
                      {field.IsMandatory ? (
                        <span style={{ color: "red" }}>*</span>
                      ) : null}
                    </Label>
                    {field.ToolTip && (
                      <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                        <AiFillInfoCircle
                          style={{ marginBottom: 2, marginLeft: 10 }}
                        />
                      </Tooltip>
                    )}
                  </div>
                  <Editor
                    onInit={(evt: any, editor: any) =>
                      (editorRef.current = editor)
                    }
                    apiKey="8s3fkrr9r5ylsjtqbesp0wk79pn46g4do9p1dg9249yn8tx5"
                    onEditorChange={(content: any) => { }}
                    value={""}
                    init={{
                      height: 200,
                      menubar: true,
                      plugins: [
                        "advlist autolink lists link image charmap print preview anchor ",
                        "searchreplace visualblocks code fullscreen",
                        "insertdatetime media  paste code help wordcount",
                      ],
                      content_style:
                        "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    }}
                  />
                </div>
              </FormGroup>
            );
          case "IMAGE":
            return (
              <div key={field.FieldID}>
                <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                  <img
                    src={field.ControlImageUrl}
                    style={{
                      height: `${field.ControlImageHeight}px`,
                      width: `${field.ControlImageWidth}px`,
                    }}
                  />
                </Tooltip>
              </div>
            );
          default:
            return null;
        }
      }
    );
  };

  const getAutoCallFields = async () => {
    setLoading(true);
    axios
      .post(
        `https://logpanel.insurancepolicy4u.com/api/Login/GetAutocallFields`,
        {
          Userid: localStorage.getItem("username"),
          FieldID: 0,
          ModuleID: 291,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        console.log('Received fields data:', response.data);
        setTabData(response.data);
        setIsDataLoaded(true);
      })
      .catch((error) => { })
      .finally(() => {
        setLoading(false);
      })
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Modal isOpen={isAddNewField} style={{ maxWidth: "80%" }}>
      {loading && <Loading />}
      <ModalHeader>Add New Field</ModalHeader>
      <ModalBody className="flex flex-col">
        <div>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            {tabData?.Tabdata?.map((response: any, index: number) => {
              return <Tab label={response.Tabname} {...a11yProps(index)} />;
            })}
          </Tabs>
          <div style={{ display: "flex", flexWrap: "wrap", rowGap: 1, columnGap: 10 }}>
            {renderFields(value)}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={async () => {
            onSubmit();
          }}
        >
          Submit
        </Button>
        <Button color="primary" onClick={() => setIsAddNewField(false)}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
