---
slug: "/blog/reverse-proxies"
date: "2022-06-04"
title: "Reverse Proxies"
---

You've built your webapp.  Everything works in dev.  Your frontend talks to your backend and all the features are there.  It's time to deploy.  But .. how?  How does the front talk to the back in prod? Is it secure? Ports? What that CORS error?

It's a question I see pretty often.  And it makes sense that this doesn't get covered in schools/camps/tutorials.  There are so many correct answers and *YOUR* right answer depends on you process and infrastructure.  But there's one tool to have in your back pocket that will give you tons of flexibility and give you the foundational knowledge for other tools: the **reverse proxy**.

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
``` 

# Want more?  Want to chat?

Want to talk more?  Find me on Wyzant!  If you're new to the platform, you get a $40 credit. 

https://www.wyzant.com/refer/tutor/88533966