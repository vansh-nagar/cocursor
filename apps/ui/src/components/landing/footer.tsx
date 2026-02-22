"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Github, Twitter, MessageCircle, ArrowUpRight, Mail, MessageSquare } from "lucide-react";
import OrangeButton from "./button/orange-button";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Workspace", href: "#workspace" },
        { name: "Real-time Sync", href: "#collab" },
        { name: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "Changelog", href: "/changelog" },
        { name: "Support", href: "mailto:support@cocursor.com" },
        { name: "API Reference", href: "/api-docs" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Twitter", icon: <Twitter size={18} />, href: "https://twitter.com/cocursor" },
    { name: "GitHub", icon: <Github size={18} />, href: "https://github.com/cocursor" },
    { name: "Discord", icon: <MessageCircle size={18} />, href: "https://discord.gg/cocursor" },
  ];

  return (
    <footer className="relative w-full bg-black border-zinc-900 pt-20 pb-10 overflow-hidden">
    
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Main Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-20">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <svg
                className="w-8 h-8"
                viewBox="0 0 87 91"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M47.1643 21.4431L1.51616 34.7167C0.385676 35.0454 0.305338 36.6102 1.39625 37.0521L21.7132 45.2821C22.083 45.4319 22.358 45.7495 22.4525 46.1357L28.1896 69.5876C28.4777 70.7653 30.1174 70.8716 30.5564 69.741L48.6718 23.0781C49.0431 22.1215 48.1526 21.1557 47.1643 21.4431Z"
                  fill="white"
                />
                <path
                  d="M39.811 69.2416L85.4341 55.8831C86.564 55.5523 86.6415 53.9874 85.5497 53.5476L65.2175 45.3554C64.8473 45.2063 64.5717 44.8891 64.4765 44.5029L58.6954 21.0619C58.4051 19.8847 56.7653 19.7815 56.3284 20.9129L38.3004 67.6093C37.9309 68.5666 38.8231 69.5308 39.811 69.2416Z"
                  fill="white"
                />
              </svg>
              <span className="text-white font-bold text-xl tracking-tight">
                Cocursor
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              The collaborative AI workspace built for modern software teams.
              Code, review, and deploy in one unified environment.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-orange-500 hover:border-orange-500/50 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-white font-semibold mb-6">{group.title}</h3>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-zinc-500 hover:text-white transition-colors text-sm flex items-center gap-1 group"
                    >
                      {link.name}
                      {link.href.startsWith("http") && (
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-zinc-500 text-sm">
            © {currentYear} Cocursor Inc. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
