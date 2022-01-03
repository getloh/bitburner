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
