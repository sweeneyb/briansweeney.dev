---
slug: "/blog/WebAPIs"
date: "2023-03-24"
title: "WebAPI fundamentals"
---

# What is a web API?
Spotify has a good overview at https://developer.spotify.com/documentation/web-api/.  If we look at the "tranfer-a-fungible-token" action of the wallet api of venly, we see that it's a POST request with a body: https://docs.venly.io/api/api-products/wallet-api/transfer-a-fungible-token.

https://developer.spotify.com/documentation/general/guides/authorization/ goes on to talk about authorization, which is hard.  Read it if you want, but people make careers out of it.  I'd suggest learn as you need to (but also, do enough reading to make sure you're being safe).

https://docs.venly.io/api/authentication/authentication is pretty standard as far as auth goes (the system is called "openid-connect" which is kind of like an extension to vanilla jwt's.).  Once you have a Bearer token, present that on the request, and the server knows who you are.  To get the token for simple for server-to-server communication is outlined on the above page, and it's what you'd use for testing.  In the spotify auth doc, and most everywhere else, this is the "client credentials" flow.  Don't do this from a browser or put it into your apps.  Danger.  It looks like Venly expects to be accessed from an environment you trust.

Once you have authenticated and have a token, then you can make calls.  Venly shares a postman collection that'll have several canned requests to do a couple of things.  That's probably a good place to start.

## Tools
1. Postman - the de facto standard, but falling a bit out of favor.  Great GUI tool for making requests
1. curl - The command line Swiss Army knife of making requests.  It can do it all, but it's CLI only, and cryptic.  

You'll see both in common usage.  They're roughly equivalent in what they do.  Which you use is preference and workflow, but starting with postman is probably a good idea.

# Exercises:
1. Get Venly wallets: https://documenter.getpostman.com/view/11995086/TzXwEdfX#74e240dc-fe92-40a7-aacc-575ff3761bab.  You should be able to run this multiple times without anything changing.
1. Get the balance of one of the above wallets.  https://documenter.getpostman.com/view/11995086/TzXwEdfX#2fc7faf7-5589-40d9-b1f9-73f565e7f2bf.  This requires you to use the above request to get a wallet and use that in the subsequent request to get the balance.
1. BONUS: Automatically get the balance for all wallets via some automation.  Postman has collections that can run (and substitute values).  If you prefer curl, wrap it in a bash script.  Or use python's "requests" library to make the API calls.  If you can automate this, I'm confident you'll understand how APIs work.
