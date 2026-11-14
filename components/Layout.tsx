import React from "react";

const socials = [
  { label: "GitHub", href: "https://github.com/saada" },
  { label: "Twitter", href: "https://twitter.com/saadazzz" },
  { label: "LinkedIn", href: "https://linkedin.com/in/msaada" },
];

// The hero fills the first screen edge to edge; everything after it sits in one column.
const Layout = ({ hero, children }) => (
  <>
    <main>
      {hero}
      <div className="container">{children}</div>
    </main>
    <footer className="container">
      <span>© Mahmoud Saada</span>
      {socials.map((s) => (
        <a key={s.label} href={s.href}>
          {s.label}
        </a>
      ))}
    </footer>
  </>
);

export default Layout;
