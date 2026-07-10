import type { StoreItem } from "@/types";

export const mockStoreItems: StoreItem[] = [
  { id: "si_1", name: "Moldura Neon", description: "Moldura animada com brilho neon.", scope: "host", category: "frame", price: 200, preview_url: "https://api.dicebear.com/9.x/shapes/svg?seed=neon", rarity: "rare", featured: true },
  { id: "si_2", name: "Badge Fênix", description: "Badge exclusivo de retomada.", scope: "host", category: "badge", price: 350, preview_url: "https://api.dicebear.com/9.x/shapes/svg?seed=phoenix", rarity: "epic", featured: false },
  { id: "si_3", name: "Tema Midnight", description: "Tema escuro premium para o painel.", scope: "agency", category: "theme", price: 900, preview_url: "https://api.dicebear.com/9.x/shapes/svg?seed=midnight", rarity: "epic", featured: true },
  { id: "si_4", name: "Efeito Confete", description: "Explosão de confete ao atingir meta.", scope: "host", category: "effect", price: 150, preview_url: "https://api.dicebear.com/9.x/shapes/svg?seed=confete", rarity: "common", featured: false },
  { id: "si_5", name: "Título 'Lenda'", description: "Título aparece no perfil e ranking.", scope: "host", category: "title", price: 1200, preview_url: "https://api.dicebear.com/9.x/shapes/svg?seed=lenda", rarity: "legendary", featured: true },
  { id: "si_6", name: "Logo Personalizada", description: "Logo animada no painel da agência.", scope: "agency", category: "custom", price: 2500, preview_url: "https://api.dicebear.com/9.x/shapes/svg?seed=logo", rarity: "legendary", featured: false },
  { id: "si_7", name: "Moldura Ouro", description: "Clássico refinado, brilho suave.", scope: "host", category: "frame", price: 500, preview_url: "https://api.dicebear.com/9.x/shapes/svg?seed=ouro", rarity: "epic", featured: false },
  { id: "si_8", name: "Badge Estreante", description: "Marca sua primeira semana.", scope: "host", category: "badge", price: 80,  preview_url: "https://api.dicebear.com/9.x/shapes/svg?seed=estreia", rarity: "common", featured: false },
];
