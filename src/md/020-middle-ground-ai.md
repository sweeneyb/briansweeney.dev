---
slug: "/blog/middle-ground-ai"
date: "2025-06-01"
title: "Middle Ground for AI"
---

LinkedIn seems to be awash in AI takes, and the posts on my feed tend to be wildly polarized.  They claim ether we're going to see the end of coding as a profession or that LLMs are are a fad with no substance behind it.  There's probably merit to both.  But how can seemingly opposed opinions both be "right"?  Like most complicated situations, the answer likely lies in the middle of extremes.

In this post, I want to think about some of the problems the "sky is falling" camp is warning us of.  How does the profession deal with reduced hiring, reduce need for early-career people, and less time to master the craft?  I also want to address the "nothing to see here" camp and the issues around correctness, energy use, and the proliferation of "vibe coding" garbage. Finally, I'm hoping we can put forward some middle-of-the-road thoughts to guide our adoption.

## Let's dispell the extreme positions.
### AI will take all the jobs
The big fear post is that AI will take over a large swath of programming jobs.  Specifically, it's going to be able to do things tradionally assigned to early career people, and creating a dearth of skills in the future.

My opinion is that we didn't need LLMs for that.  The "shift left" mentality, fully embraced by the development community, was already doing that.  A dev team used to have some people specializing on builds and entire other teams dedicated to the deployment and operations.  Firewalls were a whole other team.  DevOps and hyperscale cloud vendors both contributed to the collapse of all of those responsibilities onto generalist developers, albeit in (usually) high-code environments.  

I started my career as an intern specifically focused on automated builds (ant and, at the time, ivy).  And that was a great focus at the time.  But, I understood that my value as an intern was reducing toil for the team and platform.  And it was DevX before it got a name.  Several years ago, I was fortunate enough to run an internship program developin a full stack feature where we spent about a week on the build and integration pipelines.  Were any of those people less useful to the industry because builds got easier?  Just the opposite: by not focusing on the toil, they were able to deliver an actual feature, delivered to real customers, within the summer.

### AI is a nothingburger
My short take here is that LLMs are clearly not useless.  While I'm a skeptic of valuations as a proxy for value generated or utility, they are undeniably high, and I'd be misguided to think that many smart people are *so* incredibly wrong.  There's also my anecdotal evidence where LLMs are pretty good at generating python comprehensions for me.  Or giving me a few ways to parse arguments in python.  It's actually really good at feeding me information that I used to a) spend a lot of time discovering or b) relying on social networks or early-career folks to learn.  That's all valuable to me, but **at what price?**


## Take a step back.  What is the "programming" career?
I have begun to think of my career track as, "business process automation engineer with a specialty in software."  It's important that we recognize what we're programming is a business process.  It should add value to somebody's life.  And the business processes I focus on are processes where software out-leverages humans.  Traditionally, those have been repetitive tasks where computer are cheaper and/or more consistent.  

We see the tension in the Amazon warehouse.  Traditional warehouses have people driving forklifts to pick items.  My understanding of Amazon warehouses now is that a lot of bins are brought to people via robots for item picking.  Robots far exceed humans in gross movement and minimizing paths.  Humans far exceed robots (for now) in dexterity. But that line moves as humans get more expensive and complicated robots get cheaper.  The symbiosis is a function of price.

## So how do we approach LLM use?
We're still in early days of the hype cycle as the tech and integrations develop.  RAG allowed more (and more accurate) context to be evaluated.  Agents (which is a buzzword for "calling an api") are providing really compelling interfaces to get things done. And the princing is in early days, too. My searches suggest LLM token prices need to increase 10x-20x before the AI businesses break even.  

So now is a great time to expirment. See where you get value.  But be conscious of the actual value.  Was it better than a stack overflow search?  The answer may depend of where you are in your career.  

## What does this mean for early-career people or CS students?
Computer Science was never a vocational degree.  It teaches you about computers. What they can do, what they can't, and how they work.  That can be related to the work in the software industry, but there are a lot of really successful people that don't have CS degrees and just build great software.  

For early career folk, my suggestion would be to recalibrate how we teach them.  Have LLMs review your syntax and offer approaches to decoupling or problem deconstruction.  Teach people to ask about more edge cases.