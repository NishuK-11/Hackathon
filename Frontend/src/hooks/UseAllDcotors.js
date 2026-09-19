import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queries/queryKeys";
import { getAllDoctors } from "../api/backend";




export function useAllDoctors(){
    return useQuery({
        queryKey:queryKeys.allDoctors,
        queryFn:async()=>{
            const res = await getAllDoctors();
            return{
                doctors:res.data.doctors,
                hospital: res.data.hospital,
            }
        },
        staleTime:15*1000
    })
}