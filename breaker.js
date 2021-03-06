// 'Breaker' bot for Bitburner - https://danielyxie.github.io/bitburner/
// Runs infinitely - Continually polls servers to see if they can be rooted, then runs hack/weak/growscript on them
// Version 3.43 - Added better thread calculating logic
// resolved bugs from 3.42 - still does not work well at <1tb , doesn't fill RAM, hackscript minimum threads needs to be 1

export async function main(ns) {

    // ~~~~~~~ Editable variables ~~~~~~~
    const blacklist = ["home", "darkweb", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", ".","The-Cave"]; // do not run on these machines
    const ownedServerName = "plex"
    const threadRatio = [1, 10, 5];
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ns.print("Starting breaker script");
    ns.disableLog("getHackingLevel");
    const currentPC = ns.getHostname();
    let network = ns.scan(currentPC); // Will list all computers on network
    let portHacks = 0;
     

    while (true) {
        let loopNum = 0;
        // -------- This loop scans the wide network and adds more nodes each scan ---------
        for (let i = 0; i < network.length; i++) {          // for each computer, scan it's network
            let iList = ns.scan(network[i]);                // each computers network scan result is iList
            for (let j = 0; j < iList.length; j++) {        // then for each item in the iList
                if (network.find(element => element == iList[j]) == undefined) { // if iList[j] is not in the big list..
                    network.push(iList[j]);                 // add it to the master list
                }
            }
        }
        let threads = threadCount() //[hack, grow, weaken]
        portHacks = hacksCheck();

        // ------- This loop breaches servers found in the above loop ---------
        for (let i = 0; i < network.length; i++) {
            // status - the server has not been breached yet && hacking level is sufficient
            if (!ns.hasRootAccess(network[i]) && ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(network[i])) {
                // How many ports are required?
                let portsReq = ns.getServerNumPortsRequired(network[i]);
                switch (portsReq) {
                    case 5:
                        if (portHacks >= 5) {
                            ns.sqlinject(network[i]);
                        }
                    case 4:
                        if (portHacks >= 4) {
                            ns.httpworm(network[i]);
                        }
                    case 3:
                        if (portHacks >= 3) {
                            ns.relaysmtp(network[i]);
                        }
                    case 2:
                        if (portHacks >= 2) {
                            ns.ftpcrack(network[i]);
                        }
                    case 1:
                        if (portHacks >= 1) {
                            ns.brutessh(network[i]);
                        }
                    default:
                        if (portHacks >= portsReq) {
                            ns.nuke(network[i]);
                        }
                }
                // Machine should now be nuked and open
            };
            // if Server has already been breached, and hackscript isn't already running, run w/ threads
            if (blacklist.find(e => e === network[i]) === undefined && !network[i].includes(ownedServerName)) { // Check if server is in the blacklist

                if (ns.hasRootAccess(network[i]) && ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(network[i])) {
                    if (!ns.isRunning("hackscript.js", ns.getHostname(), network[i])) {
                        ns.run("hackscript.js", threads[0], network[i]);
                        ns.run("growscript.js", threads[1], network[i]);
                        ns.run("weakscript.js", threads[2], network[i])
                    }
                }
            }
        } // ~~~ End of the for loop
        await ns.sleep(150000); // 150secs
        loopNum++;

        if (loopNum >= 50){ns.toast('Consider restarting to re-evaluate threadcount')}
    }; // ~~ end of the while true loop

    function hacksCheck() { //Checks how many hacks are available on Home
        let hacks = 0;
        if (ns.fileExists("BruteSSH.exe", "home")) { hacks++ };
        if (ns.fileExists("FTPCrack.exe", "home")) { hacks++ };
        if (ns.fileExists("relaySMTP.exe", "home")) { hacks++ };
        if (ns.fileExists("HTTPWorm.exe", "home")) { hacks++ };
        if (ns.fileExists("SQLInject.exe", "home")) { hacks++ };

        ns.print("Found " + hacks + " hacks on computer")
        return hacks;
    };

    function threadCount() {
        const serverRam = ns.getServerMaxRam(currentPC); // finds server RAM
        const hackRam = (ns.getScriptRam("hackscript.js"))*1.05; // how big is hackscript?

        let serverCount = 0;
        for (let i = 0; i < network.length; i++){
            if (blacklist.find(e => e === network[i]) === undefined && !network[i].includes(ownedServerName) && ns.hasRootAccess(network[i]) ) {
                serverCount++;
            }
        }

        const maxThreads = (serverRam / hackRam) - 5;
        // const serverCount = 63;
        const threadsPerServer = maxThreads/serverCount;
        const threadMultiplier = threadsPerServer / threadRatio.reduce((x,y) => x + y, 0);
        if(serverRam <= 64){
            return [1, 4, 2];
        }
        return threadRatio.map(x => Math.ceil(x * threadMultiplier))
        // return array, hacks / grows / weaken
    }
}