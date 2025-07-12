---
slug: "/blog/deploy-gitlab"
date: "2025-02-16"
title: "Deploying Gitlab in the homelab"
---

I recently deployed gitlab into my weird homelab.  My requirements are a little different than the stock gitlab docs, so I wanted to share a few of the steps to get it running.  Specifically, I don't forward ports to the internet anymore.  I'm running a few things off a basement machine, and ues [tailscale](https://tailscale.com/) to reach things when I'm not in the house.  That machine runs VMs (via KVM), so I needed some setup for that.  Finally, I really dislike special configuration, so I really wanted be able to log into the guest via ssh over 22, as well as work with git over port 22.  

# Gitlab vs Github
Github is a great service and I have no reservations about using it.  However, there are 2 drawbacks: 1) it can't reach into my environment to deploy and b) the free tier requires everything be public.  I have some other learning goals around workers setup and pipeline comfort, but those are outside the scope here.  Plus, it was interesting enough to try and if I don't want to keep it, destorying VMs is easy.

# The Requirements and Plan
This gitlab instance is going to run a homelab.  As such, I'm going to target the easiest deployment/upgrade path over anything high-availability.  The docker omnibus install fits my needs well.  

Another thing that was important to me was to log into the guest and the git ssh server over port 22.  That means my VM needs 2 IP addresses.

Finally, the http portions need to be behind TLS.  I dislike maintaining certs, so we'll go with Let's Encrypt.  But because I don't expose the webserver to the internet, we'll configure DNS challenges.

And one last assumption: my DHCP setup is external to all of this and comes from my router.  It generally remembers MAC addresses and keeps IPs consistent enough that I'm not going to worry about MAC -> IP mapping.  The IP is static enough.

# Create the VM
I have a pretty standard template for creating my VMs:
```
export VM_NAME=gitlab-010
export VM_IMAGE=noble-server-cloudimg-amd64.img

sudo zfs create -p -o refquota=30GB  -o mountpoint=/data/vms/$VM_NAME tank/data/vms/$VM_NAME
sudo chown ${USER}:${USER} /data/vms/$VM_NAME
cd /data/vms/$VM_NAME
cp ~/$VM_IMAGE /data/vms/$VM_NAME
cat << EOF > /data/vms/$VM_NAME/meta-data
instance-id: $VM_NAME
local-hostname: $VM_NAME
EOF

cat << EOF > /data/vms/$VM_NAME/user-data
#cloud-config

hostname: $VM_NAME
users:
  - name: <username>
    groups: sudo, docker
    shell: /bin/bash
    ssh_authorized_keys:
      - ssh-ed25519 <pub key>
    lock_passwd: false
    passwd: "<salted, hashed password>"
    sudo: ALL=(ALL) NOPASSWD:ALL
packages:
 - podman
 - docker.io
 - net-tools
EOF

# autostart
genisoimage -output cidata.iso -V cidata -r -J user-data meta-data
qemu-img create -b $VM_IMAGE -f qcow2 -F qcow2 root.img 30G
virt-install --name=$VM_NAME --ram=16384 --autostart --vcpus=1 --import --disk path=root.img,format=qcow2 --disk path=cidata.iso,device=cdrom --os-variant=ubuntu-lts-latest --network bridge=br0,model=virtio --network bridge=br1,model=virtio --graphics none --console pty,target_type=serial
```

Most of this is "standard": create a zfs FS, move a current ubuntu image to the area, set up the disk, and do just enough cloud-init config to bootstrap the box.  After that, we create the VM.  There's still some work to be done on the cloud-init script, but more on that later.

For the moment, the one difference to my "normal" script is the second network card.  Which is easier than expected:

```
--network bridge=br0,model=virtio
--network bridge=br1,model=virtio
```

In the guest, this will set up 2 network interfaces: enp1s0 and enp2s0.  
> An area of improvement is this second network interface.  By default, it doesn't get a dhcp address.  That's the IP the gitlab will be assigned, so the containers won't start without that IP.  We'll go over a workaround below, but that should really be incorporated into the cloud-init as a netplan pass-through.

Boot the VM and watch the startup to grab the IP.  SSH in to continue the setup.

# Fix up the network
As mentioned above, the dhcp client isn't configured to pull an IP address on the second network interface.  We're going to add 2 lines to /etc/netplan/50-cloud-init.yaml.  Add the enp2s0 key with dhcp4: true to enable dhcpcd on the second interface.  The file should look like:

```
network:
    ethernets:
        enp2s0:
            dhcp4: true
        enp1s0:
            dhcp4: true
            dhcp6: true
            match:
                macaddress: 52:54:00:35:f2:5d
            set-name: enp1s0
    version: 2
```

