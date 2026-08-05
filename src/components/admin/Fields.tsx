/* Shared form pieces for the admin editors.

   The translation fields are the reason this file exists. Romanian is the one
   required language and Russian and English are optional, so they are folded
   into a <details> the owner can ignore entirely — visible enough to be found
   when he has a translation, quiet enough never to look like work he owes. */

export function Field({
  label,
  name,
  value,
  type = "text",
  required,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  value?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="f-field">
      <label htmlFor={name}>
        {label} {required && "*"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={value}
        placeholder={placeholder}
      />
      {hint && <span className="f-hint">{hint}</span>}
    </div>
  );
}

export function Area({
  label,
  name,
  value,
  rows = 5,
  required,
  hint,
}: {
  label: string;
  name: string;
  value?: string;
  rows?: number;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="f-field">
      <label htmlFor={name}>
        {label} {required && "*"}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        defaultValue={value}
      />
      {hint && <span className="f-hint">{hint}</span>}
    </div>
  );
}

/** Romanian input plus a collapsed pair of optional translations. */
export function Translated({
  label,
  name,
  value,
  area = false,
  rows = 5,
  required,
  hint,
}: {
  label: string;
  name: string;
  value?: { ro: string; ru?: string; en?: string };
  area?: boolean;
  rows?: number;
  required?: boolean;
  hint?: string;
}) {
  const Input = area ? Area : Field;
  return (
    <div className="f-translated">
      <Input
        label={`${label} (română)`}
        name={`${name}_ro`}
        value={value?.ro}
        required={required}
        rows={rows}
        hint={hint}
      />
      <details className="admin-translations">
        <summary>Traduceri — rusă și engleză (opțional)</summary>
        <div className="f-grid">
          <Input
            label={`${label} (rusă)`}
            name={`${name}_ru`}
            value={value?.ru}
            rows={rows}
          />
          <Input
            label={`${label} (engleză)`}
            name={`${name}_en`}
            value={value?.en}
            rows={rows}
          />
        </div>
      </details>
    </div>
  );
}

/** Upload a cover image, or paste a Facebook / external link, or both. */
export function MediaFields({
  image,
  link,
}: {
  image?: string;
  link?: string;
}) {
  return (
    <>
      <div className="f-field">
        <label htmlFor="imageFile">Imagine de copertă</label>
        {image && (
          <span className="admin-current-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" />
            <label className="f-consent">
              <input type="checkbox" name="removeImage" />
              <span>Elimină imaginea</span>
            </label>
          </span>
        )}
        <input
          id="imageFile"
          name="imageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
        />
        <span className="f-hint">
          JPG, PNG, WebP sau AVIF, până la 6 MB. Dacă nu alegi un fișier nou,
          imaginea existentă rămâne neschimbată.
        </span>
      </div>
      <Field
        label="Link extern (postare Facebook, album, articol)"
        name="link"
        type="url"
        value={link}
        placeholder="https://www.facebook.com/..."
        hint="Opțional. Apare ca buton „Vezi pe Facebook” sub articol."
      />
    </>
  );
}

export function PublishToggle({ published }: { published?: boolean }) {
  return (
    <label className="f-consent">
      <input
        type="checkbox"
        name="published"
        defaultChecked={published ?? true}
      />
      <span>
        Publicat — vizibil pe site. Debifează pentru a-l păstra ca ciornă.
      </span>
    </label>
  );
}
