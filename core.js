const {searchURL}=require('./search-engines');
function destination(value,template) {
 const s=String(value||'').trim(); if(!s) return '';
 if(/^https?:\/\//i.test(s)){try{return new URL(s).href}catch{return ''}}
 if(/^[a-z][a-z\d+.-]*:/i.test(s)&&!/^(site|intitle|inurl|filetype|before|after):/i.test(s)) return '';
 if(/^(localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?([/?#].*)?$/i.test(s)) return 'https://'+s;
 return searchURL(s,template);
}
const allowed = value => {try{return ['https:','http:'].includes(new URL(value).protocol)}catch{return false}};
module.exports={destination,allowed};
