(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.VeloraSearch=factory()})(typeof window!=='undefined'?window:this,function(){
 const engines=[
  {id:'duckduckgo',name:'DuckDuckGo',template:'https://duckduckgo.com/?q={query}'},
  {id:'google',name:'Google',template:'https://www.google.com/search?q={query}'},
  {id:'bing',name:'Bing',template:'https://www.bing.com/search?q={query}'},
  {id:'brave',name:'Brave Search',template:'https://search.brave.com/search?q={query}'},
  {id:'ecosia',name:'Ecosia',template:'https://www.ecosia.org/search?q={query}'},
  {id:'yahoo',name:'Yahoo',template:'https://search.yahoo.com/search?p={query}'},
  {id:'startpage',name:'Startpage',template:'https://www.startpage.com/sp/search?query={query}'},
  {id:'kagi',name:'Kagi',template:'https://kagi.com/search?q={query}'}
 ];
 function validTemplate(value){if(typeof value!=='string'||value.length>2048||!value.includes('{query}'))return false;try{const u=new URL(value.replaceAll('{query}','velora')),v=new URL(value.replaceAll('{query}','different'));return u.protocol==='https:'&&!u.username&&!u.password&&u.origin===v.origin}catch{return false}}

 function searchURL(query,template=engines[0].template){return (validTemplate(template)?template:engines[0].template).replaceAll('{query}',encodeURIComponent(query))}
 return {engines,validTemplate,searchURL};
});
