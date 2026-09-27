export interface Product {
  id: string;
  title: string;
  subtitleArabic: string;
  category: string;
  categoryArabic: string;
  badge?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  hoverImage?: string;
  stockQuantity: number;
  description: string;
  costPrice?: number;
  salesCount?: number;
  gender?: "homme" | "femme" | "unisex";
  variants?: {
    name: string;
    options: string[];
  }[];
}

export interface Department {
  id: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  image: string;
  iconName: string;
  subcategories: {
    nameFr: string;
    nameAr: string;
    slug: string;
  }[];
}

export const DEPARTMENTS: Department[] = [
  {
    id: "dept-montres",
    slug: "montres",
    nameFr: "Montres",
    nameAr: "قسم الساعات",
    image: "https://lh3.googleusercontent.com/aida/AEtjO1XzJjlK_t2Aw34By9eINLZqBDJdXXP-Dp0ceDr55wa5FBX68qy6xFBTjSU-x3Y9bmVWiqRgH5Hf7Z71fHJ2S-hQMk-EftXaUbHss6wQb9JW-86BBKOTJf7k5jqKlOgSorGdtOVQ5HD1Pq1Fc3wICCVlotE9Ukc-1sdBLJVud2MbjDWL2RcGyqUgRCAc4e3v3KsvBFTAglHbRFf2_kmj5giUhSVBq7aY9EGKPuzr6dexho3CpvVuzm15TQ",
    iconName: "Watch",
    subcategories: [
      { nameFr: "Montres Hommes", nameAr: "ساعات رجالية", slug: "montres-hommes" },
      { nameFr: "Montres Femmes", nameAr: "ساعات نسائية", slug: "montres-femmes" }
    ]
  },
  {
    id: "dept-coffrets",
    slug: "coffrets",
    nameFr: "Coffrets Cadeaux",
    nameAr: "أطقم الهدايا والكوفريات",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_DcN3Upqx9Zuj8y2p8ytcNJyBdp9gHtevPj_UNEltZKkN5jFkB-v047v7DD6nlDKdNHL1wsnahaD-z3pAkUwFNOXT5cUvt5zh-QwSjbXN4xULww-F4yYttl8o0ea8rzDtlxMcktGt4635w9Z2IfSHJO_uT7ZVRs08YgLhJ0o6zqPTlxFqLNgTnm3SOkfodA0MfD-0biJfhHnp5n6JqzqG9JuRlRQbNzRV0eb7QHyL4k-cbMjJa_zP",
    iconName: "Gift",
    subcategories: [
      { nameFr: "Coffrets Hommes VIP", nameAr: "كوفريات رجالية VIP", slug: "coffrets-hommes-vip" },
      { nameFr: "Coffrets Femmes Luxe", nameAr: "كوفريات نسائية فاخرة", slug: "coffrets-femmes-luxe" }
    ]
  },
  {
    id: "dept-lunettes",
    slug: "lunettes",
    nameFr: "Lunettes",
    nameAr: "قسم النظارات",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA3DFFISzjmB1crUOlTX-yOxT_kHRSEqN0jL1Ls8o_WiVeyxFIKPpBhmpaMmIJ7d9bAbvuA372NL1LQ1o3p84x21rpFG1GBwNKXsOLklLEyYFqOjkqa9A4EoNiZVWSQNIdo0h-wUOa5Yrvf4ijCUlNEgLSTfHnToykUoARsSmn959S0t2fCHB9dnsRYjeVB1ix0o5TXHMcA8iua0750Z1AUjstblaIrK1hgTfp_RowV9yjCRxE8wYo",
    iconName: "Glasses",
    subcategories: [
      { nameFr: "Lunettes Solaires Hommes", nameAr: "نظارات شمسية رجالية", slug: "lunettes-hommes" },
      { nameFr: "Lunettes Solaires Femmes", nameAr: "نظارات شمسية نسائية", slug: "lunettes-femmes" }
    ]
  },
  {
    id: "dept-maroquinerie",
    slug: "maroquinerie",
    nameFr: "Maroquinerie & Sacs",
    nameAr: "قسم الحقائب والمحافظ",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBnHM179oF3KE_YTtLuObUNhyo4z8uV4l7-dg708xV5MJyvb7nvM0TBd8YmHcKzd5qewX4La5NuIYOlz4lkhdYWBXXzoGeQFQJBEGJbIw5cdXVZuH_wgvTzeDDaJWTj_tRdCV7G8ZP6kZ7iXC-OH6MtEyLhYFqfucbvnWM1-sUGkovNtEwFTRcuTbnxx4Zt6_tZaOhSGO25QDWGCtDhTt0dlD7wNr8DgqhKBeaCDzJGw8NX0ykw1Iv",
    iconName: "Briefcase",
    subcategories: [
      { nameFr: "Sacoches Hommes", nameAr: "صاكوش رجالي", slug: "sacoches-hommes" },
      { nameFr: "Portefeuilles & Porte-cartes", nameAr: "محافظ وحافظات البطاقات", slug: "portefeuilles" },
      { nameFr: "Sacs Femmes", nameAr: "حقائب نسائية", slug: "sacs-femmes" },
      { nameFr: "Ceintures en Cuir Hommes", nameAr: "أحزمة جلدية رجالية", slug: "ceintures" }
    ]
  },
  {
    id: "dept-vetements",
    slug: "vetements",
    nameFr: "Vêtements",
    nameAr: "قسم الملابس",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHyFzsziKJEnODSGEv3gRgBPz2iX81TtkFeOWrWEY85m1Nj13oo1-Z3k5qmFryep45hmbalEpXNOHUl6P1VM_WZxWZW6_jGowsjjVknF4kXXMxH_vOny6HkA_aJnB3JmAUP5-DmwR0M8vaFfY3QGl70zzm0b87RkFgUWkWx1iSjoO-xoehwDssA1KWDJsqhvjFubkhwANcpQG2hAQYQqLVgVcKV_1QXLVMtcVZ1CYARybExzc3Ilkd",
    iconName: "Shirt",
    subcategories: [
      { nameFr: "Sous-vêtements Hommes", nameAr: "ملابس رجالية : ملابس داخلية", slug: "sous-vetements" },
      { nameFr: "Ensembles de Prière", nameAr: "ملابس نسائية : أطقم الصلاة", slug: "ensembles-priere" }
    ]
  },
  {
    id: "dept-parfumerie",
    slug: "parfumerie",
    nameFr: "Parfumerie",
    nameAr: "قسم العطور",
    image: "https://lh3.googleusercontent.com/aida/AEtjO1XbDmX3XOTXZAlQriGCpz8imDgoDhR7i4unGpAvSNbH11HXzMFPQWFXpZZEOJEt4ED7od63_CSgnLGnbhtu_2XGg3VICAwHSvcrB4skmP8psVqShjZMaJYjT7PmMhIvnmqoLAGTlOPf92Qobis1BBP7bkrPYHRd3dopbUYlYY0qhrIN-6TI0VskRVI79odAhym1zOJViAEcZg6gOP-IzlB4qLjokdfKjOdjOM7VZrH4Zf0YOfAzIVxvwoI",
    iconName: "Flame",
    subcategories: [
      { nameFr: "Parfums Hommes", nameAr: "عطور رجالية", slug: "parfums-hommes" },
      { nameFr: "Parfums Femmes", nameAr: "عطور نسائية", slug: "parfums-femmes" },
      { nameFr: "Mini Cadeaux & Favors", nameAr: "التوزيعات", slug: "mini-cadeaux" },
      { nameFr: "Brumes Corporelles", nameAr: "معطر الجسم - Brumes", slug: "brumes" }
    ]
  },
  {
    id: "dept-decorations",
    slug: "decorations",
    nameFr: "Décorations",
    nameAr: "قسم الديكورات",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnBc43kZe_-Sc3HLrIgUykxEvB4B81F3ZWDzSCTeT7IF8V5Fiq-dtFIfNy7qyQpMij1u0lLAlCwyfUzNZTSA8IP8na4dDTZL1WamWH5pu6BNydQ_szHN3hQoPl7MFkLhRMM0lYWdjWigNFrhaA8I5TrXsFkhYLtfILSeHWaKdskQN7ojfshPIily7dWDeSMXPVzzPq_RYzBCTPYqYP_a6gduGr4z8hTCb1UFwp-IBmA1dWWJfg3eyV",
    iconName: "Home",
    subcategories: [
      { nameFr: "Décorations", nameAr: "قسم الديكورات", slug: "decorations" }
    ]
  },
  {
    id: "dept-accessoires",
    slug: "accessoires",
    nameFr: "Accessoires",
    nameAr: "قسم الإكسسوارات",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvDW8y2oKCtn3a-hqWxIuIVy7dPdMfotD9gtV_VTsG6KZZ9nYHL_wB0PAclnD2Pre9lNsAlUmzI8FItzZcvzMCtx0FIAdgPUkRHccD0RbmjNcdC34U4IYX-kZ-6jH66JcnqYBeOEWPz0_3a8EpUE9NEsd6oEcTrJNlTL7yELUSL3yUu9-fHFZ3gHgHt20JZqp2b3hIxMfcAU_zYeS009mXjhA0az0Obr-oPxL9TKdly1khGMjQuh6w",
    iconName: "Diamond",
    subcategories: [
      { nameFr: "Les bagues", nameAr: "الخواتم", slug: "bagues" },
      { nameFr: "Les colliers", nameAr: "السلاسل / القلائد", slug: "colliers" },
      { nameFr: "Les gourmettes", nameAr: "القورميط / الأساور", slug: "bracelets" },
      { nameFr: "Les boucles", nameAr: "الخراصات / الأقراط", slug: "boucles" }
    ]
  }
];

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Coffret Royal Black Chrono + Parfum 100ml",
    subtitleArabic: "طقم رويال بلاك فاخر: ساعة كرونوغراف مع عطر مركز وإسوارة",
    category: "Coffrets Cadeaux VIP",
    categoryArabic: "كوفريات رجالية VIP",
    gender: "homme",
    badge: "-26% PROMO",
    price: 5800,
    originalPrice: 7900,
    rating: 5,
    reviewsCount: 64,
    image: "https://lh3.googleusercontent.com/aida/AEtjO1WOMz1Rw1qk1sy7Vob_AARz2qpUyguBCsSU3uSai-5Wo3h5fnzCfXV3_A1ZNw5uP59tYi-K80lh0qm7XiKXDCPO5K_-ybubyr3bQW9H162AVPc3IOB85N3RGcZ1ft8ztxthl1m6IAscTzhnzYQ6i-XoVKnXhumtW7JqJUsARjtusOyiaD171dlOrhgJ_FuW0oF5i6sPTEHdc12ugnJ67XrIndDfJaEupT67sXfdsBT6NM8El28wQL_2fw",
    hoverImage: "https://lh3.googleusercontent.com/aida/AEtjO1XzJjlK_t2Aw34By9eINLZqBDJdXXP-Dp0ceDr55wa5FBX68qy6xFBTjSU-x3Y9bmVWiqRgH5Hf7Z71fHJ2S-hQMk-EftXaUbHss6wQb9JW-86BBKOTJf7k5jqKlOgSorGdtOVQ5HD1Pq1Fc3wICCVlotE9Ukc-1sdBLJVud2MbjDWL2RcGyqUgRCAc4e3v3KsvBFTAglHbRFf2_kmj5giUhSVBq7aY9EGKPuzr6dexho3CpvVuzm15TQ",
    stockQuantity: 3,
    description: "Coffret prestige comprenant une montre chronographe 316L avec verre saphir inrayable, mécanisme quartz de précision, un extrait de parfum 100ml aux notes boisées et ambrées, et son écrin velours de présentation.",
    variants: [
      { name: "Finition", options: ["Noir Onyx", "Argent Brossé", "Or Rose"] }
    ]
  },
  {
    id: "prod-2",
    title: "Montre Homme Chronographe Phantom Noir Mat",
    subtitleArabic: "ساعة فانتوم رجالية رياضية مقاومة للماء مع زجاج سفاير",
    category: "Montres",
    categoryArabic: "ساعات رجالية",
    gender: "homme",
    badge: "TOP VENTE",
    price: 4200,
    originalPrice: 5500,
    rating: 5,
    reviewsCount: 89,
    image: "https://lh3.googleusercontent.com/aida/AEtjO1XzJjlK_t2Aw34By9eINLZqBDJdXXP-Dp0ceDr55wa5FBX68qy6xFBTjSU-x3Y9bmVWiqRgH5Hf7Z71fHJ2S-hQMk-EftXaUbHss6wQb9JW-86BBKOTJf7k5jqKlOgSorGdtOVQ5HD1Pq1Fc3wICCVlotE9Ukc-1sdBLJVud2MbjDWL2RcGyqUgRCAc4e3v3KsvBFTAglHbRFf2_kmj5giUhSVBq7aY9EGKPuzr6dexho3CpvVuzm15TQ",
    stockQuantity: 8,
    description: "Design minimaliste haute horlogerie inspiré de MVMT. Boîtier ultra-fin en acier inoxydable noir mat, cadrans secondaires de chronomètre fonctionnels.",
    variants: [
      { name: "Bracelet", options: ["Acier Noir", "Cuir Véritable Noir", "Silicone Sport"] }
    ]
  },
  {
    id: "prod-3",
    title: "Coffret Femme Montre Dorée + Gourmette & Bague",
    subtitleArabic: "طقم نسائي فاخر: ساعة مرصعة مع قورميط وخاتم مطلي بالذهب",
    category: "Coffrets Cadeaux",
    categoryArabic: "كوفريات نسائية فاخرة",
    gender: "femme",
    badge: "COFFRET CADEAU",
    price: 4900,
    originalPrice: 6800,
    rating: 5,
    reviewsCount: 42,
    image: "https://lh3.googleusercontent.com/aida/AEtjO1XpP0ENYC5JiY9LJ4RYdVGZTXsWbsTs3Q4ymiKYKjXv22mEThiUFsZsMAeBfqvAfZ2q3ZIK5UDIFjSKdfvmPWWZBdDsE8CiQN6w19IIxPaNS88qAllGfPAg3198qDKMJ4ZJfEOn0b3DKs10_x9LCgG6v7Vgvc3ziMc7L6pjBoQb5faazKVC18Z8jkAVO_eJyBehUuz-8p16Yc-yCpGhFuoJO-wBMyuBRTtGuwWCvm7sdGkIPI86YdbYtA",
    stockQuantity: 4,
    description: "L'ensemble parfait pour offrir. Montre à quartz dorée avec cadran nacre, accompagnée d'un bracelet jonc fin et d'un collier assorti présentés dans une boîte de luxe.",
    variants: [
      { name: "Couleur", options: ["Or Jaune", "Or Rose", "Argent Étincelant"] }
    ]
  },
  {
    id: "prod-4",
    title: "Extrait de Parfum Aurelia Paris 100ml",
    subtitleArabic: "عطر مركز ثابت وفواح بنوتات العود والمسك والعنبر",
    category: "Haute Parfumerie",
    categoryArabic: "عطور فاخرة",
    gender: "unisex",
    badge: "NOUVEAU",
    price: 4800,
    originalPrice: 6200,
    rating: 5,
    reviewsCount: 31,
    image: "https://lh3.googleusercontent.com/aida/AEtjO1XbDmX3XOTXZAlQriGCpz8imDgoDhR7i4unGpAvSNbH11HXzMFPQWFXpZZEOJEt4ED7od63_CSgnLGnbhtu_2XGg3VICAwHSvcrB4skmP8psVqShjZMaJYjT7PmMhIvnmqoLAGTlOPf92Qobis1BBP7bkrPYHRd3dopbUYlYY0qhrIN-6TI0VskRVI79odAhym1zOJViAEcZg6gOP-IzlB4qLjokdfKjOdjOM7VZrH4Zf0YOfAzIVxvwoI",
    stockQuantity: 12,
    description: "Parfum d'exception à sillage persistant. Notes de tête bergamote et poivre noir, cœur ambre gris et cuir doux, fond cèdre de l'Atlas et musc impérial.",
    variants: [
      { name: "Volume", options: ["100ml Extrait"] }
    ]
  },
  {
    id: "prod-5",
    title: "Lunettes Solaires Aviateur Titane Polarisées",
    subtitleArabic: "نظارات شمسية أفياتور أصلية مستقطبة حماية UV400",
    category: "Lunettes",
    categoryArabic: "نظارات شمسية",
    gender: "homme",
    badge: "PROMO",
    price: 3200,
    originalPrice: 4500,
    rating: 5,
    reviewsCount: 56,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA3DFFISzjmB1crUOlTX-yOxT_kHRSEqN0jL1Ls8o_WiVeyxFIKPpBhmpaMmIJ7d9bAbvuA372NL1LQ1o3p84x21rpFG1GBwNKXsOLklLEyYFqOjkqa9A4EoNiZVWSQNIdo0h-wUOa5Yrvf4ijCUlNEgLSTfHnToykUoARsSmn959S0t2fCHB9dnsRYjeVB1ix0o5TXHMcA8iua0750Z1AUjstblaIrK1hgTfp_RowV9yjCRxE8wYo",
    stockQuantity: 6,
    description: "Monture légère en alliage de titane, verres polarisés haute définition protégeant contre 100% des rayons UVA/UVB avec étui rigide HK STORE inclus.",
    variants: [
      { name: "Verres", options: ["Noir Fumé", "Bleu Miroir", "Marron Dégradé"] }
    ]
  },
  {
    id: "prod-6",
    title: "Sacoche Homme Cuir Noir Compacte VIP",
    subtitleArabic: "صاكوش رجالي جلد طبيعي عملي مع جيوب متعددة وسحاب فولاذي",
    category: "Maroquinerie & Sacs",
    categoryArabic: "حقائب ومحافظ",
    gender: "homme",
    badge: "TENDANCE",
    price: 3800,
    originalPrice: 5200,
    rating: 5,
    reviewsCount: 27,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBnHM179oF3KE_YTtLuObUNhyo4z8uV4l7-dg708xV5MJyvb7nvM0TBd8YmHcKzd5qewX4La5NuIYOlz4lkhdYWBXXzoGeQFQJBEGJbIw5cdXVZuH_wgvTzeDDaJWTj_tRdCV7G8ZP6kZ7iXC-OH6MtEyLhYFqfucbvnWM1-sUGkovNtEwFTRcuTbnxx4Zt6_tZaOhSGO25QDWGCtDhTt0dlD7wNr8DgqhKBeaCDzJGw8NX0ykw1Iv",
    stockQuantity: 5,
    description: "Sacoche bandoulière contemporaine en cuir grainé pleine fleur avec compartiments dédiés pour smartphone, portefeuille et clés.",
    variants: [
      { name: "Couleur", options: ["Noir Profond", "Marron Vintage"] }
    ]
  },
  {
    id: "prod-7",
    title: "Montre Femme Élégance Nacre & Or Rose",
    subtitleArabic: "ساعة نسائية راقية بميناء لؤلؤي وسوار ستانلس ذهبي وردي",
    category: "Montres",
    categoryArabic: "ساعات نسائية",
    gender: "femme",
    price: 4500,
    originalPrice: 6000,
    rating: 5,
    reviewsCount: 38,
    image: "/images/hk-womens-watch.jpg",
    hoverImage: "/images/hk-womens-watch.jpg",
    stockQuantity: 6,
    description: "Montre de soirée et quotidienne alliant la brillance du nacre véritable au raffinement de l'or rose. Mouvement quartz japonais.",
    variants: []
  },
  {
    id: "prod-8",
    title: "Sac à Main Femme Prestige Cuir Noir & Doré",
    subtitleArabic: "حقيبة نسائية فاخرة من الجلد بتصميم عصري راقي",
    category: "Maroquinerie & Sacs",
    categoryArabic: "حقائب نسائية",
    gender: "femme",
    price: 5200,
    originalPrice: 6900,
    rating: 5,
    reviewsCount: 29,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBnHM179oF3KE_YTtLuObUNhyo4z8uV4l7-dg708xV5MJyvb7nvM0TBd8YmHcKzd5qewX4La5NuIYOlz4lkhdYWBXXzoGeQFQJBEGJbIw5cdXVZuH_wgvTzeDDaJWTj_tRdCV7G8ZP6kZ7iXC-OH6MtEyLhYFqfucbvnWM1-sUGkovNtEwFTRcuTbnxx4Zt6_tZaOhSGO25QDWGCtDhTt0dlD7wNr8DgqhKBeaCDzJGw8NX0ykw1Iv",
    stockQuantity: 4,
    description: "Sac à main pour femme au tombé impeccable, confectionné avec des finitions dorées et bandoulière amovible.",
    variants: []
  },
  {
    id: "prod-9",
    title: "Lunettes Solaires Femme Glamour Cat-Eye",
    subtitleArabic: "نظارات شمسية نسائية كات آي أنيقة حماية UV400",
    category: "Lunettes",
    categoryArabic: "نظارات نسائية",
    gender: "femme",
    price: 3400,
    originalPrice: 4600,
    rating: 5,
    reviewsCount: 44,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCA3DFFISzjmB1crUOlTX-yOxT_kHRSEqN0jL1Ls8o_WiVeyxFIKPpBhmpaMmIJ7d9bAbvuA372NL1LQ1o3p84x21rpFG1GBwNKXsOLklLEyYFqOjkqa9A4EoNiZVWSQNIdo0h-wUOa5Yrvf4ijCUlNEgLSTfHnToykUoARsSmn959S0t2fCHB9dnsRYjeVB1ix0o5TXHMcA8iua0750Z1AUjstblaIrK1hgTfp_RowV9yjCRxE8wYo",
    stockQuantity: 7,
    description: "Silhouette œil-de-chat iconique avec verres protecteurs UV400 haute clarté optique et étui rigide.",
    variants: []
  },
  {
    id: "prod-10",
    title: "Pack Boxers Coton Égyptien Confort VIP (Lot de 3)",
    subtitleArabic: "طقم بوكسر رجالي قطن مصري ممتاز مريح وعالي الجودة",
    category: "Vêtements",
    categoryArabic: "ملابس داخلية رجالية",
    gender: "homme",
    badge: "ESSENTIEL",
    price: 2400,
    originalPrice: 3200,
    rating: 5,
    reviewsCount: 52,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHyFzsziKJEnODSGEv3gRgBPz2iX81TtkFeOWrWEY85m1Nj13oo1-Z3k5qmFryep45hmbalEpXNOHUl6P1VM_WZxWZW6_jGowsjjVknF4kXXMxH_vOny6HkA_aJnB3JmAUP5-DmwR0M8vaFfY3QGl70zzm0b87RkFgUWkWx1iSjoO-xoehwDssA1KWDJsqhvjFubkhwANcpQG2hAQYQqLVgVcKV_1QXLVMtcVZ1CYARybExzc3Ilkd",
    stockQuantity: 15,
    description: "Confectionnés en pur coton peigné respirant avec ceinture élastique douce siglée HK Store.",
    variants: [
      { name: "Taille", options: ["M", "L", "XL", "XXL"] }
    ]
  },
  {
    id: "prod-11",
    title: "Ensemble de Prière Femme Soie de Médine Deux Pièces",
    subtitleArabic: "طقم صلاة نسائي فاخر حرير المدينة قماش بارد وساتر",
    category: "Vêtements",
    categoryArabic: "أطقم الصلاة النسائية",
    gender: "femme",
    badge: "COLLECTION LUXE",
    price: 3600,
    originalPrice: 4800,
    rating: 5,
    reviewsCount: 36,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHyFzsziKJEnODSGEv3gRgBPz2iX81TtkFeOWrWEY85m1Nj13oo1-Z3k5qmFryep45hmbalEpXNOHUl6P1VM_WZxWZW6_jGowsjjVknF4kXXMxH_vOny6HkA_aJnB3JmAUP5-DmwR0M8vaFfY3QGl70zzm0b87RkFgUWkWx1iSjoO-xoehwDssA1KWDJsqhvjFubkhwANcpQG2hAQYQqLVgVcKV_1QXLVMtcVZ1CYARybExzc3Ilkd",
    stockQuantity: 9,
    description: "Tenue de prière d'une fluidité exceptionnelle, tissu opaque infroissable avec finitions soignées.",
    variants: [
      { name: "Couleur", options: ["Noir Nuit", "Vert Émeraude", "Beige Sable"] }
    ]
  },
  {
    id: "prod-12",
    title: "Parfum Homme Boisé Noir Impérial 100ml",
    subtitleArabic: "عطر رجالي فخم بنفحات خشبية وثبات يدوم طويلاً",
    category: "Parfumerie",
    categoryArabic: "عطور رجالية",
    gender: "homme",
    badge: "BEST SELLER",
    price: 3900,
    originalPrice: 5200,
    rating: 5,
    reviewsCount: 78,
    image: "https://lh3.googleusercontent.com/aida/AEtjO1XbDmX3XOTXZAlQriGCpz8imDgoDhR7i4unGpAvSNbH11HXzMFPQWFXpZZEOJEt4ED7od63_CSgnLGnbhtu_2XGg3VICAwHSvcrB4skmP8psVqShjZMaJYjT7PmMhIvnmqoLAGTlOPf92Qobis1BBP7bkrPYHRd3dopbUYlYY0qhrIN-6TI0VskRVI79odAhym1zOJViAEcZg6gOP-IzlB4qLjokdfKjOdjOM7VZrH4Zf0YOfAzIVxvwoI",
    stockQuantity: 11,
    description: "Sillage puissant et raffiné aux accords de cuir, bois de gaïac et poivre de Sichuan.",
    variants: []
  },
  {
    id: "prod-13",
    title: "Brume Parfumée Corps & Cheveux Vanille Dorée 250ml",
    subtitleArabic: "معطر الجسم والشعر برائحة الفانيليا الشرقية المنعشة",
    category: "Parfumerie",
    categoryArabic: "معطر الجسم - Brumes",
    gender: "femme",
    price: 2200,
    originalPrice: 2900,
    rating: 5,
    reviewsCount: 49,
    image: "https://lh3.googleusercontent.com/aida/AEtjO1XbDmX3XOTXZAlQriGCpz8imDgoDhR7i4unGpAvSNbH11HXzMFPQWFXpZZEOJEt4ED7od63_CSgnLGnbhtu_2XGg3VICAwHSvcrB4skmP8psVqShjZMaJYjT7PmMhIvnmqoLAGTlOPf92Qobis1BBP7bkrPYHRd3dopbUYlYY0qhrIN-6TI0VskRVI79odAhym1zOJViAEcZg6gOP-IzlB4qLjokdfKjOdjOM7VZrH4Zf0YOfAzIVxvwoI",
    stockQuantity: 14,
    description: "Brume hydratante longue durée enrichie en extraits naturels de vanille Bourbon.",
    variants: []
  },
  {
    id: "prod-14",
    title: "Diffuseur d'Ambiance & Bougie Parfumée Prestige",
    subtitleArabic: "طقم موزع عطور وبخور منزلي فاخر لديكور راقي",
    category: "Décorations",
    categoryArabic: "ديكورات وموزعات عطور",
    gender: "unisex",
    badge: "DÉCO MAISON",
    price: 3500,
    originalPrice: 4500,
    rating: 5,
    reviewsCount: 33,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnBc43kZe_-Sc3HLrIgUykxEvB4B81F3ZWDzSCTeT7IF8V5Fiq-dtFIfNy7qyQpMij1u0lLAlCwyfUzNZTSA8IP8na4dDTZL1WamWH5pu6BNydQ_szHN3hQoPl7MFkLhRMM0lYWdjWigNFrhaA8I5TrXsFkhYLtfILSeHWaKdskQN7ojfshPIily7dWDeSMXPVzzPq_RYzBCTPYqYP_a6gduGr4z8hTCb1UFwp-IBmA1dWWJfg3eyV",
    stockQuantity: 8,
    description: "Écrin décoratif en verre fumé avec bâtonnets en rotin naturel pour une diffusion raffinée.",
    variants: []
  },
  {
    id: "prod-15",
    title: "Gourmette Homme Acier Inoxydable 316L Maille Royale",
    subtitleArabic: "قورميط رجالي ستانلس ستيل مضاد للصدأ تصميم ملكي",
    category: "Accessoires",
    categoryArabic: "إكسسوارات رجالية",
    gender: "homme",
    badge: "ACIER 316L",
    price: 2800,
    originalPrice: 3800,
    rating: 5,
    reviewsCount: 41,
    image: "https://lh3.googleusercontent.com/aida/AEtjO1WOMz1Rw1qk1sy7Vob_AARz2qpUyguBCsSU3uSai-5Wo3h5fnzCfXV3_A1ZNw5uP59tYi-K80lh0qm7XiKXDCPO5K_-ybubyr3bQW9H162AVPc3IOB85N3RGcZ1ft8ztxthl1m6IAscTzhnzYQ6i-XoVKnXhumtW7JqJUsARjtusOyiaD171dlOrhgJ_FuW0oF5i6sPTEHdc12ugnJ67XrIndDfJaEupT67sXfdsBT6NM8El28wQL_2fw",
    stockQuantity: 10,
    description: "Bracelet gourmette lourd en acier chirurgical poli miroir, inaltérable à l'eau et aux parfums.",
    variants: [
      { name: "Couleur", options: ["Argent Brillant", "Noir Mat", "Doré Or 18K"] }
    ]
  },
  {
    id: "prod-16",
    title: "Bague Chevalière Homme Pierre Onyx Noir & Argent",
    subtitleArabic: "خاتم فضي رجالي مرصع بحجر الأونيكس الأسود الفاخر",
    category: "Accessoires",
    categoryArabic: "خواتم رجالية فخمة",
    gender: "homme",
    badge: "FAIT MAIN",
    price: 2600,
    originalPrice: 3500,
    rating: 5,
    reviewsCount: 30,
    image: "https://lh3.googleusercontent.com/aida/AEtjO1XpP0ENYC5JiY9LJ4RYdVGZTXsWbsTs3Q4ymiKYKjXv22mEThiUFsZsMAeBfqvAfZ2q3ZIK5UDIFjSKdfvmPWWZBdDsE8CiQN6w19IIxPaNS88qAllGfPAg3198qDKMJ4ZJfEOn0b3DKs10_x9LCgG6v7Vgvc3ziMc7L6pjBoQb5faazKVC18Z8jkAVO_eJyBehUuz-8p16Yc-yCpGhFuoJO-wBMyuBRTtGuwWCvm7sdGkIPI86YdbYtA",
    stockQuantity: 7,
    description: "Chevalière sculptée en alliage noble ornée d'un onyx naturel taillé en cabochon.",
    variants: [
      { name: "Tour de doigt", options: ["58", "60", "62", "64"] }
    ]
  }
];

