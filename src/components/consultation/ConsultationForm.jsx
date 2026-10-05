import { useRef, useState } from "react";
import { useConsultation } from "./ConsultationContext";
import { submitConsultation } from "./submit";
import {
  STEPS, UI, PATIENT_TYPES, SUMMARY_FIELDS, basicFields, sectionsForStep, t, optionLabel,
} from "./schema";
import "./consultation.css";

const MAX_FILE = 20 * 1024 * 1024;
const isLtr = (type) => ["tel", "email", "number", "date"].includes(type);

// ---------- ek sawal (field) ----------
function Field({ field, lang, data, setField, error }) {
  const value = data[field.name];
  const otherName = `${field.name}_other`;
  const label = t(field.label, lang);

  const toggle = (val) => {
    if (field.type === "chips") {
      setField(field.name, value === val ? "" : val);
      return;
    }
    const cur = Array.isArray(value) ? value : [];
    let next;
    if (cur.includes(val)) next = cur.filter((x) => x !== val);
    else if (val === "none") next = ["none"]; // "None" baaki sab hata deta hai
    else next = [...cur.filter((x) => x !== "none"), val];
    setField(field.name, next);
  };

  const isOn = (val) => (field.type === "chips" ? value === val : Array.isArray(value) && value.includes(val));

  return (
    <div className={`cf-field ${error ? "has-error" : ""}`} data-field={field.name}>
      <label className="cf-label" htmlFor={`cf-${field.name}`}>
        {label}
        {field.required && <span className="cf-req"> *</span>}
      </label>

      {(field.type === "chips" || field.type === "multi") && (
        <>
          <div className="cf-chips" role={field.type === "chips" ? "radiogroup" : "group"} aria-label={label}>
            {field.options.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`cf-chip ${isOn(opt.value) ? "on" : ""}`}
                aria-pressed={isOn(opt.value)}
                onClick={() => toggle(opt.value)}
              >
                {t(opt, lang)}
              </button>
            ))}
          </div>
          {field.other && (
            <input
              type="text"
              className="cf-input cf-other"
              placeholder={t(UI.other, lang)}
              value={data[otherName] ?? ""}
              onChange={(e) => setField(otherName, e.target.value)}
            />
          )}
        </>
      )}

      {field.type === "select" && (
        <select
          id={`cf-${field.name}`}
          className="cf-input"
          value={value ?? ""}
          onChange={(e) => setField(field.name, e.target.value)}
        >
          <option value="">{field.required ? "" : t(UI.choose, lang)}</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{t(opt, lang)}</option>
          ))}
        </select>
      )}

      {["text", "tel", "email", "number", "date"].includes(field.type) && (
        <input
          id={`cf-${field.name}`}
          type={field.type}
          className="cf-input"
          dir={isLtr(field.type) ? "ltr" : undefined}
          style={isLtr(field.type) && lang === "ur" ? { textAlign: "right" } : undefined}
          placeholder={t(field.placeholder, lang)}
          min={field.min}
          max={field.max}
          inputMode={field.type === "tel" ? "tel" : field.type === "number" ? "numeric" : undefined}
          autoComplete={field.type === "tel" ? "tel" : field.type === "email" ? "email" : undefined}
          value={value ?? ""}
          onChange={(e) => setField(field.name, e.target.value)}
        />
      )}

      {error && <div className="cf-error" role="alert">{error}</div>}
    </div>
  );
}

