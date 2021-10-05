---
slug: "/blog/container-basics"
date: "2021-07-05"
title: "A Few Container Basics"
---

I'd like to start by saying I am no expert on containers.  I use them, I build them, I encourage their adoption. But a lot of really smart did a lot of really great work to make them so useful.  I'm going to try and share a few things about them, though there will be a lot of depth I skip over.  That said, let's dive in.

## What is a container? 

Docker provides a concise definition: "A container is a standard unit of software that packages up code and all its dependencies so the application runs quickly and reliably from one computing environment to another." [Source](https://www.docker.com/resources/what-container) You may have heard of images.  Docker goes on: "Container images become containers at runtime."

## Okay, that was really formal.  What?

Containers are really good at packaging and distruting an application (or component of an application) so that it can run in different places using different tools.  They present a single, predictable interface.  Usually, the person creating the container only needs to think about whether your app needs to listen on a network port, files that might be read in or written out, and maybe some environment variables to pass in. And once built an image is built, they're immutable.  The simplicity has benefits. Images can be passed among teammates, across teams, or across organizations.  All with fairly consistent rules about how they're invoked and run.  

The reliability and ease of that is useful as a single developer, but it really comes into its own when one team develops an image and another team operates it.  By sticking to norms and best practices, the operations team can launch, scale, and recover from failures without involving the development team.  Teams can also run multiple versions of the software on the same host.  Or easily swap between versions of the software.

## But what really IS an image?  And what does it mean to launch a container?

For all the big buildup, an image is just an ordered set of file sets and a bit of metadata. I say a "set of file sets" because things are built up in layers.  A layer might be the files representing an OS package, several packages, or code from an app dev team.  And the "ordered" part is important as the layers are merged to present a "normal" looking filesystem, starting from the base layer merged up through the top layer.  This has some intereting/important side-effects.  Because things are broken up, they can be transmitted in pieces (and in parallel).  The system can also know enough about what didn't change to share pieces and not re-download them.  We'll looks more into that a bit later when we talk about a few practices for building images.

Starting a container is where the magic happens.  The file system layers are merged, the networks and volumes are attached, environment variables passed in, and a process is started.  There is a lot of nuance in all that.  But at a high level, you can think of it as single command (in docker, it's defined by a combination of entrypoint and cmd fields), running on a very lightweight machine defined by how you build your Dockerfile.  And that process is mostly isolated from the world, aside from the volumes and network attachments you specified (.. mostly.  As you learn more, look into how to break out of containers and how to prevent that. It's a big thing).

## So what?  I launched a process in a really complicated way

Yes, this is a single process. It would have been easier to launch it.  But there's a lot of power in the abstracton.

### Case 1: Scaling
Say you've packaged your web server into one of these images.  And then your website makes the front page of Reddit and starts getting more traffic than it can handle.  There's no time to build another machine, copy all your files, configure the server and launch it.  But fortunately, you've already done that.  It's in your image already.  You can provision another server and tell it to launch a container from your image (hopefully you've got the network components in place already).  You've added capacity in the time it takes the machine to boot, pull your image, and start the server.  Better, it's common for this to happen automatically through the use of auto-scalers.  The system running the machines can watch the CPU usage of your container and, if it goes above some threshold, allocate a new one to cope with demand.  They'll power it off when the load subsides.

### Case 2: Variety
Agile has taken the software industry by storm.  Teams are empowered to select the languages and tools that work for them, but still rely on some common tools for some tasks.  I worked in a company where builds were managed by a central team that supported several versions of java and golang.  I needed a feature from a newer version of golang, but the team didn't have the capacity to add support.  I could have made the feature enhancement for the language version.  But instead, I added support for generic images to be used as builders.  That let all teams bring their own images for any language/version they needed.  Teams got more agility and the central team because less of a burden and could work on more significant projects.

### Case 3: Reduce vulnerability management burden
Cyberattacks have been in the news almost every week this summer.  Keeping on top of patches is getting renewed focus.  With a traditional machine, upgrading is hard.  You have to make sure all depenencies work for everything on the box.  With a container image being dedicated to a single process, there are no overlapping dependencies. You can also get rid of of a lot, since you know the environment in which it'll run.  No need for wifi drivers or cron for a web server.  The image gets only the lines of code needed to run the process and no more.  That reduces the attack surface and makes taking security patches easier.  The ecosystem also has tooling to make rollout pretty seamless.

## I'm sold.  But how about a few tips to get started?

### Know your FROM
The first line in a Dockerfile is the "FROM" line.  It is the source for everything below your layers.  Know what it is, who built it, and (ideally) how it was built.  It will often be the source of security issues that need to be remediated.  It may already come with some startup commands or bake in things you don't need.  

### Build your layers with the least quickly changing first
Sytems that use images (ie, the Docker daemon), will try and re-use existing layers where possible.  But once there's a change in one of the layers, nothing above can be pulled from the cache (* I need to check this.. something doesn't feel right about how a layer is defined).  So, if you're building something like a java application, you'd want to put the JDK on first, then your dependencies, then your app code.  As you iterate on your code, you won't need to be messing with anything but the top layer with pushing & pulling.

### Don't embed secret material!
Everything is baked into the image.  So secrets will be available to anyone that can pull the image.  Be aware!  Don't leak your secrets!

### Other tips
Research semantic versioning.  Think about your tagging strategy.  Try some stuff out and make some mistakes. 

## Continued Reading
https://docs.docker.com/develop/dev-best-practices/
https://cloud.google.com/architecture/best-practices-for-building-containers
