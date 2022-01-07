// Startup script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs once when called - Starts all other automated scripts
// Recommend run the following in terminal to set alias: alias boot="run boot.js"
// Version 1.22 - Added conditional for running servers.js, removed argument as no longer req

export async function main(ns) {

    ns.run("breaker.js");

    if (ns.getServerMaxRam("home") > 32){
        ns.run("servers.js");
        }

    if (ns.getPlayer().has4SDataTixApi) { //returns true if owned or purchased
        ns.run("stockbot.js");
        }

}

