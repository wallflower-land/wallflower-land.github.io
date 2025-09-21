/**
* ios-haptics v0.1.4
* tijn.dev
* @license MIT
**/const a=typeof window>"u"?!1:window.matchMedia("(pointer: coarse)").matches;function t(){try{if(navigator.vibrate){navigator.vibrate(50);return}if(!a)return;const e=document.createElement("label");e.ariaHidden="true",e.style.display="none";const i=document.createElement("input");i.type="checkbox",i.setAttribute("switch",""),e.appendChild(i),document.head.appendChild(e),e.click(),document.head.removeChild(e)}catch{}}t.confirm=()=>{if(navigator.vibrate){navigator.vibrate([50,70,50]);return}t(),setTimeout(()=>t(),120)};t.error=()=>{if(navigator.vibrate){navigator.vibrate([50,70,50,70,50]);return}t(),setTimeout(()=>t(),120),setTimeout(()=>t(),240)};const n=t;export{n as _};
