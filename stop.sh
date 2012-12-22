#!/bin/sh

# Stop Utopia server node
kill $(ps aux | grep '[h]p.js' | awk '{print $2}')