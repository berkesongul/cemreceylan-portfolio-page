export const portfolioCategories = {
  brand: {
    title: "Marka kimliği",
    eyebrow: "Strateji · Kimlik · Yön",
    summary: "Markanın fikrini tutarlı bir görsel dile dönüştüren kimlik sistemleri, sunumlar ve uygulamalar.",
    path: "/works/marka-kimligi/",
    accent: "#d6c2b5",
  },
  uiux: {
    title: "UI / UX tasarım",
    eyebrow: "Araştırma · Sistem · Prototip",
    summary: "Karmaşık ihtiyaçları doğal hissettiren dijital ürünlere dönüştüren ekranlar, akışlar ve deneyimler.",
    path: "/works/ui-ux/",
    accent: "#c7d0c3",
  },
  editorial: {
    title: "Dergi & kitap",
    eyebrow: "Editoryal · Tipografi · Düzen",
    summary: "Tipografi, ritim ve anlatıyı bir araya getiren dergi, kitap ve yayın tasarımları.",
    path: "/works/dergi-kitap/",
    accent: "#d7cbb1",
  },
  poster: {
    title: "Afiş tasarımı",
    eyebrow: "Konsept · Görsel dil · Seri",
    summary: "Kültür, etkinlik ve hikâyeler için geliştirilen güçlü görsel fikirler ve afiş serileri.",
    path: "/works/afis/",
    accent: "#d1b9b6",
  },
  character: {
    title: "Karakter tasarımı",
    eyebrow: "Eskiz · Karakter · Dünya",
    summary: "Markalara ve hikâyelere kişilik kazandıran karakterler, illüstrasyonlar ve görsel dünyalar.",
    path: "/works/karakter/",
    accent: "#c9bdd4",
  },
  logo: {
    title: "Logofolyo",
    eyebrow: "İşaret · Tipografi · Sistem",
    summary: "Farklı sektörler ve projeler için yalın, ayırt edici ve ölçeklenebilir logo işaretleri.",
    path: "/works/logofolyo/",
    accent: "#bfcfd3",
  },
  internship: {
    title: "TÜBİTAK Stajı Sürecim",
    eyebrow: "Araştırma · Üretim · Sunum",
    summary: "Popüler Bilim Yayınları ve KİBİ için geliştirdiğim tasarımlarla TÜBİTAK stajı sürecim.",
    path: "/works/stajlarim/",
    accent: "#d2cdb9",
  },
  web: {
    title: "Web tasarım",
    eyebrow: "Arayüz · Etkileşim · Responsive",
    summary: "Marka stratejisini, güçlü arayüzleri ve akıcı etkileşimleri yayına hazır web deneyimlerine dönüştüren projeler.",
    path: "/works/web-tasarim/",
    accent: "#c9d4ca",
  },
};

const portfolioRanges = [
  [1, 91, "uiux"], [92, 95, "internship"], [96, 96, "uiux"], [97, 103, "brand"],
  [104, 104, "editorial"], [105, 109, "uiux"], [110, 110, "brand"], [111, 111, "internship"],
  [112, 113, "editorial"], [114, 117, "internship"], [118, 119, "poster"], [120, 121, "editorial"],
  [122, 124, "uiux"], [125, 136, "internship"], [137, 137, "uiux"], [138, 140, "editorial"],
  [141, 144, "character"], [145, 150, "uiux"], [151, 151, "poster"], [152, 152, "uiux"],
  [153, 155, "poster"], [156, 157, "character"], [158, 163, "brand"], [164, 169, "character"],
  [170, 173, "uiux"], [174, 174, "character"], [175, 180, "editorial"], [181, 183, "uiux"],
  [184, 189, "character"], [190, 190, "logo"], [191, 192, "character"], [193, 196, "poster"],
  [197, 197, "uiux"], [198, 198, "internship"], [199, 199, "character"], [200, 205, "poster"],
  [206, 206, "logo"], [207, 207, "character"], [208, 211, "poster"], [212, 212, "character"],
  [213, 213, "uiux"], [214, 214, "logo"], [215, 216, "character"], [217, 219, "poster"],
  [220, 220, "logo"], [221, 223, "character"], [224, 224, "logo"], [225, 225, "character"],
  [226, 226, "uiux"], [227, 234, "poster"], [235, 235, "logo"], [236, 236, "character"],
  [237, 237, "logo"], [238, 238, "uiux"], [239, 239, "logo"], [240, 240, "character"],
  [241, 241, "logo"], [242, 242, "uiux"], [243, 243, "logo"], [244, 244, "character"],
  [245, 245, "logo"], [246, 246, "uiux"], [247, 249, "logo"], [250, 250, "uiux"],
  [251, 253, "logo"],
];

const categoryForPage = (page) => portfolioRanges.find(([start, end]) => page >= start && page <= end)?.[2] || "brand";

const projectForPage = (page, category) => {
  if (page <= 41) return "Kibi · Okuma Deneyimi";
  if (page <= 91) return "Type · Sosyal Deneyim";
  if (page >= 92 && page <= 95) return "Cemre Ceylan · Hakkımda";
  if (page >= 97 && page <= 103) return "Kechi · Marka Kimliği";
  if (page >= 105 && page <= 109) return "Dijital Ürün Seçkisi";
  if (page >= 114 && page <= 117) return "Cemre Ceylan · Deneyim";
  if (page >= 125 && page <= 136) return "TÜBİTAK · Staj Çalışmaları";
  if (page >= 158 && page <= 163) return "Kechi · Marka Kimliği";
  if (page >= 170 && page <= 173) return "Dijital Ürün Seçkisi";
  return portfolioCategories[category].title;
};

export const portfolioItems = Array.from({ length: 253 }, (_, index) => {
  const page = index + 1;
  const category = categoryForPage(page);
  return {
    page,
    category,
    project: projectForPage(page, category),
    src: `/portfolio/pages/page-${String(page).padStart(3, "0")}.jpg`,
  };
});

export const itemsForCategory = (category) => portfolioItems.filter((item) => item.category === category);
