import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queries/queryKeys";
import { getStats } from "../api/backend";


export function useStats(){
    return useQuery({
        queryKey:queryKeys.hospitalStats,
        queryFn:async()=>{
            const res = await getStats();
            return res.data;
        },
        staleTime:15*1000,
    });
}