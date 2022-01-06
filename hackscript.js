// Hack script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs infinitely, designed to be used concurrently with growscript and weakscript
// Version 1.1 - Changed to threshold to avoid wasting time hacking $0 servers

export async function main(ns) {
    let target = ns.args[0];
    let moneyThresh = ns.getServerMaxMoney(target) * 0.33
    while(true){
        if (ns.getServerMoneyAvailable(target) < moneyThresh){
            await ns.grow(target);
        }
        else {
            await ns.hack(target);
        }
    }
}
