import{s as a}from"./index-C6Z6l2i0.js";const e=async()=>{const{data:t,error:s}=await a.from("settings").select("whatsapp_numero1, whatsapp_numero2").single();if(s)throw s;return t};export{e as getWhatsAppNumbers};
//# sourceMappingURL=settings-BcwkUAA_.js.map
