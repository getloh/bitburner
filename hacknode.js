// Hacknet NODES script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs until satisfied (x nodes @ max strength)
// Allocates 33% of your bank account to use every 10 minutes.
// Version 1.02 - Functional? Slightly bugged, added debug print, hopefully resolved failure due to owning no nodes before init
// Cleaned up code significantly, reorganized, set amendable variables

// bugs - Some strange cases where it triggers the default case in the switch argument, but logs with a valid case..

export async function main(ns) {
    ns.disableLog('getServerMoneyAvailable');
    ns.disableLog('sleep');
    ns.tail();
    ns.print('hacknode script starting.....')
    await ns.sleep(5000);

    // Amendable values
    let NODE_MAX = 20;
    let SPEND_LIMIT = 3 // Will spend your money, divided by this number. 3=33%, 4=25%, etc

    // Maximums, change if you really want to...
    const levelMax = 180; // will increase to 200 if >1T in bank
    const ramMax = 64;
    let coreMax = 8; //will increase to 16 if >1T in bank
    if (ns.getServerMoneyAvailable("home") > 1000000000000){
        coreMax = 16;    }
    
    // initial values, do not change! They will change on their own!
    let complete = false;
    let nodeTarget = 5;
    let levelTarget = 40;   
    let ramTarget = 1;
    let coreTarget = 1;

    let cashAvail = ns.getServerMoneyAvailable('home') / SPEND_LIMIT; // 33% of snapshotted cash
    ns.toast(`hacknet script has $ ${cashAvail/1000000} M to play with`);

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Do not touch below this line unless you know what you're doing
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    let nodesOwned = ns.hacknet.numNodes();
    if (nodesOwned === 0){
        ns.hacknet.purchaseNode();
        nodesOwned = 1
    }

    while (complete === false){
        let nodeCost = ns.hacknet.getPurchaseNodeCost();

        if (cashAvail > nodeCost && nodesOwned < nodeTarget){ // Buy node first if under target and available cash
            ns.hacknet.purchaseNode();
            nodesOwned = ns.hacknet.numNodes();
            cashAvail -= nodeCost;
        }

        for (let i = 0; i < nodesOwned;){                // iterates through owned nodes
            // if targets are met, move on to the next node
            if (ns.hacknet.getNodeStats(i).level >= levelTarget && ns.hacknet.getNodeStats(i).ram >= ramTarget && ns.hacknet.getNodeStats(i).cores >= coreTarget){
                i++;
            }

            // if cash is sufficient, then buy cheapest upgrade
            else if (cashAvail > getCheapest(i)[0]){         
                switch(getCheapest(i)[1]){
                    case "level":
                        ns.hacknet.upgradeLevel(i , 1);
                        cashAvail -= getCheapest(i)[0]
                        ns.print(`node ${i} level purchased`)
                        break;
                    case "ram":
                        ns.hacknet.upgradeRam(i , 1);
                        cashAvail -= getCheapest(i)[0];
                        ns.print(`node ${i} ram purchased`)
                        break;
                    case "core":
                        ns.hacknet.upgradeCore(i , 1);
                        cashAvail -= getCheapest(i)[0];
                        ns.print(`node ${i} core purchased`)
                    default:
                        ns.print(`error. case not found - case ref ${getCheapest(i)[1]}`);
                }
            }
            // insufficient money, break out of loop for now.
            else {break};                                

        } // end of for loop. At this state, either we ran out of money, or all targets have been met

        if (cashAvail > getCheapest(1)[0]){ //if Cash > Node1's upgradecost

            if (levelTarget < levelMax){
                levelTarget += 10;
                ns.print(`Level target was increased, now ${levelTarget}`)
                };
            if (ramTarget < ramMax && levelTarget > 100){
                ramTarget *= 2;
                ns.print(`RAM target was increased, now ${ramTarget}`)
                };
            if (ns.getServerMoneyAvailable('home') > 1000000000000){        // if 1T in bank, coreMax set to 16
                levelMax = 200;
                coreMax = 16;
                };
            if (coreTarget < coreMax && ramTarget >= 32){
                coreTarget += 1;
                ns.print(`core target was increased, now ${coreTarget}`)
                }
            if (nodeTarget < NODE_MAX && levelTarget >= 100){
                nodeTarget += 1;
                ns.print(`node target was increased, now ${nodeTarget}`)
            }
            if (levelTarget === levelMax && ramTarget === ramMax && coreTarget === coreMax && nodeTarget === NODE_MAX){
                complete = true;
                ns.toast("Hacknet at max")
            }
            await ns.sleep (2000);
            ns.print(`cash at end of an upgrade cycle is ${cashAvail}`)
        }
        else {
            ns.print("insufficient money reserves, sleeping for 10min");
            await ns.sleep(600000);
            cashAvail = ns.getServerMoneyAvailable('home') / SPEND_LIMIT;
            ns.toast(`hacknet script re-running, $ ${cashAvail/1000000} M to play with`);
        }
    } // end of the while loop

    function getCheapest(nodeIndex){            // Returns [price, "option"] of best upgrade path
        
        let levelCost = ns.hacknet.getLevelUpgradeCost(nodeIndex, 1);               //Find costs
        let ramCost = ns.hacknet.getRamUpgradeCost(nodeIndex, 1);
        let coreCost = ns.hacknet.getCoreUpgradeCost(nodeIndex, 1);
        let upgradePath = "level"                                                   //Default upgradepath is level
        let upgradeCost = levelCost;                                                //will be the cheapest path cost

        if (levelCost > ramCost || levelCost > coreCost){                           //if levelCost is higher... 
            if (ramCost > coreCost){upgradePath = "core"; upgradeCost = coreCost}   //core is cheapest
            else {upgradePath = "ram"; upgradeCost = ramCost}                       //ram is cheapest
        }
        return [upgradeCost, upgradePath]
    }

}
