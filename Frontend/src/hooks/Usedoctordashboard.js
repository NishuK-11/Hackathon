import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queries/queryKeys";
import { getDoctorDashboard } from "../api/backend";



export function useDoctorDashboard(){
    return useQuery({
        queryKey:queryKeys.doctorDashboard,
        queryFn:async()=>{
            const {data} = await getDoctorDashboard();
            return data.dashboard;
        },
        staleTime:15*1000,
        refetchInterval:30*1000,
    });
}