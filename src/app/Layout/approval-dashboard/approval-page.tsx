import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { decryptText } from '@/utils';
import { Button, Modal, ModalBody, Spinner } from 'reactstrap';
import { useRouter } from 'next/router';
import { StatusApproval } from './_components/status-Approvals';
import { AllApprovalComponent } from './_components/all-approval';
import { AllYearComponent } from './_components/years-components';
import { Backdrop, CircularProgress } from '@mui/material';


const ApprovalPage = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [approvalList, setApprovalList] = useState<any | undefined>()
    const [expanded, setExpanded] = useState<string | false>(false);

    const handleApprovalDashboard = async () => {
        try {
            setLoading(true)
            let UserName = localStorage.getItem("username")
            let data = {
                "Userid": UserName
            }
            const resp = await axios.post(`https://logpanel.insurancepolicy4u.com/api/Login/ApprovalDashBoardENC`, data, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            })

            if (resp) {
                const decrypt = decryptText(resp?.data)
                // console.log("decrypt data",decrypt);
                setApprovalList(decrypt)
            } else {
                const result = await axios.post(`https://logpanel.insurancepolicy4u.com/api/Login/ApprovalDashBoard`, data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                })

                if (result?.data) {
                    setApprovalList(result?.data)
                }

            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleApprovalDashboard()
    }, [])

    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };
    return (
        <>
            {
                loading ? (
                    <div style={{ width: "100%", height: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Backdrop
                            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                            open={true}
                        >
                            <CircularProgress />
                        </Backdrop>
                    </div>
                ) : (
                    <div style={{}}>
                      
                        {
                            approvalList && Object.keys(approvalList).map((approval) => (
                                approval !== "ErrorMessage" && (
                                    <Accordion
                                        key={approval}
                                        onChange={handleChange(approval)}
                                        expanded={expanded === approval}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <Typography>
                                                {approval} <span style={{ color: "red" }}> {
                                                    approvalList[approval] && approvalList[approval] && approvalList[approval][0]
                                                        ? approvalList[approval][0].Count ?? ""
                                                        : ""
                                                }</span>
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {approval === "AllApprovals" && <AllApprovalComponent />}
                                            {approval === "StatusApprovals" && <StatusApproval approvalList={approvalList && approvalList?.StatusApprovals} />}
                                            {approval === "YearWise" && <AllYearComponent approvalList={approvalList && approvalList.YearWise?.years} />}
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            ))
                        }
                    </div>)
            }
        </>
    );
}

export default ApprovalPage;