// breaker - worm edition - copies itself to other machines and runs.

export async function main(ns) {
    ns.print("Starting script here");
    await ns.sleep(10000);
    let portHacks = ns.args[0];
    let currentPC = ns.hostname;
    let network = ns.scan(currentPC);
        // for each item in the scanned network...
    while(true){
    for (let i = 0; i < network.length; i++){
         // status - the server has not been breached yet && hacking level is sufficient
        if (!ns.hasRootAccess(network[i]) && ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(network[i])){
            // How many ports are required?
            let portsReq = ns.getServerNumPortsRequired(network[i]);
            switch(portsReq){
                case 5 :
                    if (portHacks >= 5){
                    ns.sqlinject(network[i]);
                    }
                case 4:
                    if (portHacks >= 4){
                        ns.httpworm(network[i]);
                        }
                case 3:
                    if (portHacks >= 3){
                        ns.relaysmtp(network[i]);
                        }
                case 2:
                    if (portHacks >= 2){
                        ns.ftpcrack(network[i]);
                        }
                case 1:
                        ns.brutessh(network[i]);
                default: 
                        if(portHacks >= portsReq){
                        ns.nuke(network[i]);
                        }
            } // end switch
        } 
        else if (!ns.hasRootAccess(network[i]) && ns.getHackingLevel() < ns.getServerRequiredHackingLevel(network[i])){
            ns.print("can't hack this server yet");
            await ns.sleep(1000);
        };
            // If machine has been breached, copy and execute the worm
        if (ns.hasRootAccess(network[i]) && ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(network[i])){
        await ns.scp("breakerworm.js", network[i]);
            if(!ns.isRunning("breakerworm.js", network[i])){
                ns.exec("breakerworm.js", network[i], 1, portHacks);
            }
        }

        } // ~~~ End of the for loop

    await ns.sleep (300000)
    } // ~~~ end of the while(true) loop
}