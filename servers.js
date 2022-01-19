// Server purchasing script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs until satisfied, will rebuy servers money is sufficient and server is worse than 25% of ram. Run with 'f' argument to force rebuy

// Version 1.222
// Small change to an ns.print + improvements to rebuy prints

export async function main(ns) {

    // ~~~~~~~~~Editable variables~~~~~~~~~~~
    const SVRNAME = "plex";             // What hostname your purchased servers will have
    const MIN_RAM = 32;                 // Minimum RAM you want to buy for a server
    const SVR_RAM_RATIO = 2;            // Target RAM for server is "Home" RAM, divided by SVR_RAM_RATIO, must = power of 2 (0.5, 1, 2, 4...). eg. '2' is 50% of home RAM
    const MAIN_SCRIPT = "breaker.js"    // Name of your main script that you want to upload
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    let currentServers = ns.getPurchasedServers();
    let ram = calculateRam();   // Calculates how much RAM to buy for the server
    let i = currentServers.length;
    const serverMax = 25;       // hardcoded max servers as of Bitburner v1.3

    // Check and ensure servers are running scripts (recover after a forced reboot)
    // if server is not running scripts, overwrite existing breaker and run.
    ns.print('Starting scripts on existing servers...')
    for(let x = 0; x < currentServers.length; x++){
        if (!ns.isRunning(MAIN_SCRIPT, currentServers[x])){ 
            await ns.scp(MAIN_SCRIPT, currentServers[x]);
            ns.exec(MAIN_SCRIPT, currentServers[x], 1);
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
            // if sufficient money, buy server, name it, upload scripts and exec MAIN_SCRIPT
            let hostname = ns.purchaseServer(SVRNAME + i, ram);
            await ns.scp(MAIN_SCRIPT, hostname);
            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // Add any extra scripts you want to upload here, or delete the lines
            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            await ns.scp("hackscript.js", hostname);
            await ns.scp("growscript.js", hostname);
            await ns.scp("weakscript.js", hostname);
            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            ns.exec(MAIN_SCRIPT, hostname, 1);
            ns.toast(`Server ${hostname} was purchased`, "success")
            ++i;
        }
        else {
            ns.print(`cannot buy yet - price is ${serverPriceInfoText} M`)
            await ns.sleep(20000)
        }
    } // end of while <serverMax

    // if at max servers, and purchased servers are less than 25% of RAM power
    while (ns.getServerMaxRam(SVRNAME+'0') <= (ram/4) && (ns.getServerMaxRam(SVRNAME+'0') !== 1048576) || ns.args[0] === 'f'){
        if ( ns.getServerMoneyAvailable("home") > (ns.getPurchasedServerCost(ram) * 13) ){ // if money is sufficient for upgrade..
            let areYouSure = await ns.prompt(`do you want to rebuy servers? Est Cost: $ ${((ns.getPurchasedServerCost(ram) * 25)/1000000000).toFixed(2)} B`);
            if (areYouSure){
                for (let i = 0; i < currentServers.length; i++){    // Delete all existing servers
                    ns.killall(currentServers[i]);
                    ns.deleteServer(currentServers[i]);
                }
                ns.spawn("servers.js", 1);                          // Kills and Restarts this script to start buy process
            }
        }
        ns.print("25 servers already");
        ns.print("servers are underpowered, but we don't have enough money to upgrade yet");
        ns.print(`Min Money required: $ ${((ns.getPurchasedServerCost(ram) * 13)/1000000000).toFixed(2)} B`)
        await ns.sleep (900000);

    }

    function calculateRam() {
        // Calculate how much RAM to buy for the server (set to SVR_RAM_RATIO)
        const myRam = ns.getServerMaxRam("home");
        const maxPossRam = 1048576; // Hardcoded value for maximum purchasable server ram @ Bitburner v1.3
        if (myRam > maxPossRam){return maxPossRam}
        else if (myRam <= MIN_RAM){return MIN_RAM}
        else {return (myRam / SVR_RAM_RATIO)};
        }
    } // end of script
