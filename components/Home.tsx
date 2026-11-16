import React, { useEffect, useRef, useState } from "react";
import Layout from "./Layout";
import { Scene, SceneMode } from "./scene";
import { z } from "zod";
// @ts-ignore
import cameoURL from "../images/portrait-cameo.jpg";
// @ts-ignore
import ckaURL from "../images/logo_cka.png";
// @ts-ignore
import ckadURL from "../images/logo_ckad.png";

// The handbill's programme: every way off the page, each destination a sticker.
const programme = [
  {
    label: "The blog",
    links: [
      { text: "Guitar rigs", href: "/blog/tone3000-linux-rig/" },
      { text: "Dota custom games", href: "/blog/custom-maps-in-dota/" },
    ],
  },
  { label: "Older writing", links: [{ text: "Medium", href: "https://medium.com/@saada" }] },
  { label: "Code", links: [{ text: "GitHub", href: "https://github.com/saada" }] },
  { label: "Talks", links: [{ text: "Watch them", href: "#talks" }] },
  {
    label: "Elsewhere",
    links: [
      { text: "Twitter/X", href: "https://twitter.com/saadazzz" },
      { text: "LinkedIn", href: "https://linkedin.com/in/msaada" },
    ],
  },
  {
    label: "Games",
    links: [
      { text: "Catastrophe", href: "https://www.playcatastrophe.com" },
      { text: "Splendid", href: "https://splendid.games" },
    ],
  },
  { label: "The long version", links: [{ text: "Read it all", href: "#experience", dark: true }] },
];

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const FILLS = ["sun", "sea", "clay", "white"];
const SHAPES = ["pill", "soft", "square"];
const TILTS = [-2, 1.5, -1, 2, -1.5, 1.5, 1.5, -2, -1];

