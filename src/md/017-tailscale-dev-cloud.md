---
slug: "/blog/tailscale-and-cloud-dev"
date: "2024-12-27"
title: "Bringing the cloud home with tailscale"
---

In a [previous post](/blog/tailscale-home-services/), we looked at how you might log into your basement from a coffee shop.  In this post, we're going to use the VPN to make a cloud machine seem like it's on our local network.  The value-add is that communication is secure without complicated SSH tunnels or TLS certs.  We can experiment with bare HTTP traffic without exposing that to the wilds of the internet.

# The problem
Secure communication to a cloud machine for exploratory/development purposes without ssh tunnels or TLS.  It should "just work" as if we magically dropped another box in our basement. 

# How to
Tailscale actually has a guide at https://tailscale.com/kb/1147/cloud-gce.  It's great to tell you what's going on, but not particularly fast/painless.  I also have don't like the curl-pipe-bash install pattern, especially when it requires root.  Can we do this all automaticaly when we spin up the cloud VM?  We sure can.  Let's dive in.

## Provisioning (with automation)
I like repeatability.  It lets me stand up projects/machines quickly, try something, and tear it all down so I'm not charged for more than I use.  This means I don't want to click through the UI a lot.  Luckily, the Google cloud (and pretty much any cloud) supports calls that lets a user script any interaction.  It's a fundamental reason so many people move to the cloud, so let's leverage that.  We'll use a tool called https://www.hashicorp.com/products/terraform to do that.

### Tailscale prerequisite & repo use
You need to have an API key.  See https://tailscale.com/kb/1101/api.  I created one with too many things checked.  I'll leave it to an exercise to the reader to get the minimal set of permissions for use in this repo.  Add the value to a `variables.tfvars` file:
```
ts_api_key = "tskey-api-kEXKyTxxxxxxxx..."
```

Note that the repo referenced requires 4 variables:
```
ts_api_key = "tskey-api-kEXKyTxxxxxxxx..."
proj_id = "<project_name>"
tailnet = "<your tailnet>"
host_prefix = "<host_prefix>"
```

### Terraform
Details on how to use terraform are a bit outside our scope here, but a quick overview is: you code up what you want, then run a "plan" phase to make sure your code will result in what you want, and finally run an "apply" phase to create the cloud infrastructure.  When you're done, you run a "destroy" and it all gets cleaned up and deleted nicely.  No surprise bills.  

### cloud-init
Terraform will only get you so far.  It targets the large operations of the cloud, but tends not to get into the fine details of machine configuration.  For that, you need a tool like ansible, puppet, chef, or cloud-init.  While the other tools have their merits, my case of needing to run something once, during provision, and with no concern to ongoing maintenance or drift is a perfect match for cloud-init.  The lack of dependencies also makes it less complicated to use (though the documentation is notably worse than the other config management tools).

### Combining various steps
If you read through the tailscale doc, there is a pretty long process:
1. create the VM https://tailscale.com/kb/1147/cloud-gce
1. Install tailscale https://tailscale.com/kb/1476/install-ubuntu-2404
1. Approve the machine joining the tailnet (which isn't specifically called out, but it's a manual step during the install)

The first is easy with terraform.  https://github.com/sweeneyb/devEnvs/blob/9361b128799b5d92987c8130076fb29516b47a1a/pulsar/main.tf#L55 shows a block of terraform that creates a VM.  
```
resource "google_compute_instance" "VMs" {
  count = var.cluster_size
  name         = "${var.host_prefix}${format("-%03s", count.index+1)}"
  project = google_project.dev-project.project_id
  machine_type = "e2-standard-2"
  zone         = "us-east1-b"


  boot_disk {
    initialize_params {
      type  = "pd-standard"
      image = "projects/ubuntu-os-cloud/global/images/family/ubuntu-2404-lts-amd64"
      size  = var.boot_disk_size
    }
  }

  network_interface {
    network = "default"
    // If you need a public IP, uncomment this.
    access_config {
      // Ephemeral IP
    }
  }

  metadata = {
    user-data                  = templatefile("cloud-init.tftpl", {KEY = tailscale_tailnet_key.vm_keys[count.index].key})
    #google-logging-enabled    = true
    #google-monitoring-enabled = true
  }

  depends_on = [
    google_project_service.compute_api
  ]
}
```
Theres a lot of boilerplate around that snippet in the linked file to create a project, associate a billing account, and turn on some services.  But the core of creating a VM is that block.

