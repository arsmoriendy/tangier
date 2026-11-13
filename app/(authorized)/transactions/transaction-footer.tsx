"use client"

import { Form, withForm } from "@/components/form"
import {
  XIcon,
  ClockCountdownIcon,
  HandIcon,
  PrinterIcon,
  TrashIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react/dist/ssr"
import { AddItemForm } from "@/app/(authorized)/transactions/add-item-form"
import { AddItemProvider } from "@/app/(authorized)/transactions/add-item-ctx"
import { defaultTransactionValues } from "@/app/(authorized)/transactions/transaction-schema"
import { PriceGroupBadge } from "@/app/(authorized)/transactions/price-group-badge"
import { RecallDialog } from "@/app/(authorized)/transactions/recall-dialog"
import {
  listTransactions,
  TransactionWithRelations,
} from "@/lib/crud/transactions"
import { useHeld } from "@/app/(authorized)/transactions/held-ctx"
import { useUserSettings } from "@/contexts/user-settings"
import { useFormatter, useTranslations } from "next-intl"
import { ComponentProps, ReactNode, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import AdminOnly from "@/components/admin-only"
import { formatCurrency } from "@/lib/i18n/currency"
import { marginAndDiscount } from "@/lib/margin"
import { cn } from "@/lib/utils"
import { usePriceGroups } from "@/contexts/price-groups-ctx"
import { toFormItem } from "@/app/(authorized)/transactions/transaction-item-mapper"
import { toast } from "sonner"
import { useSidebar } from "@/components/ui/sidebar"
import AppButton, { AppButtonProps } from "@/components/app-button"

function FooterBar({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex justify-between gap-2 border bg-sidebar p-2 text-sidebar-foreground",
        className
      )}
      {...props}
    />
  )
}

