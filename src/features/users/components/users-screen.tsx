"use client"

import { useState } from "react"
import { UserMultiple02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { LoadingState } from "@/components/common/loading-state"
import { StatusBadge, type StatusBadgeConfig } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUserMutations, useUsers } from "@/features/users/hooks/use-users"
import type { RoleName } from "@/lib/permissions"

const roleStatusConfig: StatusBadgeConfig = {
  Owner: { label: "Owner", variant: "luxury" },
  Manager: { label: "Manager", variant: "info" },
  Staff: { label: "Staff", variant: "neutral" },
}

const roleItems: Array<{ label: string; value: RoleName }> = [
  { label: "Owner", value: "Owner" },
  { label: "Manager", value: "Manager" },
  { label: "Staff", value: "Staff" },
]

type UsersScreenProps = {
  user: { name: string; role: string }
}

export function UsersScreen({ user }: UsersScreenProps) {
  const users = useUsers()
  const mutations = useUserMutations()
  const [error, setError] = useState("")

  async function changeRole(userId: string, role: RoleName) {
    setError("")
    try {
      await mutations.updateRole.mutateAsync({ id: userId, role })
    } catch {
      setError("Could not update role.")
    }
  }

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]} title="Users">
        <div className="grid gap-5">
          {error ? (
            <div className="rounded-xl bg-admin-danger/12 px-4 py-3 text-sm font-medium text-admin-danger">{error}</div>
          ) : null}

          <SectionWrapper
            headerEyebrow="Platform"
            title="Team members"
            description="Owner can manage all administrative data. Manager and Staff have scoped access."
            icon={<HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={UserMultiple02Icon} strokeWidth={1.5} />}
          >
            {users.isLoading ? (
              <LoadingState label="Loading users..." surface="plain" />
            ) : (
              <div className="overflow-hidden rounded-xl bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Change role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.data?.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="px-4 font-semibold text-foreground">{member.name}</TableCell>
                        <TableCell>
                          <StatusBadge status={member.role} config={roleStatusConfig} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            items={roleItems}
                            value={member.role}
                            onValueChange={(value) => changeRole(member.id, value as RoleName)}
                          >
                            <SelectTrigger className="ml-auto w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Role</SelectLabel>
                                {roleItems.map((item) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionWrapper>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
