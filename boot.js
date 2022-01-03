// Bitburner startup script

export async function main(ns) {
    ns.run("stockbot.js");
    ns.run("breaker.js");
    ns.run("servers.js");
}