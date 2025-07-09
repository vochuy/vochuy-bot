const { WAConnection, MessageType } = require('@adiwajshing/baileys');
const fs = require('fs');

// Config
const config = {
    sessionFile: './session.json',
    adminNumber: '081227108559' // Ganti dengan nomor admin
};

// Produk Toko Vochuy
const products = {
    pulsa: [
        { code: 'P10', name: 'Pulsa 10.000', price: 11.000 },
        { code: 'P20', name: 'Pulsa 20.000', price: 21.000 }
    ],
    pln: [
        { code: 'PLN20', name: 'Token PLN 20.000', price: 19.500 },
        { code: 'PLN50', name: 'Token PLN 50.000', price: 48.000 }
    ],
    paketdata: [
        { code: 'AXL1', name: 'AXIS 1GB/30D', price: 10.000 },
        { code: 'TEL3', name: 'Telkomsel 3GB/30D', price: 25.000 }
    ],
    sosmed: [
        { code: 'IG1K', name: 'Instagram 1K Followers', price: 50.000 },
        { code: 'TIK5K', name: 'TikTok 5K Followers', price: 100.000 }
    ]
};

const conn = new WAConnection();

// Load session jika ada
if (fs.existsSync(config.sessionFile)) {
    conn.loadAuthInfo(config.sessionFile);
}

// Event QR Code
conn.on('qr', qr => {
    console.log('Scan QR ini di WhatsApp > Menu Titik 3 > Perangkat Tertaut');
    require('qrcode-terminal').generate(qr, { small: true });
});

// Event ketika bot sudah connect
conn.on('open', () => {
    console.log('🤖 Bot Vochuy siap melayani!');
    fs.writeFileSync(config.sessionFile, JSON.stringify(conn.base64EncodedAuthInfo()));
});

// Event pesan masuk
conn.on('chat-update', async (m) => {
    if (!m.hasNewMessage || !m.messages.all()[0]) return;
    
    const msg = m.messages.all()[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || '';

    if (text.toLowerCase() === 'menu') {
        let menu = `🛍️ *Menu Produk Vochuy* 🛍️\n\n`;
        menu += `🔹 *Pulsa:*\n`;
        products.pulsa.forEach(p => menu += `- ${p.name} (${p.code}): Rp${p.price}\n`);
        
        menu += `\n🔹 *Token PLN:*\n`;
        products.pln.forEach(p => menu += `- ${p.name} (${p.code}): Rp${p.price}\n`);
        
        menu += `\n🔹 *Paket Data:*\n`;
        products.paketdata.forEach(p => menu += `- ${p.name} (${p.code}): Rp${p.price}\n`);
        
        menu += `\n🔹 *Sosial Media:*\n`;
        products.sosmed.forEach(p => menu += `- ${p.name} (${p.code}): Rp${p.price}\n`);
        
        menu += `\n📌 *Cara Pesan:* Ketik "BELI [KODE] [NOMOR]"\nContoh: *BELI P10 08123456789*`;
        
        await conn.sendMessage(sender, menu, MessageType.text);
    } 
    else if (text.toLowerCase().startsWith('beli ')) {
        const [_, code, number] = text.split(' ');
        let product = null;
        
        // Cari produk
        for (const category in products) {
            product = products[category].find(p => p.code.toLowerCase() === code.toLowerCase());
            if (product) break;
        }
        
        if (product) {
            const reply = `✅ *Pesanan Diterima!*\n\n` +
                          `Produk: ${product.name}\n` +
                          `Harga: Rp${product.price}\n` +
                          `Nomor: ${number}\n\n` +
                          `Admin akan segera memproses pesanan Anda.`;
            
            await conn.sendMessage(sender, reply, MessageType.text);
            
            // Kirim notifikasi ke admin
            const adminMsg = `💡 *PESANAN BARU!*\n\n` +
                             `Dari: ${sender}\n` +
                             `Produk: ${product.name}\n` +
                             `Nomor: ${number}\n` +
                             `Kode: ${product.code}`;
            await conn.sendMessage(config.adminNumber + '@s.whatsapp.net', adminMsg, MessageType.text);
        } else {
            await conn.sendMessage(sender, '❌ Kode produk tidak valid. Ketik *MENU* untuk melihat daftar produk.', MessageType.text);
        }
    } 
    else {
        await conn.sendMessage(sender, 'Halo! Ketik *MENU* untuk melihat produk yang tersedia.', MessageType.text);
    }
});

// Connect ke WhatsApp
conn.connect();
