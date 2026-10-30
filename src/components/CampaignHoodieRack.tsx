import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { formatPrice, SIZES, type Product } from "@/lib/products";

const LOCAL_HOODIE_IMAGES: Record<string, { front: string; hanger: string; side: string }> = {
  "001": {
    front: "/products/hoodie-001-front-transparent.webp",
    hanger: "/products/hoodie-001-hanger.png",
    side: "/products/hoodie-001-side.webp",
  },
  "002": {
    front: "/products/hoodie-002-front-transparent.webp",
    hanger: "/products/hoodie-002-hanger.png",
    side: "/products/hoodie-002-side.webp",
  },
  "003": {
    front: "/products/hoodie-003-front-transparent.webp",
    hanger: "/products/hoodie-003-hanger.png",
    side: "/products/hoodie-003-side.webp",
  },
  "004": {
    front: "/products/hoodie-004-front-transparent.webp",
    hanger: "/products/hoodie-004-hanger.png",
    side: "/products/hoodie-004-side.webp",
  },
  "005": {
    front: "/products/hoodie-005-front-transparent.webp",
    hanger: "/products/hoodie-005-hanger.png",
    side: "/products/hoodie-005-side.webp",
  },
};

function getLocalHoodieImage(product: Product, pose: "front" | "hanger" | "side") {
  const number = product.name.match(/hoodie\s*0*(\d+)/i)?.[1];
  if (!number) return null;

  const id = String(Number(number)).padStart(3, "0");
  return LOCAL_HOODIE_IMAGES[id]?.[pose] ?? null;
}

type CampaignHoodieRackProps = {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
};

export function CampaignHoodieRack({ products, isLoading, isError }: CampaignHoodieRackProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hoodies = products.filter((product) =>
    `${product.category} ${product.name}`.toLowerCase().includes("hoodie"),
  );
  const selectedProductImage = selectedProduct
    ? getLocalHoodieImage(selectedProduct, "front")
    : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selectedProduct && !dialog.open) dialog.showModal();
    else if (!selectedProduct && dialog.open) dialog.close();
  }, [selectedProduct]);

  return (
    <section
      className="campaign-rack"
      id="hoodie-rack"
      data-reveal
      aria-labelledby="campaign-rack-title"
    >
      <div className="campaign-rack-inner">
        <div className="campaign-rack-heading">
          <p className="campaign-rack-overline">
            <span>GHOST</span> / COLLECTION 01
          </p>
          <h2 id="campaign-rack-title">
            Find your <em>piece.</em>
          </h2>
          <p className="campaign-rack-intro">
            Five signature hoodies. Each one made to stand apart.
            <span>Select a hanger to take a closer look.</span>
          </p>
        </div>

        {isLoading ? (
          <div className="campaign-rack-state" role="status">
            Preparing the collection
          </div>
        ) : isError ? (
          <div className="campaign-rack-state" role="status">
            The rack is unavailable right now. Explore the collection below.
          </div>
        ) : hoodies.length > 0 ? (
          <div className="campaign-rack-track">
            <div className="campaign-rack-content">
              <div className="campaign-rack-rail" aria-hidden="true" />
              <span className="campaign-rack-end-space" aria-hidden="true" />
              {hoodies.map((product, index) => {
                const availableSizes = SIZES.filter((size) => product.sizes[size] > 0);
                const sideImage = getLocalHoodieImage(product, "side");
                const frontImage = getLocalHoodieImage(product, "front");
                const hangerImage = getLocalHoodieImage(product, "hanger");

                return (
                  <button
                    className={`campaign-rack-piece${activeProductId === product.id ? " is-active" : ""}`}
                    key={product.id}
                    type="button"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onPointerEnter={() => setActiveProductId(product.id)}
                    onPointerLeave={() =>
                      setActiveProductId((activeId) => (activeId === product.id ? null : activeId))
                    }
                    onFocus={() => setActiveProductId(product.id)}
                    onBlur={() =>
                      setActiveProductId((activeId) => (activeId === product.id ? null : activeId))
                    }
                    onClick={() => setSelectedProduct(product)}
                    aria-label={`View details for ${product.name}`}
                  >
                    <span className="campaign-rack-suspension" aria-hidden="true" />
                    <span className="campaign-rack-hanging">
                      <span className="campaign-rack-hanger" aria-hidden="true" />
                      <span className="campaign-rack-image">
                        {sideImage ? (
                          <img
                            className="campaign-rack-image-side"
                            src={sideImage}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            onError={(event) => {
                              const image = event.currentTarget;
                              image.onerror = null;
                              if (frontImage) image.src = frontImage;
                              else image.hidden = true;
                            }}
                          />
                        ) : (
                          <span className="campaign-rack-placeholder">GHOST</span>
                        )}
                        {hangerImage && (
                          <img
                            className="campaign-rack-image-hanger"
                            src={hangerImage}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        <span className="campaign-rack-view">Discover this piece</span>
                      </span>
                    </span>
                    <span className="campaign-rack-label">
                      <span>{product.name}</span>
                      <small>
                        {formatPrice(product.price)}
                        {availableSizes.length === 0 ? " · Sold out" : ""}
                      </small>
                    </span>
                  </button>
                );
              })}
              <span
                className="campaign-rack-end-space campaign-rack-end-space-last"
                aria-hidden="true"
              />
            </div>
          </div>
        ) : (
          <div className="campaign-rack-state">No hoodies are available in this drop yet.</div>
        )}

        <div className="campaign-rack-footer">
          <span>
            <i aria-hidden="true" />
            Heavyweight fleece · considered design · made for the after-hours
          </span>
          <a href="#collection">
            Shop the collection <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <dialog
        className="campaign-rack-dialog"
        ref={dialogRef}
        aria-labelledby="campaign-rack-dialog-title"
        onClose={() => setSelectedProduct(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        {selectedProduct && (
          <div className="campaign-rack-dialog-content">
            <div className="campaign-rack-dialog-image">
              {selectedProductImage ? (
                <img src={selectedProductImage} alt={selectedProduct.name} />
              ) : (
                <span className="campaign-rack-placeholder">GHOST</span>
              )}
              <span className="campaign-rack-dialog-edition">GHOST / 01</span>
            </div>
            <div className="campaign-rack-dialog-info">
              <button
                className="campaign-rack-dialog-close"
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close hoodie details"
              >
                <X size={20} aria-hidden="true" />
              </button>
              <p className="campaign-rack-dialog-kicker">
                {selectedProduct.category || "GHOST"} · Collection 01
              </p>
              <h3 id="campaign-rack-dialog-title">{selectedProduct.name}</h3>
              <p className="campaign-rack-dialog-price">{formatPrice(selectedProduct.price)}</p>
              {selectedProduct.description && (
                <p className="campaign-rack-dialog-description">{selectedProduct.description}</p>
              )}
              <div className="campaign-rack-dialog-sizes">
                <span>Available sizes</span>
                <strong>
                  {SIZES.filter((size) => selectedProduct.sizes[size] > 0).join(" · ") ||
                    "Sold out"}
                </strong>
              </div>
              <Link
                to="/product/$handle"
                params={{ handle: selectedProduct.id }}
                className="campaign-rack-dialog-link"
              >
                View sizes &amp; details <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
