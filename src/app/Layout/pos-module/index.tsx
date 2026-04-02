"use client"
import React, { useEffect, useState } from 'react'
import "@/styles/pos-module/pos.css"
import OtpInput from 'react-otp-input';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TrainingPos from './pos-module-training';
import { Button } from 'reactstrap';
import Loading from '@/app/loading';
function PosModule() {
    const [otp, setOtp] = useState('');
    const [otpInput, setOtpInput] = useState<boolean>(false)
    const [status, setStatus] = useState([]);
    const [isMounted, setIsMounted] = React.useState(false);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        setIsMounted(true);  // required to avoid hydration mismatch
        setLoading(false);   // loading complete
    }, []);

    if (!isMounted || loading) {
        return <Loading />;
    }

    const handleGenerateOTP = async () => {
        const Username = localStorage.getItem("username");

        let data = {
            "Userid": Username
        }
        const response = await axios.post(`https://logpanel.insurancepolicy4u.com/api/Login/GenerateTrainingOTP`, data,
            {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            }
        )

        if (response.status === 201) {
            setOtpInput(true);
            toast.success(`${response.data.Resp}`)

        }
        else {
            toast.error("failed in generated OTP")
        }
    }

    const handleVerifyOtp = async () => {
        try {
            const Username = localStorage.getItem("username");

            let data = {
                "Userid": Username,
                "OTP": otp,
            }


            const response = await axios.post(`https://logpanel.insurancepolicy4u.com/api/Login/VerifyTrainingOTP`, data, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            })

            if (response.status === 201) {
                localStorage.setItem("trainingToken", response.data.TrainingToken[0].Token)
                console.log(response.data.TrainingStatus);
                setStatus(response.data.TrainingStatus);
                toast.success("OTP Verified Success!");
            } else {
                toast.error(`OTP verification failed`)
            }

        } catch (error: any) {
            toast.error(`${error?.message ? error?.message : "OTP verification failed"}`)

        }
    }

    return (
        <div style={{ width: "100%", display: "flex", fontFamily: "sans-serif" }}>
            <div style={{ width: "100%" }}>
                <h1 className='pos-heading font'>POS Training Module</h1>

                {!(status.length > 0) ? (
                    <div style={{ backgroundColor: "#fff", padding: "12px", paddingBottom: "70px", borderRadius: "10px" }}>
                        <h2 className='pos-heading-2 font'>Please Verify Your Identity Before Starting the Training</h2>
                        <div style={{ width: "100%", height: "1px", backgroundColor: "#000" }}></div>
                        <div style={{ paddingBottom: "50px", marginTop: "20px" }}>
                            <Button color="warning" onClick={handleGenerateOTP}>
                                Generate OTP
                            </Button>
                            {otpInput && (
                                <div className='otp'>
                                    <h2 className='pos-heading-3 font'>Enter Your OTP</h2>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                                        <OtpInput
                                            value={otp}
                                            onChange={setOtp}
                                            numInputs={6}
                                            renderSeparator={<span></span>}
                                            renderInput={(props) => <input {...props} />}
                                            inputStyle="inputStyle"
                                        />
                                        <Button color="warning" className='btn font' onClick={handleVerifyOtp}>
                                            Verify OTP
                                        </Button>
                                    </div>

                                </div>
                            )}

                        </div>
                    </div>) : (<div style={{ width: "100%" }}><TrainingPos
                        status={status}
                    /></div>)}
            </div>
            <ToastContainer
                position="bottom-right"
            />
        </div>
    )
}

export default PosModule