const experience = [
  {
    company: "Carta",
    href: "https://carta.com",
    roles: [
      {
        title: "Staff AI Engineer",
        org: "Evergreen by Carta",
        orgHref: "https://evergreen.carta.com",
        desc: "Founding engineer of Evergreen by Carta.",
      },
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

const byNewest = (a: Post, b: Post) => b.pubDate.localeCompare(a.pubDate);

// Posts that live on this site or outside Medium. They show at once, and still show if
// the Medium feed cannot be reached.
const ownPosts: Post[] = [
  {
    title: "How Claude's Fable 5.2 Revived Warcraft III and StarCraft II Custom Maps Inside Dota 2",
    link: "/blog/custom-maps-in-dota/",
    pubDate: "2026-11-16 00:00:00",
  },
  {
    title: "An AI Agent Built My Entire Guitar Rig on Omarchy, So I Just Play",
    link: "/blog/tone3000-linux-rig/",
    pubDate: "2026-09-26 00:00:00",
  },
  {
    title:
      "How Claude's Fable Model Saved My Gear and Got Me Excited About Playing Guitar Again",
    link: "/blog/fcb1010-biasfx2/",
    pubDate: "2026-07-19 00:00:00",
  },
  {
    title: "The easy way to test your Logstash configuration",
    link: "https://blog.agolo.com/the-easy-way-to-test-your-logstash-configuration-3f80eb5ffd59",
    pubDate: "2017-11-29 00:00:00",
  },
].sort(byNewest);

async function getPosts(): Promise<Post[]> {
  const url =
    "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@saada";
  const res = await fetch(url);
  const data = await res.json();
  const medium = z.array(Post).parse(data.items);
  return [...ownPosts, ...medium].sort(byNewest);
}

const Cross = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20">
    <path d="M5 5.3C8 8.2 11.4 11.5 15 14.8M14.8 5C11.7 8.4 8.5 11.4 5.2 15" />
  </svg>
);

// The first screen: a handbill pinned over a picture that keeps drawing itself.
const Hero = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sprites = useRef<HTMLCanvasElement>(null);
  const scene = useRef<Scene | null>(null);
  const [theme, setTheme] = useState<SceneMode>(() =>
    typeof document !== "undefined" && document.documentElement.dataset.theme === "dark"
      ? "dark"
      : "light"
  );
  const [away, setAway] = useState(false);

  useEffect(() => {
    scene.current = new Scene(canvas.current!, sprites.current!, theme);
    return () => scene.current?.destroy();
    // the scene is created once; later theme changes go through setMode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next: SceneMode = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    setTheme(next);
    scene.current?.setMode(next);
  };

  let sticker = 0;

  return (
    <header className="hero">
      <canvas ref={canvas} className="hero__canvas" aria-hidden="true" />
      <div className="hero__dots" aria-hidden="true" />
      <canvas ref={sprites} className="hero__canvas hero__canvas--front" aria-hidden="true" />

      <div className={away ? "bill-wrap bill-wrap--away" : "bill-wrap"}>
        <article className="bill" aria-labelledby="name">
          <p className="bill__caption">Meanwhile, at Carta…</p>
          <button
            className="bill__close"
            type="button"
            aria-label="Put the handbill away"
            onClick={() => setAway(true)}
          >
            <Cross />
          </button>

          <div className="bill__cols">
            <div className="bill__intro">
              <p className="overline">Developer Experience · AI Agents · Reliability</p>
              <h1 id="name" className="name">
                Mahmoud Saada
              </h1>
              <svg className="swipe" aria-hidden="true" viewBox="0 0 360 22" preserveAspectRatio="none">
                <path d="M5 12C42 5 74 17 110 10s72-7 104 1 60 7 90 0 34-4 50 2" />
              </svg>
              <p className="role-strip">Staff AI Engineer</p>
              <p className="lede">
                Most recently a founding engineer of{" "}
                <a className="hl" href="https://evergreen.carta.com">
                  Evergreen by Carta
                </a>
                . I lead the team bringing AI agentic engineering to all of{" "}
                <a className="hl" href="https://carta.com">
                  Carta
                </a>
                , beyond engineering.
              </p>
              <p className="lede">
                Before that came a decade of developer experience, site reliability, platform
                and full-stack work. I contribute to{" "}
                <a className="hl" href="https://github.com/astral-sh/ty">
                  ty
                </a>{" "}
                and maintain{" "}
                <a className="hl" href="https://github.com/yetibot/yetibot">
                  Yetibot
                </a>
                .
              </p>
            </div>

            <div className="bill__programme">
              <div className="cameo-row">
                <span className="cameo" aria-hidden="true">
                  <img src={cameoURL} alt="" />
                </span>
                <p className="scrawl">Kubernetes certified, twice (CKA + CKAD)</p>
              </div>

              <div className="programme-head">
                <h2>Programme</h2>
              </div>

              <ol className="programme">
                {programme.map((row, i) => (
                  <li key={row.label} style={{ animationDelay: `${2.45 + i * 0.1}s` }}>
                    <span className="programme__no">{ROMAN[i]}.</span>
                    <span className="programme__label">{row.label}</span>
                    <span className="leader" aria-hidden="true" />
                    <span className="stickers" style={{ animationDelay: `${2.6 + i * 0.1}s` }}>
                      {row.links.map((link: any) => {
                        const n = sticker++;
                        const look = link.dark
                          ? "stk stk--dark stk--pill"
                          : `stk stk--${FILLS[n % FILLS.length]} stk--${SHAPES[n % SHAPES.length]}`;
                        return (
                          <a
                            key={link.href}
                            className={look}
                            href={link.href}
                            style={{ rotate: `${TILTS[n % TILTS.length]}deg` }}
                          >
                            {link.text}
                          </a>
                        );
                      })}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </article>
      </div>

      {away && (
        <button
          className="bill-mini"
          type="button"
          aria-label="Show the handbill again"
          onClick={() => setAway(false)}
        >
          Mahmoud Saada
        </button>
      )}

      <nav className="chips" aria-label="Picture">
        <button className="chip" type="button" onClick={() => scene.current?.fresh()}>
          redraw
        </button>
        <button
          className="chip chip--mode"
          type="button"
          onClick={toggle}
          aria-label={`Colour theme: ${theme === "dark" ? "night" : "day"}. Switch`}
        >
          {theme === "dark" ? "night" : "day"}
        </button>
      </nav>
    </header>
  );
};

const Section = ({ title, children, className = "" }) => (
  <section className="section" id={title.replace(/\s+/g, "-")}>
    <h2 className="section__title">{title}</h2>
    <div className={className}>{children}</div>
  </section>
);

const ExperienceCard = ({ company, href, roles }) => (
  <article className="panel xp-card">
    <a className="panel__title hl" href={href}>
      {company}
    </a>
    {roles.map((role) => (
      <div className="xp-role" key={role.title}>
        <div className="xp-role__title">{role.title}</div>
        {role.org && (
          <div className="xp-role__org">
            {role.orgHref ? (
              <a className="hl" href={role.orgHref}>
                {role.org}
              </a>
            ) : (
              role.org
            )}
          </div>
        )}
        {role.desc && <p className="xp-role__desc">{role.desc}</p>}
      </div>
    ))}
  </article>
);

const ContribCard = ({ project, org, href, note, prs }) => (
  <article className="panel contrib">
    <div className="contrib__head">
      <a className="panel__title hl" href={href}>
        {project}
      </a>
      {org && <span className="contrib__org">{org}</span>}
    </div>
    <p className="contrib__note">{note}</p>
    <ul className="contrib__prs">
      {prs.map((pr) => (
        <li key={pr.href}>
          <a className="hl" href={pr.href}>
            {pr.title}
          </a>
        </li>
      ))}
    </ul>
  </article>
);

const TalkCard = ({ talk }) => {
  if (talk.youtube) {
    return (
      <a className="panel talk-card" href={`https://www.youtube.com/watch?v=${talk.youtube}`}>
        <div className="talk-thumb">
          <img
            src={`https://img.youtube.com/vi/${talk.youtube}/hqdefault.jpg`}
            alt=""
            loading="lazy"
          />
          <div className="talk-thumb__play" aria-hidden="true">
            <span>▶</span>
          </div>
        </div>
        <div className="talk-card__title">{talk.title}</div>
      </a>
    );
  }
  return (
    <a className="panel talk-card talk-card--text" href={talk.href}>
      <div className="talk-card__title">
        {talk.title}
        {talk.lang && <span className="talk-card__lang">{talk.lang}</span>}
      </div>
    </a>
  );
};

const Home = () => {
  const [posts, setPosts] = useState<Post[]>(ownPosts);
  useEffect(() => {
    getPosts().then(setPosts).catch(() => {});
  }, []);

  return (
    <Layout hero={<Hero />}>
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
        <ul className="rows">
          {posts.map((p) => (
            <li key={p.link}>
              <a href={p.link}>{p.title}</a>
              <span className="leader" aria-hidden="true" />
              <span className="rows__aside">{p.pubDate.split(" ")[0]}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="publications">
        <ul className="rows">
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
        <p className="oss__more">other merged PRs</p>
        <ul className="rows rows--cols">
          {projects.map((p) => (
            <li key={p.href}>
              <a href={p.href}>{p.title}</a>
              <span className="leader" aria-hidden="true" />
              {p.note && <span className="rows__aside">{p.note}</span>}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="certifications" className="certs">
        <img className="panel" src={ckaURL} alt="Certified Kubernetes Administrator" />
        <img className="panel" src={ckadURL} alt="Certified Kubernetes Application Developer" />
      </Section>

      <Section title="games" className="sticker-row">
        {games.map((g, i) => (
          <a
            key={g.href}
            className={`stk stk--${FILLS[(i + 2) % FILLS.length]} stk--${SHAPES[i % SHAPES.length]}`}
            href={g.href}
            style={{ rotate: `${TILTS[i]}deg` }}
          >
            {g.title}
          </a>
        ))}
      </Section>
    </Layout>
  );
};

export default Home;
