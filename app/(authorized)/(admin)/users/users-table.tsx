"use client"

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
          const disabled = user.role === "admin"
          return (
            <TableRow key={i}>
              <TableCell>{user.name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Checkbox
                    id={`${user.id}-admin`}
                    checked={user.role === "admin"}
                    disabled={disabled}
                    onCheckedChange={async (checked: boolean) => {
                      const role = checked ? "admin" : "user"
                      await authClient.admin.updateUser({
                        userId: user.id,
                        data: { role },
                      })
                      usersProxy.find((u) => u.id === user.id)!.role = role
                      toast.success(tt("updated"))
                    }}
                  />
                  <label htmlFor={`${user.id}-admin`}>{t("admin")}</label>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Checkbox
                    id={`${user.id}-active`}
                    checked={user.active}
                    disabled={disabled}
                    onCheckedChange={async (checked: boolean) => {
                      await authClient.admin.updateUser({
                        userId: user.id,
                        data: { active: checked },
                      })
                      usersProxy.find((u) => u.id === user.id)!.active = checked
                      toast.success(tt("updated"))
                    }}
                  />
                  <label htmlFor={`${user.id}-active`}>{t("active")}</label>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  disabled={disabled}
                  onClick={async () => {
                    await authClient.admin.removeUser({
                      userId: user.id,
                    })
                    usersProxy.splice(i, 1)
                    toast.error(tt("deleted"))
                  }}
                >
                  {t("delete")}
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
