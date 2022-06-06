---
slug: "/blog/software-from-scratch"
date: "2022-05-29"
title: "Software from scratch"
---

Somebody recently asked me, "What devops pitfalls should I be aware of when building out software that will be tools for scientists to use?"  .. and I didn't know where to begin.  The field is huge.  From the structure of the code, to the build/deliver pipelines, security, and data governance, there's a lot to think about.  So in order to get around analysis paralysis, let's start small, build up, and chart a course.

# Context
The software in question will be a tool for neuroscientists to crunch data and build new models.  There is an existing tool, coded in python, that has some interesting features, but nobody likes or uses it.  Developing novel techniques is the real goal (and one I'm definitely not qualified to weigh in on), but packaging it in a way people can, and want, to use is also a priority.

# Approach
Before we get to the ops portions, we need to bootstrap development.  Getting the ball rolling is a critical step to developing the new models, getting a product in users' hands, and assessing the viability of the project.  

And we will fail. The goal in the early stages is not to "get it right" or plan an architecture that will satisfy the users. We want to keep the design modular so that a) we can pivot with minimal refactoring and b) we can separate components in case this becomes a team project.

## Prior art
https://www.dominodatalab.com/data-science-dictionary/pyspark is worth a read. A TON of engineering effort has gone into spark, and it can scale out massively.  The interface is for developers, which is a pro and a con.  You're writing your own code, so you can develop novel techniques.  But it requires coding knowledge and a spark cluster.

Fortunately, running spark is pretty easy these days.  Google has a managed offering called Dataproc (https://cloud.google.com/dataproc/).  Amazon also seems to have a managed instance (https://aws.amazon.com/emr/features/spark/).  If you want to run on your machine, Bitnami has a docker-compose file (https://github.com/bitnami/bitnami-docker-spark/blob/master/docker-compose.yml) that sets up a minimal spark cluster.

# Code
## Starting the code -- Structure
The core feature of this application will be the data processing in novel ways.  The application should be structured around that processing, allowing work to be done locally or on remote resources.  If it could be structured to support local functions or spark routines, that would be great.  How those data processing functions should be uniform, so that the user doesn't see a difference.  

If we go with the assumption that some processing may occur over a network, we should adopt an async model for processing.  It'll just make things easier in the future when we won't know if crunching the numbers will take 2 seconds or 20 minutes.

## Starting the code -- A contrived example
For the purposes of having something concrete, let's build a silly math application.  We'll build a couple of functions to do things like add, multiply, and calculate square roots of items in CSV files. 

### First executions
Because we don't know if this will be a webapp or desktop GUI tool, let's start with a simple command line interface.  Maybe something like

```pyMath add -f numbers.csv```

```pyMath sqrt -f numbers.csv```

Which would load the "add" function, taking a file "numbers.csv" as an argument.  

It's relatively easy to see how we could turn that into a GUI where an "add" button prompts the user with a file selector, then runs the operation.  

We could also turn this into a web app where POST calls to http://&lt;domain&gt;/add call the same function.  This has typically implemented via a form upload button in a browser.

### Output format
How we return data is going to be important to think about.  The sum of all numbers in a CSV is going result in 1 number, whereas getting the square root of each number in a CSV will result in the same number of elements as the original file.  Again, this is where Spark is a good example.  It has a language for defining the schemas, so it can tell if transformations can't be passed into one another.  This will be important if we ever define flows where one stage's output is the input to another stage.

## Building features

At this point, we have a loose framework in which to build useful functions.  The UI is abstracted away, the I/O format is abstracted.  Time to focus on business logic.  This is where domain expertise comes in.  And because you're closer to the problem, you'll know it better than I.  While coding this layer, keep in mind your SOLID principles (https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design).  DRY gets a lot of attention, but I think WET principles (https://dev.to/wuz/stop-trying-to-be-so-dry-instead-write-everything-twice-wet-5g33) have a lot of legs.  And listen to your users.  Also, be thinking of what you need to do to divide this processing over multiple cores or multiple network nodes (can it be parallelized? how much thread cross-talk is there? are operations idempotent on their operands?).  Build good tests that operate on the components, but don't make assumptions about what happens in the component.  Use the SOLID's 'D' to make your testing easy.

## Is it useful?
Talk with users.  Maybe you're a user yourself.  What gets used?  Which functions do people love/hate?  Do you need to pivot from a desktop GUI to a webapp.  Do you need both?  Pivot.

# Build/Operations
* Builds should be automated
    * Tests should run in these automated builds
* Decide on a continuous integration tool to run your builds.  Bonus if you also do continuous deployment.
* Have multiple environments to test and verify changes/integrations.  Bonus points if they're ephemeral.
* Decide on a branch strategy.  Trunk based or branch based development.  You probably don't need the bells and whistles of "git flow" until your supporting multiple tennants.  It's more complicated than you want.
* Write a readme (and test it) to make sure people can clone your code, make a change, and build it.
* Decide how your modules relate, and how you want to structure your dependencies.  How to submodules trigger builds in parent modules?
* What needs to pass for you to consider something a "good" release?

If you're operating this as a webapp, or publishing an application as something like an RPM:
* Who/what decides something is a new release?
* How does it get promoted to production/pushed out to prod repos?
* How is data managed?
* What sort of telemetry do you need from the application to make sure 
    * it is used
    * What features/parts are used
    * It hasn't crashed

Observability tools are typically added late in a product cycle, but they're super important when people start expecting your application to be up all the time. Google shared how they do it at https://sre.google/sre-book/table-of-contents/.  But you are not Google.  Take the lessons (like eliminating toil), but perhaps don't implement the same systems (as you likely won't need automation to coordinate cross-team incident responses for quite some time).  

# The most important part - People
Building a good team is hard, and I definitely have less experience building teams than building software.  However, from my limited experience, it's important to have somebody that truely knows the domain.  It's also important to have somebody that knows the primary language really well (and the frameworks you'll be using moderately well).  Beyond that, perserverance, curiousity, and a team orientation are the primary attributes.  Yes, some technical ability is required, but people can learn/improve their knowledge of a language, framework, or domain (especially with access to knowledgable people).  Setting such people up in a psychologically safe environment where they can give honsest feedback about what is, and more importantly *isn't*, working well will set the team up to build, learn, and discard process that isn't working.  