// ---------- pura form ----------
export default function ConsultationForm({ variant = "modal", onClose }) {
  const c = useConsultation();
  const { lang, setLang, step, setStep, data, setField, file, setFile } = c;
  const [errors, setErrors] = useState({});
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef(null);
  const L = lang || "en";

  const scrollTop = () => bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const validate = (stepIndex) => {
    const errs = {};
    const req = (name) => {
      const v = data[name];
      if (v === undefined || v === null || String(v).trim() === "") errs[name] = t(UI.required, L);
    };
    if (stepIndex === 0) {
      basicFields.filter((f) => f.required).forEach((f) => req(f.name));
      if (!errs.phone && !/^[0-9+\-\s()]{7,20}$/.test(data.phone.trim())) errs.phone = t(UI.badPhone, L);
      if (!errs.age) {
        const n = Number(data.age);
        if (!Number.isFinite(n) || n < 0 || n > 120) errs.age = t(UI.badAge, L);
      }
      if (data.email && !/^\S+@\S+\.\S+$/.test(data.email.trim())) errs.email = t(UI.badEmail, L);
    }
    if (stepIndex === 3 && !consent) errs.consent = t(UI.consentRequired, L);
    return errs;
  };

  const focusFirstError = (errs) => {
    const first = Object.keys(errs)[0];
    requestAnimationFrame(() => {
      const el = bodyRef.current?.querySelector(`[data-field="${first}"]`) || bodyRef.current?.querySelector(".cf-consent.has-error");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const next = () => {
    const errs = validate(step);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(errs);
    c.dismissRestored();
    setStep(step + 1);
    scrollTop();
  };

  const back = () => {
    setErrors({});
    setStep(Math.max(0, step - 1));
    scrollTop();
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setErrors((x) => ({ ...x, file: t(UI.filePdfOnly, L) }));
      return;
    }
    if (f.size > MAX_FILE) {
      setErrors((x) => ({ ...x, file: t(UI.fileTooBig, L) }));
      return;
    }
    setErrors((x) => ({ ...x, file: undefined }));
    setFile(f);
  };

  const submit = async () => {
    const errs = validate(3);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(errs);
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitConsultation({ data, file, lang: L });
      c.markSubmitted();
    } catch (err) {
      console.error(err);
      const basic = new Set(basicFields.map((f) => f.name));
      const bad = (err.fields || []).filter((n) => basic.has(n));
      if (bad.length) {
        // server ko koi basic field galat laga - wapas pehle step par le jao aur wahan dikhao
        const e = {};
        bad.forEach((n) => (e[n] = n === "age" ? t(UI.badAge, L) : t(UI.badField, L)));
        setErrors(e);
        setStep(0);
        focusFirstError(e);
      } else {
        setSubmitError(t(UI.submitError, L)); // answers saved hain, dobara try kar sakte hain
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/consultation`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Form link:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const startOver = () => {
    if (window.confirm(t(UI.confirmStartOver, L))) {
      c.reset();
      setErrors({});
      setConsent(false);
    }
  };

  const dir = L === "ur" ? "rtl" : "ltr";

  // ---- header ----
  const header = (
    <div className="cf-header">
      <h2 className="cf-title">{t(UI.title, L)}</h2>
      <div className="cf-header-actions">
        {lang && !c.submitted && (
          <button type="button" className="cf-lang-switch" onClick={() => setLang(lang === "en" ? "ur" : "en")}>
            {t(UI.langSwitch, L)}
          </button>
        )}
        {variant === "modal" && (
          <button type="button" className="cf-link-btn" onClick={copyLink} title={t(UI.copyLink, L)}>
            {copied ? `✓ ${t(UI.copied, L)}` : `🔗 ${t(UI.copyLink, L)}`}
          </button>
        )}
        {variant === "modal" && (
          <button type="button" className="cf-close" onClick={onClose} aria-label={t(UI.close, L)}>×</button>
        )}
      </div>
    </div>
  );

  const shell = (inner) => (
    <div className={`cf-card cf-${variant}`} dir={dir} lang={L === "ur" ? "ur" : "en"}>
      {header}
      {inner}
    </div>
  );

  // ---- submit ho gaya ----
  if (c.submitted) {
    return shell(
      <div className="cf-success">
        <div className="cf-success-icon">✓</div>
        <h3>{t(UI.successTitle, L)}</h3>
        <p>{t(UI.successText, L)}</p>
        <button type="button" className="cf-btn cf-btn-gold" onClick={() => { c.reset(); setConsent(false); }}>
          {t(UI.newForm, L)}
        </button>
      </div>
    );
  }

  // ---- language choose karo ----
  if (!lang) {
    return shell(
      <div className="cf-lang">
        <h3>{t(UI.chooseLang, "en")}</h3>
        <p className="cf-lang-sub">{UI.chooseLangSub.en}</p>
        <div className="cf-lang-btns">
          <button type="button" className="cf-lang-opt" onClick={() => setLang("en")}>{UI.fillEnglish.en}</button>
          <button type="button" className="cf-lang-opt urdu" onClick={() => setLang("ur")}>{UI.fillUrdu.en}</button>
        </div>
      </div>
    );
  }

  // ---- wizard ----
  const patientType = data.patientType;
  const sections = sectionsForStep(step, patientType);

  return shell(
    <>
      <div className="cf-stepper" aria-label="Progress">
        <div className="cf-steps">
          {STEPS.map((s, i) => (
            <div key={s.key} className="cf-step-wrap">
              <div className={`cf-dot ${i < step ? "done" : ""} ${i === step ? "active" : ""}`}>{i + 1}</div>
              {i < STEPS.length - 1 && <div className={`cf-line ${i < step ? "done" : ""}`} />}
            </div>
          ))}
        </div>
        <div className="cf-step-name">{t(STEPS[step].title, L)}</div>
      </div>

      <div className="cf-body" ref={bodyRef}>
        {c.restored && (
          <div className="cf-restored">
            <span>{t(UI.restored, L)}</span>
            <button type="button" onClick={startOver}>{t(UI.startOver, L)}</button>
            <button type="button" className="x" aria-label={t(UI.close, L)} onClick={c.dismissRestored}>×</button>
          </div>
        )}

        {step === 0 &&
          basicFields.map((f) => (
            <Field key={f.name} field={f} lang={L} data={data} setField={setField} error={errors[f.name]} />
          ))}

        {(step === 1 || step === 2) &&
          sections.map((sec, i) => (
            <section key={i} className="cf-section">
              <h3 className="cf-section-title"><span>{sec.icon}</span> {t(sec.title, L)}</h3>
              {sec.fields.map((f) => (
                <Field key={`${patientType}-${f.name}`} field={f} lang={L} data={data} setField={setField} error={errors[f.name]} />
              ))}
            </section>
          ))}

        {step === 3 && (
          <>
            <section className="cf-section">
              <h3 className="cf-section-title">{t(UI.summary, L)}</h3>
              <div className="cf-summary">
                {SUMMARY_FIELDS.map((name) => {
                  const f = basicFields.find((x) => x.name === name);
                  let v = data[name];
                  if (!v) return null;
                  if (name === "patientType") v = optionLabel(PATIENT_TYPES, v, L);
                  if (name === "age") v = `${v} ${t(UI.years, L)}`;
                  return (
                    <div className="cf-sum-row" key={name}>
                      <span>{t(f.label, L)}:</span>
                      <strong>{v}</strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="cf-field">
              <label className="cf-label" htmlFor="cf-address">{t(UI.address, L)}</label>
              <textarea
                id="cf-address"
                className="cf-input"
                rows={3}
                placeholder={t(UI.addressPh, L)}
                value={data.address ?? ""}
                onChange={(e) => setField("address", e.target.value)}
              />
            </div>

            <div className="cf-field">
              <label className="cf-label" htmlFor="cf-budget">{t(UI.budget, L)}</label>
              <input
                id="cf-budget"
                className="cf-input"
                inputMode="numeric"
                dir="ltr"
                style={L === "ur" ? { textAlign: "right" } : undefined}
                placeholder={t(UI.budgetPh, L)}
                value={data.budget ?? ""}
                onChange={(e) => setField("budget", e.target.value)}
              />
            </div>

            <div className={`cf-field ${errors.file ? "has-error" : ""}`}>
              <span className="cf-label">
                {t(UI.report, L)} <small className="cf-muted">{t(UI.reportOpt, L)}</small>
              </span>
              <div className="cf-file">
                <label className="cf-file-btn">
                  {t(UI.chooseFile, L)}
                  <input type="file" accept="application/pdf,.pdf" hidden onChange={onFile} />
                </label>
                {file ? (
                  <span className="cf-file-name" dir="ltr">
                    {file.name}
                    <button type="button" onClick={() => setFile(null)}>{t(UI.remove, L)}</button>
                  </span>
                ) : (
                  <span className="cf-muted">{t(UI.maxSize, L)}</span>
                )}
              </div>
              {errors.file && <div className="cf-error" role="alert">{errors.file}</div>}
            </div>

            <label className={`cf-consent ${errors.consent ? "has-error" : ""}`}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>{t(UI.consent, L)}</span>
            </label>
            {errors.consent && <div className="cf-error" role="alert">{errors.consent}</div>}
            {submitError && <div className="cf-error cf-submit-error" role="alert">{submitError}</div>}
          </>
        )}
      </div>

      <div className="cf-savebar">
        <span>✓ {t(UI.saved, L)}</span>
        <button type="button" onClick={startOver}>{t(UI.startOver, L)}</button>
      </div>

      <div className="cf-footer">
        {step > 0 ? (
          <button type="button" className="cf-btn cf-btn-ghost" onClick={back} disabled={submitting}>{t(UI.back, L)}</button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" className="cf-btn cf-btn-gold" onClick={next}>{t(UI.next, L)}</button>
        ) : (
          <button type="button" className="cf-btn cf-btn-gold" onClick={submit} disabled={submitting}>
            {submitting ? t(UI.submitting, L) : t(UI.submit, L)}
          </button>
        )}
      </div>
    </>
  );
}
