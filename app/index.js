#! /usr/bin/env node

/* Dependencies
 * ------------------------------------- */
const yml = require('js-yaml');
const fs = require('fs');

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
console.log(fileReferences);

// console.log(yml.safeLoad(requestFile));













function matchFileReferences(string, regex) {
    const matches = [];
    while (match = regex.exec(string)) {
        matches.push(match[1]);
    }
    return matches;
}
