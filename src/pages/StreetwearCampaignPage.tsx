import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, RotateCw, Volume2, VolumeX, X } from "lucide-react";
import { GhostLogo } from "@/components/GhostLogo";
import { CampaignHoodieRack } from "@/components/CampaignHoodieRack";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import "@/styles/campaign.css";

const FRAME_COUNT = 300;
const FRAME_CACHE_LIMIT = 18;
// Reference footage for the finale preview. Replace with the commissioned GHOST film before launch.
const FINALE_VIDEO_SRC =
  "https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/summit-hero-1.mp4";

const initialCampaignMoment = {
  until: 0.18,
  title: "Made for",
  accent: "after dark.",
  kicker: "GHOST campaign · 2026",
  description: "A new uniform for the hours after dark.",
};

const campaignMoments = [
  initialCampaignMoment,
  {
    until: 0.34,
    title: "Engineered",
    accent: "for the street.",
    kicker: "A closer study · 01",
    description: "Quietly considered. Unmistakably GHOST.",
  },
  {
    until: 0.67,
    title: "Built in",
    accent: "every layer.",
    kicker: "Construction · 02",
    description: "Every detail has a purpose.",
  },
  {
    until: 0.9,
    title: "Precision in",
    accent: "every detail.",
    kicker: "Signature hoodie · 03",
    description: "A familiar form, reworked with intention.",
  },
  {
    until: 1.01,
    title: "Made for",
    accent: "after dark.",
    kicker: "GHOST campaign · 2026",
    description: "Designed for the streets. Built for movement.",
  },
];

function frameUrl(index: number) {
  return `/campaign/frames/ezgif-frame-${String(index + 1).padStart(3, "0")}.webp`;
}

