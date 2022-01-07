---
slug: "/blog/SRE-and-sump-pumps"
date: "2021-12-06"
title: "Of SRE and Sump Pumps"
---

I think a lot about how my job affects my life and vice versa.  The way I've been trained to approached problems professionally has left a mark on how I approach things personally, for better and for worse.  I think a therapist could write a tome on interpersonal conflict and code reviews, but I'll set that aside for today.  Today, it is my lowly sump pump that grabbed my attention.  And the overlap between this house's install of pumps and how I approach software reliability was striking.

## Inheriting other people's work
I did not design or install the sump pump/pit in this house.  Like so many other things in some state of operation, it was part of the systems of the house. And just like switching jobs, I became the maintainer when switching homes.  I have never been responsible for a sump pump or sump pit before.  I generally got all the parts.. pump, PVC, battery backup.  But I did not know how they fit together.  There's a check valve in there?  Okay.. that makes sense. Wouldn't have thought of that...

But it all seemed to work.  Great.  I'm happy that it works, I know I need to learn more, but there's no immediate need.

## Alerts
The best alerts are well tuned to grab your attention when needed, but not a second before.  And by attention, I don't mean "this needs to be fixed RIGHT NOW."  That gives you no time to be proactive.  Just like I don't want an alert when a disk is 100% full, my sump pump shouldn't be alerting when things are overflowing.  I'd like a bit of warning, thank you.  

"Grab" is important, too.  These days, we are inundated with notifications, emails and popups.  I get an alert when my cat sits in the litterbox too long (that's not a joke - and I absolutely love the litter robot. But the app notifications could use some tuning).  Had I gotten a notification on my phone, I may have put off addressing it.  But no, the alarm for this sump pump is a siren. And it is loud. Like a car alarm in the basement.  My wife and I didn't even know what it was when we heard it, but it was not to be ignored.  Some headphones and a bit of tracing toward the noise led me to exactly what was wrong: Too much water in the sump pit. The backup was running.

## Failure modes
I have to give the previous owner credit.  Being pretty low relative to the neighbors, and near a creek, he knew there was going to be a lot of water.  There's evidence that there's been about a full inch of water in the basement.  He designed this system to be reliable from unreliable parts.  And at the end of the day, that's what production engineering (and part of how I see SRE) is all about.  

Generally, one pump would be okay.  And judging from the salt crust from years in hard water, it had been okay for decades.  But we don't just design for the happy days.  The previous owner knew (perhaps from experience), that nothing fails at an opportune time.  And in this case, the pump wasn't going to fail when water wasnt' flowing into the sump pit.  So in addition to the submersible pump, there was a smaller pedistal pump. The pedistal pump was set with the floater a bit higher, so it normally wouldn't run.  But in the event the submersible was overwhelmed or died, the pedistal pump would spin up and remove water.  As an added protection, the pedistal pump was wired with an alarm to sound if it started running (from what I can tell, this is a general device that splits a hot electrical line and wails like no tomorrow if it sees current draw).  

And a hat tip to the alarm designers for having a conventient switch to turn the alarm off.  That would, seemingly, defeat the purpose of the device.  But being able to silence alarms for some amount of time is really important.  In many cases, I think it would be better to have a mechanical delay timer that automatically re-enables the alarm.  But in this case, it was nice to turn it off at 9pm (of course, everything broke as the hardware stores closed) and wait for morning.  This applies to software alarms, too.  The last thing you want to deal with while fixing a problem is a deluge of alerts giving no additional information.  Turn them off until things are fixed.

## Diagnosis
As I mentioned, I knew very little about sump pumps and pits.  Even when I identified the source of the alarm, it looked like everything was working.  It took a minute to think about what the previous person had intended by setting that alarm off.  