import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  GraduationCap,
  Instagram,
  Mail,
  Menu,
  Phone,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type NavLinkItem = {
  name: string;
  path: string;
};

const leftMenu: NavLinkItem[] = [
  { name: "Homepage", path: "/" },
  { name: "Meet Meera", path: "/about" },
  { name: "Makeup Services", path: "/services" },
];

const rightMenu: NavLinkItem[] = [
  { name: "Portfolio", path: "/portfolio" },
  { name: "The Journal", path: "/testimonials" },
  { name: "Contact", path: "/contact" },
];

const socialLinks = [
  {
    href: "https://instagram.com/meerasakhrani",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "mailto:hello@meeramakeupstudio.com",
    label: "Email",
    icon: Mail,
  },
  {
    href: "tel:+918448229694",
    label: "Phone",
    icon: Phone,
  },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const desktopLinkClass = (path: string) =>
    [
      "relative inline-flex items-center justify-center rounded-full px-3 py-1.5",
      "font-sans text-[12px] uppercase tracking-[0.34em] transition-all duration-300",
      isActive(path)
        ? "bg-[#d9d2cf] text-[#6f565c] shadow-[0_6px_18px_rgba(146,117,121,0.12)]"
        : "text-[#826e70] hover:bg-white/70 hover:text-[#6f565c]",
    ].join(" ");

  const mobileLinkClass = (path: string) =>
    [
      "rounded-full px-4 py-3 text-center font-sans text-[12px] uppercase tracking-[0.3em] transition-all duration-300",
      isActive(path)
        ? "bg-[#a78594] text-white shadow-[0_12px_30px_rgba(122,94,111,0.2)]"
        : "border border-[#eadfdb] bg-white/90 text-[#7b6668] hover:border-[#cdb7bb] hover:text-[#6c5459]",
    ].join(" ");

  const renderMenuGroup = (links: NavLinkItem[]) => (
    <div className="flex min-w-[11rem] flex-col items-center gap-2 text-center">
      {links.map((link) => (
        <Link key={link.path} to={link.path} className={desktopLinkClass(link.path)}>
          {link.name}
        </Link>
      ))}
    </div>
  );

  return (
    <nav className="fixed left-0 right-0 top-0 z-[999] border-b border-[#efe4de] bg-[#fbf5f0]/95 shadow-[0_8px_30px_rgba(126,98,105,0.06)] backdrop-blur-md">
      <div className="mx-auto hidden max-w-[1480px] items-center justify-between gap-6 px-6 py-6 lg:flex xl:px-10">
        <div className="flex w-[180px] shrink-0 justify-start">
          <Link
            to="/classes"
            className="group inline-flex flex-col items-center gap-1 text-center text-[#b59565] transition"
          >
            <GraduationCap className="h-5 w-5 transition group-hover:scale-105" />
            <span className="font-sans text-[12px] uppercase tracking-[0.28em] text-[#b08c5d]">
              Makeup School
            </span>
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-8 xl:gap-12">
          {renderMenuGroup(leftMenu)}

          <div className="h-28 w-px bg-gradient-to-b from-transparent via-[#e4d8d2] to-transparent" />

          <Link to="/" className="flex min-w-[250px] flex-col items-center px-2 text-center">
            <span className="font-script text-[4.35rem] leading-none text-[#8d6c6d]">
              Meera
            </span>
            <span className="mt-1 font-serif text-[1.04rem] uppercase tracking-[0.62em] text-[#94787a]">
              Sakhrani
            </span>
          </Link>

          <div className="h-28 w-px bg-gradient-to-b from-transparent via-[#e4d8d2] to-transparent" />

          {renderMenuGroup(rightMenu)}
        </div>

        <div className="flex w-[180px] shrink-0 items-center justify-end gap-3">
          <Link
            to="/contact"
            className="group inline-flex flex-col items-center gap-1 text-center transition"
          >
            <Calendar className="h-5 w-5 text-[#b59565] transition group-hover:scale-105" />
            <span className="font-sans text-[12px] uppercase tracking-[0.28em] text-[#b08c5d]">
              Book Appointment
            </span>
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-4 lg:hidden sm:px-6">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-script text-[2.95rem] text-[#8d6c6d]">Meera</span>
          <span className="mt-1 font-serif text-[0.72rem] uppercase tracking-[0.42em] text-[#94787a]">
            Sakhrani
          </span>
        </Link>

        <button
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#eaded8] bg-white/85 text-[#6d565d] shadow-sm transition hover:bg-white"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-[#eee1dc] bg-[#fbf5f0] px-5 pb-6 pt-5 shadow-[0_20px_40px_rgba(129,103,109,0.08)] lg:hidden sm:px-6">
          <div className="grid gap-3">
            {[...leftMenu, ...rightMenu].map((link) => (
              <Link key={link.path} to={link.path} className={mobileLinkClass(link.path)}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#e8dcd5] to-transparent" />

          <div className="grid gap-3">
            <Link to="/classes" className="rounded-full border border-[#eadfdb] bg-white/90 px-4 py-3 text-center font-sans text-[12px] uppercase tracking-[0.3em] text-[#7b6668] transition hover:border-[#cdb7bb] hover:text-[#6c5459]">
              Makeup School
            </Link>
            <Link to="/contact" className="rounded-full bg-[#a78594] px-4 py-3 text-center font-sans text-[12px] uppercase tracking-[0.3em] text-white shadow-[0_12px_30px_rgba(122,94,111,0.2)] transition hover:opacity-95">
              Book Appointment
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            {socialLinks.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={item.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfdb] bg-white/90 text-[#7b6668] transition hover:border-[#cdb7bb] hover:text-[#6c5459]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
