"use client"
import AutoCallPage from "@/app/Layout/autocall";
import UserUploadFiles from "@/app/Layout/user-profile/UserUploadedFiles";
import { getDropDownData } from "@/app/Layout/user-profile/_components/hooks";
import Commissions from "@/app/Layout/user-profile/commissions";
import PersonalDetails from "@/app/Layout/user-profile/peronal-details";
import SalaryInfo from "@/app/Layout/user-profile/salary-info";
import axios from "axios";
import { usePathname } from 'next/navigation'
import { createContext, useEffect, useMemo, useState } from "react";
import { Input } from "reactstrap";

export const MainContext = createContext<any>(undefined);
const UserProfile = () => {


    return (
        <div className='h-full relative' style={{height: '100vh'}}>
           
           <AutoCallPage recordID={'userid'} moduleID={'userid'} isModalOpen={false} />
        </div>
    );
}

export default UserProfile;