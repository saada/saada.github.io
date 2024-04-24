import React, { useEffect } from "react";
import Layout from "./Layout";
import ReactMarkdown from "react-markdown";
// @ts-ignore
import landingURL from "../images/mahmoudsaada.jpg";
// @ts-ignore
import ckaURL from "../images/logo_cka.png";
// @ts-ignore
import ckadURL from "../images/logo_ckad.png";
import { useState } from "react";
import { z } from "zod";

const Posts = z.array(
  z.object({
    title: z.string(),
    link: z.string(),
    pubDate: z.string(),
  })
);

type Posts = z.infer<typeof Posts>;

async function getPosts() {
  const url =
    "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@saada";
  const res = await fetch(url);
  const data = await res.json();
  return Posts.parse(data.items);
}

const markdown = (posts) => `
Mahmoud Saada

![landing](${landingURL})

# Work Experience

## [Carta](https://carta.com)
Senior Site Reliability Engineer I &rarr; Senior Site Reliability Engineer II
> CartaX

Senior Software Engineer II
> Carta Developer Experience

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

# Publications

- [Using Automated Machine Learning to Predict the Mortality of Patients With COVID-19: Prediction Model Development Study](https://www.jmir.org/2021/2/e23458/)

# Blog

## [Medium](https://medium.com/@saada)

${posts || "loading posts..."}

# Talks

## Klustered - episode 13
[![klustered](https://img.youtube.com/vi/akJCvD0ASmw/0.jpg)](https://www.youtube.com/watch?v=akJCvD0ASmw)

## Tracing a Kafka Pipeline (Uber Engineering - Distributed Tracing - NYC)
[![Tracing a Kafka Pipeline](https://img.youtube.com/vi/ZpUMpaWj0i8/0.jpg)](https://www.youtube.com/watch?v=ZpUMpaWj0i8)

## Container Hive Demo
[![Container Hive Demo](https://img.youtube.com/vi/DsBqEI_JHa0/0.jpg)](https://www.youtube.com/watch?v=DsBqEI_JHa0)

## Gitops on AWS: Codifying Cloud Operations
[![GitOps on AWS: Codifying cloud operations](https://img.youtube.com/vi/JRtrOc8CHug/0.jpg)](https://www.youtube.com/watch?v=JRtrOc8CHug)

## [AWS MENA Community - Gitops on AWS: Codifying multi-cloud operations](https://www.facebook.com/share/p/38EG6PP3mvrxZBMV/) (Arabic)

# Open Source

## [Container Hive](https://github.com/saada/container-hive)
Visualization tool for Docker container networks

## [Helm Operator](https://github.com/fluxcd/helm-operator/pulls?q=is%3Apr+is%3Aclosed+author%3Asaada)
## [Elastic Beats](https://github.com/elastic/beats/pull/5355)
## [Grafana](https://github.com/grafana/grafana/pull/8956)
## [Logstash Test Runner](https://github.com/agolo/logstash-test-runner)
## [Terraform Azure Provider](https://github.com/terraform-providers/terraform-provider-azurerm/pull/1027)

# Certifications

![cka](${ckaURL})
![cka](${ckadURL})

# Games

- [Catastrophe](https://www.playcatastrophe.com)
- [Splendid](https://splendid.games)

# Contact Me

* [Github](https://github.com/saada)
* [Twitter](https://twitter.com/saadazzz)
* [LinkedIn](https://linkedin.com/in/msaada)
`;

const Home = () => {
  const [posts, setPosts]: [
    Posts,
    React.Dispatch<React.SetStateAction<Posts>>
  ] = useState([]);
  useEffect(() => {
    (async () => {
      const posts = await getPosts();
      // add other blog posts
      posts.push({
        title: "The easy way to test your Logstash configuration",
        link: "https://blog.agolo.com/the-easy-way-to-test-your-logstash-configuration-3f80eb5ffd59",
        pubDate: "2017-11-29 00:00:00",
      });

      setPosts(posts);
    })();
  }, [posts]);
  return (
    <Layout>
      <ReactMarkdown>
        {markdown(
          posts
            .map(
              (p) => `- [${p.title} - ${p.pubDate.split(" ")[0]}](${p.link})`
            )
            .join("\n")
        )}
      </ReactMarkdown>
    </Layout>
  );
};
export default Home;
