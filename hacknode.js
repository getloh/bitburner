// Hacknet NODES script for Bitburner - https://danielyxie.github.io/bitburner/
// Runs until satisfied (x nodes @ y strength)
// Version 1 - Functional? Basic debug up to level 100 complete

export async function main(ns) {
    ns.tail();
    await ns.sleep(5000);

    let complete = false;
    let NODE_MAX = 20;
    
    let nodeTarget = 5;
    let levelTarget = 40;   // initial value, do not change
    let ramTarget = 1;
    let coreTarget = 1;

    const levelMax = 200;
    const ramMax = 64;
    const coreMax = 16;

    let nodesOwned = ns.hacknet.numNodes();

    let cashAvail = ns.getServerMoneyAvailable('home') / 3; // 33% of snapshotted cash
    while (complete === false){

        ns.toast(`hacknet script has $ ${cashAvail/1000000} M to play with`);
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
                        ns.print("error. case not found");
                }
            }
            // insufficient money, break out of loop for now.
            else {break};                                

        } // end of for loop. At this state, either we ran out of money, or all targets have been met

        if (cashAvail > getCheapest(1)[0]){
            ns.print(`for loop finished, and cashAvail > cheapest triggered`)
            if (levelTarget < levelMax){
                levelTarget += 10;
                ns.print(`Level target was increased, now ${levelTarget}`)
                };
            if (ramTarget < ramMax && levelTarget > 120){
                ramTarget *= 2;
                ns.print(`RAM target was increased, now ${ramTarget}`)
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
            await ns.sleep (10000);
        }
        else {
            ns.print("insufficient money reserves, sleeping for 10min");
            await ns.sleep(600000);
            cashAvail = ns.getServerMoneyAvailable('home') / 3;
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
        // ns.print(`for node ${nodeIndex} the cheapest option is ${upgradePath} @ ${upgradeCost}`)
        return [upgradeCost, upgradePath]
    }




}
