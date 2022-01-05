// Server purchasing script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs until satisfied - Max servers @ the RAM specified by argument[0]

// To do - An argument which can delete and rebuy servers at higher RAM

// Version 1.1 -
// Amended to breaker.js from breakerlite.js (since it now calculates RAM), added arguments to better change the RAM wanted
// now overwrites breaker.js on a recover
// Added toasts for purchasing and how much a server costs

export async function main(ns) {

    let currentServers = ns.getPurchasedServers();
    let ram = ns.args[0]; // Specify RAM to buy in GB
    let i = currentServers.length;
    let serverMax = 25;
    // let serverMax = ns.getPurchasedServerLimit();
    const serverPriceInfoText = (ns.getPurchasedServerCost(ram) / 1000000).toFixed(3);
    ns.toast(`Server price is ${serverPriceInfoText} M`, "info")
    
    // Check and ensure servers are running scripts (recover after a forced reboot)
    for(let x = 0; x < currentServers.length; x++){
        if (!ns.isRunning("breaker.js", currentServers[x])){
            await ns.scp("breaker.js", currentServers[x]);
            ns.exec("breaker.js", currentServers[x], 1);
        }
    };
    // then Continuously try to purchase servers until we've reached the maximum
    
    while (i < serverMax) {
        // Check if we have enough money to purchase a server
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            // if sufficient money, buy server, name it, upload 4x scripts and exec breaker.js
            let hostname = ns.purchaseServer("plex" + i, ram);
            await ns.scp("breaker.js", hostname);
            await ns.scp("hackscript.js", hostname);
            await ns.scp("growscript.js", hostname);
            await ns.scp("weakscript.js", hostname);
            ns.exec("breaker.js", hostname, 1);
            ns.toast(`Server ${hostname} was purchased`, "success")
            ++i;
            
        }
        else {
            ns.print(`cannot buy yet - price is `+ ns.getPurchasedServerCost(ram))
            await ns.sleep(20000)
        }
        
    }
    }