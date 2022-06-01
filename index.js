import fetch from 'node-fetch'
import fs from 'fs';

// const baseUrl = 'https://westeurope-1.cognitedata.com';
const baseUrl = 'https://greenfield.cognitedata.com';
const cdfToken = process.env.CDF_TOKEN;
// const project = 'integral-develop';
const project = 'schema-test';
const projectUrl = `${baseUrl}/api/v1/projects/${project}`;
const space = 'cfihos20'
const debug = false

run();

async function run() {
  let models = JSON.parse(fs.readFileSync(space + '/storage.json', { encoding: "utf-8" }).toString())
  models = models['items']
  
  const spaceResponse = await applySpace(space)
  console.log(spaceResponse)
  const modelsResponse = await applyDataModels(space, models)
  console.log(modelsResponse)
  const api = await deployAPIs()
  console.log("response: ", api)
  const ingestResponse = await ingestData()
  console.log('ingestResponse, ', ingestResponse)
}

async function POST(url, body) {
  if (debug) {
    console.log("POST ", url)
    console.log("body ", body)
  }
  return await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cdfToken}`,
      'cdf-version': 'alpha',
    }
  }).then(res => res.json());
}

async function applySpace(space) {
  return await POST(`${projectUrl}/datamodelstorage/spaces`, {
    items: [
      { externalId: space }
    ]
  })
}

async function deleteDataModels(space, models) {
  return await POST(`${projectUrl}/datamodelstorage/models/delete`, {
    'spaceExternalId': space,
    'items': models.map(model => ({'externalId': model.externalId}))
  })
}

async function applyDataModels(space, models) {
  return await POST(`${projectUrl}/datamodelstorage/models`, {
    'spaceExternalId': space,
    'items': models
  })
}

async function deployAPIs() {
  const manifest = JSON.parse(fs.readFileSync(space + '/manifest.json').toString('utf-8'));
  console.log(JSON.stringify(await updateApis([manifest.api])));

  const apiVersions = manifest.api.versions.map(apiVersion => {
    return {
      version: apiVersion.version,
      apiExternalId: manifest.api.externalId,
      graphQl: fs.readFileSync(space + '/' + apiVersion.source).toString('utf-8'),
      bindings: apiVersion.bindings,
    };
  });

  console.log(JSON.stringify(await updateApiVersions(apiVersions)));
}

async function ingestData() {
  const data = JSON.parse(fs.readFileSync(space + '/data.json').toString('utf-8'))
  Object.keys(data).forEach(async key => {
    const d = data[key]
    console.log("Ingesting ", key)
    const response = await POST(`${projectUrl}/datamodelstorage/nodes`, d)
    console.log('response', response)
  })
  // return await Promise.all(Object.values(data).map(d => d => POST(`${projectUrl}/datamodelstorage/nodes`, d)))
}

async function updateApis(apis) {
  return runQuery({
    query:
      `
      mutation upsertApi($apis: [ApiCreate!]!) {
        upsertApis(apis: $apis) {
          externalId
          name
        }
      }
    `,
    variables: {
      apis: apis.map(api => ({ ...api })).map(api => {
        delete api.versions;
        if (!api.name) {
          return { ...api, name: api.externalId };
        } else {
          return api;
        }
      })
    }
  });
}

async function updateApiVersions(apiVersions) {
  return Promise.all(apiVersions.map(apiVersion => updateApiVersion(apiVersion)));
}

async function updateApiVersion(apiVersion) {
  return runQuery({
    query:
      `
      mutation upsertApiVersion($apiVersion: ApiVersionFromGraphQl!) {
        upsertApiVersionFromGraphQl(apiVersion: $apiVersion) {
          version
          dataModel {
            types {
              name
            }
          }
        }
      }
    `,
    variables: {
      apiVersion
    }
  });
}

async function runQuery(queryBody) {
  console.log("running query ", queryBody)
  return fetch(`${projectUrl}/schema/graphql`, {
    method: 'POST',
    body: JSON.stringify(queryBody),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cdfToken}`,
    }
  }).then(res => res.json()).then(res => {
    if (res.errors) {
      console.error(JSON.stringify(res.errors));
    }
    return res;
  });
}