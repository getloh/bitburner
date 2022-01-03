// Bitburner startup script
// Version 1.1 - Added conditional to run stockbot.js, added arguments for servers.js

export async function main(ns) {
    
    ns.run("breaker.js");
    ns.run("servers.js", ns.args[0]);
    if (ns.stock.purchase4SMarketDataTixApi()){ //returns true if owned or purchased
        ns.run("stockbot.js");
    }
}