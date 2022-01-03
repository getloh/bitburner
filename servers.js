// Server purchasing and automated run script for Bitburner

export async function main(ns) {

let currentServers = ns.getPurchasedServers();
let ram = 4096; // Specify RAM to buy in GB
let i = currentServers.length;
let serverMax = ns.getPurchasedServerLimit();

// Check and ensure servers are running scripts (recover after a forced reboot)
for(let x = 0; x < currentServers.length; x++){
    if (!ns.isRunning("breakerlite.js", currentServers[x])){
        ns.exec("breakerlite.js", currentServers[x], 1);
    }
};
// then Continuously try to purchase servers until we've reached the maximum

while (i < serverMax) {
    // Check if we have enough money to purchase a server
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
        // if sufficient money, buy server, name it, upload 4x scripts and exec breakerlite.js
        let hostname = ns.purchaseServer("plex" + i, ram);
        await ns.scp("breakerlite.js", hostname);
        await ns.scp("hackscript.js", hostname);
        await ns.scp("growscript.js", hostname);
        await ns.scp("weakscript.js", hostname);
        ns.exec("breakerlite.js", hostname, 1);
        ++i;
    }
    else {
        ns.print(`cannot buy yet - price is `+ ns.getPurchasedServerCost(ram))
        await ns.sleep(20000)
    }
    
}
}