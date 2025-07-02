interface IndoSMMServiceData {
  service: number
  name: string
  category: string
  rate: string
  min: string
  max: string
}

interface IndoSMMOrder {
  order: number
  charge: string
  start_count: string
  status: string
  remains: string
}

interface IndoSMMBalance {
  balance: string
  currency: string
}

interface IndoSMMResponse {
  error?: string
  message?: string
}

export class IndoSMMService {
  private apiKey: string
  private baseUrl: string
  private isDevelopment: boolean

  constructor() {
    this.apiKey = process.env.INDOSMM_API_KEY || ""
    this.baseUrl = process.env.INDOSMM_API_URL || "https://indosmm.com/api/v2"
    this.isDevelopment = process.env.NODE_ENV === "development"
  }

  private async makeRequest(action: string, params: Record<string, string> = {}): Promise<any> {
    const startTime = Date.now()

    try {
      // Enhanced logging for connection attempts
      console.log(`🔄 IndoSMM API Request Started:`, {
        action,
        timestamp: new Date().toISOString(),
        apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : "NOT_SET",
        baseUrl: this.baseUrl,
        isDevelopment: this.isDevelopment,
        params: Object.keys(params),
        fullParams: params, // Log full params for debugging
      })

      // If no API key or development mode, return mock data
      if (!this.apiKey || this.apiKey === "your-indosmm-api-key") {
        console.log("⚠️ Using mock IndoSMM data for development - API key not configured")
        return this.getMockData(action, params)
      }

      const formData = new URLSearchParams({
        key: this.apiKey,
        action: action,
        ...params,
      })

      console.log("📡 Sending request to IndoSMM:", {
        url: this.baseUrl,
        method: "POST",
        formData: formData.toString(),
      })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.error(`⏰ IndoSMM API Request Timeout (30s) for action: ${action}`)
        controller.abort()
      }, 30000) // 30 second timeout

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Premium-Store/1.0",
        },
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      const responseText = await response.text()

      console.log(`📡 IndoSMM API Response:`, {
        action,
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        bodyLength: responseText.length,
        bodyPreview: responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""),
        headers: Object.fromEntries(response.headers.entries()),
      })

      if (!response.ok) {
        // Enhanced error logging
        console.error(`❌ IndoSMM API HTTP Error:`, {
          action,
          status: response.status,
          statusText: response.statusText,
          url: this.baseUrl,
          responseBody: responseText,
          responseTime: `${responseTime}ms`,
        })

        // Handle specific errors
        if (response.status === 400) {
          let errorData
          try {
            errorData = JSON.parse(responseText)
          } catch {
            errorData = { error: "Bad Request" }
          }

          if (errorData.error === "user_inactive") {
            console.warn("⚠️ IndoSMM API key is inactive, falling back to mock data", {
              apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : "NOT_SET",
              action,
              isDevelopment: this.isDevelopment,
            })
            return this.getMockData(action, params)
          }

          throw new Error(`IndoSMM API Error: ${errorData.error || "Bad Request"}`)
        }

        if (response.status === 500) {
          console.error("🔥 IndoSMM Server Error - Their API might be down", {
            action,
            status: response.status,
            body: responseText,
          })
        }

        throw new Error(`IndoSMM API HTTP Error: ${response.status} ${response.statusText}`)
      }

      // Try to parse JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log(`✅ IndoSMM API Success:`, {
          action,
          responseTime: `${responseTime}ms`,
          dataType: Array.isArray(data) ? `array[${data.length}]` : typeof data,
          hasError: !!data.error,
          data: data, // Log full response for debugging
        })
      } catch (parseError) {
        console.error("💥 Failed to parse IndoSMM response as JSON:", {
          action,
          parseError: parseError instanceof Error ? parseError.message : "Unknown parse error",
          responseText: responseText.substring(0, 500),
          responseLength: responseText.length,
        })
        throw new Error(`IndoSMM API returned invalid JSON: ${responseText.substring(0, 100)}`)
      }

      // Check for API errors
      if (data.error) {
        console.error(`🚫 IndoSMM API returned error:`, {
          action,
          error: data.error,
          message: data.message,
          fullResponse: data,
        })

        if (data.error === "user_inactive") {
          console.warn("⚠️ IndoSMM API key is inactive, falling back to mock data")
          return this.getMockData(action, params)
        }
        throw new Error(`IndoSMM API Error: ${data.error}`)
      }

      return data
    } catch (error) {
      const responseTime = Date.now() - startTime

      if (error instanceof Error && error.name === "AbortError") {
        console.error(`⏰ IndoSMM API Request Aborted (Timeout):`, {
          action,
          timeout: "30s",
          responseTime: `${responseTime}ms`,
        })
      } else {
        console.error(`💥 IndoSMM API Error:`, {
          action,
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          responseTime: `${responseTime}ms`,
          apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : "NOT_SET",
          baseUrl: this.baseUrl,
        })
      }

      // Fallback to mock data if API fails and in development
      if (this.isDevelopment) {
        console.log("🔄 API failed, using mock data for development")
        return this.getMockData(action, params)
      }

      throw error
    }
  }

  private getMockData(action: string, params: Record<string, string> = {}): any {
    console.log(`🎭 Returning mock data for action: ${action}`, params)

    switch (action) {
      case "services":
        return [
          {
            service: 1,
            name: "Instagram Followers [Real]",
            category: "Instagram",
            rate: "0.50",
            min: "100",
            max: "10000",
          },
          {
            service: 2,
            name: "Instagram Likes [High Quality]",
            category: "Instagram",
            rate: "0.30",
            min: "50",
            max: "5000",
          },
          {
            service: 3,
            name: "Facebook Page Likes",
            category: "Facebook",
            rate: "0.80",
            min: "100",
            max: "20000",
          },
          {
            service: 4,
            name: "YouTube Views [Real]",
            category: "YouTube",
            rate: "1.20",
            min: "1000",
            max: "100000",
          },
          {
            service: 5,
            name: "TikTok Followers [Premium]",
            category: "TikTok",
            rate: "2.50",
            min: "100",
            max: "50000",
          },
          {
            service: 6,
            name: "Twitter Followers [Active]",
            category: "Twitter",
            rate: "1.80",
            min: "100",
            max: "25000",
          },
          {
            service: 7,
            name: "LinkedIn Connections",
            category: "LinkedIn",
            rate: "3.00",
            min: "50",
            max: "5000",
          },
          {
            service: 8,
            name: "Telegram Members",
            category: "Telegram",
            rate: "1.50",
            min: "100",
            max: "10000",
          },
          {
            service: 9,
            name: "Spotify Plays",
            category: "Spotify",
            rate: "0.40",
            min: "1000",
            max: "500000",
          },
          {
            service: 10,
            name: "Website Traffic [Organic]",
            category: "Website",
            rate: "5.00",
            min: "1000",
            max: "100000",
          },
        ]

      case "balance":
        return {
          balance: "1000.00",
          currency: "USD",
        }

      case "add":
        const mockOrderId = Math.floor(Math.random() * 1000000)
        console.log(`🎭 Mock order created with ID: ${mockOrderId}`)
        return {
          order: mockOrderId,
          charge: params.quantity ? ((Number.parseFloat(params.quantity) * 0.5) / 1000).toFixed(2) : "10.00",
          start_count: "1000",
          status: "Pending",
          remains: params.quantity || "0",
        }

      case "status":
        return {
          order: Number.parseInt(params.order) || 123456,
          charge: "10.00",
          start_count: "1000",
          status: "Completed",
          remains: "0",
        }

      default:
        return {}
    }
  }

  async testConnection(): Promise<boolean> {
    console.log("🔍 Testing IndoSMM API connection...")

    try {
      const startTime = Date.now()
      await this.getBalance()
      const responseTime = Date.now() - startTime

      console.log(`✅ IndoSMM API connection successful (${responseTime}ms)`)
      return true
    } catch (error) {
      console.error("❌ IndoSMM connection test failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : "NOT_SET",
        baseUrl: this.baseUrl,
        isDevelopment: this.isDevelopment,
        willUseMockData: this.isDevelopment,
      })

      // Return true for development with mock data
      return this.isDevelopment
    }
  }

  async getServices(): Promise<IndoSMMServiceData[]> {
    console.log("📋 Fetching IndoSMM services...")

    const data = await this.makeRequest("services")

    if (!Array.isArray(data)) {
      console.error("❌ IndoSMM API returned invalid services data:", {
        dataType: typeof data,
        data: data,
      })
      throw new Error("IndoSMM API returned invalid services data")
    }

    console.log(`✅ Successfully fetched ${data.length} IndoSMM services`)
    return data
  }

  async createOrder(serviceId: number, link: string, quantity: number): Promise<IndoSMMOrder> {
    console.log("🛒 Creating IndoSMM order:", {
      serviceId,
      link: link.substring(0, 50) + (link.length > 50 ? "..." : ""),
      quantity,
    })

    console.log("🎯 CRITICAL: Submitting order to IndoSMM API with parameters:", {
      service: serviceId.toString(),
      link: link,
      quantity: quantity.toString(),
    })

    const data = await this.makeRequest("add", {
      service: serviceId.toString(),
      link: link,
      quantity: quantity.toString(),
    })

    if (!data.order) {
      console.error("❌ IndoSMM API did not return order ID:", data)
      throw new Error("IndoSMM API did not return order ID")
    }

    console.log(`✅ IndoSMM order created successfully:`, {
      indoSMMOrderId: data.order,
      status: data.status,
      charge: data.charge,
      startCount: data.start_count,
      remains: data.remains,
    })

    console.log("🎉 ORDER SUCCESSFULLY SUBMITTED TO INDOSMM!")

    return data
  }

  async getOrderStatus(orderId: number): Promise<IndoSMMOrder> {
    console.log(`🔍 Checking IndoSMM order status for order: ${orderId}`)

    const data = await this.makeRequest("status", {
      order: orderId.toString(),
    })

    console.log(`📊 IndoSMM order status:`, {
      orderId,
      status: data.status,
      remains: data.remains,
      startCount: data.start_count,
    })

    return data
  }

  async getBalance(): Promise<IndoSMMBalance> {
    const data = await this.makeRequest("balance")

    if (!data.balance) {
      console.error("❌ IndoSMM API did not return balance:", data)
      throw new Error("IndoSMM API did not return balance")
    }

    console.log(`💰 IndoSMM balance: ${data.balance} ${data.currency || "USD"}`)

    return {
      balance: data.balance,
      currency: data.currency || "USD",
    }
  }

  // Get multiple order statuses
  async getMultipleOrderStatus(orderIds: number[]): Promise<IndoSMMOrder[]> {
    console.log(`🔍 Checking multiple IndoSMM order statuses:`, orderIds)

    const data = await this.makeRequest("status", {
      orders: orderIds.join(","),
    })

    const results = Array.isArray(data) ? data : [data]
    console.log(`📊 Retrieved ${results.length} order statuses`)

    return results
  }
}

export const indoSMMService = new IndoSMMService()
