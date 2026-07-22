import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import { z } from "zod";
// @ts-ignore
import ckaURL from "../images/logo_cka.png";
// @ts-ignore
import ckadURL from "../images/logo_ckad.png";

const socials = [
  { label: "GitHub", href: "https://github.com/saada" },
  { label: "Twitter", href: "https://twitter.com/saadazzz" },
  { label: "LinkedIn", href: "https://linkedin.com/in/msaada" },
];

const experience = [
  {
    company: "Carta",
    href: "https://carta.com",
    roles: [
      {
        title: "Lead Developer Experience Engineer",
        desc: "Lead an AI agentic engineering enablement team driving adoption across the entire organization, expanding beyond engineering.",
      },
      {
        title: "Senior Software Engineer II",
        org: "Carta Developer Experience",
      },
      {
        title: "Senior Site Reliability Engineer I → II",
        org: "CartaX",
      },
    ],
  },
  {
    company: "Weaveworks",
    href: "https://weave.works",
    roles: [
      {
        title: "Customer Reliability Engineer",
        desc: "Worked with customers to select the right technology and introduce a site reliability approach to operating them.",
      },
    ],
  },
  {
    company: "Agolo",
    href: "https://agolo.com",
    roles: [
      {
        title: "Site Reliability Engineer",
        desc: "Established an SRE team and devops culture taking Agolo toward immutable infrastructure with Docker and Kubernetes. Drove technical and cultural shifts toward more testing, monitoring, self-service, and automation, acting as a developer-advocate for self-service CI/CD. Built monitoring, logging, and software-lifecycle automation across cloud and on-premises, managed infrastructure and compute spend, and contributed to open source such as Terraform.",
      },
    ],
  },
  {
    company: "Lifion (ADP)",
    href: "https://lifion.com",
    roles: [
      {
        title: "Full Stack Software Engineer",
        desc: "Worked full-stack on a metadata-driven platform, building core event-bus frameworks integrating services across ADP with Lifion. Developed a utility for in-cloud dev environments used by all engineers to simplify setup, maintenance, and debugging of a 100+ microservice architecture.",
      },
    ],
  },
  {
    company: "Staffingnation (TargetCW)",
    href: "https://staffingnation.com",
    roles: [
      {
        title: "Software Engineer → Tech Lead",
        desc: "Built StaffingNation, an employee onboarding web app helping large TargetCW clients such as Uber on-board employees through a tailored paperless process. In a startup environment I led a team of engineers, wrote specifications, coded across the stack, built infrastructure, designed architecture, and owned most technical decisions.",
      },
    ],
  },
];

const talks = [
  { title: "Klustered — episode 13", youtube: "akJCvD0ASmw" },
  {
    title: "Tracing a Kafka Pipeline — Uber Engineering, Distributed Tracing, NYC",
    youtube: "ZpUMpaWj0i8",
  },
  { title: "Container Hive Demo", youtube: "DsBqEI_JHa0" },
  { title: "GitOps on AWS: Codifying Cloud Operations", youtube: "JRtrOc8CHug" },
  {
    title: "AWS MENA Community — GitOps on AWS: Codifying multi-cloud operations",
    href: "https://www.facebook.com/share/p/38EG6PP3mvrxZBMV/",
    lang: "Arabic",
  },
];

const publications = [
  {
    title:
      "Using Automated Machine Learning to Predict the Mortality of Patients With COVID-19: Prediction Model Development Study",
    href: "https://www.jmir.org/2021/2/e23458/",
  },
];

const contributions = [
  {
    project: "ty",
    org: "Astral",
    href: "https://github.com/astral-sh/ty",
    note: "Type-inference fixes for Astral's Rust-based Python type checker.",
    prs: [
      {
        title: "Fix generic inference for non-dataclass inheriting from a generic dataclass",
        href: "https://github.com/astral-sh/ruff/pull/21159",
      },
      {
        title: "Fix false positive for Final attribute assignment in __init__",
        href: "https://github.com/astral-sh/ruff/pull/21158",
      },
    ],
  },
  {
    project: "Yetibot",
    org: "maintainer",
    href: "https://github.com/yetibot/yetibot",
    note: "Open-source ChatOps bot — multi-modal image generation and agentic PR-filing commands.",
    prs: [
      {
        title: "Add code command to file PRs via Gemini CLI",
        href: "https://github.com/yetibot/yetibot/pull/1157",
      },
      {
        title: "Support image inputs for bameme/banana commands",
        href: "https://github.com/yetibot/yetibot/pull/1140",
      },
    ],
  },
];

const projects = [
  {
    title: "Container Hive",
    href: "https://github.com/saada/container-hive",
    note: "Docker container network visualizer",
  },
  {
    title: "Helm Operator",
    href: "https://github.com/fluxcd/helm-operator/pulls?q=is%3Apr+is%3Aclosed+author%3Asaada",
    note: "fluxcd",
  },
  { title: "Elastic Beats", href: "https://github.com/elastic/beats/pull/5355", note: "elastic" },
  { title: "Grafana", href: "https://github.com/grafana/grafana/pull/8956", note: "grafana" },
  {
    title: "Terraform Azure Provider",
    href: "https://github.com/terraform-providers/terraform-provider-azurerm/pull/1027",
    note: "hashicorp",
  },
  {
    title: "Logstash Test Runner",
    href: "https://github.com/agolo/logstash-test-runner",
    note: "agolo",
  },
];

const games = [
  { title: "Catastrophe", href: "https://www.playcatastrophe.com" },
  { title: "Splendid", href: "https://splendid.games" },
];

