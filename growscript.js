// Grow script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs infinitely, designed to be used concurrently with hackscript and weakscript
// Version 1

export async function main(ns) {
    let target = ns.args[0];
    let moneyThresh = ns.getServerMaxMoney(target) * 0.8
    while(true){
        if (ns.getServerMoneyAvailable(target) < moneyThresh){
            await ns.grow(target);
        }
        else {
            await ns.hack(target);
        }
    }
}
