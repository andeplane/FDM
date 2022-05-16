# Flexible Data Model (FDM) workshop
This repository tries to document how to use the current state of our new Flexible Data Model capabilities. First a big disclaimer:

We have created the basic building blocks and not focused on the end 2 end user experience yet. This means that in this car, you have to control the steering of both front wheels (separately), and manually adjust the nozzle as we have not installed a gas pedal yet. There are no windows and the doors may fall off during driving.

However, you are the first ones trying this service out, so you should feel special! 

Is that ok? Alright, let's move forward.

### Prerequisite
To access these APIs, you need a token for authentication. We have a small Python script to fetch this token. So therefore, you need to be able to run Python in a terminal. To abstract away some the API calls, we are using a cli tool for this. In addition, one of the APIs is not covered using the cli, so we have a couple of convenience scripts that we run using Node.js

## Python 3 and Node.js
You will need to have installed Python and Node.js (choose version 16).
Guide on how to install Node.js: https://nodejs.org/en/

## Install dependencies
Just run `npm install` in this directory.

## CDF cli
In addition, let's install the CDF cli tool
`npm install -g npm install @cognite/cdf-cli`
You will have to authenticate by running
`cdf login power-ops-staging --tenant="431fcc8b-74b8-4171-b7c9-e6fab253913b" --cluster=bluefield --client-id="140df241-50bf-4c16-a965-6fd4e5b87958"`

# How to create a data model
### Apply storage
The storage is the database. The file containing the storage data model is found in `datamodel/storage.json`. To apply it into DMS (data model storage), run this command:
`CDF_TOKEN=$(python3 login.py) node ./apply_storage/index.js`

API docs: https://pr-ark-codegen-1646.specs.preview.cogniteapp.com/v1.json.html#tag/Data-model-management

### Create API
To create an API (a GraphQL end point), we can run this:
`cdf solutions api create --externalId="demo-api" --description="Demo API"`

### Deploy API version
A deployed API has the /graphql end point and is binded to the data in the DMS API. 
`cdf solutions api versions publish --externalId="demo-api" --apiVersion=1 --bindings=./datamodel/bindings.json --file=./datamodel/schema.graphql`

# How to populate the data model
First ingest data into RAW. Go to https://fusion.cognite.com/power-ops-staging/raw?env=bluefield to create a RAW database.
Then look at `ingest_raw/index.js` (modify if you want to) and run
`CDF_TOKEN=$(python3 login.py) node ./ingest_raw/index.js`

Move data from RAW into FDM:
https://fusion.cognite.com/power-ops-staging/transformations?env=bluefield
Go into transformations and choose `Destination type = Data Model Instances` and pick your model
(Azure AD tenant for login: poweropsdev.onmicrosoft.com)

Example query:
`select double(levelHighestRegulated), double(levelLowestRegulated), double(capacity), key as externalId from fdm_demo.HydroPowerReservoir`

# How to query the data using GraphQL API
https://graphiql-online.com/graphiql
https://bluefield.cognitedata.com/api/v1/projects/power-ops-staging/schema/api/demo-api/1/graphql
Add header `Authorization: Bearer XYZ`