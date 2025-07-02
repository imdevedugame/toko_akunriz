-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Streaming', 'streaming', 'Layanan streaming video dan musik'),
('Gaming', 'gaming', 'Akun premium untuk gaming'),
('Productivity', 'productivity', 'Tools produktivitas dan bisnis'),
('Education', 'education', 'Platform pembelajaran online');

-- Insert admin user (password: admin123)
INSERT INTO users (email, password, name, role) VALUES
('admin@premiumstore.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'admin');

-- Insert sample premium products
INSERT INTO premium_products (name, slug, description, category_id, user_price, reseller_price, stock, features, tips) VALUES
('Netflix Premium 1 Bulan', 'netflix-premium-1-bulan', 'Akun Netflix Premium dengan kualitas 4K Ultra HD. Nikmati ribuan film dan series terbaru tanpa iklan.', 1, 25000, 20000, 50, 
'["Kualitas 4K Ultra HD", "Tanpa iklan", "Download untuk offline", "Akses semua konten", "Bisa digunakan di 4 device"]',
'["Jangan ganti password akun", "Maksimal 1 device aktif bersamaan", "Jangan share akun ke orang lain", "Logout setelah selesai menonton"]'),

('Spotify Premium 1 Bulan', 'spotify-premium-1-bulan', 'Akun Spotify Premium tanpa iklan dengan kualitas musik terbaik.', 1, 15000, 12000, 30,
'["Tanpa iklan", "Kualitas musik tinggi", "Download offline", "Skip unlimited", "Akses semua playlist"]',
'["Jangan ganti password", "Gunakan di 1 device saja", "Jangan ubah profil", "Logout setelah selesai"]'),

('Disney+ Hotstar Premium', 'disney-hotstar-premium', 'Akses lengkap Disney+ dan Hotstar dengan konten premium.', 1, 20000, 16000, 25,
'["Konten Disney+ lengkap", "Hotstar premium", "Kualitas HD/4K", "Download offline", "Tanpa iklan"]',
'["Jangan ganti password", "Maksimal 1 device", "Jangan share akun", "Logout setelah menonton"]');

-- Insert sample premium accounts
INSERT INTO premium_accounts (product_id, email, password) VALUES
(1, 'netflix1@example.com', 'password123'),
(1, 'netflix2@example.com', 'password456'),
(1, 'netflix3@example.com', 'password789'),
(2, 'spotify1@example.com', 'spotifypass1'),
(2, 'spotify2@example.com', 'spotifypass2'),
(3, 'disney1@example.com', 'disneypass1');

-- Insert settings
INSERT INTO settings (key_name, value, description) VALUES
('xendit_api_key', 'your_xendit_api_key_here', 'Xendit API Key'),
('indosmm_api_key', 'your_indosmm_api_key_here', 'IndoSMM API Key'),
('indosmm_api_url', 'https://indosmm.com/api/v2', 'IndoSMM API Base URL'),
('site_name', 'Premium Store', 'Site Name'),
('site_description', 'Toko online terpercaya untuk akun premium dan layanan IndoSMM', 'Site Description');
