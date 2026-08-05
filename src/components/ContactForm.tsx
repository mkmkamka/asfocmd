"use client";

import { useState } from "react";
import Icon from "./Icon";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export default function ContactForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.pages.contact.form;
  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  function validate(): boolean {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = t.errRequired;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = t.errEmail;
    if (values.message.trim().length < 5) next.message = t.errRequired;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="form-card c-box success">
        <div className="ok-ic"><Icon name="badgeCheck" size={30} /></div>
        <h2>{t.successTitle}</h2>
        <p>{t.successDesc}</p>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setValues({ name: "", email: "", subject: "", message: "" });
            setStatus("idle");
          }}
        >
          {t.again}
        </button>
      </div>
    );
  }

  return (
    <form className="form-card c-box" onSubmit={submit} noValidate>
      {/* Titled like its two neighbours on /contact so the three boxes share a
          header rule. */}
      <h2 className="c-box-title">{t.title}</h2>
      <div className="f-grid">
        <div className="f-field half">
          <label htmlFor="cf-name">{t.name}</label>
          <input
            id="cf-name"
            value={values.name}
            onChange={set("name")}
            placeholder={t.namePh}
            aria-invalid={!!errors.name}
          />
          {errors.name && <span className="f-err">{errors.name}</span>}
        </div>
        <div className="f-field half">
          <label htmlFor="cf-email">{t.email}</label>
          <input
            id="cf-email"
            type="email"
            value={values.email}
            onChange={set("email")}
            placeholder={t.emailPh}
            aria-invalid={!!errors.email}
          />
          {errors.email && <span className="f-err">{errors.email}</span>}
        </div>
        <div className="f-field">
          <label htmlFor="cf-subject">{t.subject}</label>
          <input
            id="cf-subject"
            value={values.subject}
            onChange={set("subject")}
            placeholder={t.subjectPh}
          />
        </div>
        <div className="f-field">
          <label htmlFor="cf-message">{t.message}</label>
          <textarea
            id="cf-message"
            rows={3}
            value={values.message}
            onChange={set("message")}
            placeholder={t.messagePh}
            aria-invalid={!!errors.message}
          />
          {errors.message && <span className="f-err">{errors.message}</span>}
        </div>
      </div>
      {status === "error" && (
        <p className="f-err" style={{ marginTop: 14 }}>{t.errSubmit}</p>
      )}
      <div className="f-nav">
        <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
          {status === "sending" ? t.sending : t.send}
          <Icon name="send" size={18} />
        </button>
      </div>
    </form>
  );
}