const Post = z.object({ title: z.string(), link: z.string(), pubDate: z.string() });
type Post = z.infer<typeof Post>;

async function getPosts(): Promise<Post[]> {
  const url =
    "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@saada";
  const res = await fetch(url);
  const data = await res.json();
  const posts = z.array(Post).parse(data.items);
  posts.push({
    title: "The easy way to test your Logstash configuration",
    link: "https://blog.agolo.com/the-easy-way-to-test-your-logstash-configuration-3f80eb5ffd59",
    pubDate: "2017-11-29 00:00:00",
  });
  posts.push({
    title:
      "How Claude's Fable Model Saved My Gear and Got Me Excited About Playing Guitar Again",
    link: "/blog/fcb1010-biasfx2/",
    pubDate: "2026-07-19 00:00:00",
  });
  posts.sort((a, b) => b.pubDate.localeCompare(a.pubDate));
  return posts;
}

const Hero = () => (
  <header className="hero">
    <div className="terminal">
      <div className="terminal__bar">
        <span className="terminal__dot terminal__dot--red" />
        <span className="terminal__dot terminal__dot--yellow" />
        <span className="terminal__dot terminal__dot--green" />
        <span className="terminal__title">mahmoud@saada: ~</span>
      </div>
      <div className="terminal__body">
        <div className="prompt">whoami</div>
        <h1 className="name">Mahmoud Saada</h1>
        <div className="role">
          Lead Developer Experience Engineer <span className="at">@</span> Carta
        </div>
        <div className="role-sub">
          AI agentic engineering enablement — org-wide, beyond engineering
          <span className="cursor">▋</span>
        </div>
        <nav className="socials">
          {socials.map((s) => (
            <a key={s.label} href={s.href}>
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  </header>
);

const Section = ({ title, children, className = "" }) => (
  <section className="section" id={title.replace(/\s+/g, "-")}>
    <h2 className="section__title">{title}</h2>
    <div className={className}>{children}</div>
  </section>
);

const ExperienceCard = ({ company, href, roles }) => (
  <article className="xp-card">
    <a className="xp-card__company" href={href}>
      {company}
    </a>
    {roles.map((role) => (
      <div className="xp-role" key={role.title}>
        <div className="xp-role__title">{role.title}</div>
        {role.org && <div className="xp-role__org">{role.org}</div>}
        {role.desc && <p className="xp-role__desc">{role.desc}</p>}
      </div>
    ))}
  </article>
);

const ContribCard = ({ project, org, href, note, prs }) => (
  <article className="contrib">
    <div className="contrib__head">
      <a className="contrib__project" href={href}>
        {project}
      </a>
      {org && <span className="contrib__org">{org}</span>}
    </div>
    <p className="contrib__note">{note}</p>
    <ul className="link-list">
      {prs.map((pr) => (
        <li key={pr.href}>
          <a href={pr.href}>{pr.title}</a>
        </li>
      ))}
    </ul>
  </article>
);

const TalkCard = ({ talk }) => {
  if (talk.youtube) {
    return (
      <a
        className="talk-card"
        href={`https://www.youtube.com/watch?v=${talk.youtube}`}
      >
        <div className="talk-thumb">
          <img
            src={`https://img.youtube.com/vi/${talk.youtube}/hqdefault.jpg`}
            alt={talk.title}
            loading="lazy"
          />
          <div className="talk-thumb__play">
            <span>▶</span>
          </div>
        </div>
        <div className="talk-card__title">{talk.title}</div>
      </a>
    );
  }
  return (
    <a className="talk-card talk-card--text" href={talk.href}>
      <div className="talk-card__title">
        {talk.title}
        {talk.lang && <span className="talk-card__lang">{talk.lang}</span>}
      </div>
    </a>
  );
};

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    getPosts().then(setPosts).catch(() => {});
  }, []);

  return (
    <Layout>
      <Hero />

      <Section title="experience" className="xp">
        {experience.map((xp) => (
          <ExperienceCard key={xp.company} {...xp} />
        ))}
      </Section>

      <Section title="talks" className="talks-grid">
        {talks.map((talk) => (
          <TalkCard key={talk.title} talk={talk} />
        ))}
      </Section>

      <Section title="writing">
        <ul className="link-list">
          {posts.length === 0 && <li className="note">loading posts…</li>}
          {posts.map((p) => (
            <li key={p.link}>
              <a href={p.link}>{p.title}</a>
              <span className="date">{p.pubDate.split(" ")[0]}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="publications">
        <ul className="link-list">
          {publications.map((p) => (
            <li key={p.href}>
              <a href={p.href}>{p.title}</a>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="open source" className="oss">
        <div className="contribs">
          {contributions.map((c) => (
            <ContribCard key={c.project} {...c} />
          ))}
        </div>
        <p className="oss__more">// other merged PRs</p>
        <ul className="repo-list">
          {projects.map((p) => (
            <li key={p.href}>
              <a href={p.href}>{p.title}</a>
              {p.note && <span className="repo-list__note">{p.note}</span>}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="certifications" className="certs">
        <img src={ckaURL} alt="Certified Kubernetes Administrator" />
        <img src={ckadURL} alt="Certified Kubernetes Application Developer" />
      </Section>

      <Section title="games">
        <ul className="link-list link-list--cols">
          {games.map((g) => (
            <li key={g.href}>
              <a href={g.href}>{g.title}</a>
            </li>
          ))}
        </ul>
      </Section>
    </Layout>
  );
};

export default Home;
