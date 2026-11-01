import { TableCell, TableRow } from "@/components/ui/table"
import { useTranslations } from "next-intl"

export function NoItemsRow({ colSpan }: { colSpan: number }) {
  const t = useTranslations("transactions.form")

  return (
    <TableRow>
      <TableCell
        className="text-center text-muted-foreground"
        colSpan={colSpan}
      >
        {t("items.noItems")}
      </TableCell>
    </TableRow>
  )
}
