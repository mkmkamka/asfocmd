// Sanity schema: news post / event — trilingual fields (ro/ru/en).
const localeString = {
  name: "localeString",
  title: "Text tradus",
  type: "object",
  fields: [
    { name: "ro", title: "Română", type: "string" },
    { name: "ru", title: "Русский", type: "string" },
    { name: "en", title: "English", type: "string" },
  ],
};

const localeText = {
  name: "localeText",
  title: "Conținut tradus",
  type: "object",
  fields: [
    { name: "ro", title: "Română", type: "text" },
    { name: "ru", title: "Русский", type: "text" },
    { name: "en", title: "English", type: "text" },
  ],
};

const post = {
  name: "post",
  title: "Știre / Eveniment",
  type: "document",
  fields: [
    { name: "title", title: "Titlu", type: "localeString" },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title.ro" } },
    {
      name: "category",
      title: "Categorie",
      type: "string",
      options: {
        list: [
          { title: "Instruire", value: "training" },
          { title: "Asociație", value: "association" },
          { title: "Internațional", value: "international" },
          { title: "Eveniment", value: "event" },
        ],
      },
    },
    { name: "date", title: "Data", type: "date" },
    { name: "eventDate", title: "Data evenimentului (dacă e eveniment)", type: "datetime" },
    { name: "cover", title: "Imagine", type: "image" },
    { name: "excerpt", title: "Rezumat", type: "localeText" },
    { name: "body", title: "Conținut", type: "localeText" },
  ],
};

export { localeString, localeText };
export default post;
