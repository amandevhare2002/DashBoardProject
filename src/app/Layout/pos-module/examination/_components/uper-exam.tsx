import { FaBook } from "react-icons/fa";
import { IoTimeSharp } from "react-icons/io5";
import "@/styles/pos-module/exam.css"
const UpperExam = (
    {question}:any
) => {
    const data =[
        {
            id:1,
            name:'Total Questions',
            para:question.TotalQuestion,
            icon:<FaBook />
        },
        {
            id:2,
            name:'Start Time',
            para:question.StartTime,
            icon:<IoTimeSharp />
        },
        {
            id:1,
            name:'Duration',
            para:question.Duration,
            icon:<IoTimeSharp />
        },
        {
            id:1,
            name:'End Time',
            para:question.EndTime,
            icon:<IoTimeSharp />
        },
    ]
    return (
        <div className="exam-upper-div" style={{width:"100%"}}>
            <div style={{display:"flex",width:"95%",justifyContent:"space-between",gap:"10px"}}>
                 {
                    data.map((item)=>(
                        <div key={item.id} className="exam-upper-map" 
                            style={{display:"flex",flexDirection:"column",border:"1px solid #adb5bd",width:"100%",height:"100px",borderRadius:"5px",placeItems:"flex-start",fontSize:"20px",backgroundColor:"#fff"}}
                            >
                            <div className="exam-upper-text" style={{borderBottom:"1px solid #adb5bd",width:"100%",paddingTop:"6px",paddingBottom:"6px",paddingLeft:"10px",alignItems:"center",display:"flex",textAlign:"start"}}>
                                <span className="exam-icon font " style={{marginBottom:"2px"}}>{item.icon}</span>{item.name}
                            </div>
                            <div className="exam-upper-val font" style={{textAlign:"center",width:"100%",justifyContent:"center",display:"flex",alignItems:"center",height:'100%'}}>
                                {item.para}
                            </div>
                        </div>
                    ))
                } 
            </div>
        </div>
    );
}
 
export default UpperExam;