function RecallBadge({
  createdAt,
  onCancelRecall,
}: {
  createdAt: Date
  onCancelRecall: () => void
}) {
  const t = useTranslations("transactions.form")
  const format = useFormatter()

  return (
    <Badge className="absolute -top-4 right-2 gap-2">
      <span className="relative size-2">
        <span className="absolute size-full animate-ping rounded-full bg-warning opacity-75" />
        <span className="flex size-full rounded rounded-full bg-warning" />
      </span>

      <span>{t("recalled")}</span>
      <ClockCountdownIcon />
      <span>
        {format.dateTime(createdAt, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </span>

      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={() => onCancelRecall()}>
            <XIcon />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {t("cancelRecall")} <Kbd>Ctrl + F6</Kbd>
        </TooltipContent>
      </Tooltip>
    </Badge>
  )
}

function MarginBadge({
  values: v,
}: {
  values: typeof defaultTransactionValues
}) {
  const tc = useTranslations("common")
  const expenses = v.transactionItems.reduce(
    (acc, item) => (acc += item.buyPrice * item.quantity),
    0
  )
  const { margin: profitLoss } = marginAndDiscount(v.totalPrice, expenses)

  return (
    <Badge variant="secondary">
      <span>{tc("margin")}:</span>
      <span
        className={cn(
          profitLoss < 0 ? "text-destructive-foreground" : "text-success"
        )}
      >
        {profitLoss > 0 && "+"}
        {formatCurrency(profitLoss)}
      </span>
    </Badge>
  )
}

function FooterButton({
  xlLabel,
  smLabel,
  icon,
  dynamicLabels = true,
  ...btnProps
}: AppButtonProps & {
  dynamicLabels?: boolean // sidebar expanded, with hold/recall buttons
  xlLabel?: ReactNode
  smLabel?: ReactNode
  icon?: ReactNode
}) {
  return (
    <AppButton
      tooltip={xlLabel}
      tooltipProps={{
        className: "inline xl:hidden",
        side: "top",
        arrow: false,
      }}
      wrapTooltip
      {...btnProps}
    >
      {icon}
      {dynamicLabels ? (
        <>
          <span className="hidden xl:inline">{xlLabel}</span>
          <span className="inline xl:hidden">{smLabel}</span>
        </>
      ) : (
        <span>{xlLabel}</span>
      )}
    </AppButton>
  )
}

export const TransactionFooter = withForm({
  defaultValues: defaultTransactionValues,
  props: {
    selected: new Set<number>(),
    setSelected: (_selected: Set<number>) => {},
    recalledTrx: undefined as TransactionWithRelations | undefined,
    setRecalledTrx: (_trx: TransactionWithRelations | undefined) => {},
    openRecallDialog: false,
    setOpenRecallDialog: (_open: boolean) => {},
    hideHoldRecall: false,
    onHold: (): void | Promise<void> => {},
    onCancelRecall: () => {},
    onReset: () => {},
    onItemAdded: (_index: number) => {},
  },
  render: function Render({
    form,
    selected,
    setSelected,
    recalledTrx,
    setRecalledTrx,
    openRecallDialog,
    setOpenRecallDialog,
    hideHoldRecall,
    onHold,
    onCancelRecall,
    onReset,
    onItemAdded,
  }) {
    const { getUserSettings } = useUserSettings()
    const { setHeld } = useHeld()
    const { priceGroups } = usePriceGroups()
    const { state: sidebarState } = useSidebar()
    const t = useTranslations("transactions.form")
    const tc = useTranslations("common")
    const dynamicBtn = sidebarState === "expanded" && !hideHoldRecall
    const [holding, setHolding] = useState(false)
    const [recalling, setRecalling] = useState(false)

    useEffect(() => {}, [sidebarState, hideHoldRecall])

    function removeSelectedItems() {
      form.setFieldValue(
        "transactionItems",
        form
          .getFieldValue("transactionItems")
          .filter((_, i) => !selected.has(i))
      )
      setSelected(new Set())
    }

    async function refreshHeldTrxs() {
      setHeld.splice(
        0,
        setHeld.length,
        ...(await listTransactions({
          held: true,
          from: new Date(0),
          to: new Date(),
        }))
      )
    }

    async function recallTrx(trx: DeepReadonly<TransactionWithRelations>) {
      setSelected(new Set())
      setRecalledTrx(trx as DeepMutable<typeof trx>)

      form.setFieldValue(
        "priceGroup",
        priceGroups.find((pg) => pg.name === trx.customerPriceGroup)?.id
      )
      form.setFieldValue("totalPrice", trx.totalPrice)
      form.setFieldValue(
        "transactionItems",
        (trx.transactionItems as DeepMutable<typeof trx.transactionItems>).map(
          toFormItem
        )
      )

      setOpenRecallDialog(false)
    }

    async function holdTrx() {
      setHolding(true)
      try {
        await onHold()
      } finally {
        setHolding(false)
      }
    }

    async function recallHeld() {
      setRecalling(true)
      try {
        await refreshHeldTrxs()

        switch (setHeld.length) {
          case 0:
            toast.error(t("toasts.emptyHeldList"))
            break
          case 1:
            recallTrx(setHeld[0])
            break
          default:
            setOpenRecallDialog(true)
            break
        }
      } finally {
        setRecalling(false)
      }
    }

    return (
      <div className="sticky bottom-0 space-y-2 bg-background">
        <FooterBar>
          <AddItemProvider>
            <AddItemForm form={form} onItemAdded={onItemAdded} />
          </AddItemProvider>
        </FooterBar>

        <FooterBar>
          <div className="absolute -top-4 left-2 flex gap-2">
            <Badge>{tc("totalPrice")}</Badge>

            <form.Subscribe selector={(f) => f.values.priceGroup}>
              {(priceGroup) => (
                <PriceGroupBadge
                  value={priceGroup}
                  onChange={(id) => form.setFieldValue("priceGroup", id)}
                />
              )}
            </form.Subscribe>

            <AdminOnly>
              {getUserSettings.showMarginAndDiscounts && (
                <form.Subscribe selector={(f) => f.values}>
                  {(v) => <MarginBadge values={v} />}
                </form.Subscribe>
              )}
            </AdminOnly>
          </div>

          {recalledTrx !== undefined && (
            <RecallBadge
              createdAt={new Date(recalledTrx.createdAt)}
              onCancelRecall={onCancelRecall}
            />
          )}

          <form.AppField name="totalPrice">
            {(field) => <field.IdrField min={0} className="max-w-xs" />}
          </form.AppField>

          <div className="flex gap-2">
            <FooterButton
              hotkeys={["Ctrl+d"]}
              variant="destructive"
              disabled={selected.size < 1}
              onClick={() => removeSelectedItems()}
              icon={<TrashIcon />}
              xlLabel={t("removeItems", { count: selected.size })}
              smLabel={selected.size}
              dynamicLabels={dynamicBtn}
            />

            <FooterButton
              hotkeys={["F4"]}
              onClick={onReset}
              type="reset"
              variant="destructive"
              icon={<ArrowCounterClockwiseIcon />}
              xlLabel={tc("resetAll")}
              dynamicLabels={dynamicBtn}
            />

            {!hideHoldRecall && (
              <>
                <form.Subscribe selector={(form) => form.canSubmit}>
                  {(canSubmit) => (
                    <AppButton
                      type="button"
                      onClick={holdTrx}
                      hotkeys={["F5"]}
                      disabled={!canSubmit}
                      loading={holding}
                    >
                      <HandIcon /> <span>{t("hold")}</span>
                    </AppButton>
                  )}
                </form.Subscribe>

                <AppButton
                  type="button"
                  hotkeys={["F6"]}
                  onClick={recallHeld}
                  loading={recalling}
                >
                  <ClockCountdownIcon /> <span>{t("recall")}</span>
                </AppButton>

                <RecallDialog
                  form={form}
                  open={openRecallDialog}
                  setOpen={setOpenRecallDialog}
                  recalledTrx={recalledTrx}
                  onReset={onReset}
                  recallTrx={recallTrx}
                />
              </>
            )}

            <Form handleSubmit={form.handleSubmit}>
              <form.AppForm>
                <form.SubmitButton hotkeys={["F7"]}>
                  <PrinterIcon /> {t("saveAndPrint")}
                </form.SubmitButton>
              </form.AppForm>
            </Form>
          </div>
        </FooterBar>
      </div>
    )
  },
})
