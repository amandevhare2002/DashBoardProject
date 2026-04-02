import "@/styles/pos-module/pos.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "reactstrap";
const TrainingPos = ({status}:any) => {
    const [ModuleID,setModuleID] = useState("")
    const router = useRouter();
    const handleTraining = () => {
        if(ModuleID){
            router.push(`/posmodule/training/${ModuleID}`)
        }
    }
    return (
        <div style={{backgroundColor:"#fff",borderRadius:"10px",width:"100%",padding:"10px"}}>
            <h3 className="pos-heading-2 font">Please Verify your Identity Before Starting the Training</h3>
            <div style={{width:"100%",height:"1px",backgroundColor:"#000",marginBottom:"10px"}}></div>
            <div >
            <table>
                <tr>
                    <th>select</th>
                    <th>Module Name</th>
                    <th>ModuleID</th>
                    <th>Duration</th>
                    <th>Status</th>
                </tr>
                {
                    status && status.length>0 && status.map((item:any,i:number) => (
                        <tr key={i} 
                        style={{cursor:"pointer"}}
                        >
                            <td style={{textAlign:"center",cursor:"pointer"}}>
                                <input 
                                    onChange={() => setModuleID(item.ModuleID)}
                                    type="radio" name="module" className="inputcheck"
                            /></td>
                            <td>{item.ModuleName}</td>
                            <td>{item.ModuleID}</td>
                            <td>{item.Duration}</td>
                            <td>{item.Status}</td>
                        </tr>
                    ))
                }  
                
            </table> 
            <Button color="warning"
            onClick={handleTraining}
            className='btn font'style={{width:"100%",textAlign:"center",marginTop:"10px"}}>
                Start Training
            </Button> 
            </div>
        </div>
    );
}
 
export default TrainingPos;