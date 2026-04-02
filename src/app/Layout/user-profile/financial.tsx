import { useState } from "react";
import { Form, FormGroup, Input, Label } from "reactstrap";

const Financial = ({financialDetails}:any) => {
    const [financialData,setFinancialData] = useState( )

    const handleInputChange = (box:any, value:any) => {
        setFinancialData((prevPersonalData:any) => ({
          ...prevPersonalData,
          [box]: value,
        }));
    };
    

    return (
        <Form>
            <div className="w-full flex flex-wrap space-x-[3px]">
            {
                financialDetails && Object.keys(financialDetails).reverse().map((field) => (
                    <>
                    { 
                    financialDetails[field]&& Object.keys(financialDetails[field]).length !== 0 && Object.keys(financialDetails[field]).map((box)=>(
                    <FormGroup key={box}>
                        <Label for={box} className="bold">
                            {box}
                        </Label>
                        <Input
                            id={box}
                            name={box}
                            value = { financialData ? financialData?.[box] : financialDetails?.Boxitems[box]}
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
 
export default Financial;