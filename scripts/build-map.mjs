// Generates src/data/moldova-districts.json from geoBoundaries MDA ADM1.
// Projects each district to SVG path data fitted to a shared viewBox.
// Run: node scripts/build-map.mjs
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { geoIdentity, geoPath } from "d3-geo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const NAMES = {
  "Anenii Noi": { id: "anenii-noi", ro: "Anenii Noi", ru: "Анений Ной" },
  Balti: { id: "balti", ro: "Bălți", ru: "Бельцы" },
  Basarabeasca: { id: "basarabeasca", ro: "Basarabeasca", ru: "Басарабяска" },
  Bender: { id: "bender", ro: "Bender (Tighina)", ru: "Бендеры" },
  Briceni: { id: "briceni", ro: "Briceni", ru: "Бричаны" },
  Cahul: { id: "cahul", ro: "Cahul", ru: "Кагул" },
  Calarasi: { id: "calarasi", ro: "Călărași", ru: "Кэлэраши" },
  Cantemir: { id: "cantemir", ro: "Cantemir", ru: "Кантемир" },
  Causeni: { id: "causeni", ro: "Căușeni", ru: "Каушаны" },
  Chisinau: { id: "chisinau", ro: "Chișinău", ru: "Кишинёв" },
  Cimislia: { id: "cimislia", ro: "Cimișlia", ru: "Чимишлия" },
  Criuleni: { id: "criuleni", ro: "Criuleni", ru: "Криуляны" },
  Donduseni: { id: "donduseni", ro: "Dondușeni", ru: "Дондюшаны" },
  Drochia: { id: "drochia", ro: "Drochia", ru: "Дрокия" },
  Dubasari: { id: "dubasari", ro: "Dubăsari", ru: "Дубоссары" },
  Edinet: { id: "edinet", ro: "Edineț", ru: "Единец" },
  Falesti: { id: "falesti", ro: "Fălești", ru: "Фалешты" },
  Floresti: { id: "floresti", ro: "Florești", ru: "Флорешты" },
  Gagauzia: { id: "gagauzia", ro: "Găgăuzia", ru: "Гагаузия" },
  Glodeni: { id: "glodeni", ro: "Glodeni", ru: "Глодяны" },
  Hincesti: { id: "hincesti", ro: "Hîncești", ru: "Хынчешты" },
  Ialoveni: { id: "ialoveni", ro: "Ialoveni", ru: "Яловены" },
  Leova: { id: "leova", ro: "Leova", ru: "Леова" },
  Nisporeni: { id: "nisporeni", ro: "Nisporeni", ru: "Ниспорены" },
  Ocnita: { id: "ocnita", ro: "Ocnița", ru: "Окница" },
  Orhei: { id: "orhei", ro: "Orhei", ru: "Орхей" },
  RIscani: { id: "riscani", ro: "Rîșcani", ru: "Рышканы" },
  Rezina: { id: "rezina", ro: "Rezina", ru: "Резина" },
  SIngerei: { id: "singerei", ro: "Sîngerei", ru: "Сынджерей" },
  Soldanesti: { id: "soldanesti", ro: "Șoldănești", ru: "Шолдэнешты" },
  Soroca: { id: "soroca", ro: "Soroca", ru: "Сорока" },
  "Stefan Voda": { id: "stefan-voda", ro: "Ștefan Vodă", ru: "Штефан-Водэ" },
  Straseni: { id: "straseni", ro: "Strășeni", ru: "Страшены" },
  Taraclia: { id: "taraclia", ro: "Taraclia", ru: "Тараклия" },
  Telenesti: { id: "telenesti", ro: "Telenești", ru: "Теленешты" },
  Transnistria: { id: "transnistria", ro: "Transnistria", ru: "Приднестровье" },
  Ungheni: { id: "ungheni", ro: "Ungheni", ru: "Унгены" },
};

const W = 620;
const geojson = JSON.parse(fs.readFileSync(path.join(__dirname, "mda_adm1.geojson"), "utf8"));

// geoBoundaries polygons have inconsistent winding, which breaks d3's spherical
// Mercator (it treats them as the whole globe). Use a planar projection instead,
// with a cosine-latitude correction so 1° lon and 1° lat are proportional on the
// ground — accurate for a country this small and immune to winding issues.
const LAT0 = (((45.47 + 48.49) / 2) * Math.PI) / 180;
const K = Math.cos(LAT0);
const scaleLon = (c) =>
  typeof c[0] === "number" ? [c[0] * K, c[1]] : c.map(scaleLon);
const projected = {
  ...geojson,
  features: geojson.features.map((f) => ({
    ...f,
    geometry: { ...f.geometry, coordinates: scaleLon(f.geometry.coordinates) },
  })),
};

// Douglas–Peucker simplification (planar space) to cut point count ~70%
// without visibly changing the silhouette at this scale.
function perpDist(p, a, b) {
  const [px, py] = p, [ax, ay] = a, [bx, by] = b;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function dp(points, tol) {
  if (points.length < 3) return points;
  let idx = -1, max = 0;
  const a = points[0], b = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDist(points[i], a, b);
    if (d > max) { max = d; idx = i; }
  }
  if (max > tol) {
    return dp(points.slice(0, idx + 1), tol).slice(0, -1).concat(dp(points.slice(idx), tol));
  }
  return [a, b];
}
const TOL = 0.004; // ≈ 1px at the target width
const simplifyRing = (ring) => {
  const s = dp(ring, TOL);
  return s.length >= 4 ? s : ring;
};
const simplifyGeom = (coords, depth) =>
  depth === 0 ? simplifyRing(coords) : coords.map((c) => simplifyGeom(c, depth - 1));
for (const f of projected.features) {
  const depth = f.geometry.type === "MultiPolygon" ? 2 : 1;
  f.geometry.coordinates = f.geometry.coordinates.map((c) => simplifyGeom(c, depth - 1));
}

const projection = geoIdentity().reflectY(true).fitWidth(W, projected);
const toPath = geoPath(projection);
const [[x0, y0], [x1, y1]] = toPath.bounds(projected);
const pad = 6;
const vbX = +(x0 - pad).toFixed(1);
const vbY = +(y0 - pad).toFixed(1);
const vbW = +(x1 - x0 + pad * 2).toFixed(1);
const vbH = +(y1 - y0 + pad * 2).toFixed(1);

const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => (+n).toFixed(1));

const districts = projected.features
  .map((f) => {
    const key = f.properties.shapeName;
    const meta = NAMES[key];
    if (!meta) {
      console.warn("No name mapping for:", key);
      return null;
    }
    const [[bx0, by0], [bx1, by1]] = toPath.bounds(f);
    return {
      id: meta.id,
      ro: meta.ro,
      ru: meta.ru,
      en: meta.ro,
      d: round(toPath(f)),
      // label anchor = centroid, for city dots / names
      cx: +((bx0 + bx1) / 2).toFixed(1),
      cy: +((by0 + by1) / 2).toFixed(1),
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.ro.localeCompare(b.ro, "ro"));

const out = {
  viewBox: `${vbX} ${vbY} ${vbW} ${vbH}`,
  districts,
};

const outPath = path.join(root, "src/data/moldova-districts.json");
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(`Wrote ${districts.length} districts → ${outPath}`);
console.log("viewBox:", out.viewBox);
