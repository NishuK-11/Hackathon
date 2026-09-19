import { useEffect } from "react";
import { useSelector } from "react-redux";

export function useThemeSync(){
    const mode = useSelector((state)=>state.theme.mode)

    useEffect(()=>{
        const root = document.documentElement
        root.classList.toggle('dark', mode==='dark')
    },[mode])
}