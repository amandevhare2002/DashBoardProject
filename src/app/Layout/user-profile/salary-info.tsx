import { useState } from "react";
import { Form, FormGroup, Input, Label } from "reactstrap";

const SalaryInfo = ({salaryInfoDetails}:any) => {
    const [salaryInfoData,setSalaryInfoData] = useState( )

    const handleInputChange = (box:any, value:any) => {
        setSalaryInfoData((prevPersonalData:any) => ({
          ...prevPersonalData,
          [box]: value,
        }));
    };
    

    return (
        <Form>
            <div className="w-full flex flex-wrap space-x-[3px]">
            {
                salaryInfoDetails && Object.keys(salaryInfoDetails).reverse().map((field) => (
                    <>
                    { 
                    salaryInfoDetails[field]&& Object.keys(salaryInfoDetails[field]).length !== 0 && Object.keys(salaryInfoDetails[field]).map((box)=>(
                    <FormGroup key={box}>
                        <Label for={box} className="bold">
                            {box}
                        </Label>
                        <Input
                            id={box}
                            name={box}
                            value = { salaryInfoData ? salaryInfoData?.[box] : salaryInfoDetails?.Boxitems[box]}
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
 
export default SalaryInfo;