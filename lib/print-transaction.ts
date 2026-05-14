"use server"

import { Printer } from "@node-escpos/core"
import USB from "@node-escpos/usb-adapter"
import { TransactionWithRelations } from "@/lib/crud/transactions"
import { env } from "@/lib/env"
import { format } from "date-fns"

const numberFormatter = new Intl.NumberFormat("id-ID", {})
const formatNumber = numberFormatter.format

export async function printTransaction(trx: TransactionWithRelations) {
  // variables
  const vid = env.PRINTER_VID
  const pid = env.PRINTER_PID
  const width = env.PRINTER_WIDTH

  const device = new USB(vid, pid)
  const printer = new Printer(device, { encoding: "ascii", width })

  const crtDate = new Date(trx.createdAt)

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

    printer.align("ct").text(trx.id).align("lt")

    twoCols(
      [`Cashier : `, trx.cashier],
      [`Cust.   : `, trx.customerPriceGroup],
      [`Date    : `, format(crtDate, "yyyy-MM-dd")],
      [`Time    : `, format(crtDate, "HH:mm:ss")]
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

    twoCols([
      `${trx.transactionItems.length} items`,
      `Total : ${formatNumber(trx.totalPrice)}`,
    ])

    printer.feed(3)
    await printer.cut().close()
  })
  device.close()
}
