import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "@/pages/ProductDetailPage";

export const Route = createFileRoute("/product/$handle")({
  head: () => ({
    meta: [
      { title: "Vault Piece — GHOST" },
      { name: "description", content: "A members-only GHOST piece from The Vault." },
      { property: "og:title", content: "Vault Piece — GHOST" },
      { property: "og:description", content: "A members-only GHOST piece from The Vault." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),

  component: ProductRoute,
});

function ProductRoute() {
  const { handle } = Route.useParams();
  return <ProductDetailPage handle={handle} />;
}