export const WILAYAS_DZ = [
  { code: 1, name: "Adrar", domicilePrice: 1100, stopdeskPrice: 700 },
  { code: 2, name: "Chlef", domicilePrice: 500, stopdeskPrice: 300 },
  { code: 3, name: "Laghouat", domicilePrice: 850, stopdeskPrice: 500 },
  { code: 4, name: "Oum El Bouaghi", domicilePrice: 750, stopdeskPrice: 450 },
  { code: 5, name: "Batna", domicilePrice: 750, stopdeskPrice: 450 },
  { code: 6, name: "Béjaïa", domicilePrice: 750, stopdeskPrice: 450 },
  { code: 7, name: "Biskra", domicilePrice: 850, stopdeskPrice: 500 },
  { code: 8, name: "Béchar", domicilePrice: 1000, stopdeskPrice: 650 },
  { code: 9, name: "Blida", domicilePrice: 650, stopdeskPrice: 400 },
  { code: 10, name: "Bouira", domicilePrice: 700, stopdeskPrice: 400 },
  { code: 11, name: "Tamanrasset", domicilePrice: 1300, stopdeskPrice: 900 },
  { code: 12, name: "Tébessa", domicilePrice: 800, stopdeskPrice: 450 },
  { code: 13, name: "Tlemcen", domicilePrice: 700, stopdeskPrice: 400 },
  { code: 14, name: "Tiaret", domicilePrice: 700, stopdeskPrice: 400 },
  { code: 15, name: "Tizi Ouzou", domicilePrice: 700, stopdeskPrice: 400 },
  { code: 16, name: "Alger", domicilePrice: 600, stopdeskPrice: 350 },
  { code: 17, name: "Djelfa", domicilePrice: 800, stopdeskPrice: 450 },
  { code: 18, name: "Jijel", domicilePrice: 750, stopdeskPrice: 450 },
  { code: 19, name: "Sétif", domicilePrice: 700, stopdeskPrice: 400 },
  { code: 20, name: "Saïda", domicilePrice: 750, stopdeskPrice: 450 },
  { code: 21, name: "Skikda", domicilePrice: 750, stopdeskPrice: 450 },
  { code: 22, name: "Sidi Bel Abbès", domicilePrice: 700, stopdeskPrice: 400 },
  { code: 23, name: "Annaba", domicilePrice: 750, stopdeskPrice: 450 },
  { code: 24, name: "Guelma", domicilePrice: 750, stopdeskPrice: 450 },
  { code: 25, name: "Constantine", domicilePrice: 700, stopdeskPrice: 400 },
  { code: 26, name: "Médéa", domicilePrice: 650, stopdeskPrice: 400 },
  { code: 27, name: "Mostaganem", domicilePrice: 650, stopdeskPrice: 350 },
  { code: 28, name: "M'Sila", domicilePrice: 750, stopdeskPrice: 450 },
  { code: 29, name: "Mascara", domicilePrice: 650, stopdeskPrice: 400 },
  { code: 30, name: "Ouargla", domicilePrice: 900, stopdeskPrice: 600 },
  { code: 31, name: "Oran", domicilePrice: 650, stopdeskPrice: 400 },
  { code: 32, name: "El Bayadh", domicilePrice: 900, stopdeskPrice: 600 },
  { code: 33, name: "Illizi", domicilePrice: 1300, stopdeskPrice: 900 },
  { code: 34, name: "Bordj Bou Arreridj", domicilePrice: 700, stopdeskPrice: 400 },
  { code: 35, name: "Boumerdès", domicilePrice: 650, stopdeskPrice: 400 },
  { code: 36, name: "El Tarf", domicilePrice: 750, stopdeskPrice: 450 },
  { code: 37, name: "Tindouf", domicilePrice: 1300, stopdeskPrice: 900 },
  { code: 38, name: "Tissemsilt", domicilePrice: 700, stopdeskPrice: 400 },
  { code: 39, name: "El Oued", domicilePrice: 900, stopdeskPrice: 600 },
  { code: 40, name: "Khenchela", domicilePrice: 800, stopdeskPrice: 450 },
  { code: 41, name: "Souk Ahras", domicilePrice: 800, stopdeskPrice: 450 },
  { code: 42, name: "Tipaza", domicilePrice: 650, stopdeskPrice: 350 },
  { code: 43, name: "Mila", domicilePrice: 750, stopdeskPrice: 450 },
  { code: 44, name: "Aïn Defla", domicilePrice: 600, stopdeskPrice: 350 },
  { code: 45, name: "Naâma", domicilePrice: 900, stopdeskPrice: 600 },
  { code: 46, name: "Aïn Témouchent", domicilePrice: 700, stopdeskPrice: 400 },
  { code: 47, name: "Ghardaïa", domicilePrice: 900, stopdeskPrice: 600 },
  { code: 48, name: "Relizane", domicilePrice: 600, stopdeskPrice: 350 },
  { code: 49, name: "Timimoun", domicilePrice: 1100, stopdeskPrice: 750 },
  { code: 50, name: "Bordj Badji Mokhtar", domicilePrice: 1400, stopdeskPrice: 1000 },
  { code: 51, name: "Ouled Djellal", domicilePrice: 850, stopdeskPrice: 500 },
  { code: 52, name: "Béni Abbès", domicilePrice: 1100, stopdeskPrice: 750 },
  { code: 53, name: "In Salah", domicilePrice: 1200, stopdeskPrice: 800 },
  { code: 54, name: "In Guezzam", domicilePrice: 1400, stopdeskPrice: 1000 },
  { code: 55, name: "Touggourt", domicilePrice: 900, stopdeskPrice: 600 },
  { code: 56, name: "Djanet", domicilePrice: 1300, stopdeskPrice: 900 },
  { code: 57, name: "El M'Ghair", domicilePrice: 900, stopdeskPrice: 600 },
  { code: 58, name: "El Meniaa", domicilePrice: 1000, stopdeskPrice: 700 }
];
