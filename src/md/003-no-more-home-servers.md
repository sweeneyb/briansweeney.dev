---
slug: "/blog/no-new-home-servers"
date: "2022-01-06"
title: "I'm never buying a home server again"
---

I'm done.  It happened slowly, then suddenly.  It used to be the case that to do little experiements with a new language, or weird packages, I needed a home server.  Not anymore. They're expensive. I have to maintain/reboot them. They're pets. I have to blow holes in my home firewall. Cloud IaaS is where it's at for personal development.

# How much cpu do you *really* need?
My learner projects are small.  Vue code can be built cheaply and served via firebase.  Any ML model I come up with is more storage-intensive than compute intense (even in the training phase.. I'm an ML dummy).  Most of my learning is going from 0-60 in a particular (web) technology.  Requests are low, data volume is small, processing is minimal.  Even a reasonable laptop, it's going to work while I'm doing other things.  So let's say 2 cores.  

A GCP "e2-standard-2" (as of jan 6, 2022) is 0.067006 per hour, or 0.067006*24*365 = $587/year.  That's not a small amount of cash.  Say I run that machine for 2 years, and I can build a ~$1200 rig.  Recycling the case/power supply (if I can), that's not too bad.  Until we factor in the power-off.

How often am I doing these experiments?  Let's say weekends.  Honestly it's more often nights, but the occassional saturday works its way in.  So let's use the approximation that 5 out of 7 days, things can be powered down.  That drops the yearly bill to $168.  Which is leaving the territory of "something I need to think a lot about saving for" and getting towards "I should eat out one fewer time this month."

## But getting an instance spun up in the cloud is hard!
It's not. I've done the work for you, if you are a java/node/docker developer.  https://github.com/sweeneyb/devEnvs  Assuming you have terraform 1.0+ installed on your local machine and a GCP account with billing account (and a credit card attached), a "terraform apply" will spin up a VM, provision a new ssh key, and give you the IP to log into.  

Then you're free to clone a repo.  I suggest https://github.com/sweeneyb/fullstackStomp and sending me PR's that fix the vulnerabilities!  

## Wait.. that was fast. Let's walk through this.
That's fair.  I went from an economic argumentment to "this is easier" without going through the magic.  Let's do the devops soup-to-nuts.

### I want a VM
https://github.com/sweeneyb/devEnvs/blob/main/java-node-docker/main.tf#L59 defines the VM within GCP:
```
resource "google_compute_instance" "vm" {
  name         = "dev-machine"
  project = google_project.dev-project.project_id
  machine_type = "e2-standard-2"
  zone         = "us-east1-b"


  boot_disk {
    initialize_params {
      type  = "pd-standard"
      image = "projects/ubuntu-os-cloud/global/images/family/ubuntu-2004-lts"
      size  = var.boot_disk_size
    }
  }

  network_interface {
    network = "default"
    access_config {
      // Ephemeral IP
    }
  }

  metadata = {
    user-data                 = data.template_file.cloud-config.rendered
    #google-logging-enabled    = true
    #google-monitoring-enabled = true
  }

  depends_on = [
    google_project_service.compute_api
  ]
}
```

```project = google_project.dev-project.project_id``` links back to the project, which is also dynamically provisioned via terraform.  The goal is that a "terraform destroy" will guarantee you're no longer billed. So we're setting up a new project within your billing account.  If you're not sure what that means, no worries.  But make sure you read until the "terraform destroy" at the end when this all gets cleaned up.  No surprise charges.

A few other notes:
```
  machine_type = "e2-standard-2"
  zone         = "us-east1-b"
```
The machine type is the size of your machine (2 cpus and 8GB of ram).  The zone is where the server will be.  Ideally you'd pick something close to you, but google's network does a pretty good job of shuffling bits around.  If you're in the US, that setting is probably fine.  Otherwise, choose the Europe/APAC/etc region closeby to avoid latency.  Note that region affects price (and regions like us-central are typically cheaper than us-west).

Finally, note that we're using the ubuntu 20.04 LTS image.  That feels pretty standard and well supported.  

### But what's on the box by default?
Ubuntu and cloud providers have a really good system to bootstrap some basic stuff.  You can research cloud-init if you want, but I find most value out of the "packages" section of the yaml.  It's provided via the "user-data" field in the metadata section of the terraform above, and looks like this:

```
#cloud-config
# Add groups to the system
# The following example adds the ubuntu group with members 'root' and 'sys'
# and the empty group cloud-users.
groups:
  - ubuntu: [root,sys]
  - cloud-users

# Add users to the system. Users are added after groups are added.
# Note: Most of these configuration options will not be honored if the user
#       already exists. Following options are the exceptions and they are
#       applicable on already-existing users:
#       - 'plain_text_passwd', 'hashed_passwd', 'lock_passwd', 'sudo',
#         'ssh_authorized_keys', 'ssh_redirect_user'.

packages:
 - openjdk-11-jdk
 - nodejs
 - npm
 - docker.io
```

The big take-away here is I'm adding java 11, docker, and npm/node.  Any other ubuntu 20.04 package is valid here.  Go nuts.  You can also add things after you log into the box, but these are going to be there when you log in the first time.

## So what's the flow?
```
terraform apply
<ssh to the box, git clone, work, git commit && git push>
terraform destroy
```

You get an on-demand, current, ephemeral server for a few pennies per hour.  Mess the box up, then throw it away.  If you find a process you like, bake it into the cloud-init.  Hand it to your fellow devs to replicate.  If you don't like it, trash it, and forget about it.  No conflict with future work.

But seriously, *don't forget the 'terraform destroy' or you will continue to be billed.*

## All that said, sometimes this isn't the right option
Okay, but what about your process that just runs all the time with a low throughput?  Maybe don't use this.  Maybe that's a cloud function, or something for a raspberry pi.

Or maybe you run something like https://zoneminder.com/ that requires constant processing and lots of data movement.  That's also outside the scope of what I'm talking about here.  Certainly, buy something for that, and hopefully run it in a VM or container so you get some reuse and "cloud" benefit.  

## But like, really? Is it worth it?
A lot of the time, yeah.  I set a lot of a project up for an interview on a home server.  I moved, let it get a little out of date, and updates caused it to not boot.  I wrote the above terraform in less time than it took to fix the machine, fixed my vulnerabilities, and built a new deployment mechanism for a different interview.  I really like I can hand the whole thing to somebody as a demo.  And next on my list is to add github CI so that somebody can get the dev env up, fork the repo & ci, build & deploy from a few commands.  All for less than $1, that's pretty impressive.  The world of software development is more accessible than ever.  We need more teachers and knowledge transfer.