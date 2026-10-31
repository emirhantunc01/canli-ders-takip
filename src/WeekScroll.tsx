import {useEffect,useRef} from 'react';
export function WeekScroll({children}:{children:React.ReactNode}) {const ref=useRef<HTMLDivElement>(null);useEffect(()=>{if(ref.current)ref.current.scrollTop=8*72},[]);return <div className="week-scroll" ref={ref}>{children}</div>}
