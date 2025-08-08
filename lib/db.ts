import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "premium_store",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
}

let pool: mysql.Pool

try {
  pool = mysql.createPool(dbConfig)
  console.log("Database pool created successfully")
} catch (error) {
  console.error("Failed to create database pool:", error)
  throw error
}

// Test connection on startup
pool
  .getConnection()
  .then((connection) => {
    console.log("Database connected successfully")
    connection.release()
  })
  .catch((error) => {
    console.error("Database connection failed:", error)
  })

// Helper function to execute queries
export const query = async (sql: string, params?: any[]) => {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Query execution failed:", error)
    throw error
  }
}

export default pool