export function StreetwearCampaignPage() {
  const campaignRef = useRef<HTMLDivElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const finaleRef = useRef<HTMLElement>(null);
  const finaleVideoRef = useRef<HTMLVideoElement>(null);
  const showreelRef = useRef<HTMLDialogElement>(null);
  const showreelVideoRef = useRef<HTMLVideoElement>(null);
  const filmRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [momentIndex, setMomentIndex] = useState(0);
  const [filmReady, setFilmReady] = useState(false);
  const [filmError, setFilmError] = useState<string | null>(null);
  const [introEnded, setIntroEnded] = useState(false);
  const [introBlocked, setIntroBlocked] = useState(false);
  const [introError, setIntroError] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [finaleInView, setFinaleInView] = useState(false);
  const [finaleSoundOn, setFinaleSoundOn] = useState(false);
  const { data: products, isLoading, isError, refetch } = useProducts();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(media.matches);
    syncMotion();
    media.addEventListener("change", syncMotion);
    return () => {
      media.removeEventListener("change", syncMotion);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      introVideoRef.current?.pause();
      setIntroEnded(true);
    }
  }, [reduceMotion]);

  useEffect(() => {
    const section = finaleRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      setFinaleInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setFinaleInView(Boolean(entry?.isIntersecting)),
      {
        rootMargin: "200px 0px",
      },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = finaleVideoRef.current;
    if (!video) return;
    if (!finaleInView || reduceMotion || showreelRef.current?.open) {
      video.pause();
      return;
    }
    video.play().catch(() => undefined);
  }, [finaleInView, reduceMotion]);

  useEffect(() => {
    const root = campaignRef.current;
    if (!root || reduceMotion || !("IntersectionObserver" in window)) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    root.classList.add("campaign-motion-ready");
    return () => {
      observer.disconnect();
      root.classList.remove("campaign-motion-ready");
    };
  }, [reduceMotion]);

  const updateFromScroll = useCallback(() => {
    const film = filmRef.current;
    if (!film) return;

    const bounds = film.getBoundingClientRect();
    const scrollable = Math.max(1, bounds.height - window.innerHeight);
    const fraction = Math.max(0, Math.min(1, -bounds.top / scrollable));
    const frame = reduceMotion
      ? 0
      : Math.min(FRAME_COUNT - 1, Math.round(fraction * (FRAME_COUNT - 1)));
    if (progressRef.current) progressRef.current.style.width = `${fraction * 100}%`;
    if (counterRef.current) {
      counterRef.current.textContent = `${String(frame + 1).padStart(3, "0")} / ${FRAME_COUNT}`;
    }
    const nextMoment = campaignMoments.findIndex(
      (entry) => (reduceMotion ? 0 : fraction) < entry.until,
    );
    setMomentIndex(nextMoment === -1 ? campaignMoments.length - 1 : nextMoment);
    return frame;
  }, [reduceMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) {
      setFilmError("The campaign film could not be initialized in this browser.");
      return;
    }

    const frames: Array<HTMLImageElement | undefined> = new Array(FRAME_COUNT);
    const recentlyUsed: number[] = [];
    let currentFrame = 0;
    let displayedFrame = -1;
    let renderQueued = false;
    let scrollQueued = false;
    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;

    const remember = (index: number) => {
      const position = recentlyUsed.indexOf(index);
      if (position !== -1) recentlyUsed.splice(position, 1);
      recentlyUsed.push(index);

      while (recentlyUsed.length > FRAME_CACHE_LIMIT) {
        const oldestPosition = recentlyUsed.findIndex(
          (index) => index !== currentFrame && frames[index]?.complete,
        );
        if (oldestPosition === -1) break;
        const [oldest] = recentlyUsed.splice(oldestPosition, 1);
        if (oldest === undefined) continue;
        const image = frames[oldest];
        if (image && !image.complete) {
          image.onload = null;
          image.onerror = null;
          image.src = "";
        }
        frames[oldest] = undefined;
      }
    };

    const drawFrame = () => {
      renderQueued = false;
      let frameToDraw = currentFrame;
      let image = frames[frameToDraw];
      if (!image?.complete || !image.naturalWidth) {
        const nearbyFrames = recentlyUsed
          .filter((index) => Math.abs(index - currentFrame) <= 2)
          .sort((a, b) => Math.abs(a - currentFrame) - Math.abs(b - currentFrame));
        frameToDraw =
          nearbyFrames.find((index) => frames[index]?.complete && frames[index]?.naturalWidth) ??
          displayedFrame;
        image = frames[frameToDraw];
      }
      if (!image?.complete || !image.naturalWidth) return;

      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(bounds.width * pixelRatio));
      const height = Math.max(1, Math.round(bounds.height * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const backdrop = context.createLinearGradient(0, 0, width, height);
      backdrop.addColorStop(0, "#171614");
      backdrop.addColorStop(0.55, "#100f0e");
      backdrop.addColorStop(1, "#090909");
      context.fillStyle = backdrop;
      context.fillRect(0, 0, width, height);

      const glow = context.createRadialGradient(
        width * 0.73,
        height * 0.3,
        0,
        width * 0.73,
        height * 0.3,
        Math.max(width, height) * 0.68,
      );
      glow.addColorStop(0, "rgba(201, 162, 74, 0.14)");
      glow.addColorStop(1, "rgba(16, 15, 14, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      const mobile = window.innerWidth <= 640;
      const frameTop = mobile ? height * 0.42 : 0;
      const frameHeight = mobile ? height * 0.42 : height;
      const frameWidth = mobile ? width * 0.94 : width;
      const scale = Math.min(frameWidth / image.naturalWidth, frameHeight / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.drawImage(
        image,
        (width - drawWidth) / 2,
        frameTop + (frameHeight - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
      displayedFrame = frameToDraw;
      if (counterRef.current) {
        counterRef.current.textContent = `${String(frameToDraw + 1).padStart(3, "0")} / ${FRAME_COUNT}`;
      }
    };

    const scheduleDraw = () => {
      if (renderQueued) return;
      renderQueued = true;
      requestAnimationFrame(drawFrame);
    };

    const requestFrame = (index: number, current = false) => {
      if (index < 0 || index >= FRAME_COUNT) return;
      const existing = frames[index];
      if (existing) {
        if (current) existing.fetchPriority = "high";
        remember(index);
        if (Math.abs(index - currentFrame) <= 2 && existing.complete) scheduleDraw();
        return;
      }

      const image = new Image();
      frames[index] = image;
      image.decoding = "async";
      image.fetchPriority = current ? "high" : "low";
      image.onload = () => {
        if (disposed || frames[index] !== image) return;
        remember(index);
        setFilmReady(true);
        if (Math.abs(index - currentFrame) <= 2) scheduleDraw();
      };
      image.onerror = () => {
        if (disposed || frames[index] !== image) return;
        frames[index] = undefined;
        setFilmError(`Campaign frame ${String(index + 1).padStart(3, "0")} could not be loaded.`);
      };
      image.src = frameUrl(index);
    };

    const primeAround = (index: number, direction: number) => {
      requestFrame(index, true);
      for (let offset = 1; offset <= 8; offset += 1) {
        requestFrame(index + offset * direction);
      }
      for (let offset = 1; offset <= 3; offset += 1) {
        requestFrame(index - offset * direction);
      }
    };

    const updateScroll = () => {
      scrollQueued = false;
      const nextFrame = updateFromScroll();
      if (nextFrame === undefined) return;
      const direction = nextFrame < currentFrame ? -1 : 1;
      currentFrame = nextFrame;
      primeAround(currentFrame, direction);
      if (displayedFrame === currentFrame && counterRef.current) {
        counterRef.current.textContent = `${String(currentFrame + 1).padStart(3, "0")} / ${FRAME_COUNT}`;
      }
    };

    const scheduleScrollUpdate = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(updateScroll);
    };

    requestFrame(0, true);
    scheduleScrollUpdate();
    window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
    window.addEventListener("resize", scheduleDraw);
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(scheduleDraw);
      resizeObserver.observe(canvas);
    }

    return () => {
      disposed = true;
      window.removeEventListener("scroll", scheduleScrollUpdate);
      window.removeEventListener("resize", scheduleDraw);
      resizeObserver?.disconnect();
      frames.forEach((image) => {
        if (image && !image.complete) image.src = "";
      });
    };
  }, [updateFromScroll]);

  const moment = campaignMoments[momentIndex] ?? initialCampaignMoment;

  return (
    <div className="campaign" id="top" ref={campaignRef}>
      <a className="campaign-skip" href="#collection">
        Skip to collection
      </a>

      <div>
        <section className="campaign-intro" id="vault-intro" aria-label="GHOST Vault intro film">
          <video
            ref={introVideoRef}
            className="campaign-intro-video"
            autoPlay={!reduceMotion}
            muted
            playsInline
            preload="metadata"
            poster="/media/vault-intro-poster.webp"
            onCanPlay={(event) => {
              if (reduceMotion || introEnded) return;
              event.currentTarget.play().catch(() => setIntroBlocked(true));
            }}
            onPlay={() => setIntroBlocked(false)}
            onEnded={() => {
              setIntroEnded(true);
              setIntroBlocked(false);
            }}
            onError={() => setIntroError(true)}
          >
            <source
              media="(max-width: 640px)"
              src="/media/vault-intro-mobile.mp4"
              type="video/mp4"
            />
            <source src="/media/vault-intro.mp4" type="video/mp4" />
          </video>
          <div className="campaign-intro-shade" />
          <div className="campaign-intro-copy">
            <p className="campaign-eyebrow">GHOST · The Vault</p>
            <h1>
              Enter the
              <br />
              <em>Vault.</em>
            </h1>
            {introError ? (
              <p className="campaign-intro-status" role="alert">
                The Vault preview could not be loaded. Continue to the campaign below.
              </p>
            ) : introBlocked ? (
              <button
                type="button"
                className="campaign-intro-play"
                onClick={() => {
                  const video = introVideoRef.current;
                  if (!video) return;
                  video.currentTime = 0;
                  video.play().catch(() => setIntroBlocked(true));
                }}
              >
                Tap to play the Vault film
              </button>
            ) : introEnded ? (
              <a className="campaign-intro-scroll" href="#film">
                <span>Scroll to discover the campaign</span>
                <i aria-hidden="true">↓</i>
              </a>
            ) : (
              <p className="campaign-intro-status" aria-live="polite">
                Watch the preview or scroll to explore
              </p>
            )}
            <a className="campaign-primary-cta" href="#collection">
              Explore the drop <span aria-hidden="true">↗</span>
            </a>
          </div>
          <a
            className="campaign-intro-skip"
            href="#film"
            onClick={() => {
              introVideoRef.current?.pause();
              setIntroEnded(true);
            }}
          >
            Skip intro <span aria-hidden="true">↗</span>
          </a>
          <p className="campaign-intro-counter" aria-live="off">
            {introEnded ? "THE CAMPAIGN CONTINUES BELOW" : "VAULT PREVIEW"}
          </p>
        </section>
        <section
          className="campaign-film"
          id="film"
          ref={filmRef}
          aria-label="Scroll-controlled campaign film"
        >
          <div className="campaign-film-stage">
            <canvas ref={canvasRef} aria-label="GHOST campaign film, controlled by scrolling">
              A cinematic film featuring the GHOST collection.
            </canvas>
            <div className="campaign-film-shade" aria-hidden="true" />
            <div className="campaign-film-copy" aria-live="polite">
              <div className="campaign-film-words" key={momentIndex}>
                <p className="campaign-eyebrow">{moment.kicker}</p>
                <h2>
                  {moment.title}
                  <br />
                  <em>{moment.accent}</em>
                </h2>
                <p className="campaign-film-description">{moment.description}</p>
              </div>
              <a className="campaign-primary-cta" href="#collection">
                Explore the collection <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="campaign-film-meta" aria-hidden="true">
              <span>GHOST · Chapter {String(momentIndex + 1).padStart(2, "0")} / 05</span>
              <span ref={counterRef}>001 / {FRAME_COUNT}</span>
            </div>
            {!filmReady && !filmError && (
              <div className="campaign-film-loader" role="status">
                <span className="campaign-loader-mark" aria-hidden="true" />
                <span>Preparing the film</span>
              </div>
            )}
            {filmError && (
              <p className="campaign-film-error" role="status">
                {filmError}
              </p>
            )}
            <div className="campaign-film-progress" aria-hidden="true">
              <span ref={progressRef} />
              <i />
              <i />
              <i />
              <i />
            </div>
            <a className="campaign-scroll-cue" href="#story">
              <span>Skip film</span>
              <i aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="campaign-story campaign-shell" id="story">
          <div className="campaign-section-index" data-reveal>
            <span>01</span>
            <span>Point of view</span>
          </div>
          <div className="campaign-story-content">
            <p className="campaign-eyebrow" data-reveal>
              A study in movement
            </p>
            <h2 data-reveal data-reveal-delay="1">
              More than
              <br />
              <em>a hoodie.</em>
            </h2>
            <div className="campaign-story-bottom" data-reveal data-reveal-delay="2">
              <p>
                A study in silhouette, material, construction and movement — designed for a new
                generation of streetwear.
              </p>
              <a className="campaign-round-link" href="#craft" aria-label="Discover the craft">
                ↓
              </a>
            </div>
          </div>
          <span className="campaign-story-ghost" aria-hidden="true">
            GHOST
          </span>
        </section>

        <section className="campaign-craft" id="craft">
          <div className="campaign-craft-panel">
            <div className="campaign-craft-main">
              <div className="campaign-craft-copy">
                <div className="campaign-section-index" data-reveal>
                  <span>02</span>
                  <span>The GHOST edit</span>
                </div>
                <p className="campaign-eyebrow" data-reveal>
                  Editor's picks <i /> Collection 01
                </p>
                <h2 data-reveal data-reveal-delay="1">
                  This season's
                  <br />
                  <em>essentials.</em>
                </h2>
                <p className="campaign-craft-intro" data-reveal data-reveal-delay="2">
                  A closer look at the silhouette that leads the drop. Graphic, form and movement
                  come together in one unmistakable point of view.
                </p>
                <div className="campaign-detail-list" data-reveal data-reveal-delay="2">
                  <p>
                    <i className="detail-gold" />
                    Distinctive, considered detailing
                  </p>
                  <p>
                    <i className="detail-crimson" />A relaxed, deliberate silhouette
                  </p>
                  <p>
                    <i className="detail-chrome" />
                    Designed for everyday movement
                  </p>
                </div>
                <div className="campaign-craft-actions" data-reveal data-reveal-delay="3">
                  <a className="campaign-primary-cta" href="#collection">
                    Explore the collection <span aria-hidden="true">↗</span>
                  </a>
                  <a className="campaign-secondary-link" href="#film">
                    View the film <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
              <div className="campaign-gallery" aria-label="Campaign imagery">
                <a className="campaign-gallery-card" href="#collection" data-reveal>
                  <img
                    src="/products/hoodie-001.webp"
                    alt="GHOST Phantom Skull hoodie with spectral blue artwork"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="campaign-gallery-shade" aria-hidden="true" />
                  <span className="campaign-gallery-caption">
                    <strong>Phantom Skull</strong>
                    <small>01 / Explore the drop</small>
                  </span>
                </a>
                <a
                  className="campaign-gallery-card"
                  href="#collection"
                  data-reveal
                  data-reveal-delay="1"
                >
                  <img
                    src="/products/hoodie-002.jpg"
                    alt="GHOST Trinity Skull hoodie with blue flame artwork"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="campaign-gallery-shade" aria-hidden="true" />
                  <span className="campaign-gallery-caption">
                    <strong>Trinity Skull</strong>
                    <small>02 / Explore the drop</small>
                  </span>
                </a>
                <a
                  className="campaign-gallery-card"
                  href="#collection"
                  data-reveal
                  data-reveal-delay="2"
                >
                  <img
                    src="/products/hoodie-004.jpg"
                    alt="GHOST Void Skull hoodie with electric blue skull artwork"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="campaign-gallery-shade" aria-hidden="true" />
                  <span className="campaign-gallery-caption">
                    <strong>Void Skull</strong>
                    <small>03 / Explore the drop</small>
                  </span>
                </a>
                <a
                  className="campaign-gallery-card"
                  href="#collection"
                  data-reveal
                  data-reveal-delay="3"
                >
                  <img
                    src="/products/hoodie-005.webp"
                    alt="GHOST hoodie with a procession of spectral spirits"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="campaign-gallery-shade" aria-hidden="true" />
                  <span className="campaign-gallery-caption">
                    <strong>Ghost Spirits</strong>
                    <small>04 / Explore the drop</small>
                  </span>
                </a>
              </div>
            </div>
            <div className="campaign-craft-footer">
              <span>
                <i /> Campaign 01 — The signature hoodie
              </span>
              <span>
                Studio <b>·</b> Construction <b>·</b> In motion
              </span>
            </div>
          </div>
        </section>

        <section className="campaign-interlude" aria-label="Campaign image">
          <img
            src="/media/vault-hero-poster.webp"
            alt="A figure in the GHOST skull hoodie overlooks a city skyline at dusk"
            loading="lazy"
            decoding="async"
          />
          <div className="campaign-interlude-overlay" />
          <div className="campaign-interlude-copy">
            <p className="campaign-eyebrow" data-reveal>
              The silhouette
            </p>
            <h2 data-reveal data-reveal-delay="1">
              Made to
              <br />
              <em>move.</em>
            </h2>
            <p data-reveal data-reveal-delay="2">
              A familiar form with an unmistakable point of view.
            </p>
          </div>
          <span className="campaign-image-caption">GHOST / SIGNATURE HOODIE</span>
        </section>

        <CampaignHoodieRack products={products ?? []} isLoading={isLoading} isError={isError} />

        <section className="campaign-collection campaign-shell" id="collection">
          <div className="campaign-section-index" data-reveal>
            <span>03</span>
            <span>Collection 01</span>
          </div>
          <div className="campaign-collection-heading">
            <div data-reveal data-reveal-delay="1">
              <p className="campaign-eyebrow">A considered essential</p>
              <h2>
                Inside the
                <br />
                <em>Vault.</em>
              </h2>
            </div>
            <p data-reveal data-reveal-delay="2">
              The current GHOST drop, gathered in one place. Explore the pieces and find your own
              way to wear them.
            </p>
          </div>
          {isLoading ? (
            <div
              className="campaign-product-grid"
              role="status"
              aria-label="Loading the collection"
            >
              {[0, 1, 2].map((item) => (
                <div className="campaign-product-skeleton" key={item} aria-hidden="true">
                  <div className="campaign-product-skeleton-image" />
                  <div className="campaign-product-skeleton-line" />
                  <div className="campaign-product-skeleton-line short" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="campaign-products-state campaign-products-error" role="alert">
              <span className="campaign-products-error-index">
                Collection 01 / Temporarily unavailable
              </span>
              <h3>The drop is taking a moment.</h3>
              <p>We could not show the collection right now. Give it another try.</p>
              <button type="button" onClick={() => void refetch()}>
                <RotateCw className="h-4 w-4" /> Try again
              </button>
            </div>
          ) : (
            <ProductGrid products={products ?? []} showDescription variant="editorial" />
          )}
          <p className="campaign-members-note">
            Viewing is open to everyone.{" "}
            <Link to="/auth" search={{ mode: "signup" }}>
              Request Vault access
            </Link>{" "}
            to purchase.
          </p>
        </section>

        <section
          className="campaign-finale"
          id="vault-finale"
          ref={finaleRef}
          aria-labelledby="vault-finale-title"
        >
          <video
            ref={finaleVideoRef}
            className="campaign-finale-video"
            autoPlay={finaleInView && !reduceMotion}
            loop
            muted={!finaleSoundOn}
            playsInline
            preload="none"
            poster="/media/vault-hero-poster.webp"
            aria-hidden="true"
          >
            <source src={FINALE_VIDEO_SRC} type="video/mp4" />
          </video>
          <div className="campaign-finale-shade" aria-hidden="true" />
          <button
            type="button"
            className="campaign-finale-sound"
            onClick={() => setFinaleSoundOn((current) => !current)}
            aria-label={finaleSoundOn ? "Mute background video" : "Unmute background video"}
            aria-pressed={finaleSoundOn}
          >
            {finaleSoundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
            <span>Sound {finaleSoundOn ? "on" : "off"}</span>
          </button>
          <div className="campaign-finale-copy">
            <p className="campaign-eyebrow" data-reveal>
              The Vault awaits · Collection 01
            </p>
            <h2 id="vault-finale-title" data-reveal data-reveal-delay="1">
              The story
              <br />
              continues
              <br />
              <em>inside.</em>
            </h2>
            <p data-reveal data-reveal-delay="2">
              Explore the GHOST collection. Request access when you are ready to make a piece yours.
            </p>
            <div className="campaign-finale-actions" data-reveal data-reveal-delay="3">
              <Link to="/auth" search={{ mode: "signup" }} className="campaign-primary-cta">
                Request Vault access <span aria-hidden="true">↗</span>
              </Link>
              <button
                type="button"
                className="campaign-finale-watch"
                onClick={() => {
                  finaleVideoRef.current?.pause();
                  showreelRef.current?.showModal();
                  showreelVideoRef.current?.play().catch(() => undefined);
                }}
              >
                <span className="campaign-finale-play-icon" aria-hidden="true">
                  <Play size={16} fill="currentColor" />
                </span>
                Watch the film
              </button>
            </div>
          </div>
          <div className="campaign-finale-bottomline" aria-hidden="true">
            <span>Independent by design</span>
            <span>GHOST · 2026</span>
          </div>
          <dialog
            ref={showreelRef}
            className="campaign-showreel"
            aria-label="The finale film"
            onClick={(event) => {
              if (event.target === event.currentTarget) event.currentTarget.close();
            }}
            onClose={() => {
              showreelVideoRef.current?.pause();
              if (finaleInView && !reduceMotion)
                finaleVideoRef.current?.play().catch(() => undefined);
            }}
          >
            <button
              type="button"
              className="campaign-showreel-close"
              onClick={() => showreelRef.current?.close()}
              aria-label="Close the film"
            >
              <X size={21} />
            </button>
            <video
              ref={showreelVideoRef}
              controls
              playsInline
              preload="none"
              poster="/media/vault-hero-poster.webp"
            >
              <source src={FINALE_VIDEO_SRC} type="video/mp4" />
            </video>
          </dialog>
        </section>
      </div>

      <footer className="campaign-footer">
        <div className="campaign-footer-top">
          <div>
            <p className="campaign-footer-kicker">GHOST / COLLECTION 01</p>
            <p className="campaign-footer-statement">
              Stay in
              <br />
              <em>motion.</em>
            </p>
          </div>
          <div className="campaign-footer-aside">
            <p>
              Built with intention.
              <br />
              Designed for movement.
            </p>
            <a href="#top" className="campaign-footer-return">
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
        <div className="campaign-footer-main">
          <div className="campaign-footer-brand">
            <GhostLogo className="h-16 w-auto" />
            <p>Independent by design.</p>
          </div>
          <nav aria-label="Footer navigation">
            <div className="campaign-footer-nav-group">
              <span>Explore</span>
              <a href="#collection">Collection</a>
              <a href="#story">Our story</a>
            </div>
            <div className="campaign-footer-nav-group">
              <span>Connect</span>
              <Link to="/contact">Contact</Link>
              <Link to="/auth">Login</Link>
            </div>
            <div className="campaign-footer-nav-group">
              <span>The Vault</span>
              <Link to="/auth" search={{ mode: "signup" }}>
                Request access <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </nav>
        </div>
        <div className="campaign-footer-legal">
          <span>© 2026 GHOST</span>
          <span>Made for the hours after dark.</span>
        </div>
      </footer>
    </div>
  );
}
