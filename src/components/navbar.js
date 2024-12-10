import * as React from "react"
import "@fontsource/open-sans"
import styled from "styled-components"

const fontStyle = {
    fontFamily: "Open Sans, Segoe UI, Apple SD Gothic Neo, Lucida Grande, Lucida Sans Unicode, sans-serif"
  }

const Li = styled.li`
  display: inline-block;
`

const Ul = styled.ul`
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #333;
    text-align: center;
`

const Link = styled.a`
    display: block;
    color: white;
    text-align: center;
    padding: 14px 16px;
    text-decoration: none;
  
`


function Navbar(props) {
    return (
        <Ul>
        <Li><Link href="/">Home</Link></Li>
        <Li><Link href="/blog">Blog</Link></Li>
        {/* <Li><Link class="active" href="#about">About</Link></Li> */}
      </Ul>
    );
  }

export default Navbar