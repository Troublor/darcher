module.exports=(()=>{"use strict";var e={362:function(e,t,o){var r=this&&this.__createBinding||(Object.create?function(e,t,o,r){void 0===r&&(r=o),Object.defineProperty(e,r,{enumerable:!0,get:function(){return t[o]}})}:function(e,t,o,r){void 0===r&&(r=o),e[r]=t[o]}),n=this&&this.__exportStar||function(e,t){for(var o in e)"default"===o||Object.prototype.hasOwnProperty.call(t,o)||r(t,e,o)};Object.defineProperty(t,"__esModule",{value:!0}),n(o(240),t),n(o(825),t)},240:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Logger=void 0;var o=function(){function e(e,t){this.module=e,this.level=t}return e.prototype.parseLog=function(t,o,r){var n,i=new Date,s=i.getMonth().toString().padStart(2,"0")+"-"+i.getDay().toString().padStart(2,"0")+"|"+i.getHours().toString().padStart(2,"0")+":"+i.getMinutes().toString().padStart(2,"0")+":"+i.getSeconds().toString().padStart(2,"0")+"."+i.getMilliseconds().toString().padEnd(3,"0").slice(0,3),a=function(e,t){return t},c="";if(r)for(var u in r)r.hasOwnProperty(u)&&(c+=a(0,u)+"="+(null===(n=r[u])||void 0===n?void 0:n.toString())+" ");return a(0,e.Level.levelString(t).padEnd(5," "))+"["+s+"]["+this.module+"] "+o.padEnd(48," ")+" "+c},e.prototype.log=function(t,o,r){if(this.level<=t)switch(this.level){case e.Level.ERROR:console.error(this.parseLog(t,o,r));break;case e.Level.WARN:console.warn(this.parseLog(t,o,r));break;case e.Level.INFO:console.info(this.parseLog(t,o,r));break;case e.Level.DEBUG:console.debug(this.parseLog(t,o,r));break;default:console.log(this.parseLog(t,o,r))}},e.prototype.info=function(t,o){this.log(e.Level.INFO,t,o)},e.prototype.warn=function(t,o){this.log(e.Level.WARN,t,o)},e.prototype.debug=function(t,o){this.log(e.Level.DEBUG,t,o)},e.prototype.error=function(t,o){this.log(e.Level.ERROR,t,o)},e.Level={DEBUG:1,INFO:2,WARN:3,ERROR:4,levelString:function(e){switch(e){case 1:return"DEBUG";case 2:return"INFO";case 3:return"WARN";case 4:return"ERROR";default:return"UNKNOWN"}}},e}();t.Logger=o},825:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.prettifyHash=void 0,t.prettifyHash=function(e){var t=0;return e.startsWith("0x")&&(t=2),e.substring(t,t+6)+"…"+e.substring(e.length-6,e.length)}},235:(e,t,o)=>{Object.defineProperty(t,"__esModule",{value:!0});var r=o(362),n=function(){function e(e){this.address=e,this.logger=new r.Logger("MetaMask-Notifier",r.Logger.Level.DEBUG)}return e.prototype.start=function(){var e=this;this.ws=new WebSocket(this.address),this.ws.onmessage=function(t){return e.onMessage(t.data)},this.ws.onerror=function(t){return e.onError(t)},this.ws.onclose=function(){return e.onClose()},this.ws.onopen=function(){return e.logger.info("WebSocket connection opened")}},e.prototype.onMessage=function(e){this.logger.debug("receive message",{msg:e})},e.prototype.onError=function(e){this.logger.error(e)},e.prototype.onClose=function(){var e=this;this.ws=void 0,this.logger.info("WebSocket connection closed"),setTimeout((function(){e.logger.warn("reconnecting..."),e.start()}),1e3)},e.prototype.notifyUnapprovedTx=function(e){if(this.ws){this.logger.debug("Notify new transaction",{from:e.from,to:e.to});try{this.ws.send(JSON.stringify(e))}catch(e){this.logger.error("Notify new transaction error",{err:e})}}else this.logger.error("WebSocket not connected, fail to notify new transaction:",e)},e.prototype.notifyUnlockRequest=function(e){},e}();t.default=n}},t={};return function o(r){if(t[r])return t[r].exports;var n=t[r]={exports:{}};return e[r].call(n.exports,n,n.exports,o),n.exports}(235)})();