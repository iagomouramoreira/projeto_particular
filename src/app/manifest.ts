import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "projeto_particular",
    short_name: "Finanças",
    description: "Controle de contas, gastos, receitas e o que sobrou no mês.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3efe6",
    theme_color: "#1f5c4d",
    lang: "pt-BR",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