We also need to make sshd only listen on one interface.  To do that, we'll add a file `/etc/ssh/sshd_config.d/70-listen-address.conf` with contents (note that the IP might be different - whatever you used to ssh into your box, place that here):
```
ListenAddress 192.168.3.118
```

And restart your sshd service with `sudo systemctl restart ssh`.  Double check netstat to make sure things are working.  You should see a listener on port 22 that's only on 1 IP, not all of them:

```
netstat -tnlp
(No info could be read for "-p": geteuid()=1000 but you should be root.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 192.168.3.118:22        0.0.0.0:*               LISTEN      -
```

# Get the TLS cert
I have my domain registered through square (RIP google domains), and the authoritative servers are in cloudflare.  Highly recommend the setup.  Apparently if cloudflare is your registrar, you have less flexibility, but porting the authoritative source over was easy.

Once the machine boots and you fix up the secondary interface, jot down the IP.  Go into cloudflare (or your registrar) and add the DNS record (it's in my site, dns-> records in the current UI.)

While you're in there, click on your profile, go to API tokens, and create a token for "Edit zone DNS" scoped to at least your domain zone (keep it least privilege).  Copy that token into a cloudflare.ini file:

```
mkdir certbot
cd certbot
vi cloudflare.ini
```
The full file should be:
```
dns_cloudflare_api_token = 7xxxxxxxtokenxxxxxx
```
Then copy this into a docker-compose.yaml 
```
version: '3'
services:

  certbot:
    image: certbot/dns-cloudflare
    volumes:
      - ./certbot_etc:/etc/letsencrypt
      - ${PWD}/cloudflare.ini:/root/cloudflare.ini
    command: >-
      -v certonly --dns-cloudflare
      --dns-cloudflare-credentials /root/cloudflare.ini
      --dns-cloudflare-propagation-seconds 15
      --email tab126@gmail.com
      --agree-tos --no-eff-email
      -d <your domain>
```
Then run `docker-compose up -d` and you should see the certbot_etc populate.

# Configure gitlab docker-compose:
```
version: '3.6'
services:
  gitlab:
    image: gitlab/gitlab-ce:17.6.4-ce.0
    container_name: gitlab
    restart: always
    hostname: '<your domain>'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        # Add any other gitlab.rb configuration here, each on its own line
        external_url 'https://<your domain>'
        letsencrypt['enable'] = false
        nginx['ssl_certificate'] = "/certbot/live/<your domain>/fullchain.pem"
        nginx['ssl_certificate_key'] = "/certbot/live/<your domain>/privkey.pem"
    ports:
      - '192.168.3.122:80:80'
      - '192.168.3.122:443:443'
      - '192.168.3.122:22:22'
    volumes:
      - '${PWD}/gitlab/config:/etc/gitlab'
      - '${PWD}/gitlab/logs:/var/log/gitlab'
      - '${PWD}/gitlab/data:/var/opt/gitlab'
      - '/home/<user>/certbot/certbot_etc/:/certbot'
    shm_size: '256m'
```

Note the ports block is a bit unusual:
```
    ports:
      - '192.168.3.122:80:80'
      - '192.168.3.122:443:443'
      - '192.168.3.122:22:22'
```
This will bind the ports to a single IP of the machine, not the default of both.  

# Finish setting up gitlab
At this point, you should see gitlab up or booting at your domain, behind TLS.  You can go back to post-install steps at [https://docs.gitlab.com/ee/install/docker/installation.html#install-gitlab-by-using-docker-compose](https://docs.gitlab.com/ee/install/docker/installation.html#install-gitlab-by-using-docker-compose).  To log in, use the user "root" and password grep'ed from:
```
sudo docker exec -it gitlab grep 'Password:' /etc/gitlab/initial_root_password
```
# And you're done
At this point, set up your user, add ssh keys, and go.  You've got gitlab installed!

# Upgrades and future improvements
Again, since this is a homelab, HA isn't required.  Upgrades are going to be something like, "Backup/export all of gitlab, shut down the gitlab machine, zfs snapshot the filesytem, bring up a new vm with a newer version, and import the backup." Though I might have to adjust the DNS records, it allows for a really nice rollback path.  I really value that rollback path in case I have to abandon things mid-upgrade.

Because I expect I'll stand up more of these VMs, I'd really like to get the install more automated.  The sshd config could be done with the `write_files` module [https://cloudinit.readthedocs.io/en/latest/reference/examples.html#writing-out-arbitrary-files](https://cloudinit.readthedocs.io/en/latest/reference/examples.html#writing-out-arbitrary-files)

The network configuration should also be managed in cloud-init.  I'm pretty sure it's possible, but [https://xkcd.com/1205/](https://xkcd.com/1205/) says I shouldn't spend much time automating it. If you know how, please drop me a line so we can get this fixed up.

