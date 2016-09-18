CLAW: Command Line API Workflow
===============================

Easily consumable enpoint defintion files
probably yaml

easy to define properties

record output to same file

use specific output from one file for input on another

global configuration for project

multiple environments

take input params

command
-------

claw auth-login myname mysecret; // use default/development
NODE_ENV=production claw auth-login myname mysecret; // production test

config.yml
----------
development:
    host: http://0.0.0.0:3000

production:
    host: https://8.8.8.8

auth-login.yml
--------------
endpoint: {whatever-host-in-config}/api/auth
method: post
request:
    headers:
        Content-Type: application/json; charset=utf-8
    params:
        hello: world
    body:
        type: json
        values:
            username: {{input1}}
            password: {{input2}}

response:
    headers:
        Content-Type: application/json; charset=utf-8
    body:
        status: 200
        message: Logged in successfully
        data:
            id: 4
        token: abc123
        admin-token: xyz890

say-hello.yml
-------------
endpoint: {whatever-host-in-config}/api/greetings
method: get
request:
    headers:
        Content-Type: application/json; charset=utf-8
        x-access-token: [auth-login.yml][response.body.token]
response:
    headers:
        Content-Type: application/json; charset=utf-8
    body:
        status: 200
        message: Hello Greg!
