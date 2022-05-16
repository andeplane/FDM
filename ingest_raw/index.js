import fetch from 'node-fetch';

const baseUrl = 'https://bluefield.cognitedata.com';
const cdfToken = process.env.CDF_TOKEN;
const project = 'power-ops-staging';
const projectUrl = `${baseUrl}/api/v1/projects/${project}`;

let powerplants = [
  {
    "key": "powerplant1",
    "columns": {
      "outletLevel": 1.0,
      "mainLossFactor": 2.0,
      "flowsTo": "reservoir1"
    }
  },
  {
    "key": "powerplant2",
    "columns": {
      "outletLevel": 2.0,
      "mainLossFactor": 10.0,
      "flowsTo": "reservoir2"
    }
  }
]

let reservoirs = [
  {
    "key": "reservoir1",
    "columns": {
      "levelHighestRegulated": 10.0,
      "levelLowestRegulated": 1.0,
      "capacity": 1.0,
      "flowsTo": "powerplant1"
    }
  },
  {
    "key": "reservoir2",
    "columns": {
      "levelHighestRegulated": 10.0,
      "levelLowestRegulated": 5.0,
      "capacity": 3.0,
      "flowsTo": "powerplant2"
    }
  }
]

async function ingest() {
  await writeRows('fdm_demo', 'HydroPowerPlant', powerplants);
  console.log("Successfully upserted power plants");
  await writeRows('fdm_demo', 'HydroPowerReservoir', reservoirs);
  console.log("Successfully upserted reservoirs");
}

async function writeRows(db, table, data) {
  return await fetch(`${projectUrl}/raw/dbs/${db}/tables/${table}/rows`, {
    method: 'POST',
    body: JSON.stringify({ items: data }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cdfToken}`,
    }
  }).then(res => res.json());
}

ingest()