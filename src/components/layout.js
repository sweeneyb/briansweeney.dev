import * as React from "react"
import "@fontsource/open-sans"

// const IndexPage = () => {
//     return (
//       <layout style={foo}>
//       <main style={pageStyles}>

const fontStyle = {
    fontFamily: "Open Sans, Segoe UI, Apple SD Gothic Neo, Lucida Grande, Lucida Sans Unicode, sans-serif"
  }


function Layout(props) {
    return (
      <div style={fontStyle}>
        {props.children}
      </div>
    );
  }

export default Layout