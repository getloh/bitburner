// Grow script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs infinitely, designed to be used concurrently with hackscript and weakscript
// Version 1.2 - Increased case to weaken over hack

export async function main(ns) {
    let target = ns.args[0];
    let moneyThresh = ns.getServerMaxMoney(target) * 0.7
    let securityThresh = ns.getServerMinSecurityLevel(target) * 1.5;
    while(true){
        if (ns.getServerMoneyAvailable(target) < moneyThresh){
            await ns.grow(target);
        }
        else if (ns.getServerSecurityLevel(target) > securityThresh || ns.getServerSecurityLevel(target) > 80){
            await ns.weaken(target);
        }
        else {
            await ns.hack(target);
        }
    }
}