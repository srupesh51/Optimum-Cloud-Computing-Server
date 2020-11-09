const _ = require('lodash');

// Region of Servers for each and every region and their individua costs
const servers = {
  "us_east" : {
      "large": 0.14,
      "xlarge": 0.23,
      "2xlarge": 0.09
  },
  "us_west" : {
    "large": 0.21,
    "2xlarge": 0.413,
    "xlarge": 0.31
  },
  "asia": {
     "large": 0.15,
     "4xlarge": 0.19,
     "2xlarge": 0.29
  }
};

// Number of CPUs for each server
const numServerCPUs =  {
  "large": 1,
  "xlarge": 2,
  "2xlarge": 4,
  "4xlarge": 8,
  "8xlarge": 16,
  "10xlarge": 32
};

// Computes the resources needed for allocation server resources
const getCosts = (hours, cpus, price) => {
    const regionKeys = Object.keys(servers);
    const regionSize = regionKeys.length;
    const pricePerRegion = parseFloat(price / regionSize).toFixed(2);
    const cpuPerRegion = parseInt(cpus / regionSize);
    const hourPerRegion = parseInt(hours / regionSize);
    //console.log(pricePerRegion, cpuPerRegion, hourPerRegion);
    let serverTemp = [];
    let result = [];

    // Gets the corresponding region for particular servers
    regionKeys.forEach((serverRegion) => {
        //console.log(serverRegion);
        const serverCPUs = Object.keys(servers[serverRegion]);
        let priceTemp = [];
        serverTemp[serverRegion] = [];

        // Gets the Server CPU for each server Region
        serverCPUs.forEach((serverCPU) => {
            //console.log(serverCPU, servers[serverRegion][serverCPU]);
            let cpuVal = numServerCPUs[serverCPU];
            if(cpuVal <= cpuPerRegion) {
              cpuVal = cpuPerRegion / cpuVal;
            }

            // Stores the type, value and its number of Servers
            serverTemp[serverRegion].push({'type': serverCPU,
            'value': parseFloat((cpuVal * servers[serverRegion][serverCPU]).toFixed(2)), 'num': parseInt(cpuVal)});
            priceTemp.push(servers[serverRegion][serverCPU]);
        });

        // Sorts the Server Region by Cost (value)
        serverTemp[serverRegion] = _.sortBy(serverTemp[serverRegion],
          (cpu) => {return cpu.value});

        let totalCost = 0;
        let resultServers = [];
        let resultCPUs = 0;
        let resultHours = 0;
        //console.log(serverTemp[serverRegion]);

        // Calculates the number of CPUs and their hours and their corresponding prices
        serverTemp[serverRegion].forEach((serverCPU) => {
           //console.log(serverCPU);

            // Checks the number of CPUs allocated for particular region
            if((resultCPUs + serverCPU.num) <= cpuPerRegion) {
                //console.log(serverCPU.num);

                // Checks the hours required for particular region
                if((resultHours) <= (hourPerRegion)) {

                  // Checks the cost required for particular region
                  if(parseFloat(totalCost + serverCPU.value) <= parseFloat(pricePerRegion)) {
                     //console.log("LO");
                     totalCost = totalCost + serverCPU.value;
                     resultServers[serverCPU.type] = serverCPU.num;
                     resultCPUs += serverCPU.num;
                  }
                  resultHours++;
               }
            }
        });

        // Stores the Region, Cost and its Servers
        result.push({"region": serverRegion, "total_cost": totalCost,
        "servers": resultServers});
    });

    // Sorts the Server Results by Cost (total_cost)
    result = _.sortBy(result, (data) => {return data.total_cost});
    //console.log(serverTemp);
    result.forEach((data) => {
      data.total_cost = "$"+data.total_cost;
    });

    // Displays the Server Result Ordered by total_cost
    console.log(result);
}

module.exports = {
  getCosts: getCosts
}
