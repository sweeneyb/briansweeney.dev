---
slug: "/blog/ethernet-over-phone"
date: "2023-03-24"
title: "Wired Ethernet over 50 year old phone lines"
---
Just like software, our homes are made of components that occassionally need to be swapped out.  Air filters collect dust, rooves break down in the elements, and landline phone lines become forgotten tangles connecting weird wall blemishes.  In my case, 

# The Problem
I want my office to have wired ethernet.  Speed isn't so much the issue here (wifi is plenty fast these days).  I'd like my office traffic to be off wifi for both security and the reduced air time of an additional device (thus making wifi better for every other device -- and possibly my neighbors).  I also have a couple of gizmos and doo-dads that do better on wired connections (like a raspberry pi).  It'd just be nice to have a switch and a couple of ethernet ports.

# The starting point
There's a phone jack upstairs in the wall between a bedroom and an office.  The jack is in the bedroom side, but that's easy enough to turn around to the office side. It likely connects to a terminal block in the basement.  That block **|||insert picture|||** seems to bond all the phone lines in the house by wrapping them around some metal.  While it's definitely not ideal, this is actually the idea behind a networking "hub."  You can't really find them anymore, but the idea was that it could be a passive component that electrically shorted the pins from each wire together.  Easy, but creates some problems in the networking.  More on that later.

It would have been fastes to splice onto the terminal block to test some connectivity, but phones and ethernet work on very different voltages.  The last thing I want to do is fry a computer when everything was working, so I wanted to make sure the exterior phone connections were disconnected.  There wasn't voltage on the lines, but I'd still want to disconnect the inbound line.  Unfortunately, there is a mess of wiring where the phone line comes in from the exterior, and it's instantly lost in the mix.  Best to just disconnect everything and find the run I need.

# The plan
Disconnect everything off the terminal block to star.  Separate all the wires (or clip them shorter).  We'll start by trying to find where each line goes.  

Start by putting a keystone jack (RJ-45) on one of the lines. If possible, you'll want to follow the T-568B wiring (not the T-568A). But I only had 6 wires. And you're not guaranteed to have the right colors.  It turns out, none of that matters if you're consistent with the wires.  Orange on one side should be the same pin as orange on the other side. You're going to need at least pins 1, 2, 3, and 6. If you have a broken or no pair, that should be on pins 7 and 8.  Then, insert the phone tester line (which should fit into the middle of the female jack, but have space on each end), and turn it on. Go through your house with the other end of the tester, plugging into each jack.  Testing?  If so, mark it.  Note you'll want to test all jacks.  Old phone line was often daisy-chained, not "home run" wired. 

Once I find the wire connected to the other end of the jack in the bedroom, I'm going to replace that phone jack with a ethernet keystone jack (RJ-45's if you're looking to by a pack).  Terminate it, retest.  

Now, remember how phone wire can be daisy chained?  This was the case in the bedroom.  The wires weren't even disconnected, just stripped in the middle and screwed down to the jack.  I had no idea where the other wire ran, but I don't care at the moment.  I ended up snipping that.  I'll might try to find the other end later, but I knew where I could get a line into my office.  That was enough.  

