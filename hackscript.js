// Hack script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs infinitely, designed to be used concurrently with growscript and weakscript
// Version 1.12 - Changed threshold statement to compare with current cash instead of hack level

export async function main(ns) {
    let target = ns.args[0];
    let moneyThresh = ns.getServerMaxMoney(target) * 0.33
    while(true){
        const myCashThresh = ns.getServerMoneyAvailable('home') / 10;
        const targetCash = ns.getServerMoneyAvailable(target);
        if (targetCash < moneyThresh && targetCash < myCashThresh){
            await ns.grow(target);
        }
        else {
            await ns.hack(target);
        }
    }
}
