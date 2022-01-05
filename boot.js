// Startup script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs once when called - Starts all other automated scripts
// Recommend run the following in terminal to set alias: alias boot="run boot.js"
// Version 1.21 - Fixed conditional to run stockbot.js, added arguments for servers.js

export async function main(ns) {
    ns.run("breaker.js");
    ns.run("servers.js", ns.args[0]);
    if (ns.getPlayer().has4SDataTixApi) { //returns true if owned or purchased
        ns.run("stockbot.js");
    }
}

