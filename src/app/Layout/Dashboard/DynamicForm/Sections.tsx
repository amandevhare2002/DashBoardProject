import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Card,
  CardTitle,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";

 const Sections = ({
  moduleId,
  getSections,
}: {
  moduleId: string;
  getSections: () => void;
}) => {
  const [sectionName, setSectionName] = useState("");
  const token = useSelector((state: any) => state.authReducer.token);
  const [sectionId, setSectionId] = useState(0);
  const [isActive, setActive] = useState(true);

  const onChangeInput = (event: any) => {
    setSectionName(event.target.value);
  };

  const onSubmitSection = () => {
    fetch(
      `https://logpanel.insurancepolicy4u.com/api/Login/Add_UpdateSectionDetails`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Userid: localStorage.getItem("username"),
          ModuleID: Number(moduleId),
          SectionID: sectionId, //0 for new
          SectionName: sectionName,
          IsActive: isActive,
        }),
      }
    )
      .then((response) => response.json())
      .then((response: any) => {
        setSectionId(0);
        setSectionName("");
        setActive(true);
        getSections();
      });
  };

  return (
    <Form style={{ marginTop: 30 }}>
      <FormGroup>
        <Label
          style={{
            fontWeight: "bold",
          }}
        >
          Section Name
        </Label>
        <Input
          placeholder="Section Name"
          value={sectionName}
          onChange={(event) => {
            onChangeInput(event);
          }}
        />
      </FormGroup>
      <FormGroup>
        <Label
          style={{
            fontWeight: "bold",
          }}
        >
          is Active
        </Label>
        <br />
        <div style={{ display: "flex", gap: 10 }}>
          <span>
            {" "}
            <Input
              type="radio"
              name="isActive"
              checked={isActive}
              onChange={(e) => {
                setActive(true);
              }}
            />{" "}
            TRUE
          </span>
          <span>
            {" "}
            <Input
              type="radio"
              name="isHeader"
              checked={isActive === false}
              onChange={(e) => {
                setActive(false);
              }}
            />{" "}
            FALSE
          </span>
        </div>
      </FormGroup>
      <FormGroup>
        <Button
          color="primary"
          onClick={() => {
            onSubmitSection();
          }}
        >
          {" "}
          Create Section{" "}
        </Button>
      </FormGroup>
    </Form>
  );
};


export default Sections;