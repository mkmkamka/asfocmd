"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import { LimelightButton } from "./ui/limelight-button";
import mapData from "@/data/moldova-districts.json";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type District = { id: string; ro: string; ru: string; en: string };

/* Accepted evidence. Deliberately narrow: these are scans of a registration
   certificate and an identity card, so anything that can execute has no reason
   to be in the list. The server re-checks both this and the size limit — the
   client copy exists to fail fast, not to be the gate. */
const ACCEPT = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_FILES = 10;

type FormData = {
  fullName: string;
  phone: string;
  email: string;
  districtId: string;
  locality: string;
  /* Legal-entity block. An application can come from a sole sweep or from a
     firm applying through its representative; everything from `companyName`
     down is asked only in the second case. */
  isCompany: boolean;
  companyName: string;
  companyIdno: string;
  companyAddress: string;
  companyEmail: string;
  companyDesc: string;
  domains: number[];
  experience: string;
  about: string;
  heardFrom: string;
  advantage: string;
  attraction: string;
  consentGdpr: boolean;
  consentStatut: boolean;
  declaration: boolean;
};

const EMPTY: FormData = {
  fullName: "",
  phone: "",
  email: "",
  districtId: "",
  locality: "",
  isCompany: false,
  companyName: "",
  companyIdno: "",
  companyAddress: "",
  companyEmail: "",
  companyDesc: "",
  domains: [],
  experience: "",
  about: "",
  heardFrom: "",
  advantage: "",
  attraction: "",
  consentGdpr: false,
  consentStatut: false,
  declaration: false,
};

const LAST_STEP = 3;

