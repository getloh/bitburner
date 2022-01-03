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
