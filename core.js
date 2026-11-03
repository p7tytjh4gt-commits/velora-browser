function destination(value) {
 const s=String(value||'').trim(); if(!s) return '';
 if(/^https?:\/\//i.test(s)){try{return new URL(s).href}catch{return ''}}
 if(/^[a-z][a-z\d+.-]*:/i.test(s)) return '';
 if(/^(localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?([/?#].*)?$/i.test(s)) return 'https://'+s;
 return 'https://duckduckgo.com/?q='+encodeURIComponent(s);
}
const allowed = value => {try{return ['https:','http:'].includes(new URL(value).protocol)}catch{return false}};
module.exports={destination,allowed};
