"use client"

import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
import { withForm } from "@/components/form"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ButtonWithHotkeys } from "@/components/ui/button-with-hotkeys"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useSession } from "@/contexts/session-ctx"
import { formatCurrency } from "@/lib/i18n/currency"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { ComponentProps } from "react"

export const TransactionSummaryDialog = withForm({
  defaultValues: defaultTransactionValues,
  props: {} as ComponentProps<typeof AlertDialog>,
  render: function Render({ form, ...props }) {
    const t = useTranslations("transactions.form.summary")
    const tc = useTranslations("common")
    const { user } = useSession()
    return (
      <AlertDialog {...props}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          </AlertDialogHeader>
          <form.Subscribe selector={(f) => f.values}>
            {(v) => {
              const expenses = v.transactionItems.reduce(
                (acc, item) => (acc += item.buyPrice * item.quantity),
                0
              )
              const profitLoss = v.totalPrice - expenses
              return (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>{t("itemCount")}</TableCell>
                      <TableCell>{v.transactionItems.length}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{t("totalPrice")}</TableCell>
                      <TableCell>{formatCurrency(v.totalPrice)}</TableCell>
                    </TableRow>
                    {user.role === "admin" && (
                      <>
                        <TableRow>
                          <TableCell>{t("expenses")}</TableCell>
                          <TableCell className="text-destructive">
                            {formatCurrency(expenses)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>{tc("profitLoss")}</TableCell>
                          <TableCell
                            className={cn(
                              profitLoss < 0
                                ? "text-destructive"
                                : "text-success"
                            )}
                          >
                            {formatCurrency(profitLoss)}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              )
            }}
          </form.Subscribe>
          <AlertDialogFooter>
            <ButtonWithHotkeys
              hotkeys={["Enter"]}
              onClick={() => {
                props.onOpenChange?.(false)
              }}
            >
              {t("close")}
            </ButtonWithHotkeys>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  },
})
