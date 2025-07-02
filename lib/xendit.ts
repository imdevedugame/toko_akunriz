interface XenditInvoiceData {
  external_id: string
  amount: number
  description: string
  invoice_duration: number
  customer?: {
    given_names: string
    email: string
  }
  success_redirect_url?: string
  failure_redirect_url?: string
}

interface XenditInvoice {
  id: string
  external_id: string
  user_id: string
  status: string
  merchant_name: string
  amount: number
  description: string
  invoice_url: string
  expiry_date: string
  created: string
  updated: string
}

export class XenditService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.XENDIT_API_KEY || ""
    this.baseUrl = "https://api.xendit.co"
  }

  async createInvoice(data: XenditInvoiceData): Promise<XenditInvoice> {
    const response = await fetch(`${this.baseUrl}/v2/invoices`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Xendit API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getInvoice(invoiceId: string): Promise<XenditInvoice> {
    const response = await fetch(`${this.baseUrl}/v2/invoices/${invoiceId}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Xendit API error: ${response.statusText}`)
    }

    return response.json()
  }
}

export const xenditService = new XenditService()
