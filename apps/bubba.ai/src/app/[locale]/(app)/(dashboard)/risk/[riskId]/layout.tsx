import { auth } from "@/auth";
import { Title } from "@/components/title";
import { getI18n } from "@/locales/server";
import { db } from "@bubba/db";
import { SecondaryMenu } from "@bubba/ui/secondary-menu";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ riskId: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const t = await getI18n();
  const session = await auth();

  if (!session || !session.user.organizationId) {
    redirect("/");
  }

  const riskId = await params;
  const risk = await getRisk(riskId.riskId, session.user.organizationId);

  if (!risk) {
    redirect("/risk");
  }

  return (
    <div className="max-w-[1200px] space-y-4">
      <Title title={risk.title} href="/risk/register" />

      <SecondaryMenu
        isChild
        items={[
          { path: `/risk/${riskId.riskId}`, label: "Overview" },
          { path: `/risk/${riskId.riskId}/tasks`, label: "Tasks" },
          { path: `/risk/${riskId.riskId}/comments`, label: "Comments" },
        ]}
      />

      <main className="mt-8">{children}</main>
    </div>
  );
}

const getRisk = unstable_cache(
  async (riskId: string, organizationId: string) => {
    const risk = await db.risk.findUnique({
      where: {
        id: riskId,
        organizationId: organizationId,
      },
    });

    return risk;
  },
  ["risk-cache"],
);