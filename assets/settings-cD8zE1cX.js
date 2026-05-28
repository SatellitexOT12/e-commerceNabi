import{s as a}from"./index-Cezei5Te.js";const e=async()=>{const{data:t,error:s}=await a.from("settings").select("whatsapp_numero1, whatsapp_numero2").single();if(s)throw s;return t};export{e as getWhatsAppNumbers};
//# sourceMappingURL=settings-cD8zE1cX.js.map
