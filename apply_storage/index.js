import fetch from 'node-fetch';
import { readFileSync } from 'fs';

const baseUrl = 'https://bluefield.cognitedata.com';
const cdfToken = process.env.CDF_TOKEN;
const project = 'power-ops-staging';
const projectUrl = `${baseUrl}/api/v1/projects/${project}`;

const models = readFileSync('./datamodel/storage.json', { encoding: "utf-8" }).toString();

(async function apply() {
  await applyDataModels(models).then(d => console.log(JSON.stringify(d, null, 2)));
  console.log("Successfully applied storage model.");
})();

async function applyDataModels(models) {
  return await fetch(`${projectUrl}/datamodelstorage/definitions/apply`, {
    method: 'POST',
    body: models,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cdfToken}`,
      'cdf-version': 'alpha',
    }
  }).then(res => res.json());
}

