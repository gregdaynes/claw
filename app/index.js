#! /usr/bin/env node

/* Dependencies
 * ------------------------------------- */
const yml = require('js-yaml');
const fs = require('fs');
const request = require('request');

/* Get commandline arguments
 * ------------------------------------- */
const env = process.env.NODE_ENV || 'default';
const args = process.argv.slice(2);
const inputs = args.slice(1);

/* Setup configuration
 * ------------------------------------- */
const loadConfig = yml.safeLoad(fs.readFileSync('./config.yml', 'utf-8'));
const config = loadConfig[env];
config.endpointLocation = loadConfig['endpoint-location'];
const filePath = `${config.endpointLocation}/${args[0]}`;
let requestFile = fs.readFileSync(filePath, 'utf-8');

// console.log(config);
// console.log(requestFile);

/* Replace config vars in requestFile
 * ------------------------------------- */
requestFile = Object.keys(config).map(param => requestFile.replace(`{${param}}`, config[param]))[0];

/* Replace arguments in requestFile
 * ------------------------------------- */
inputs.forEach(input => {
    const index = inputs.indexOf(input) + 1;
    requestFile = requestFile.replace(`{{input-${index}}}`, input);
});

/* Replace file references in input file
 * ------------------------------------- */
const fileReferences = matchFileReferences(requestFile, /(?:\[)([a-zA-Z\-\.]+)(?:\])/g);

// chunk file references into group: filename | json path
const fileReferenceChunks = [];
if (!fileReferenceChunks.length % 2) {
    for (let i = 0; i < fileReferences.length; i += 2) {
        fileReferenceChunks.push(fileReferences.slice(i, i + 2));
    }
}

// each reference group should load file + json data.
fileReferenceChunks.map(file => {
    const referenceFilePath = `${config.endpointLocation}/${file[0]}`;
    const referenceFileContents = yml.safeLoad(fs.readFileSync(referenceFilePath, 'utf-8'));

    // find referenced property in external file
    const resource = file[1].split('.');
    const includedProperty = resource.reduce((acc, part) => {
        if (!acc) return acc;

        acc = acc[`${part}`];
        return acc;
    }, referenceFileContents);

    // replace property refrence with property content
    requestFile = requestFile.replace(`[${file[0]}][${file[1]}]`, includedProperty);
});


/* Make request
 * ------------------------------------- */
requestFile = yml.safeLoad(requestFile);

const params = {
    method: requestFile.method,
    uri: requestFile.endpoint,
    headers: requestFile.request.headers,
    body: requestFile.request.body.values || null,
    json: true,
};
request(params, (err, response, body) => {
    console.log(params);
    if (err) throw new Error(err);

    console.log(body);
});



function matchFileReferences(string, regex) {
    const matches = [];
    while (match = regex.exec(string)) {
        matches.push(match[1]);
    }
    return matches;
}
