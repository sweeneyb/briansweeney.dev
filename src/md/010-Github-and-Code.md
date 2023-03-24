---
slug: "/blog/Github-and-Code"
date: "2023-03-24"
title: "The Repair of a smart light"
---

What is this whole Github thing?  I'd encourage you to start at https://blog.hubspot.com/website/what-is-github-used-for.  It has a great rundown of what "git" is, how it relates to "github" and how both are useful for sharing and collaboration.

The code for this site is hosted on github.  In fact, you might be reading this on github.  Why do I use it?  It saves my history in case my computer or site goes down.  It's a sort of time machine and backup.  It also makes it easy for me to pull a copy to a new place & make edits.  And if other people can learn from this, great!

## Using other people's code
So now that we know github has a ton of code, and we have a task, can we make us of github to solve our problem?  The answer is a solid maybe.  

Ready to run code tends to be in the "releases" section of a repo.  For example, you can download "jq" (a tool to manipulate json files) from https://github.com/stedolan/jq/releases.  

Other code may be informational.  https://github.com/sweeneyb/envoy-proxy-nginx for instance isn't really ready to run, and requires some setup first.  It's more to have as notes on how to configure different tools.

Libraries are also common.  You might use "mocha" as a testing framework in javascript (https://github.com/mochajs/mocha).  But you don't really grab mocha from github, you use NPM (the node package manager) because that's the standard in the javascript/node ecosystem. It's at https://www.npmjs.com/package/mocha. 

So how to "use" code from github can vary.  While it holds the source code, the useful bits are generally available through the your tool's ecosystem.  

### A note on licenses.  
If you are going to use code, make sure it's licensed.  You'll likely never own the copyrights/IP of code (unless you produce it while not working for a company), so you need to make sure that IP is available for your use.  Apache, ISC, BSD, and MIT licenses generally let you do what you want.  GPL and LGPL have more restrictions.  Code without a license is legally hazzardous to use.  I'm not a lawyer, so I'm going to stop here.  Read, understand, and abide by the licenses you use.

## Exercises:
Want to make sure you understand what github is all about?  
1. Fork https://github.com/sweeneyb/devEnvs.
1. Clone it (or your fork)
1. add a file and push it to your fork.
1. Have a friend fork https://github.com/sweeneyb/devEnvs, and open a merge request to have your newly added file appear in their repo without affecting the original repo.