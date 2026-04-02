import { useState } from "react";
import { Form, FormGroup, Input, Label } from "reactstrap";

const HierarchyDetails = ({hierarchyDetails}:any) => {
    const [hierarchyData ,setHierarchyData] = useState(hierarchyDetails && Object.keys(hierarchyDetails?.Boxitems))
    const handleInputChange = (box:any, value:any) => {
        setHierarchyData((prevPersonalData:any) => ({
          ...prevPersonalData,
          [box]: value,
        }));
    };
    return (
        <Form>
            <div className="w-full flex flex-wrap space-x-[3px]">
            {
                hierarchyDetails && Object.keys(hierarchyDetails).reverse().map((field) => (
                    <>
                    { 
                    hierarchyDetails[field]&& Object.keys(hierarchyDetails[field]).length !== 0 && Object.keys(hierarchyDetails[field]).map((box)=>(
                    <FormGroup key={box}>
                        <Label for={box} className="bold">
                            {box}
                        </Label>
                        <Input
                            id={box}
                            name={box}
                            value = {hierarchyDetails?.Boxitems[box] ? hierarchyDetails?.Boxitems[box] : hierarchyData?.[box]}
                            placeholder={box}
                            type={box === "DateofBirth" ? "date" : "text"}
                            onChange={(e) => handleInputChange(box, e.target.value)}
                        /> 
                    </FormGroup>                        
                    ))
                    }
                    </>
                ))
            }
            </div>
        </Form>
    );
}
 
export default HierarchyDetails;