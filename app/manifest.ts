import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CODELFA PARTNERS",
    short_name: "CODELFA",
    description: "Private business partnership portal",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#07172c",
    theme_color: "#07172c",
    orientation: "portrait",
    icons: [
      { src: "/codelfa-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" }
    ]
  };
}
