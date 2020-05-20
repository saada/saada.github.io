import React, { Component } from "react"
import Layout from "./Layout"
import ReactMarkdown from "react-markdown"
import landingURL from "../images/mahmoudsaada.jpg"
import ckaURL from "../images/logo_cka.png"

const markdown = `
Mahmoud Saada

![landing](${landingURL})

# Work Experience

## [Weaveworks](https://weave.works)
Customer Reliability Engineer

> Work with customers to select the right technology and introduce a site reliability approach to operating them.

## [Agolo](https://agolo.com)
Site Reliability Engineer

> Establish an SRE team and devops culture to take Agolo towards an immutable infrastructure using Docker and Kubernetes. Influence technical and cultural shifts towards more testing, monitoring, self-service, and automation. Act as a developer-advocate making it easy for dev teams to self-service CI, CD, and automation. Implement monitoring, logging, and automation of software lifecycle for the cloud and on-premises. Manage infrastructure, compute expenses, roadmaps, consultations, and deployments. Contribute to open source projects such as Terraform. Write technical blogs.

## [Lifion (ADP)](https://lifion.com)
Full Stack Software Engineer

> Worked full-stack on a metadata-driven platform building core eventbus frameworks integrating services across ADP with Lifion. Developed utility for  in-cloud dev environments used by all engineers to simplify setup, maintenance, and debugging of a 100+ microservice architecture.

## [Staffingnation (TargetCW)](https://staffingnation.com)
Software Engineer &rarr; Tech Lead

> Worked on an employee onboarding web app called StaffingNation that  assisted big TargetCW clients, such as Uber, to on-board their employees efficiently through a tailored paperless process. As a startup environment, I was in charge of everything from leading a team of engineers, to writing specifications, to coding across the stack, to building infrastructure, to designing architecture, to making most technical decisions and eventually maintaining it all.

# Open Source

## [Container Hive](https://github.com/saada/container-hive)

Visualization tool for Docker container networks

# Certifications

## Certified Kubernetes Administrator
![cka](${ckaURL})

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
