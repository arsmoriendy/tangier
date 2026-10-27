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

class TrxReceiptPrinter {
  constructor(
    public printer: Printer<[]>,
    public printerWidth: number
  ) {}

  private twoCols(
    cols: [string, string],
    {
      gap = 1,
      align = ["l", "r"],
      prioritizeColIdx = 1,
    }: {
      gap?: number
      align?: ("l" | "r")[]
      prioritizeColIdx?: number
    } = {}
  ) {
    return formatCols({
      cols,
      align,
      gap,
      prioritizeColIdx,
      width: this.printerWidth,
    })
  }

  print(
    trx: TransactionWithRelations,
    { header, footer }: { header?: string; footer?: string }
  ) {
    const crtDate = new Date(trx.createdAt)

    this.printer.font("a").align("ct").size(1, 1).style("normal")

    if (header) {
      this.printer.text(header).drawLine()
    }

    this.printer
      .align("lt")
      .text(this.twoCols([`Last ID : `, trx.id.slice(24)]))
      .text(this.twoCols([`Cashier : `, trx.cashier]))
      .text(this.twoCols([`Cust.   : `, trx.customerPriceGroup]))
      .text(this.twoCols([`Date    : `, format(crtDate, "yyyy-MM-dd")]))
      .text(this.twoCols([`Time    : `, format(crtDate, "HH:mm:ss")]))

    // print items
    this.printer.drawLine()
    for (const item of trx.transactionItems) {
      this.printer
        .text(item.name)
        .text(
          this.twoCols([
            `${item.quantity} ${item.unit} X ${formatNumber(item.sellPrice)}`,
            formatNumber(item.sellPrice * item.quantity),
          ])
        )
    }
    this.printer //
      .drawLine()
      .text(`${trx.transactionItems.length} items`)

    // Double height emphazised mode
    // https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_exclamation.html
    this.printer.buffer.write(Buffer.from([0x1b, 0x21, 0b0001_1000]))
    this.printer
      .align("rt")
      .text(`Total : ${formatNumber(trx.totalPrice)}`)
      .align("lt")
    this.printer.buffer.write(Buffer.from([0x1b, 0x21, 0b0000_0000])) // Reset mode

    if (footer) {
      this.printer.text("\n").align("ct").text(footer)
    }

    this.printer.text("\n\n\n\n\n\n")
  }
}

export async function printTrxReceipt(trx: TransactionWithRelations) {
  // variables
  const vid = env.PRINTER_VID
  const pid = env.PRINTER_PID
  const width = env.PRINTER_WIDTH

  const settings = await listSettings()

  const device = new USB(vid, pid)

  await new Promise<void>((resolve, reject) =>
    device.open((err) => (err ? reject(err) : resolve()))
  )

  const printer = new Printer(device, { encoding: "ascii", width })

  const trxReceiptPrinter = new TrxReceiptPrinter(printer, width)

  try {
    trxReceiptPrinter.print(trx, {
      header: settings.receiptHeader ?? undefined,
      footer: settings.receiptFooter ?? undefined,
    })
  } catch (e) {
    console.error(e)
    throw e
  }

  await printer.cut().close()
  device.close()
}
