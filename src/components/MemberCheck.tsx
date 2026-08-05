"use client";

import { useState } from "react";
import Icon from "./Icon";
import mapData from "@/data/moldova-districts.json";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type District = { id: string; ro: string; ru: string; en: string };
type Result =
  | { member: true; joinedAt: string; districtId: string }
  | { member: false };

/* The applicant's side of the approval flow: he types the phone number he put
   on his application and finds out whether the secretariat has admitted him.
   One field, one answer — see /api/membership/lookup for why it is the phone
   number and not his name. */
export default function MemberCheck({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.pages.memberArea;
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "done" | "failed">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const districtName = (id: string) =>
    (mapData.districts as District[]).find((d) => d.id === id)?.[locale] ?? id;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "checking") return;
    if (phone.replace(/\D/g, "").length < 6) {
      setError(t.errPhone);
      return;
    }
    setStatus("checking");
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/membership/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setResult(await res.json());
      setStatus("done");
    } catch {
      setStatus("failed");
      setError(t.errFailed);
    }
  }

  return (
    <div className="check-card">
      <h2>{t.checkTitle}</h2>
      <p className="check-lead">{t.checkLead}</p>

      <form className="check-form" onSubmit={submit}>
        <div className="f-field">
          <label htmlFor="checkPhone">{t.phone}</label>
          <input
            id="checkPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t.phonePh}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError(null);
            }}
            aria-invalid={!!error}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={status === "checking"}>
          {status === "checking" ? t.checking : t.submit}
        </button>
      </form>

      {error && (
        <span className="f-err" role="alert">
          {error}
        </span>
      )}

      {status === "done" && result?.member === true && (
        <div className="check-result is-yes" role="status">
          <div className="ic">
            <Icon name="badgeCheck" size={26} />
          </div>
          <div>
            <b>{t.foundTitle}</b>
            <dl>
              <div>
                <dt>{t.foundSince}</dt>
                <dd>{result.joinedAt}</dd>
              </div>
              {result.districtId && (
                <div>
                  <dt>{t.foundDistrict}</dt>
                  <dd>{districtName(result.districtId)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {status === "done" && result?.member === false && (
        <div className="check-result is-no" role="status">
          <div className="ic">
            <Icon name="clock" size={26} />
          </div>
          <div>
            <b>{t.notFoundTitle}</b>
            <p>{t.notFoundDesc}</p>
          </div>
        </div>
      )}

      <p className="check-privacy">{t.privacy}</p>
    </div>
  );
}
