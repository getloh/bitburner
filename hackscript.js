// Hack script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs infinitely, designed to be used concurrently with growscript and weakscript
// Version 1 - Creation


export async function main(ns) {
    let target = ns.args[0];
    while(true){
        await ns.hack(target);
    }
}
