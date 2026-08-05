// Sanity schema: association member (appears in the public directory + map).
// Drop into your Sanity Studio's schemaTypes once the project is created.
const member = {
  name: "member",
  title: "Membru",
  type: "document",
  fields: [
    { name: "fullName", title: "Nume complet", type: "string", validation: (r: { required(): unknown }) => r.required() },
    {
      name: "districtId",
      title: "Raion / municipiu",
      type: "string",
      description: "Id-ul raionului (ex: chisinau, balti) — vezi src/data/moldova-districts.json",
    },
    { name: "locality", title: "Localitate", type: "string" },
    { name: "phone", title: "Telefon", type: "string" },
    { name: "email", title: "Email", type: "string" },
    {
      name: "services",
      title: "Servicii",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Curățare coș", value: "cleaning" },
          { title: "Construcție coș", value: "building" },
          { title: "Sobe", value: "stoves" },
          { title: "Șeminee", value: "fireplaces" },
          { title: "Ventilații", value: "ventilation" },
        ],
      },
    },
    { name: "verified", title: "Verificat", type: "boolean", initialValue: false },
    { name: "photo", title: "Fotografie", type: "image" },
    { name: "memberSince", title: "Membru din", type: "date" },
  ],
};

export default member;
