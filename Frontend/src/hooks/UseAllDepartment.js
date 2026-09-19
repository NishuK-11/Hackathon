import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./queries/queryKeys";
import { DepartmentsDoctorsCount } from "../api/backend";


export function allDepartments(){
    return useQuery({
        queryKey:queryKeys.allDepartments,
        queryFn:async()=>{
            const res = await DepartmentsDoctorsCount();
            return{
                departments:res.data.department
            }
        },
        staleTime:15*1000
    })
}