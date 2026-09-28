"use client";

import {
  IconCoin,
  IconFileText,
  IconLayoutGrid,
  IconNews,
  IconPackage,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import { useProjectStore } from "~/stores/project-store";
import { api } from "~/trpc/react";
import { ProjectSwitcherDrawer } from "./project-switcher-drawer";

type NavTab = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;
  action?: () => void;
  isAnchor?: boolean;
};

interface NavTabButtonProps {
  tab: NavTab;
  pathname: string;
  hasProject: boolean;
  onDisabledClick: (tab: NavTab) => void;
}

function NavTabButton({
  tab,
  pathname,
  hasProject,
  onDisabledClick,
}: NavTabButtonProps) {
  const isDisabled = !tab.isAnchor && !hasProject;
  const isActive =
    !isDisabled &&
    !!tab.href &&
    (pathname === tab.href || pathname.startsWith(`${tab.href}/`));

  const inner = (
    <span
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5",
        "w-full h-full px-1 min-h-[48px]",
        "active:scale-95 transition-transform duration-75",
        tab.isAnchor
          ? "text-primary"
          : isActive
            ? "text-primary"
            : "text-muted-foreground",
        isDisabled && "opacity-40",
      )}
    >
      {/* Active indicator dot */}
      {isActive && (
        <span className="absolute top-1 w-1 h-1 rounded-full bg-primary" />
      )}

      {/* Tab 3 anchor styling */}
      {tab.isAnchor ? (
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <tab.icon size={24} />
        </span>
      ) : (
        <tab.icon size={20} />
      )}

      <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
    </span>
  );

  // Action tab (Tab 3 — ProjectSwitcher)
  if (tab.action) {
    return (
      <button
        type="button"
        onClick={tab.action}
        aria-label={tab.label}
        className="relative flex flex-1 items-center justify-center min-h-[48px]"
      >
        {inner}
      </button>
    );
  }

  // Disabled tab (belum pilih proyek) -> Smart prompt saat diklik
  if (isDisabled || !tab.href) {
    return (
      <button
        type="button"
        onClick={() => onDisabledClick(tab)}
        aria-label={`${tab.label} — pilih proyek terlebih dahulu`}
        className="relative flex flex-1 items-center justify-center min-h-[48px]"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={tab.href}
      aria-label={tab.label}
      aria-current={isActive ? "page" : undefined}
      className="relative flex flex-1 items-center justify-center min-h-[48px]"
    >
      {inner}
    </Link>
  );
}

