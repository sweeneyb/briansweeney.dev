import * as React from "react"
import "@fontsource/varela-round"

// const IndexPage = () => {
//     return (
//       <layout style={foo}>
//       <main style={pageStyles}>

const fontStyle = {
    fontFamily: "Varela Round"
  }


function Layout(props) {
    return (
      <div style={fontStyle}>
        {props.children}
      </div>
    );
  }

export default Layout