"use client";

import { Send } from "lucide-react";

/** Contact form — no backend; opens a pre-filled email. */
export default function ContactForm() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();
    const subject = encodeURIComponent(
      "Website message" + (name ? " from " + name : "")
    );
    const body = encodeURIComponent(
      message + "\n\n— " + name + (email ? " <" + email + ">" : "")
    );
    window.location.href =
      "mailto:ethanmic6@gmail.com?subject=" + subject + "&body=" + body;
  };

  return (
    <div className="contact__formwrap reveal">
      <form className="contact__form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="cf-name">Name</label>
          <input
            id="cf-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
          />
        </div>
        <div className="field">
          <label htmlFor="cf-email">Email</label>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label htmlFor="cf-message">Message</label>
          <textarea
            id="cf-message"
            name="message"
            rows={4}
            placeholder="Say hello…"
          />
        </div>
        <div className="contact__submit">
          <button className="pill pill--cream" type="submit">
            Send Message
            <Send className="pill__icon" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}
