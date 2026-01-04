import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    // Buat database
    await connection.query(`CREATE DATABASE IF NOT EXISTS raboros_db`);
    console.log("✅ Database raboros_db berhasil dibuat");

    await connection.query(`USE raboros_db`);

    // Buat tabel expenses
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(36) PRIMARY KEY,
        item VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        category ENUM('Kebutuhan Pokok', 'Transportasi & Servis', 'Gaya Hidup', 'Kesehatan', 'Lainnya') NOT NULL,
        source VARCHAR(255) NOT NULL,
        date DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabel expenses berhasil dibuat");

    // Buat tabel budget
    await connection.query(`
      CREATE TABLE IF NOT EXISTS budget (
        id VARCHAR(36) PRIMARY KEY,
        total_budget INT NOT NULL,
        pokok_budget INT NOT NULL DEFAULT 0,
        transport_budget INT NOT NULL DEFAULT 0,
        gaya_hidup_budget INT NOT NULL DEFAULT 0,
        kesehatan_budget INT NOT NULL DEFAULT 0,
        tabungan_budget INT NOT NULL DEFAULT 0,
        lainnya_budget INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabel budget berhasil dibuat");

    console.log("\n✨ Setup database selesai!\n");
  } catch (error) {
    console.error("❌ Error setup database:", error);
  } finally {
    await connection.end();
  }
}

setupDatabase();
