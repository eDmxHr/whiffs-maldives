import { SquareLock02Icon } from "@hugeicons/core-free-icons"

import { EmptyState } from "@/components/common/empty-state"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper } from "@/components/layouts/page"

type AccessDeniedProps = {
  user: { name: string; role: string }
  title?: string
}

export function AccessDenied({ user, title = "Access denied" }: AccessDeniedProps) {
  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper title={title}>
        <EmptyState
          title="You don't have permission to view this page"
          description={`Your role (${user.role}) doesn't include access to this workspace. Contact an owner if you need it.`}
          icon={SquareLock02Icon}
        />
      </PageWrapper>
    </AdminShell>
  )
}
