# FDM example

## Prerequisites 
You need [Node.js](https://nodejs.org/en/)

### Install dependencies
Run `npm install`

## How to use
The data model is found in the folder `simple`. The name of this folder should match the variable `space` in `index.js`, and also the space used in the data model files (see the files in `simple`). This should to be consistent across all files. Sorry for not automating this!

The data model is divided into three files (in the `simple` folder).
 - `storage.json` is the file describing the data model for the DMS (data model storage) API. See the [docs](https://pr-ark-codegen-1702.specs.preview.cogniteapp.com/v1.json.html#tag/Data-model-management) for syntax.
 - `apiSpec_v1.graphql` is the GraphQL API spec.
 - `manifest.json` defines the version of the API and the bindings between types in GraphQL and corresponding models in DMS. For this example, there is a one to one mapping between the names.

In the `storage.json` folder, you will see the `spaceExternalId` having the value `simple`. In the `manifest.json`, `simple` is also used in each binding as the space.