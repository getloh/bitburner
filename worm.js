// Worm script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs infinitely, spreads to other machines and attempts to run breaker.js on them
// Version 1 - adapted from old breakerworm.js which was no longer necessary

export async function main(ns) {
    ns.print("Starting worm here");
    await ns.sleep(10000);
    let currentPC = ns.hostname;
    let network = ns.scan(currentPC);
        // for each item in the scanned network...
    while(true){
    for (let i = 0; i < network.length; i++){
        
        // If machine has been breached, copy and execute the worm
        if (ns.hasRootAccess(network[i])){
        await ns.scp("worm.js", network[i]);
        await ns.scp("breaker.js", network[i]);
        await ns.scp("hackscript.js", network[i]);
        await ns.scp("weakscript.js", network[i]);
        await ns.scp("growscript.js", network[i]);

            if(!ns.isRunning("worm.js", network[i])){
                ns.exec("worm.js", network[i], 1);
            }
            if(!ns.isRunning("breaker.js", network[i])){
                ns.exec("breaker.js", network[i], 1);
            }
        }
        } // ~~~ End of the for loop

    await ns.sleep (300000)
    } // ~~~ end of the while(true) loop
}