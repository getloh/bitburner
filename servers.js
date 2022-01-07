// Server purchasing script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs until satisfied, will rebuy servers money is sufficient and server is worse than 25% of ram. Run with 'f' argument to force rebuy

// Version 1.2
// Now calculates how much RAM to buy automatically
// Now prompts to rebuy servers if sufficient money and server RAM is < 25% of our RAM

export async function main(ns) {

    let currentServers = ns.getPurchasedServers();
    let ram = calculateRam(); // Calculate how much RAM to buy for the server (set to half of home server) - Min 32gb, max 1peta
    let i = currentServers.length;
    const serverMax = 25;
    // const serverMax = ns.getPurchasedServerLimit(); // This doesn't work for some reason..

    // Check and ensure servers are running scripts (recover after a forced reboot)
    // if server is not running scripts, overwrite existing breaker and run.
    ns.print('Starting scripts on existing servers...')
    for(let x = 0; x < currentServers.length; x++){
        if (!ns.isRunning("breaker.js", currentServers[x])){ 
            await ns.scp("breaker.js", currentServers[x]);
            ns.exec("breaker.js", currentServers[x], 1);
        }
    };

    // Server purchase info
    const serverPriceInfoText = (ns.getPurchasedServerCost(ram) / 1000000).toFixed(2);
    ns.toast(`Server price is ${serverPriceInfoText} M`, "info");
    ns.print(`about to start buying servers @ ${ram}gb for ${serverPriceInfoText}`);
    await ns.sleep(15000)
    
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
    } // end of while <serverMax

    // if at max servers, and purchased servers are less than 25% of RAM power
    while (ns.getServerMaxRam('plex0') <= (ram/4) && (ns.getServerMaxRam('plex0') !== 1048576) || ns.args[0] === 'f'){
        if ( ns.getServerMoneyAvailable("home") > (ns.getPurchasedServerCost(ram) * 13) ){ // if money is sufficient for upgrade..
            ns.print('this would delete servers...');
            let areYouSure = await ns.prompt(`do you want to rebuy servers? Est Cost: $ ${((ns.getPurchasedServerCost(ram) * 25)/1000000000).toFixed(2)} B`);
            if (areYouSure){
                ns.print('delete servers code goes here')
                for (let i = 0; i < currentServers.length; i++){
                    ns.killall(currentServers[i]);
                    ns.deleteServer(currentServers[i]);
                }
                ns.spawn("servers.js", 1);
            }
        }
        await ns.sleep (900000);
    }

    function calculateRam() {
        // Calculate how much RAM to buy for the server (set to half of home server)
        const myRam = ns.getServerMaxRam("home");
        if (myRam > 1048576){return 1048576}
        else if (myRam < 33){return 32}
        else {return (myRam / 2)};
        }
    } // end of script
