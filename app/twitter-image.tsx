import OpengraphImage from "./opengraph-image";
import { profile } from "@/lib/portfolio-data";

// X/Twitter shows the same card as Open Graph.
export const alt = `${profile.name}, Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default OpengraphImage;
