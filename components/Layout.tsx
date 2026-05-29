import React, { useState } from "react";
// @ts-ignore
import landingURL from "../images/mahmoudsaada.jpg";

const socials = [
  { label: "GitHub", href: "https://github.com/saada" },
  { label: "Twitter", href: "https://twitter.com/saadazzz" },
  { label: "LinkedIn", href: "https://linkedin.com/in/msaada" },
];

const Layout = ({ children }) => {
  const [theme, setTheme] = useState(() =>
    typeof document === "undefined"
      ? "dark"
      : document.documentElement.dataset.theme || "dark"
  );

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    setTheme(next);
  };

  const portrait = { backgroundImage: `url(${landingURL})` };

  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <div className="backdrop__blur" style={portrait} />
        <div className="backdrop__sharp" style={portrait} />
      </div>
      <button
        className="theme-toggle"
        onClick={toggle}
        aria-label="Toggle color theme"
        title="Toggle color theme"
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>
      <div className="container">
        <main>{children}</main>
        <footer>
          <span>© Mahmoud Saada</span>
          {socials.map((s) => (
            <a key={s.label} href={s.href}>
              {s.label}
            </a>
          ))}
        </footer>
      </div>
    </>
  );
};

export default Layout;
