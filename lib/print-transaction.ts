"use server"

import { Printer } from "@node-escpos/core"
import USB from "@node-escpos/usb-adapter"
import { TransactionWithRelations } from "@/lib/crud/transaction"
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

  device.open(async (err) => {
    // TODO:
    if (err) {
      console.error(err)
      return
    }

    printer.font("a").align("lt").size(1, 1).style("normal")

    // print items
    printer.drawLine()
    for (const item of trx.transactionItems) {
      printer.text(item.name).tableCustom([
        {
          text: `${item.quantity} X ${formatNumber(item.unitPrice)}`,
          width: 0.5,
        },
        {
          text: formatNumber(item.quantifiedPrice),
          width: 0.48,
          align: "right",
        },
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