Like mentioned earlier, the configuration is done via cloud-init.  https://github.com/sweeneyb/devEnvs/blob/9fc448bb3f7216574392ff6c483d9bcafca092e7/pulsar/cloud-init.tftpl#L77 shows several packages being installed.  
```
packages:
 - openjdk-21-jdk
 - nodejs
 - npm
 - docker.io
 - podman
 - tailscale
```
The superhuman readers will reconize that the `tailscale` package comes from a non-standard repository that's maintained by the tailscale folks.  

Installing tailscale is interesting.  Because they host their own debian/ubuntu repo, we need to add that and the key that signs packages.  This happens at https://github.com/sweeneyb/devEnvs/blob/9fc448bb3f7216574392ff6c483d9bcafca092e7/pulsar/cloud-init.tftpl#L3.  
```
apt:
  sources:
    tailscale:
      source: deb [signed-by=/etc/apt/trusted.gpg.d/tailscale.gpg] https://pkgs.tailscale.com/stable/ubuntu noble main
      key: |
        -----BEGIN PGP ARMORED FILE-----
        Comment: Use "gpg --dearmor" for unpacking
        
        mQINBF5UmbgBEADAA5mxC8EoWEf53RVdlhQJbNnQW7fctUA5yNcGUbGGGTk6XFqO
...
```
There's some "magic" in there - particularly the `signed-by` path.  It took some google-foo and reading error messages (from /var/log/cloud-init.log on ubuntu) to get that path right.

The final bit of magic is at https://github.com/sweeneyb/devEnvs/blob/9fc448bb3f7216574392ff6c483d9bcafca092e7/pulsar/cloud-init.tftpl#L85
```
runcmd:
 - [ tailscale, up, --auth-key=${KEY}]
```
which issues the "tailscale up" command with a pre-computed [auth key](https://tailscale.com/kb/1085/auth-keys) created at https://github.com/sweeneyb/devEnvs/blob/9fc448bb3f7216574392ff6c483d9bcafca092e7/pulsar/tailscale.tf#L17
```
resource "tailscale_tailnet_key" "vm_keys" {
  count = var.cluster_size
  reusable      = false
  ephemeral     = false
  preauthorized = true
  expiry        = 3600
  description   = "terraform generated auth key for ${var.host_prefix}${format("-%03s", count.index+1)}"
}
```
This auth key lets the machine join the tailnet without clicking through the admin UI.  I'll note that the permission to create such keys depends on the configuration of the API key you created in the prereqs section above.  If you have permissions issues, try creating a new key with more permissions and putting the value in your `variables.tfvars` file.

# That's it
Run `terraform apply -var-file=variables.tfvars` & type "yes" at the prompt.  You'll see some things create, and the tailscale provider looks up (and waits) for the new node to be present.  Once it's on the tailnet, you'll see the output with some text like:
```
  + tailscale_ips   = [
      + [
          + "100.76.108.93",
          + "fd7a:115c:a1e0::aa01:6c5e",
        ],
    ]
```
Once you see that, you'll be able to ssh in with something like `ssh -i id_rsa user@100.76.108.93` (the repo creates an ssh key for you).  And if you bring up a new server, you'll be able to address it directly, securely!  

# Teardown
`terraform apply -var-file=variables.tfvars` and type 'yes' at the prompt.  You should see a green message that resource were destroyed and get an email from google saying the project is scheduled for deletion.  If you don't, go to https://console.cloud.google.com/cloud-resource-manager, click the three dots to the right, and click "delete".

# Conclusion
In this post, we looked into automatically provisioning a GCP VM that was joined to our tailnet for secure communication of insecure protocols.  We touched on terraform and cloud-init to do that.  And we got comfortable with VM and project lifecycles in GCP.  In the development of this repo and its use, I've incurred about $0.26 of cloud costs.  So it's not quite free tier, but it's not breaking the bank for a pretty capable VM.

But the real benefit is that I 
1. didn't have to buy a lot of hardware to put in my basement.
1. didn't worry about insecure protocols
1. didn't have to set up a bunch of complicated ssh tunnels as I bring up arbitrary ports