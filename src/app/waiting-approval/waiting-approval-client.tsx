"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "~/server/better-auth/client";

type InferredUser = typeof authClient.$Infer.Session.user;

export function WaitingApprovalPoller() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkApproval = async () => {
      try {
        const result = await authClient.getSession();
        const user: InferredUser | undefined = result?.data?.user;

        if (
          user?.isActive === true &&
          user?.roleGlobal !== "NONE" &&
          user?.roleGlobal
        ) {
          // User sudah di-approve! Redirect ke dashboard tanpa re-login
          router.push("/dashboard");
          router.refresh();
        }
      } catch {
        // Abaikan error jaringan, coba lagi di interval berikutnya
      }
    };

    // Cek langsung saat pertama kali mount
    void checkApproval();

    // Lalu polling setiap 3 detik
    const interval = setInterval(() => {
      setIsChecking((prev) => !prev); // flip untuk visual indicator
      void checkApproval();
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <p className="mt-2 text-xs text-gray-400">
      Mengecek status persetujuan{isChecking ? "..." : ""}
    </p>
  );
}
