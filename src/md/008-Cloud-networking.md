---
slug: "/blog/Cloud-Networking"
date: "2020-09-18"
title: "Networks, subnets, and VPCs! Oh my!"
---


# What is a network (..and a subnet)? 

You're likely familiar with the basics of what a network is.  It's the connections between computers.  Most of us are familiar with the basic home network, where we get a connection from our service provider and feed that into a home router/wifi device.  Often, that device is set up to assign our home machines IP addresses (via something called "DHCP").  What's less obvious is that our home router also has an IP address assigned from the service provider.  External services like https://whatismyipaddress.com/ can show you yours.

The internet service provider has their own network, of which you are a small portion.  A sub-network (subnet for short).  And there are rules for how your devices talk to your service provider's network (and indeed the global internet).  The specifics of the rules aren't important here; suffice to say they exist in such a way that you, on your computer in your home, can Facetime with your grandparent in another state, on their network (that you probably helped them set up).  And most home networks are really similar.  They are separated physically by distance, but they are separaed on the network because the home router has a different IP address.  A fun note is that your computer and your the computer of your grandparent might have the same IP address -- that's super common.  The routers, however, will always differ.

# But, cloud?
In your home, its usually okay for most devices to talk with one another.  Hacking the router aside, a device has to be physically in range of your wifi or an ethernet cord to attack your network (as an aside: https://www.techspot.com/news/96321-drones-helped-hackers-penetrate-financial-firm-network-remotely.html the creativity of people getting close to devices is fascinating).  That's not the case on the cloud.  The default assumption is that your VM will be sharing the physical host with VMs of people you do not know.  So how do we avoid a huge mess?

## Subnets to the rescue!
Just like your ISP, your cloud provider runs it's own network, and will let you provision a small slice of it.  And just like your home network, when you boot up a virtual machine (vm from here on out), it'll get an IP address.  The google cloud will put that VM on what it calls your "default" network, which can be configured to attach to the internet.  So far, this looks a LOT like your home network, except the home router has been replaced by a google cloud abstraction. But things are mostly working the same.

## So why a VPC?
So now we have a bunch of small networks on the google cloud that look a lot like home networks.  What happens when one of them wants to talk to another?  That is the job of the router.  And if both subnets have public IPs, then things can route "over the internet" (in reality, such traffic won't leave Google's network) following the same rules as your facetiming home laptop.  But what if you don't want to expose one of your subnets to the internet?  Then the rules don't apply, and you need something else.

## VPCs are a grouping of subnets
A VPC is little more than an abstraction around a group of subnets that may (or may not) talk to one another.  "But like.. why? Just put all my stuff in one group.." you might ask.  Perhaps HR applications should not talk to sales applications.  Putting such things in different VPCs can help isolate them, as the networks will only be able to attach over the internet (and hopefully you have safeguards in place to prevent that, or don't attach them to the internet at all).

The other detail here is that VPCs encompass and control access between network resources.  So if some service provider is hosting something for you, you might get access to it by allowing connections to/from their VPC.  And this is exactly how Google exposes cloud SQL.

# Providing databases at scale
One of the big features of CloudSQL is that Google agrees to maintain the database for you.  You get some permissions, but they really hold the keys.  And to do that, they run it in their VPC (there are some other historical notes here about Google's early buy-in to "zero-trust networks" as opposed to the "walled gardens" I'm describing, but the "why" isn't as important as the "what" here).  This lets them manage huge fleets of cloud sql machines.  In the past, these were all managed with public IPs (ie, on the internet) with access controls.  That provided easy access from anything connected to the internet while maintaining safety.  But remember that use-case where I didn't want my subnet exposed to the internet?  If I don't have internet, how do I get to my database?

# Okay, so about those routing rules...
There are a couple of ways to join networks.  The home network case is the easiest: everything is identified by the router's external IP address.  When one of the computers makes an outbound connection, it is assigned a number (a "port"), and the router maintains some state to direct the connection's traffic to the original computer.  Inbound connections aren't allowed (well, out of scope for this writing).  But in the cloud, we don't want this extra layer.  We actually want to join the 2 sets of machines.  One of the simplest is "peering."  In peering, we configure a bridge so that everything on one network is visible to the other network.  So if you have a network that contains computer name "A", "B", and "C" and peer that to a network with computers "1", "2", and "3", then "A" can see "3" and vica versa.

This builds a combined network.  There are some limits.  Most notably, if you have 3 subnets, and peer subnet 1 to subnet 2, and subnet 2 to subnet 3, despite the above claim of being a "combined network", traffic cannot flow from subnet 1 to subnet 3 without additional rules.

```mermaid
flowchart LR
    Subnet1 --> Subnet2
    Subnet2 --> Subnet3
    Subnet1 -. this doesn't work without more rules --> Subnet3

```

https://medium.com/google-cloud/everything-you-always-wanted-to-know-about-vpc-peering-but-were-afraid-to-ask-2b26267ba7d9 has a good writeup if you want more details.

This structure is what lets Google manage CloudSQL databases in their management domain and you keep your VMs in your management domain.  And everything can talk.

# Wrapping up
VPCs: Because the cloud provider lets you determine what your network(s) look like.  For small use-cases, utility of the different abstractions is less relevant.  But as you scale into a large org with 100's or 1000's of VMs and want to really control who and what can connect to who and what, the flexibility becomes invaluable.