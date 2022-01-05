// Hack script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs infinitely, designed to be used concurrently with growscript and hackscript
// Version 1.1 - Now uses grow instead of hack if security is low

export async function main(ns) {
    let target = ns.args[0];
    let securityThresh = ns.getServerMinSecurityLevel(target) * 1.5;
    while(true){
        if (ns.getServerSecurityLevel(target) > securityThresh){
            await ns.weaken(target);
        }
        else {
            await ns.grow(target);
        }
    }
}
