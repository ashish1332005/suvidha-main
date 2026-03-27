import { HELPLINES } from "../../data/constants";
import { Hdr, Wrap } from "../_shared";

const C="#7C3AED";
const ICONS={shield:"M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z",bolt:"M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z",flame:"M12 2C12 2 9 7 9 11C9 11 7 9.5 7 7.5C5 10 4 13 4 15C4 19.42 7.58 23 12 23C16.42 23 20 19.42 20 15C20 10 12 2 12 2Z",star:"M12 1L15.09 7.26L22 8.27L17 13.14L18.18 20.02L12 16.77L5.82 20.02L7 13.14L2 8.27L8.91 7.26L12 1Z",alert:"M12 2L1 21H23L12 2ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z",cross:"M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z",person:"M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z",building:"M2 20V8L12 2L22 8V20H16V14H8V20H2Z",phone:"M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"};
const ICON_KEYS=["shield","bolt","flame","star","alert","cross","person","star","building","phone"];

export function HelplineScreen({t,setScreen}){
  return <div className="kfa" style={{flex:1,display:"flex",flexDirection:"column",background:"#F0F4F8"}}>
    <Hdr title="Emergency Helplines" setScreen={setScreen} t={t}/>
    <Wrap>
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:"clamp(8px,1.2vw,12px)"}}>
        {HELPLINES.map((h,i)=><div key={h.d} style={{background:h.bg||h.b,border:`1.5px solid ${h.c}22`,borderLeft:`5px solid ${h.c}`,borderRadius:14,padding:"clamp(14px,1.7vw,20px) clamp(14px,1.7vw,18px)",display:"flex",alignItems:"center",gap:"clamp(12px,1.5vw,18px)",boxShadow:"0 1px 3px rgba(10,35,66,.06)"}}>
          <div style={{width:"clamp(42px,5vw,52px)",height:"clamp(42px,5vw,52px)",borderRadius:12,background:`${h.c}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill={h.c}><path d={ICONS[ICON_KEYS[i]||"phone"]}/></svg>
          </div>
          <div style={{flex:1}}>
            <p style={{fontFamily:"var(--font-body)",fontSize:"clamp(13px,1.5vw,16px)",color:"#374151",fontWeight:500}}>{h.d}</p>
          </div>
          <span style={{fontFamily:"var(--font-head)",color:h.c,fontWeight:800,fontSize:"clamp(18px,2.5vw,26px)",flexShrink:0,letterSpacing:".02em"}}>{h.n}</span>
        </div>)}
      </div>
    </Wrap>
  </div>;
}