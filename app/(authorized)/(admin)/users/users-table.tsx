"use client"

import { Alert } from "@/components/alert"
import { DeleteAlert } from "@/components/delete-alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authClient } from "@/lib/auth-client"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useUsers } from "./users-ctx"

export function UsersTable() {
  const { usersProxy, usersSnap } = useUsers()
  const tc = useTranslations("common")
  const t = useTranslations("users.table")
  const tt = useTranslations("users.toast")

  async function updateUser(
    userId: string,
    data: { role?: "admin" | "user"; active?: boolean }
  ) {
    await authClient.admin.updateUser({ userId, data })
    const updated = usersProxy.find((u) => u.id === userId)
    if (!updated) return
    Object.assign(updated, data)
    toast.success(tt("updated"))
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{tc("name")}</TableHead>
          <TableHead>{t("adminRole")}</TableHead>
          <TableHead>{t("activeState")}</TableHead>
          <TableHead>{t("delete")}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {usersSnap.map((user, i) => {
          const isAdmin = user.role === "admin"
          const adminId = `${user.id}-admin`
          const activeId = `${user.id}-active`
          return (
            <TableRow key={i}>
              <TableCell>{user.name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {isAdmin ? (
                    <Checkbox id={adminId} checked disabled />
                  ) : (
                    <Alert
                      title={<>{t("promoteTitle")}</>}
                      description={t("promoteDescription", {
                        name: user.name,
                      })}
                      actionLabel={t("promote")}
                      action={() => updateUser(user.id, { role: "admin" })}
                      trigger={<Checkbox id={adminId} checked={false} />}
                    />
                  )}
                  <label htmlFor={adminId}>{t("admin")}</label>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {isAdmin || user.active ? (
                    <Checkbox
                      id={activeId}
                      checked={user.active}
                      disabled={isAdmin}
                      onCheckedChange={(checked: boolean) =>
                        updateUser(user.id, { active: checked })
                      }
                    />
                  ) : (
                    <Alert
                      title={<>{t("enableTitle")}</>}
                      description={t("enableDescription", { name: user.name })}
                      actionLabel={t("enable")}
                      action={() => updateUser(user.id, { active: true })}
                      trigger={<Checkbox id={activeId} checked={false} />}
                    />
                  )}
                  <label htmlFor={activeId}>{t("active")}</label>
                </div>
              </TableCell>
              <TableCell>
                <DeleteAlert
                  title={<>{t("delete")}?</>}
                  description={t("deleteDescription")}
                  action={async () => {
                    await authClient.admin.removeUser({
                      userId: user.id,
                    })
                    const idx = usersProxy.findIndex((u) => u.id === user.id)
                    if (idx !== -1) usersProxy.splice(idx, 1)
                    toast.error(tt("deleted"))
                  }}
                  trigger={
                    <Button variant="destructive" disabled={isAdmin}>
                      {t("delete")}
                    </Button>
                  }
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
