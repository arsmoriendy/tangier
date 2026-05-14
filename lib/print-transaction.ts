"use server"

import { Printer } from "@node-escpos/core"
import USB from "@node-escpos/usb-adapter"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { env } from "@/lib/env"

const numberFormatter = new Intl.NumberFormat("id-ID", {})
const formatNumber = numberFormatter.format

export async function printTransaction(trx: TransactionWithRelations) {
  // variables
  const vid = env.PRINTER_VID
  const pid = env.PRINTER_PID
  const width = env.PRINTER_WIDTH

  const device = new USB(vid, pid)
  const printer = new Printer(device, { encoding: "ascii", width })

  function twoCols(...params: [string, string][]) {
    for (const row of params) {
      printer.tableCustom([
        {
          text: row[0],
          width: 0.5,
        },
        {
          text: row[1],
          width: 0.48,
          align: "right",
        },
      ])
    }
  }

  device.open(async (err) => {
    // TODO:
    if (err) {
      console.error(err)
      return
    }

    printer.font("a").align("lt").size(1, 1).style("normal")

    const crtDate = new Date(trx.createdAt)
    const isoDate = crtDate.toISOString()
    const isoTime = crtDate.toTimeString()

    twoCols(
      [`Cashier : `, trx.createdAt],
      [`Id      : ${trx.id}`, trx.createdAt],
      [`Cust.   : ${trx.customerPriceGroup}`, trx.createdAt]
    )

    // print items
    printer.drawLine()
    for (const item of trx.transactionItems) {
      printer.text(item.name)
      twoCols([
        `${item.quantity} X ${formatNumber(item.sellPrice)}`,
        formatNumber(item.sellPrice * item.quantity),
      ])
    }
    printer.drawLine()

    printer
      .align("rt")
      .size(2, 2) // TODO:
      .text(`Total : ${formatNumber(trx.totalPrice)}`)

    printer.feed(3)
    await printer.cut().close()
  })
  device.close()
}
