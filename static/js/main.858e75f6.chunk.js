(this["webpackJsonpfsh-playground"]=this["webpackJsonpfsh-playground"]||[]).push([[0],{340:function(e,t,n){e.exports=n(830)},345:function(e,t,n){},350:function(e,t,n){},506:function(e,t){},508:function(e,t){},522:function(e,t){},524:function(e,t){},539:function(e,t){},541:function(e,t){},551:function(e,t){},553:function(e,t){},830:function(e,t,n){"use strict";n.r(t);var r=n(1),a=n.n(r),o=n(87),c=n.n(o),i=(n(345),n(109)),u=n(845),s=n(848),l=n(852),p=n(846),f=n(847),m=n(850),h=Object(u.a)((function(e){return{root:{flexGrow:1,color:e.palette.text.primary,background:e.palette.warning.dark,position:"static"},docButton:{margin:e.spacing(2)},title:{flexGrow:1,edge:"start",fontFamily:"Consolas"}}}));function d(){var e=h();return a.a.createElement(l.a,{className:e.root},a.a.createElement(p.a,null,a.a.createElement(f.a,{className:e.title,variant:"h6"},"FSH Playground"),a.a.createElement(m.a,{className:e.docButton,variant:"outlined"},"Documentation")))}var g=n(849),b=n(332),v=n.n(b),x=Object(u.a)((function(e){return{box:{padding:e.spacing(0,2),color:e.palette.text.primary,background:e.palette.grey[400],height:"100%",fontFamily:"Consolas",noWrap:!1}}}));function y(e){var t=x(),n="";return e.displaySUSHI&&e.text?e.isObject?(n=JSON.parse(e.text),a.a.createElement(g.a,{className:t.box,border:1,overflow:"scroll"},a.a.createElement("h4",null,"Your Output: "),a.a.createElement(v.a,{src:n,displayDataTypes:!1,collapsed:1,name:!1}))):a.a.createElement(g.a,{className:t.box,border:1,overflow:"scroll"},a.a.createElement("h4",null,"Your Output: "),a.a.createElement("pre",null,e.text)):a.a.createElement(g.a,{className:t.box,border:1},a.a.createElement("h4",null,"Your JSON Output Will Display Here: "))}var w=Object(u.a)((function(e){return{box:{padding:e.spacing(2),color:e.palette.common.white,background:e.palette.common.black,height:"100%",fontFamily:"Consolas"}}}));function k(){var e=w();return a.a.createElement(g.a,{className:e.box},a.a.createElement("h1",null,"Console is here"))}var E=n(333);n(350),n(351),n(352);n(353),n(354);var S=Object(u.a)((function(e){return{box:{height:"100%"}}}));function O(e){var t=S();return a.a.createElement(g.a,{className:t.box},a.a.createElement(E.UnControlled,{className:"react-codemirror2",value:e.value,options:{theme:"material",lineNumbers:!0},onChange:function(t,n,r){var a;a=r,e.updateTextValue(a)}}))}var j=n(37),N=n.n(j),F=n(75),H=n(66),T=n(197),C=n(21),I=n(144),R=n(334),D=n.n(R),P=n(196),B=n.n(P),J=n(104),W=n.n(J);function Y(e){return new Promise((function(t){W.a.get("http://packages.fhir.org/hl7.fhir.r4.core/4.0.1",(function(n){var r=D.a.extract();r.on("entry",(function(t,n,r){var a="";n.on("data",(function(e){a+=e.toString()})),n.on("end",(function(){try{var t=JSON.parse(a);t.resourceType&&e.push(t)}catch(n){}r()})),n.resume()})),r.on("finish",(function(){t(e)})),n.pipe(B.a.createGunzip()).pipe(r)}))}))}function G(e,t){return new Promise((function(n,r){var a=e.transaction(["resources"],"readwrite");a.oncomplete=function(){n()},a.onerror=function(e){r(e)};var o=a.objectStore("resources",{keyPath:["id","resourceType"]});t.forEach((function(e){o.add(e)}))}))}function L(e,t){return new Promise((function(n,r){var a=t.transaction(["resources"],"readonly").objectStore("resources",{keyPath:["id","resourceType"]}).openCursor();a.onerror=function(){r("There is an error getting data out!")},a.onsuccess=function(){var t=a.result;t?(e.add(t.value),t.continue()):n(e)}}))}function U(e,t){C.logger.info("Importing FSH text...");var n=Object(H.importText)(e);return new H.FSHTank(n,t)}function V(e,t){return _.apply(this,arguments)}function _(){return(_=Object(F.a)(N.a.mark((function e(t,n){return N.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e,r){var a=null,o=!1,c=I.FHIRDefinitions,i=indexedDB.open("FSH Playground Dependencies",n);i.onsuccess=function(){var n=Object(F.a)(N.a.mark((function n(r){var i;return N.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(a=r.target.result,i=[],!o){n.next=7;break}return n.next=5,Y(i);case 5:return n.next=7,G(a,i);case 7:return n.next=9,L(t,a);case 9:c=n.sent,e(c);case 11:case"end":return n.stop()}}),n)})));return function(e){return n.apply(this,arguments)}}(),i.onupgradeneeded=function(e){o=!0,(a=e.target.result).createObjectStore("resources",{keyPath:["id","resourceType"]})},i.onerror=function(e){r(e)}})));case 1:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function z(e){return M.apply(this,arguments)}function M(){return(M=Object(F.a)(N.a.mark((function e(t){var n,r,a,o,c,i;return N.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n={canonical:"http://default.org"},r=new I.FHIRDefinitions,1,e.next=5,V(r,1);case 5:r=e.sent,a=H.FSHTank,e.prev=7,o=[new H.RawFSH(t)],a=U(o,n),e.next=16;break;case 12:return e.prev=12,e.t0=e.catch(7),C.logger.error("Something went wrong when importing the FSH definitions"),e.abrupt("return");case 16:if("4.0.1"===(null===(c=r.fishForFHIR("StructureDefinition",C.Type.Resource))||void 0===c?void 0:c.version)){e.next=20;break}return C.logger.error("StructureDefinition resource not found for v4.0.1. The FHIR R4 package in local cache may be corrupt. Local FHIR cache can be found at <home-directory>/.fhir/packages. For more information, see https://wiki.hl7.org/FHIR_Package_Cache#Location."),e.abrupt("return");case 20:return i=Object(T.exportFHIR)(a,r),e.abrupt("return",i);case 22:case"end":return e.stop()}}),e,null,[[7,12]])})))).apply(this,arguments)}var $=Object(u.a)((function(e){return{box:{padding:e.spacing(1),color:e.palette.text.primary,background:e.palette.grey[400],height:"4vh",display:"flex;",alignItems:"center",justifyContent:"center"},button:{color:e.palette.common.white,background:e.palette.success.dark}}}));function q(e,t){if("config"!==e)return t}function A(e){var t=$();function n(){return(n=Object(F.a)(N.a.mark((function t(){var n,r,a;return N.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e.onClick(!0,"Loading...",!1),n=!0,t.next=4,z(e.text);case 4:r=t.sent,a=JSON.stringify(r,q,2),r.codeSystems&&(r.codeSystems.length||r.extensions.length||r.instances.length||r.profiles.length||r.valueSets.length)||(n=!1,a="Your FSH is invalid. Just keep swimming!"),e.onClick(!0,a,n);case 8:case"end":return t.stop()}}),t)})))).apply(this,arguments)}return a.a.createElement(g.a,{className:t.box},a.a.createElement(m.a,{className:t.button,onClick:function(){return n.apply(this,arguments)},testid:"Button"},"Run"))}var K=Object(u.a)((function(e){return{container:{flexGrow:1},itemTop:{height:"75vh"},itemBottom:{height:"25vh"}}}));function Q(){var e=K(),t=Object(r.useState)(!1),n=Object(i.a)(t,2),o=n[0],c=n[1],u=Object(r.useState)("Edit FSH Here!"),l=Object(i.a)(u,2),p=l[0],f=l[1],m=Object(r.useState)("Your JSON Output Will Display Here: "),h=Object(i.a)(m,2),g=h[0],b=h[1],v=Object(r.useState)(!1),x=Object(i.a)(v,2),w=x[0],E=x[1];return a.a.createElement("div",{className:"root"},a.a.createElement(d,null),a.a.createElement(A,{onClick:function(e,t,n){c(e),b(t),E(n)},text:p}),a.a.createElement(s.a,{className:e.container,container:!0},a.a.createElement(s.a,{className:e.itemTop,item:!0,xs:6},a.a.createElement(O,{value:p,updateTextValue:function(e){f(e)}})),a.a.createElement(s.a,{className:e.itemTop,item:!0,xs:6},a.a.createElement(y,{displaySUSHI:o,text:g,isObject:w})),a.a.createElement(s.a,{className:e.itemBottom,item:!0,xs:12},a.a.createElement(k,null))))}Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(a.a.createElement(a.a.StrictMode,null,a.a.createElement(Q,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[340,1,2]]]);
//# sourceMappingURL=main.858e75f6.chunk.js.map