export function MobileBottomNav() {
  const isMobile = useIsMobile();
  const { selectedProjectSlug, setSelectedProject, clearSelectedProject } =
    useProjectStore();
  const params = useParams();
  const pathname = usePathname();
  const [switcherOpen, setSwitcherOpen] = React.useState(false);
  const [targetRoute, setTargetRoute] = React.useState<{
    tabLabel: string;
    pathSuffix?: string;
  } | null>(null);

  const urlSlug = params?.slug as string | undefined;
  const prevUrlSlugRef = React.useRef<string | undefined>(undefined);
  const isDeselectingRef = React.useRef(false);
  // Callback ref: useState setter passed as JSX ref so navNode changes when
  // <nav> mounts/unmounts — makes deps correct without needing isMobile
  const [navNode, setNavNode] = React.useState<HTMLElement | null>(null);

  const lastScrollYRef = React.useRef(0);

  // Auto-hide bottom nav saat scroll down, muncul kembali saat scroll up
  // Gunakan direct DOM mutation (bukan setState) agar tidak ada React render latency
  React.useEffect(() => {
    if (!navNode) return;

    const show = () => {
      navNode.style.transform = "translateY(0)";
      navNode.style.pointerEvents = "";
    };
    const hide = () => {
      navNode.style.transform = "translateY(100%)";
      navNode.style.pointerEvents = "none";
    };

    lastScrollYRef.current = Math.max(0, window.scrollY);
    const scrollThreshold = 8;

    const handleScroll = () => {
      // clamp to 0: prevents iOS rubber-band (negative scrollY) from
      // causing a false hide() when the page snaps back to top
      const currentScrollY = Math.max(0, window.scrollY);
      const diff = currentScrollY - lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      if (currentScrollY <= 40) {
        show();
      } else if (diff > scrollThreshold) {
        hide();
      } else if (diff < -scrollThreshold) {
        show();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
    // navNode is the callback ref value — changes when <nav> mounts/unmounts
  }, [navNode]);

  // Reset agar bottom nav selalu terlihat saat berpindah rute
  React.useEffect(() => {
    if (navNode && pathname) {
      navNode.style.transform = "translateY(0)";
      navNode.style.pointerEvents = "";
      lastScrollYRef.current = Math.max(0, window.scrollY);
    }
  }, [pathname, navNode]);

  // Sync store dengan URL params (untuk deep link / page refresh)
  const { data: projectFromUrl, isError } = api.project.getBySlug.useQuery(
    { slug: urlSlug ?? "" },
    { enabled: !!urlSlug && isMobile },
  );

  React.useEffect(() => {
    // Jika user baru saja klik "Keluar ke Dashboard", cegah re-sync sampai mendarat di rute global
    if (isDeselectingRef.current) {
      if (!urlSlug) {
        isDeselectingRef.current = false;
        prevUrlSlugRef.current = undefined;
      }
      return;
    }

    if (urlSlug) {
      // Hanya sync jika URL slug benar-benar berganti ke slug baru
      if (
        prevUrlSlugRef.current !== urlSlug &&
        projectFromUrl &&
        projectFromUrl.slug === urlSlug
      ) {
        setSelectedProject(projectFromUrl.slug, projectFromUrl.name);
        prevUrlSlugRef.current = urlSlug;
      }
    } else {
      // Tidak ada slug di URL (misal: /dashboard) — clear project selection
      // Sama persis seperti project-selector.tsx: Case 2
      prevUrlSlugRef.current = undefined;
      clearSelectedProject();
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        localStorage.removeItem("selectedProjectId");
      }
    }
  }, [projectFromUrl, urlSlug, setSelectedProject, clearSelectedProject]);

  React.useEffect(() => {
    if (isError && urlSlug) {
      clearSelectedProject();
    }
  }, [isError, urlSlug, clearSelectedProject]);

  const slug = selectedProjectSlug;
  const hasProject = !!slug;

  const handleDisabledTabClick = (tab: NavTab) => {
    const suffix =
      tab.id === "reports"
        ? "reports"
        : tab.id === "emergency"
          ? "emergency"
          : tab.id === "logistics"
            ? "logistics"
            : tab.id === "documents"
              ? "documents"
              : undefined;

    setTargetRoute({
      tabLabel: tab.label,
      pathSuffix: suffix,
    });
    toast.info(`Pilih proyek terlebih dahulu untuk membuka ${tab.label}`, {
      position: "top-center",
    });
    setSwitcherOpen(true);
  };

  const tabs: NavTab[] = [
    {
      id: "reports",
      label: "Laporan",
      icon: IconNews,
      href: hasProject ? `/projects/${slug}/reports` : undefined,
    },
    {
      id: "emergency",
      label: "Dana Darurat",
      icon: IconCoin,
      href: hasProject ? `/projects/${slug}/emergency` : undefined,
    },
    {
      id: "switcher",
      label: "Pilih Proyek",
      icon: IconLayoutGrid,
      action: () => {
        setTargetRoute(null);
        setSwitcherOpen(true);
      },
      isAnchor: true,
    },
    {
      id: "logistics",
      label: "Logistik",
      icon: IconPackage,
      href: hasProject ? `/projects/${slug}/logistics` : undefined,
    },
    {
      id: "documents",
      label: "Dokumen",
      icon: IconFileText,
      href: hasProject ? `/projects/${slug}/documents` : undefined,
    },
  ];

  if (!isMobile) return null;

  return (
    <>
      {/* Outer nav: pinned to bottom-0 so translateY(100%) hides it flush */}
      <nav
        ref={setNavNode}
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-3 transition-transform duration-200 ease-in-out will-change-transform"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        {/* Inner floating pill — rounded-[var(--radius)] matches theme token (1rem) */}
        <div
          className={cn(
            "flex items-stretch h-16 overflow-hidden",
            "bg-background/95 backdrop-blur-md",
            "border border-border rounded-[var(--radius)]",
            "shadow-[var(--shadow-md)]",
          )}
        >
          {tabs.map((tab) => (
            <NavTabButton
              key={tab.id}
              tab={tab}
              pathname={pathname}
              hasProject={hasProject}
              onDisabledClick={handleDisabledTabClick}
            />
          ))}
        </div>
      </nav>

      <ProjectSwitcherDrawer
        open={switcherOpen}
        onOpenChange={(open) => {
          setSwitcherOpen(open);
          if (!open) {
            setTargetRoute(null);
          }
        }}
        targetRoute={targetRoute}
        onDeselect={() => {
          isDeselectingRef.current = true;
        }}
      />
    </>
  );
}
