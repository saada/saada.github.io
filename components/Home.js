import React, { Component } from "react"
import Layout from "./Layout"
import ReactMarkdown from "react-markdown"
import imageURL from "../images/mahmoudsaada.jpg"

const markdown = `
Mahmoud Saada

![image](${imageURL})

# Work Experience

## [Agolo](https://agolo.com)
> Site Reliability Engineer

## [Lifion, by ADP](https://lifion.com)
> Full Stack Software Engineer

Worked full-stack on a metadata-driven platform building core eventbus frameworks integrating services across ADP with Lifion. Developed utility for  in-cloud dev environments used by all engineers to simplify setup, maintenance, and debugging of a 100+ microservice architecture.

## [Staffingnation, by TargetCW](https://staffingnation.com)
> Software Engineer -> Tech Lead

Worked on an employee onboarding web app called StaffingNation that  assisted big TargetCW clients, such as Uber, to on-board their employees efficiently through a tailored paperless process. As a startup environment, I was in charge of everything from leading a team of engineers, to writing specifications, to coding across the stack, to building infrastructure, to designing architecture, to making most technical decisions and eventually maintaining it all.

# Open Source

## [Container Hive](https://github.com/saada/container-hive)

Visualization tool for Docker container networks

# Contact Me

* [Github](https://github.com/saada)
* [Twitter](https://twitter.com/saadazzz)
* [LinkedIn](https://linkedin.com/in/msaada)
`
const Home = () => (
  <Layout>
    <ReactMarkdown source={markdown} />
  </Layout>
)
export default Home
