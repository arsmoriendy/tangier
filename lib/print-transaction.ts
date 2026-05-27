"use server"

import { Printer } from "@node-escpos/core"
import USB from "@node-escpos/usb-adapter"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { listSettings } from "@/lib/crud/settings"
import { env } from "@/lib/env"
import { format } from "date-fns"
import { formatCols } from "./format-cols"

const numberFormatter = new Intl.NumberFormat("id-ID", {})
const formatNumber = numberFormatter.format

export async function printTransaction(trx: TransactionWithRelations) {
  // variables
  const vid = env.PRINTER_VID
  const pid = env.PRINTER_PID
  const width = env.PRINTER_WIDTH

  const settings = await listSettings()

  const device = new USB(vid, pid)
  const printer = new Printer(device, { encoding: "ascii", width })

  const crtDate = new Date(trx.createdAt)

  function twoCols(
    cols: [string, string],
    {
      gap = 1,
      align = ["l", "r"],
      prioritizeColIdx = 1,
    }: { gap?: number; align?: ("l" | "r")[]; prioritizeColIdx?: number } = {}
  ) {
    return formatCols({ cols, align, gap, prioritizeColIdx, width })
  }

  device.open(async (err) => {
    // TODO:
    if (err) {
      console.error(err)
      return
    }

    printer.font("a").align("ct").size(1, 1).style("normal")

    if (settings.receiptHeader) {
      printer.text(settings.receiptHeader)
      printer.drawLine()
    }

    printer.align("lt")

    printer.text(twoCols([`Last ID : `, trx.id.slice(24)]))
    printer.text(twoCols([`Cashier : `, trx.cashier]))
    printer.text(twoCols([`Cust.   : `, trx.customerPriceGroup]))
    printer.text(twoCols([`Date    : `, format(crtDate, "yyyy-MM-dd")]))
    printer.text(twoCols([`Time    : `, format(crtDate, "HH:mm:ss")]))

    // print items
    printer.drawLine()
    for (const item of trx.transactionItems) {
      printer.text(item.name)
      printer.text(
        twoCols([
          `${item.quantity} ${item.unit} X ${formatNumber(item.sellPrice)}`,
          formatNumber(item.sellPrice * item.quantity),
        ])
      )
    }
    printer.drawLine()

    printer.text(
      twoCols([
        `${trx.transactionItems.length} items`,
        `Total : ${formatNumber(trx.totalPrice)}`,
      ])
    )

    if (settings.receiptFooter) {
      printer.feed(1)
      printer.align("ct").text(settings.receiptFooter)
    }

    printer.feed(6)
    await printer.cut().close()
  })
  device.close()
}
