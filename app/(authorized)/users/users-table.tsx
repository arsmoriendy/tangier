"use client"

import { useUsers } from "@/app/(authorized)/users/users-ctx"
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

export function UsersTable() {
  const { usersProxy, usersSnap } = useUsers()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Admin role</TableHead>
          <TableHead>Active state</TableHead>
          <TableHead>Delete</TableHead>
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
                    }}
                  />
                  <label htmlFor={`${user.id}-admin`}>Admin</label>
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
                    }}
                  />
                  <label htmlFor={`${user.id}-active`}>Active</label>
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
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
