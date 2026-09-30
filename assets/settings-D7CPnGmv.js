import{s as a}from"./index-Cb12z8ch.js";const e=async()=>{const{data:t,error:s}=await a.from("settings").select("whatsapp_numero1, whatsapp_numero2").single();if(s)throw s;return t};export{e as getWhatsAppNumbers};
//# sourceMappingURL=settings-D7CPnGmv.js.map
