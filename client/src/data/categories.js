
export const categories = [
  "All",
  "Sparklers",
  "Flower Pots",
  "Ground Chakkars",
  "Fountains",
  "Rockets",
  "Sky Shots",
  "Gift Boxes",
  "Family Combos",
  "Kids Collection",
  "Festival Specials"
];

export const categoryImages = {
  Sparklers:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=85",

  "Flower Pots":
    "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=900&q=85",

  "Ground Chakkars":
    "https://images.unsplash.com/photo-1533236897111-3e94666b2edf?w=900&q=85",

  Fountains:
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&q=85",

  Rockets:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=85",

  "Sky Shots":
    "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=900&q=85",

  "Gift Boxes":
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&q=85",

  "Family Combos":
    "https://images.unsplash.com/photo-1533236897111-3e94666b2edf?w=900&q=85",

  "Kids Collection":
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&q=85",

  "Festival Specials":
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=85"
};

export const getProductId = (product) =>
  String(product?._id || product?.id || "");

export const getProductImage = (product) =>
  product?.image ||
  "https://placehold.co/900x700/ede9fe/4c1d95?text=Chan%27s+Crackers";
