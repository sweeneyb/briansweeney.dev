import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import Navbar from "../components/navbar"
import styled from "styled-components"
import { createGlobalStyle } from "styled-components"
const GlobalStyle = createGlobalStyle`
  code {
    background-color: #f1f1f1;
  }
`



const Container = styled.div`
  margin: 3rem auto;
  // max-width: 900px;
  max-width: 60%;
  // display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`


export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data // data.markdownRemark holds your post data
  const { frontmatter, html } = markdownRemark
  return (
    <Layout>
    <Navbar/>
    <Container>
      <GlobalStyle/>
      <div className="blog-post">

          
        <h1>{frontmatter.title}</h1>
        <h2>{frontmatter.date}</h2>
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </Container>
    </Layout>
    
  )
}

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        slug
        title
      }
    }
  }
`