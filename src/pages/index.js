import * as React from "react"
import Layout from "../components/layout"
import Navbar from "../components/navbar"

// styles
const pageStyles = {
  color: "#232129",
  padding: 96,
//   fontFamily: "-apple-system, Roboto, sans-serif, serif",
  
}
const headingStyles = {
  marginTop: 0,
  // marginBottom: 64,
  // maxWidth: 520,
}
const headingAccentStyles = {
  // color: "#000000",
  // fontFamily: "Nunito, Avenir, Helvetica, sans-serif",
  // fontFeatureSettings: "kern,liga, clig, calt"
}
const paragraphStyles = {
  marginBottom: 48,
}
const codeStyles = {
  color: "#8A6534",
  padding: 4,
  backgroundColor: "#FFF4DB",
  fontSize: "1.25rem",
  borderRadius: 4,
}
const listStyles = {
  marginBottom: 96,
  paddingLeft: 0,
}
const listItemStyles = {
  fontWeight: 300,
  fontSize: 24,
  maxWidth: 560,
  marginBottom: 30,
}

const linkStyle = {
  color: "#8954A8",
  fontWeight: "bold",
  fontSize: 16,
  verticalAlign: "5%",
}

const docLinkStyle = {
  ...linkStyle,
  listStyleType: "none",
  marginBottom: 24,
}

const descriptionStyle = {
  color: "#232129",
  fontSize: 14,
  marginTop: 10,
  marginBottom: 0,
  lineHeight: 1.25,
}

const docLink = {
  text: "My Github",
  url: "https://www.github.com/sweeneyb/",
  color: "#8954A8",
}

const badgeStyle = {
  color: "#fff",
  backgroundColor: "#088413",
  border: "1px solid #088413",
  fontSize: 11,
  fontWeight: "bold",
  letterSpacing: 1,
  borderRadius: 4,
  padding: "4px 6px",
  display: "inline-block",
  position: "relative",
  top: -2,
  marginLeft: 10,
  lineHeight: 1,
}

// data
const links = [
  {
    text: "Deploying Gitlab",
    url: "/blog/deploy-gitlab",
    description: "Deploy Gitlab for some personal, non-HA use",
    badge: "new"
  },
  {
    text: "Secure cloud LAN",
    url: "/blog/tailscale-and-cloud-dev",
    description: "Bringing the cloud home with tailscale"
  },
  {
    text: "Tailscale home services",
    url: "blog/tailscale-home-services",
    description: "Access your home from anywhere with Tailscale",
  },
  {
    text: "Wired Ethernet over 50 year old phone lines",
    url: "blog/ethernet-over-phone/",
    description: "Can we coerse untwisted, 6 conductor phone line to provide reliable ethernet?",
  },
  {
    text: "Networks, subnets, and VPCs! Oh my!",
    url: "/blog/Cloud-Networking",
    description: "What are VPCs in the cloud? And why do we need them?",
  },
  {
    text: "I'm never buying a home server again",
    url: "/blog/no-new-home-servers",
    description: "I'm done keeping my home server up to date. An argument of time and economics.",
  },
  {
    text: "A Few Container Basics",
    url: "/blog/container-basics",
    description: "You may have heard of a container, but what are they really, and why do we need another abstraction?",
  },
  {
    text: "A new blog area",
    url: "/blog/my-first-post",
    description: "An introduction to who I am and what I'm interested in.",
  },
,
  
]

// markup
const IndexPage = () => {
  return (
    <Layout>
    <Navbar/>
    <main style={pageStyles}>
      <title>BrianSweeney.dev</title>
      <h1 style={headingStyles}>
        BrianSweeney.dev
        </h1>
        {/* <br /> */}
        <span style={headingAccentStyles}>Building software. using software. amusing cats.</span>
        {/* <span role="img" aria-label="Party popper emojis">
          🎉🎉🎉
        </span> */}
      
      {/* <p style={paragraphStyles}>
        Edit <code style={codeStyles}>src/pages/index.js</code> to see this page
        update in real-time.{" "}
        <span role="img" aria-label="Sunglasses smiley emoji">
          😎
        </span>
      </p> */}
      <ul style={listStyles}>
        <li style={docLinkStyle}>
          <a
            style={linkStyle}
            href={`${docLink.url}`}
          >
            {docLink.text}
          </a>
        </li>
        {links.map(link => (
          <li key={link.url} style={{ ...listItemStyles }}>
            <span>
              <a
                style={linkStyle}
                href={`${link.url}?utm_source=starter&utm_medium=start-page&utm_campaign=minimal-starter`}
              >
                {link.text}
              </a>
              {link.badge && (
                <span style={badgeStyle} aria-label="New Badge">
                  NEW!
                </span>
              )}
              <p style={descriptionStyle}>{link.description}</p>
            </span>
          </li>
        ))}
      </ul>
    </main>
    </Layout>
  )
}

export default IndexPage
