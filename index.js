const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const qrcode = require('qrcode-terminal');

// Konfigurasi
const config = {
    AI_API_KEY: 'YOUR_AI_API_KEY',
    AI_ENDPOINT: 'https://api.openai.com/v1/chat/completions', // Ganti dengan endpoint AI Anda
    SHOP_NAME: 'Vochuy',
    ADMIN_NUMBER: '081227108559' // Nomor admin untuk notifikasi error
};

// Daftar produk
const products = {
    voucher: {
        listrik: [
            { code: 'VPLN20', name: 'Voucher PLN 20.000', price: 19.500 },
            { code: 'VPLN50', name: 'Voucher PLN 50.000', price: 48.500 },
            { code: 'VPLN100', name: 'Voucher PLN 100.000', price: 97.000 }
        ],
        game: [
            { code: 'VGML10', name: 'Voucher Garena 10.000', price: 9.500 },
            { code: 'VGML50', name: 'Voucher Garena 50.000', price: 48.000 },
            { code: 'VML10', name: 'Voucher Mobile Legends 10.000', price: 9.800 }
        ]
    },
    pulsa: [
        { code: 'PTEL10', name: 'Pulsa Telkomsel 10.000', price: 10.500 },
        { code: 'PXL25', name: 'Pulsa XL 25.000', price: 24.800 }
    ],
    paket_data: [
        { code: 'DATEL1', name: 'Telkomsel 1GB/30hr', price: 12.000 },
        { code: 'DAXL3', name: 'XL 3GB/30hr', price: 25.000 }
    ],
    sosmed: {
        tiktok: [
            { code: 'TTK1K', name: 'Suntik TikTok 1000 Followers', price: 50.000 },
            { code: 'TTK10K', name: 'Suntik TikTok 10000 Followers', price: 450.000 }
        ],
        instagram: [
            { code: 'IG1K', name: 'Suntik Instagram 1000 Followers', price: 75.000 },
            { code: 'IG10K', name: 'Suntik Instagram 10000 Followers', price: 700.000 }
        ],
        youtube: [
            { code: 'YT1K', name: 'Suntik YouTube 1000 Subscribers', price: 300.000 },
            { code: 'YT10K', name: 'Suntik YouTube 10000 Subscribers', price: 2.500.000 }
        ]
    },
    aplikasi: [
        { code: 'SPOTIFY', name: 'Spotify Premium 1 Tahun', price: 75.000 },
        { code: 'YTPREMIUM', name: 'YouTube Premium 1 Tahun', price: 120.000 }
    ],
    jasa: [
        { code: 'WEB1', name: 'Jasa Pembuatan Website Sederhana', price: 1.500.000 },
        { code: 'WEBPRO', name: 'Jasa Pembuatan Website Profesional', price: 5.000.000 }
    ]
};

// Inisialisasi client WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Generate QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Scan QR code di atas dengan WhatsApp di perangkat lain');
});

// Bot siap
client.on('ready', () => {
    console.log(`${config.SHOP_NAME} Bot siap melayani!`);
});

