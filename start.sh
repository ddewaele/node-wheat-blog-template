#!/bin/bash

# Invoke the Forever module to start the Github server hook.
./node_modules/forever/bin/forever \
start \
-al github-servicehook.log \
-ao github-servicehook-out.log \
-ae github-servicehook-err.log \
server/server.js

# Invoke the Forever module to start our blog.
./node_modules/forever/bin/forever \
start \
-al wheat-blog-forever.log \
-ao wheat-blog-out.log \
-ae wheat-blog-err.log \
server/server.js
