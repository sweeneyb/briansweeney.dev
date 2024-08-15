---
slug: "/blog/tailscale-home-services"
date: "2024-07-03"
title: "Access your home from anywhere with Tailscale"
---

In this post, we're going to explore setting up a VPN.  The marketing around VPNs is a bit odd, and the sales pitch doesn't match my use case.  So let's dive in, set up the problem, explore why we want a VPN, and get into some implementation details.

A quick note on affiliation: I'm going to mention for-profit companies and products. I'm not affiliated or get payment from any of them. I use some, and don't use others. 

# The problem
We're becoming increasingly reliant and dependant on our tech tools.  And increasingly concerned that the companies to which we entrust our usage aren't as price or privacy focused as we'd like.  Self-hosting from a basement has never been easier, and is sometimes necessary.  But what do I do if I'm out of wifi range, or forgot to load the files I need?  How to I connect to that computer in my basement (hereafter, Basement DataCenter or BasementDC)?

## In the past..
In the past, when the internet was a bit less scary, I'd say forward a port.  Protect it, have reasonable authentication and authorization, and only expose what you need.  However, that likely means maintaining SSL/TLS certs, proxies for services, and external monitoring for open ports you don't expect.  Doable (Let's Encrypt, Nginx Proxy Manager, and shodan.io, respectively will address those concerns), but that's a lot.  Also, you're trusting a lot of devices and software in that chain.  It's a lot of upkeep, and as somebody that deals in those things daily, not worth the effort for home.

## A more modern solution
Let's say I have something running or available in my basement.  It might be the ability to log into a machine; it might be a database.  In my case, I'm a little privacy minded and didn't want to go full-in on Ring cameras. I have a generic camera and have [Frigate](https://frigate.video/) running to monitor the feral cat passers-by in my yard.  Because cat detection is done via a USB dongle ([Coral.ai](https://coral.ai/) is really awesome - definitely check it out), this *has* to run in my house.  So how do I check the events without exposing my camera to the internet?

Enter [Tailscale](https://tailscale.com/).  Tailscale advertises as a point-to-point VPN that will mesh together your devices how you think it should be done, getting the speeds you think you should get.  With devices registered to tailscale, they'll be able to talk anywhere you get a network connection[^1].  So take your phone to Europe, and it can talk to the computer in the basement of your midwest farmhouse.

The differentiator that tailscale has over older VPN implementations is that they take care of the negotiation for you.  In the past, you needed a world-addressable machine and it was a pain to set up static tunnels.  And traffic would always go through that machine, so you'd get the performance of the worst link (typically the upload from your house if you're on cable or DSL).  With Tailscale, based on [Wireguard](https://www.wireguard.com/), you get point-to-point.  If you're in Europe, yes, you'll be subject to what your home connection upload is.  But if you're on the same wifi, it'll figure that out, and you'll see wifi speeds.

### But I can't install tailscale on XYZ
It'll be okay.  I'm running Frigate in a docker container, where I don't want to deal with configuring networking.  You can take the same approach for a camera, network printer, or database.

# How-to
Tailscale directions are really good.  I won't rewrite their doc here.  Go to [https://tailscale.com/download](https://tailscale.com/download) and get the client for your device(s).  If this is all of your devices, great. You're done.  But if you hit the "but I can't install on XYZ" above, let's address that.

## For less-supported devices
What you want is a router.  The doc for this is at [https://tailscale.com/kb/1019/subnets](https://tailscale.com/kb/1019/subnets).  I will make a few comments on the doc, as it assumes some networking knowledge.

There's a line where you need to tell tailscale which subnet to route.  
`sudo tailscale up --advertise-routes=192.168.0.0/24,192.168.1.0/24`

They don't go into what `192.168.0.0/24,192.168.1.0/24` means or where it comes from.  And getting this right is critical.

## What's your subnet?
I'm going to assume you know computers talk to each other through IP addresses, which look like 4 clusters of numbers less than 255 (ie, 1.1.1.1 or 192.168.1.1).  And, because you don't want to port-forward, you know that the router connected to your modem has an internet-addressable IP which is not the same as the IP of the machine in your basement.  We need to find what network that basement machine is on.  And I find the easiest way to do it is on the command line/terminal.

In windows, this is clicking the start menu, and typing (or run... and typing) "cmd".  This brings up a black box where you can type.  Type "ipconfig" and press enter.  Something will look like:
```
Ethernet adapter Ethernet 3:

   Connection-specific DNS Suffix  . : home
   IPv4 Address. . . . . . . . . . . : 192.168.1.111
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
```
You can use the table at [https://techlibrary.hpe.com/docs/otlink-wo/CIDR-Conversion-Table.html](https://techlibrary.hpe.com/docs/otlink-wo/CIDR-Conversion-Table.html) to convert the Subnet Mask to what's called "CIDR notation".  In my case, the mask is `255.255.255.0` which corresponds to a `/24`.  

Linux will be a bit more explicit with `ip a`:
```
5: br0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 72:8a:94:5c:be:18 brd ff:ff:ff:ff:ff:ff
    inet 192.168.3.184/24 brd 192.168.3.255 scope global dynamic br0
```
We can see `192.168.1.184/24`.  Since the /24 spans the last octet (or 8 bits/1 byte), it's equivalent to `192.168.1.0/24`.

On macos, the `ifconfig` command will have similar output.  If you want to use the GUI, Google is your friend.

## Check-in: Do you know your subnet?
At this point, you should be able to find something like `192.168.5.0/24` or `172.16.0.0/12` or `10.0.0.0/8`.  You likely only have one (if you have more, why are you reading my blog?).  I only have one.

That's what you give to the `--advertise` argument.  So:
```
sudo tailscale up --advertise-routes=192.168.0.0/24
sudo tailscale up --advertise-routes=10.0.0.0/8
sudo tailscale up --advertise-routes=172.16.0.0/12
```
are all reasonable.  

## Back to the process
[https://tailscale.com/kb/1019/subnets#enable-subnet-routes-from-the-admin-console](https://tailscale.com/kb/1019/subnets#enable-subnet-routes-from-the-admin-console) is where we left off.  You'll need to enable the subnets.  After that, if you're new to tailscale and don't have additional policies set up (or know what "additional policies" means), you're good!

# Test it.
At this point, it's time to take a walk with your phone.  Presumably you have something available in your house that wasn't previously available outside your home.  Before you leave, bring it up, with tailscale disconnected.  It should work.  Leave for a walk.. get out of wifi range.  Bring the same thing up on your phone. Watch it fail.  Then connect to the VPN.  Reload the page/service.  It should appear.

# Conclusion
You have a secure, no-holes-to-the-internet way of connecting back into your house.  Or, if your house is the cloud, you've implemented a low-trust archiceture that can possibly span clouds.  Have fun reducing your bill as you choose to self-host instead of pay cloud providers.  Just make sure you back up your data.  If it's not in 3 places, it's not safe.

# Thanks
If you're interested in this type of thing, check out https://2.5admins.com/.  I cannot speak highly enough of Jim at https://mercenarysysadmin.com/ 


[^1]: Okay, most everywhere.  Some nations, companies, or government entities will block VPN traffic... VPNs for privacy or subverting network controls are out of scope here.  But if you're in that situation, why are you reading my blog?
[^2]: For the curious, IPv4 addresses are 4 groups of 8 bits.  The number at the end of the CIDR are the bits that identify the network.  The remaining bits identify the host on the network.  In the case above, there are ~255 available addresses on the subnet.