// Fungsi untuk memproses pesan dengan AI
async function processWithAI(message) {
    try {
        const response = await axios.post(config.AI_ENDPOINT, {
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `Anda adalah customer service dari ${config.SHOP_NAME} yang menjual berbagai produk digital. 
                    Produk yang tersedia: voucher listrik, voucher game, pulsa, paket data, jasa sosial media (TikTok, Instagram, YouTube), 
                    aplikasi premium, dan jasa pembuatan website. Balas dengan ramah dan profesional. Jika ada pertanyaan tentang produk, 
                    berikan detail produk dari daftar berikut: ${JSON.stringify(products)}.`
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${config.AI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error processing with AI:', error);
        return 'Maaf, sedang ada gangguan teknis. Silakan coba lagi nanti atau hubungi admin kami.';
    }
}

// Fungsi untuk menampilkan menu produk
function showProductMenu() {
    let menu = `*Menu Produk ${config.SHOP_NAME}*\n\n`;
    menu += `*1. Voucher Listrik*\n`;
    products.voucher.listrik.forEach(item => {
        menu += `- ${item.name}: Rp${item.price.toLocaleString('id-ID')} (Kode: ${item.code})\n`;
    });
    
    menu += `\n*2. Voucher Game*\n`;
    products.voucher.game.forEach(item => {
        menu += `- ${item.name}: Rp${item.price.toLocaleString('id-ID')} (Kode: ${item.code})\n`;
    });
    
    menu += `\n*3. Pulsa*\n`;
    products.pulsa.forEach(item => {
        menu += `- ${item.name}: Rp${item.price.toLocaleString('id-ID')} (Kode: ${item.code})\n`;
    });
    
    menu += `\n*4. Paket Data*\n`;
    products.paket_data.forEach(item => {
        menu += `- ${item.name}: Rp${item.price.toLocaleString('id-ID')} (Kode: ${item.code})\n`;
    });
    
    menu += `\n*5. Layanan Sosial Media*\n`;
    menu += `*TikTok:*\n`;
    products.sosmed.tiktok.forEach(item => {
        menu += `- ${item.name}: Rp${item.price.toLocaleString('id-ID')} (Kode: ${item.code})\n`;
    });
    menu += `*Instagram:*\n`;
    products.sosmed.instagram.forEach(item => {
        menu += `- ${item.name}: Rp${item.price.toLocaleString('id-ID')} (Kode: ${item.code})\n`;
    });
    menu += `*YouTube:*\n`;
    products.sosmed.youtube.forEach(item => {
        menu += `- ${item.name}: Rp${item.price.toLocaleString('id-ID')} (Kode: ${item.code})\n`;
    });
    
    menu += `\n*6. Aplikasi Premium*\n`;
    products.aplikasi.forEach(item => {
        menu += `- ${item.name}: Rp${item.price.toLocaleString('id-ID')} (Kode: ${item.code})\n`;
    });
    
    menu += `\n*7. Jasa Pembuatan Website*\n`;
    products.jasa.forEach(item => {
        menu += `- ${item.name}: Rp${item.price.toLocaleString('id-ID')} (Kode: ${item.code})\n`;
    });
    
    menu += `\nKetik *"info [kode produk]"* untuk detail produk, contoh: *info VPLN20*\n`;
    menu += `Atau tulis pertanyaan Anda dan kami akan bantu.`;
    
    return menu;
}

// Fungsi untuk mendapatkan info produk berdasarkan kode
function getProductInfo(code) {
    code = code.toUpperCase();
    
    // Cari di semua kategori
    for (const category in products) {
        if (category === 'voucher' || category === 'sosmed') {
            for (const subCategory in products[category]) {
                const found = products[category][subCategory].find(item => item.code === code);
                if (found) return formatProductInfo(found);
            }
        } else {
            const found = products[category].find(item => item.code === code);
            if (found) return formatProductInfo(found);
        }
    }
    
    return `Produk dengan kode ${code} tidak ditemukan. Silakan cek kode produk atau ketik *"menu"* untuk melihat daftar produk.`;
}

function formatProductInfo(product) {
    return `*Detail Produk*\n\n` +
           `Nama: ${product.name}\n` +
           `Kode: ${product.code}\n` +
           `Harga: Rp${product.price.toLocaleString('id-ID')}\n\n` +
           `Untuk memesan, silakan kirim format berikut:\n` +
           `*BELI [KODE] [NOMOR/EMAIL]*\n` +
           `Contoh: *BELI VPLN20 081234567890*`;
}

// Handle pesan masuk
client.on('message', async message => {
    try {
        const text = message.body.toLowerCase() || '';
        
        // Skip pesan dari status atau pesan yang tidak perlu dibalas
        if (message.isStatus || !text) return;
        
        let reply = '';
        
        // Cek command khusus
        if (text === 'menu' || text === 'help' || text === 'produk') {
            reply = showProductMenu();
        } else if (text.startsWith('info ')) {
            const code = text.split(' ')[1];
            reply = getProductInfo(code);
        } else if (text.startsWith('beli ')) {
            const parts = text.split(' ');
            if (parts.length < 3) {
                reply = 'Format pemesanan salah. Gunakan: *BELI [KODE] [NOMOR/EMAIL]*\nContoh: *BELI VPLN20 081234567890*';
            } else {
                const code = parts[1].toUpperCase();
                const target = parts[2];
                reply = `Terima kasih atas pesanan Anda!\n\n` +
                        `Produk: ${code}\n` +
                        `Target: ${target}\n\n` +
                        `Admin kami akan segera memproses pesanan Anda. Silakan tunggu konfirmasi dalam 1-10 menit.\n\n` +
                        `Untuk pertanyaan lebih lanjut, silakan hubungi kami.`;
                
                // Notifikasi ke admin (opsional)
                const adminMsg = `*PESANAN BARU*\n\n` +
                                `Dari: ${message.from}\n` +
                                `Produk: ${code}\n` +
                                `Target: ${target}\n` +
                                `Waktu: ${new Date().toLocaleString()}`;
                await client.sendMessage(`${config.ADMIN_NUMBER}@c.us`, adminMsg);
            }
        } else {
            // Gunakan AI untuk pesan lainnya
            reply = await processWithAI(text);
        }
        
        // Kirim balasan
        await message.reply(reply);
        
    } catch (error) {
        console.error('Error handling message:', error);
        // Notifikasi error ke admin
        await client.sendMessage(
            `${config.ADMIN_NUMBER}@c.us`, 
            `*ERROR BOT*\n\nTerjadi error saat memproses pesan:\n${error.message}`
        );
    }
});

// Jalankan bot
client.initialize();

// Handle error
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
