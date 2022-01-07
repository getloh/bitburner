// Hack script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs infinitely, designed to be used concurrently with growscript and weakscript
// Version 1.11 - Changed threshold statement to account for very low hack levels

export async function main(ns) {
    let target = ns.args[0];
    let moneyThresh = ns.getServerMaxMoney(target) * 0.33
    while(true){
        if (ns.getServerMoneyAvailable(target) < moneyThresh && ns.getHackingLevel() > 50){
            await ns.grow(target);
        }
        else {
            await ns.hack(target);
        }
    }
}
