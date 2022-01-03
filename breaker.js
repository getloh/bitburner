// 'Breaker' script for Bitburner
//  Version 3.2 - added thread calculation function
export async function main(ns) {
    ns.print("Starting breaker script");
    ns.disableLog("getHackingLevel");
    let currentPC = ns.getHostname();
    let network = ns.scan(currentPC); // Will list all computers on network
    let portHacks = 0;
    let threadRatio = [1, 4, 3];
    let threads = threadCount() //hack, grow, weaken
    let blacklist = ["home","darkweb","CSEC","avmnite-02h","I.I.I.I","run4theh111z",".","plex0","plex1","plex2","plex3","plex4","plex5","plex6","plex7","plex8","plex9","plex10","plex11","plex12","plex13","plex14","plex15","plex16","plex17","plex18","plex19","plex20","plex21","plex22","plex23","plex24"];


    while(true){
        // -------- This loop scans the wide network and adds more nodes each scan ---------
        for (let i = 0; i < network.length; i++){ // for each computer, scan it's network
            let iList = ns.scan(network[i]); 
                for (let j = 0; j < iList.length; j++){ //for each item in the iList
                    if (network.find(element => element == iList[j]) == undefined) { // iList[j] is not in the big list..
                        network.push(iList[j]); // add it to the master list
                    }
                }
        }

        portHacks = hacksCheck();

        // ------- This loop breaches servers found in the above loop ---------
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
                        if (portHacks >= 1){
                            ns.brutessh(network[i]);
                        }
                    default: 
                            if(portHacks >= portsReq){
                            ns.nuke(network[i]);
                            }
            }
            // Machine should now be nuked and open
            };
        // if Server has already been breached, and hackscript isn't already running, run w/ threads
        if (blacklist.find(e => e === network[i]) === undefined){ // Check if server is in the blacklist
            
            if (ns.hasRootAccess(network[i]) && ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(network[i])){ 
                if (!ns.isRunning("hackscript.js", ns.getHostname(), network[i])){ 
                    ns.run("hackscript.js", threads[0], network[i]);
                    ns.run("growscript.js", threads[1], network[i]);
                    ns.run("weakscript.js", threads[2], network[i])
                }
            }
        }
     } // ~~~ End of the for loop
    await ns.sleep(150000) // 150secs
    }; // ~~ end of the while true loop

    function hacksCheck() {
        let hacks = 0;
        if (ns.fileExists("BruteSSH.exe", "home")){ hacks++};
        if (ns.fileExists("FTPCrack.exe", "home")){ hacks++};
        if (ns.fileExists("relaySMTP.exe", "home")){ hacks++};
        if (ns.fileExists("HTTPWorm.exe", "home")){ hacks++};
        if (ns.fileExists("SQLInject.exe", "home")){ hacks++};

        ns.print("Found "+hacks+ " hacks on computer")
        return hacks;
    };

    function threadCount(){
        let serverRam = ns.getServerMaxRam(currentPC);
        let hackRam = ns.getScriptRam("hackscript.js");
        let threadMultiplier = Math.ceil(Math.sqrt(serverRam)/8)

        return threadRatio.map(x => x * threadMultiplier)
        // return array, hacks / grows / weaken
    }
}

