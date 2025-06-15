import { RepoTemplate } from "@/types/chat";
import { FaReact, FaVuejs, FaAngular } from "react-icons/fa";
import {
  SiSvelte,
  SiVite,
  SiTypescript,
  SiAstro,
  SiNextdotjs,
  SiQwik,
  SiRemix,
} from "react-icons/si";

export const STARTER_TEMPLATES: RepoTemplate[] = [
  {
    name: "Basic Astro",
    label: "Astro Basic",
    description:
      "Lightweight Astro starter template for building fast static websites",
    githubRepo: "xKevIsDev/bolt-astro-basic-template",
    tags: ["astro", "blog", "performance"],
    icon: SiAstro,
  },
  {
    name: "NextJS Shadcn",
    label: "Next.js with shadcn/ui",
    description:
      "Next.js starter fullstack template integrated with shadcn/ui components and styling system",
    githubRepo: "xKevIsDev/bolt-nextjs-shadcn-template",
    tags: ["nextjs", "react", "typescript", "shadcn", "tailwind"],
    icon: SiNextdotjs,
  },
  {
    name: "Vite Shadcn",
    label: "Vite with shadcn/ui",
    description:
      "Vite starter fullstack template integrated with shadcn/ui components and styling system",
    githubRepo: "xKevIsDev/vite-shadcn",
    tags: ["vite", "react", "typescript", "shadcn", "tailwind"],
    icon: SiVite,
  },
  {
    name: "Qwik Typescript",
    label: "Qwik TypeScript",
    description:
      "Qwik framework starter with TypeScript for building resumable applications",
    githubRepo: "xKevIsDev/bolt-qwik-ts-template",
    tags: ["qwik", "typescript", "performance", "resumable"],
    icon: SiQwik,
  },
  {
    name: "Remix Typescript",
    label: "Remix TypeScript",
    description:
      "Remix framework starter with TypeScript for full-stack web applications",
    githubRepo: "xKevIsDev/bolt-remix-ts-template",
    tags: ["remix", "typescript", "fullstack", "react"],
    icon: SiRemix,
  },
  {
    name: "Sveltekit",
    label: "SvelteKit",
    description:
      "SvelteKit starter template for building fast, efficient web applications",
    githubRepo: "bolt-sveltekit-template",
    tags: ["svelte", "sveltekit", "typescript"],
    icon: SiSvelte,
  },
  {
    name: "Vanilla Vite",
    label: "Vanilla + Vite",
    description:
      "Minimal Vite starter template for vanilla JavaScript projects",
    githubRepo: "xKevIsDev/vanilla-vite-template",
    tags: ["vite", "vanilla-js", "minimal"],
    icon: SiVite,
  },
  {
    name: "Vite React",
    label: "React + Vite + typescript",
    description:
      "React starter template powered by Vite for fast development experience",
    githubRepo: "xKevIsDev/bolt-vite-react-ts-template",
    tags: ["react", "vite", "frontend", "website", "app"],
    icon: FaReact,
  },
  {
    name: "Vite Typescript",
    label: "Vite + TypeScript",
    description:
      "Vite starter template with TypeScript configuration for type-safe development",
    githubRepo: "xKevIsDev/bolt-vite-ts-template",
    tags: ["vite", "typescript", "minimal"],
    icon: SiTypescript,
  },
  {
    name: "Vue",
    label: "Vue.js",
    description:
      "Vue.js starter template with modern tooling and best practices",
    githubRepo: "xKevIsDev/bolt-vue-template",
    tags: ["vue", "typescript", "frontend"],
    icon: FaVuejs,
  },
  {
    name: "Angular",
    label: "Angular Starter",
    description:
      "A modern Angular starter template with TypeScript support and best practices configuration",
    githubRepo: "xKevIsDev/bolt-angular-template",
    tags: ["angular", "typescript", "frontend", "spa"],
    icon: FaAngular,
  },
];
