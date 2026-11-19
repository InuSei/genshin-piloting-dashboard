import { Link } from "react-router-dom";

const LINKS = [
  { to: "/pricelist/genshin", label: "Genshin Impact pricelist" },
  { to: "/pricelist/hsr", label: "Honkai: Star Rail pricelist" },
];

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "#0d1420", color: "#eef3f6" }}
    >
      <title>Page not found — Zapolyarny Bureau</title>
      <p className="font-mono text-[13px] font-bold tracking-[0.15em] uppercase" style={{ color: "#8fb8d1" }}>
        Zapolyarny Bureau
      </p>
      <h1 className="text-[28px] font-extrabold">This page doesn't exist</h1>
      <p className="text-[14px] max-w-sm" style={{ color: "#a9bccb" }}>
        The link may be mistyped or out of date. Our pricelists are here:
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="px-5 py-3 rounded-full text-[14px] font-bold"
            style={{ background: "linear-gradient(135deg, #4d7a99, #8fb8d1)", color: "#0d1420" }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
