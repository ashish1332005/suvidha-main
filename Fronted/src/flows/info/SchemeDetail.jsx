import { SCHEME_DATA } from "../../data/constants";
import { Hdr, Wrap, Card, Btn } from "../_shared";

const C="#7C3AED";

export function SchemeDetail({t,flow,setScreen}){
  const s=SCHEME_DATA[flow.label]||Object.values(SCHEME_DATA)[0];
  return <div className="kfa" style={{flex:1,display:"flex",flexDirection:"column",background:"#F0F4F8"}}>
    <Hdr title={flow.label} setScreen={setScreen} t={t}/>
    <Wrap>
      <Card style={{marginBottom:14,background:"#EDE9FE",border:"1.5px solid #DDD6FE"}}><p style={{fontFamily:"var(--font-body)",fontSize:"clamp(13px,1.5vw,16px)",color:"#374151",lineHeight:1.7}}>{s.desc}</p></Card>
      {[["Benefit / Support",s.benefit,"#16A34A"],["Eligibility",s.elig,"#0A2342"],["Documents Required",s.docs,"#0A2342"]].map(([k,v,c])=><Card key={k} style={{marginBottom:12}}><p style={{fontFamily:"var(--font-body)",fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#94A3B8",marginBottom:8}}>{k}</p><p style={{fontFamily:"var(--font-body)",fontSize:"clamp(13px,1.5vw,16px)",color:c,fontWeight:500,lineHeight:1.6}}>{v}</p></Card>)}
      <div style={{background:"white",border:"1.5px solid #E2E8F0",borderRadius:16,padding:"clamp(16px,2vw,24px)",marginBottom:16}}>
        <p style={{fontFamily:"var(--font-body)",fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#94A3B8",marginBottom:12}}>How to Apply</p>
        {["Visit your nearest Common Service Centre (CSC) or Gram Panchayat office","Carry all required documents (original + photocopy)","Fill the application form and submit along with documents","Receive acknowledgement receipt with application number"].map((step,i)=><div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<3?12:0}}><div style={{width:24,height:24,borderRadius:"50%",background:"#EDE9FE",border:"1.5px solid #DDD6FE",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}><span style={{fontFamily:"var(--font-head)",fontSize:11,fontWeight:800,color:C}}>{i+1}</span></div><span style={{fontFamily:"var(--font-body)",fontSize:"clamp(13px,1.5vw,15px)",color:"#374151",lineHeight:1.5}}>{step}</span></div>)}
      </div>
      <Btn color={C} onClick={()=>alert("Online application portal opening…")}>Apply Online</Btn>
      <div style={{height:10}}/><Btn ghost color={C} onClick={()=>setScreen("home")}>{t.home}</Btn>
    </Wrap>
  </div>;
}