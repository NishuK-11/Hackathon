import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queries/queryKeys";
import { todaysAppointment } from "../api/backend";
export function useTodaysAppointments(){
    return useQuery({
        queryKey:queryKeys.todaysAppointments,
        queryFn:async()=>{  
            const response = await todaysAppointment();
            return{
                doctor:response.data.doctor,
                patients:response.data.patients || [],
            };
        },
        staleTime:15*1000,
    })
}