export default function MembershipForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const f = dict.home.membershipForm;
  /* The application asks about eight trades, not the five the public services
     grid advertises — production/import, extractor hoods and AC/photovoltaic
     cleaning are trades the association wants to know about before it lists
     them. The first five entries are in the same order as `hero.services`, so
     an approved applicant's picks map straight onto the public taxonomy. */
  const domainNames = f.domains;
  const base = `/${locale}`;

  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData | "files", string>>
  >({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed">(
    "idle",
  );
  const fileInput = useRef<HTMLInputElement>(null);

  /* "1 fișiere atașate" is wrong in Romanian and "5 файла" is wrong in
     Russian — both languages inflect the noun on the count, and Russian needs
     three forms rather than two. `Intl.PluralRules` already knows each
     locale's rule, so the dictionaries only have to carry the forms. */
  const fileCount = (n: number) => {
    const rule = new Intl.PluralRules(locale).select(n);
    const word =
      rule === "one" ? f.docsChosenOne : rule === "few" ? f.docsChosenFew : f.docsChosen;
    return `${n} ${word}`;
  };

  const districts = (mapData.districts as District[]).map((d) => ({
    id: d.id,
    name: d[locale] ?? d.ro,
  }));

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function addFiles(picked: FileList | null) {
    if (!picked) return;
    const next = [...files];
    let err: string | undefined;
    for (const file of Array.from(picked)) {
      if (!ACCEPT.includes(file.type)) {
        err = f.errDocsType;
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        err = f.errDocsSize;
        continue;
      }
      if (next.length >= MAX_FILES) {
        err = f.errDocsCount;
        break;
      }
      next.push(file);
    }
    setFiles(next);
    setErrors((e) => ({ ...e, files: err }));
    if (fileInput.current) fileInput.current.value = "";
  }

  function validateStep(s: number): boolean {
    const e: Partial<Record<keyof FormData | "files", string>> = {};
    if (s === 0) {
      if (!data.fullName.trim()) e.fullName = f.errRequired;
      if (!/^\+?[\d\s\-()]{8,}$/.test(data.phone.trim())) e.phone = f.errPhone;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
        e.email = f.errEmail;
      if (!data.districtId) e.districtId = f.errRequired;
      if (!data.locality.trim()) e.locality = f.errRequired;
      if (data.isCompany) {
        if (!data.companyName.trim()) e.companyName = f.errRequired;
        if (!data.companyIdno.trim()) e.companyIdno = f.errRequired;
        // Optional field, but a typo in it is worth catching now — this is the
        // address the secretariat will write to.
        if (
          data.companyEmail.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.companyEmail.trim())
        )
          e.companyEmail = f.errEmail;
      }
    }
    if (s === 1) {
      if (data.domains.length === 0) e.domains = f.errServices;
      if (!data.experience.trim()) e.experience = f.errRequired;
    }
    if (s === 2) {
      if (!data.heardFrom.trim()) e.heardFrom = f.errRequired;
      if (!data.advantage.trim()) e.advantage = f.errRequired;
      if (!data.attraction.trim()) e.attraction = f.errRequired;
      if (files.length === 0) e.files = f.errDocs;
    }
    if (s === 3) {
      if (!data.consentGdpr) e.consentGdpr = f.errCheck;
      if (!data.consentStatut) e.consentStatut = f.errCheck;
      if (!data.declaration) e.declaration = f.errCheck;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validateStep(LAST_STEP)) return;
    setStatus("sending");
    try {
      // Multipart rather than JSON: the documents travel with the answers, so a
      // half-submitted application is not a state the secretariat can end up in.
      const body = new FormData();
      body.append("payload", JSON.stringify({ ...data, locale }));
      for (const file of files) body.append("files", file, file.name);
      const res = await fetch("/api/membership", { method: "POST", body });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "done") {
    return (
      <div className="form-card success" role="status">
        <div className="ok-ic">
          <Icon name="badgeCheck" size={30} />
        </div>
        <h2>{f.successTitle}</h2>
        <p>{f.successDesc}</p>
        <Link className="btn btn-primary" href={base}>
          {f.backHome}
        </Link>
      </div>
    );
  }

  const districtName =
    districts.find((d) => d.id === data.districtId)?.name ?? "—";

  return (
    <div className="form-card">
      {/* step indicator */}
      <ol className="fsteps" aria-label={f.title}>
        {f.steps.map((label, i) => (
          <li
            key={i}
            className={i === step ? "cur" : i < step ? "done" : ""}
            aria-current={i === step ? "step" : undefined}
          >
            <span className="n">{i < step ? "✓" : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="f-grid">
          <div className="f-field">
            <label htmlFor="fullName">{f.fullName} *</label>
            <input
              id="fullName"
              autoComplete="name"
              placeholder={f.fullNamePh}
              value={data.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && (
              <span className="f-err" role="alert">
                {errors.fullName}
              </span>
            )}
          </div>
          <div className="f-field half">
            <label htmlFor="phone">{f.phone} *</label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder={f.phonePh}
              value={data.phone}
              onChange={(e) => set("phone", e.target.value)}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <span className="f-err" role="alert">
                {errors.phone}
              </span>
            )}
          </div>
          <div className="f-field half">
            <label htmlFor="email">{f.email} *</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={f.emailPh}
              value={data.email}
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <span className="f-err" role="alert">
                {errors.email}
              </span>
            )}
          </div>
          <div className="f-field half">
            <label htmlFor="district">{f.district} *</label>
            <select
              id="district"
              value={data.districtId}
              onChange={(e) => set("districtId", e.target.value)}
              aria-invalid={!!errors.districtId}
            >
              <option value="">{f.districtPh}</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.districtId && (
              <span className="f-err" role="alert">
                {errors.districtId}
              </span>
            )}
          </div>
          <div className="f-field half">
            <label htmlFor="locality">{f.locality} *</label>
            <input
              id="locality"
              autoComplete="address-level2"
              placeholder={f.localityPh}
              value={data.locality}
              onChange={(e) => set("locality", e.target.value)}
              aria-invalid={!!errors.locality}
            />
            {errors.locality && (
              <span className="f-err" role="alert">
                {errors.locality}
              </span>
            )}
          </div>

          {/* Legal entity. One switch, and the five company fields only exist
              once it is on — a sole sweep never sees a field about a firm. */}
          <fieldset className="f-field">
            <legend>{f.entity}</legend>
            <label className="f-consent">
              <input
                type="checkbox"
                checked={data.isCompany}
                onChange={(e) => set("isCompany", e.target.checked)}
              />
              <span>{f.isCompany}</span>
            </label>
          </fieldset>

          {data.isCompany && (
            <>
              <div className="f-field half">
                <label htmlFor="companyName">{f.companyName} *</label>
                <input
                  id="companyName"
                  autoComplete="organization"
                  placeholder={f.companyNamePh}
                  value={data.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  aria-invalid={!!errors.companyName}
                />
                {errors.companyName && (
                  <span className="f-err" role="alert">
                    {errors.companyName}
                  </span>
                )}
              </div>
              <div className="f-field half">
                <label htmlFor="companyIdno">{f.companyIdno} *</label>
                <input
                  id="companyIdno"
                  inputMode="numeric"
                  placeholder={f.companyIdnoPh}
                  value={data.companyIdno}
                  onChange={(e) => set("companyIdno", e.target.value)}
                  aria-invalid={!!errors.companyIdno}
                />
                {errors.companyIdno && (
                  <span className="f-err" role="alert">
                    {errors.companyIdno}
                  </span>
                )}
              </div>
              <div className="f-field half">
                <label htmlFor="companyAddress">{f.companyAddress}</label>
                <input
                  id="companyAddress"
                  placeholder={f.companyAddressPh}
                  value={data.companyAddress}
                  onChange={(e) => set("companyAddress", e.target.value)}
                />
              </div>
              <div className="f-field half">
                <label htmlFor="companyEmail">{f.companyEmail}</label>
                <input
                  id="companyEmail"
                  type="email"
                  placeholder={f.companyEmailPh}
                  value={data.companyEmail}
                  onChange={(e) => set("companyEmail", e.target.value)}
                  aria-invalid={!!errors.companyEmail}
                />
                {errors.companyEmail && (
                  <span className="f-err" role="alert">
                    {errors.companyEmail}
                  </span>
                )}
              </div>
              <div className="f-field">
                <label htmlFor="companyDesc">{f.companyDesc}</label>
                <textarea
                  id="companyDesc"
                  rows={3}
                  placeholder={f.companyDescPh}
                  value={data.companyDesc}
                  onChange={(e) => set("companyDesc", e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="f-grid">
          <fieldset className="f-field">
            <legend>{f.domainsLabel} *</legend>
            <div className="svc-picks">
              {domainNames.map((name, i) => {
                const on = data.domains.includes(i);
                return (
                  <button
                    type="button"
                    key={i}
                    className={`pick${on ? " on" : ""}`}
                    aria-pressed={on}
                    onClick={() =>
                      set(
                        "domains",
                        on
                          ? data.domains.filter((s) => s !== i)
                          : [...data.domains, i],
                      )
                    }
                  >
                    {name}
                  </button>
                );
              })}
            </div>
            {errors.domains && (
              <span className="f-err" role="alert">
                {errors.domains}
              </span>
            )}
          </fieldset>
          <div className="f-field half">
            <label htmlFor="experience">{f.experience} *</label>
            <input
              id="experience"
              type="number"
              min="0"
              max="60"
              inputMode="numeric"
              value={data.experience}
              onChange={(e) => set("experience", e.target.value)}
              aria-invalid={!!errors.experience}
            />
            {errors.experience && (
              <span className="f-err" role="alert">
                {errors.experience}
              </span>
            )}
          </div>
          <div className="f-field">
            <label htmlFor="about">{f.about}</label>
            <textarea
              id="about"
              rows={4}
              placeholder={f.aboutPh}
              value={data.about}
              onChange={(e) => set("about", e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="f-grid">
          <div className="f-field">
            <label htmlFor="heardFrom">{f.heardFrom} *</label>
            <input
              id="heardFrom"
              placeholder={f.heardFromPh}
              value={data.heardFrom}
              onChange={(e) => set("heardFrom", e.target.value)}
              aria-invalid={!!errors.heardFrom}
            />
            {errors.heardFrom && (
              <span className="f-err" role="alert">
                {errors.heardFrom}
              </span>
            )}
          </div>
          <div className="f-field">
            <label htmlFor="advantage">{f.advantage} *</label>
            <textarea
              id="advantage"
              rows={3}
              value={data.advantage}
              onChange={(e) => set("advantage", e.target.value)}
              aria-invalid={!!errors.advantage}
            />
            {errors.advantage && (
              <span className="f-err" role="alert">
                {errors.advantage}
              </span>
            )}
          </div>
          <div className="f-field">
            <label htmlFor="attraction">{f.attraction} *</label>
            <textarea
              id="attraction"
              rows={3}
              value={data.attraction}
              onChange={(e) => set("attraction", e.target.value)}
              aria-invalid={!!errors.attraction}
            />
            {errors.attraction && (
              <span className="f-err" role="alert">
                {errors.attraction}
              </span>
            )}
          </div>

          <fieldset className="f-field">
            <legend>{f.docs} *</legend>
            <p className="f-hint">{f.docsHint}</p>
            <input
              ref={fileInput}
              id="docs"
              type="file"
              multiple
              accept={ACCEPT.join(",")}
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
            <div className="f-upload">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => fileInput.current?.click()}
              >
                <Icon name="upload" size={18} />
                {f.docsAdd}
              </button>
              {files.length > 0 && (
                <span className="f-hint">{fileCount(files.length)}</span>
              )}
            </div>
            {files.length > 0 && (
              <ul className="f-files">
                {files.map((file, i) => (
                  <li key={`${file.name}-${i}`}>
                    <Icon name="doc" size={16} />
                    <span className="fn">{file.name}</span>
                    <span className="fs">
                      {Math.max(1, Math.round(file.size / 1024))} KB
                    </span>
                    <button
                      type="button"
                      aria-label={f.docsRemove}
                      title={f.docsRemove}
                      onClick={() =>
                        setFiles(files.filter((_, j) => j !== i))
                      }
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.files && (
              <span className="f-err" role="alert">
                {errors.files}
              </span>
            )}
          </fieldset>
        </div>
      )}

      {step === 3 && (
        <div className="f-grid">
          <p className="f-review-title">{f.review}</p>
          <dl className="f-review">
            <div>
              <dt>{f.fullName}</dt>
              <dd>{data.fullName}</dd>
            </div>
            <div>
              <dt>{f.phone}</dt>
              <dd>{data.phone}</dd>
            </div>
            <div>
              <dt>{f.email}</dt>
              <dd>{data.email}</dd>
            </div>
            <div>
              <dt>{f.district}</dt>
              <dd>
                {districtName}, {data.locality}
              </dd>
            </div>
            {data.isCompany && (
              <div>
                <dt>{f.companyName}</dt>
                <dd>
                  {data.companyName} · {data.companyIdno}
                </dd>
              </div>
            )}
            <div>
              <dt>{f.domainsLabel}</dt>
              <dd>{data.domains.map((s) => domainNames[s]).join(", ")}</dd>
            </div>
            <div>
              <dt>{f.experience}</dt>
              <dd>{data.experience}</dd>
            </div>
            <div>
              <dt>{f.docs}</dt>
              <dd>{fileCount(files.length)}</dd>
            </div>
          </dl>

          {/* Three separate declarations, not one. Data-processing consent,
              acceptance of the Statute and the Code of Conduct, and the
              membership request itself are three different things being agreed
              to, and a single tick covering all three is not a record of
              consent anyone would want to rely on later. */}
          <label className="f-consent">
            <input
              type="checkbox"
              checked={data.consentGdpr}
              onChange={(e) => set("consentGdpr", e.target.checked)}
              aria-invalid={!!errors.consentGdpr}
            />
            <span>{f.consentGdpr}</span>
          </label>
          {errors.consentGdpr && (
            <span className="f-err" role="alert">
              {errors.consentGdpr}
            </span>
          )}

          <label className="f-consent">
            <input
              type="checkbox"
              checked={data.consentStatut}
              onChange={(e) => set("consentStatut", e.target.checked)}
              aria-invalid={!!errors.consentStatut}
            />
            <span>{f.consentStatut}</span>
          </label>
          {errors.consentStatut && (
            <span className="f-err" role="alert">
              {errors.consentStatut}
            </span>
          )}

          <label className="f-consent">
            <input
              type="checkbox"
              checked={data.declaration}
              onChange={(e) => set("declaration", e.target.checked)}
              aria-invalid={!!errors.declaration}
            />
            <span>{f.declaration}</span>
          </label>
          {errors.declaration && (
            <span className="f-err" role="alert">
              {errors.declaration}
            </span>
          )}

          {status === "failed" && (
            <span className="f-err" role="alert">
              {f.errSubmit}
            </span>
          )}
        </div>
      )}

      <div className="f-nav">
        {step > 0 ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={status === "sending"}
          >
            {f.back}
          </button>
        ) : (
          <span />
        )}
        {step < LAST_STEP ? (
          <LimelightButton
            type="button"
            hoverLamp
            onClick={() => validateStep(step) && setStep((s) => s + 1)}
          >
            {step === 0 ? f.becomeCta : f.next}
          </LimelightButton>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={submit}
            disabled={status === "sending"}
          >
            {status === "sending" ? f.sending : f.submit}
          </button>
        )}
      </div>
    </div>
  );
}
