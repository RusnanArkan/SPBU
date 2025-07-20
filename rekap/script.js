// script.js
class BBM {
    constructor(nama, stokAwal = 0) {
        this.nama = nama;
        this.stokAwal = stokAwal;
        this.stokSaatIni = stokAwal;
        this.riwayatPenggunaan = [];
        this.lastMeterReading = null; // BARU: Properti untuk menyimpan pembacaan meter terakhir
    }

    // MODIFIKASI: Method untuk memuat data dari localStorage
    load() {
        const data = localStorage.getItem(`bbm_${this.nama}`); // Gunakan nama BBM sebagai ID unik
        if (data) {
            const parsedData = JSON.parse(data);
            this.stokAwal = parsedData.stokAwal;
            this.stokSaatIni = parsedData.stokSaatIni;
            this.riwayatPenggunaan = Array.isArray(parsedData.riwayatPenggunaan) ? parsedData.riwayatPenggunaan : [];
            this.lastMeterReading = parsedData.lastMeterReading !== undefined ? parsedData.lastMeterReading : null; // BARU: Muat lastMeterReading
        }
    }

    // MODIFIKASI: Method untuk menyimpan data ke localStorage
    save() {
        const dataToSave = {
            stokAwal: this.stokAwal,
            stokSaatIni: this.stokSaatIni,
            riwayatPenggunaan: this.riwayatPenggunaan,
            lastMeterReading: this.lastMeterReading // BARU: Simpan lastMeterReading
        };
        localStorage.setItem(`bbm_${this.nama}`, JSON.stringify(dataToSave));
    }

    setInputStokAwal(jumlah) {
        if (jumlah >= 0) {
            this.stokAwal = jumlah;
            this.stokSaatIni = jumlah;
            this.riwayatPenggunaan = []; // MODIFIKASI: Reset riwayat saat set stok awal
            this.lastMeterReading = null; // BARU: Reset meter terakhir saat set stok awal
            this.tambahRiwayat('Input Stok Awal', 'Input Stok Awal', jumlah, this.stokSaatIni, `Stok Awal: ${jumlah} Liter`, null, null, null);
            this.save(); // MODIFIKASI: Panggil save setelah perubahan
            return true;
        }
        return false;
    }

    tambahStok(jumlah) {
        if (jumlah > 0) {
            this.stokSaatIni += jumlah;
            this.tambahRiwayat('Tambah Stok', 'Penambahan', jumlah, this.stokSaatIni, `${jumlah} Liter`, null, null, null);
            this.save(); // MODIFIKASI: Panggil save setelah perubahan
            return true;
        }
        return false;
    }

    // MODIFIKASI: kurangiStok sekarang hanya menerima jumlah dan tipe, meter otomatis dihitung
    kurangiStok(jumlah, tipePenggunaan, deskripsiTampilan) {
        if (jumlah > 0 && this.stokSaatIni >= jumlah) {
            if (this.lastMeterReading === null) {
                // Ini seharusnya dihandle di kurangiStokHandler sebelum memanggil ini
                // Tetapi sebagai fallback, jika meter awal belum diset, tidak bisa mengurangi stok
                alert("Meter awal belum diatur. Mohon set meter awal terlebih dahulu.");
                return false;
            }

            const meterAwal = this.lastMeterReading; // Meter awal adalah lastMeterReading sebelumnya
            const meterAkhir = meterAwal + jumlah; // Meter akhir = Meter awal + jumlah liter
            const selisihMeter = jumlah; // Selisih meter adalah jumlah liter itu sendiri

            this.stokSaatIni -= jumlah;
            this.tambahRiwayat('Penggunaan', tipePenggunaan, jumlah, this.stokSaatIni, deskripsiTampilan, meterAwal, meterAkhir, selisihMeter);
            this.lastMeterReading = meterAkhir; // BARU: Perbarui lastMeterReading
            this.save(); // MODIFIKASI: Panggil save setelah perubahan
            return true;
        }
        return false;
    }

    getSisaStok() {
        return this.stokSaatIni;
    }

    // MODIFIKASI: Menambahkan parameter selisihMeter ke riwayat
    tambahRiwayat(tipeTransaksi, tipePenggunaan, jumlahLiter, stokSetelah, deskripsiTampilan = '', meterAwal = null, meterAkhir = null, selisihMeter = null) {
        const now = new Date();
        const tanggal = now.toLocaleDateString('id-ID');

        this.riwayatPenggunaan.push({
            tanggal: tanggal,
            tipeTransaksi: tipeTransaksi,
            tipePenggunaan: tipePenggunaan,
            jumlah: jumlahLiter,
            stokSetelah: stokSetelah,
            deskripsiTampilan: deskripsiTampilan,
            meterAwal: meterAwal,
            meterAkhir: meterAkhir,
            selisihMeter: selisihMeter // BARU: Tambahkan selisihMeter
        });
    }

    resetData() {
        this.stokAwal = 0;
        this.stokSaatIni = 0;
        this.riwayatPenggunaan = [];
        this.lastMeterReading = null; // BARU: Reset juga lastMeterReading
        this.save(); // MODIFIKASI: Panggil save setelah reset
    }
}

const bbmTypes = ['Pertamax', 'Pertalite', 'Solar', 'Pertaminadex'];
const bbmInstances = {};

// MODIFIKASI: Hapus fungsi saveData() dan loadData() global
// Karena sekarang setiap instance BBM memiliki method save() dan load() sendiri
// Data akan disimpan/dimuat per jenis BBM menggunakan `bbm_${this.nama}`

// Inisialisasi instance BBM
for (const type of bbmTypes) {
    bbmInstances[type] = new BBM(type);
    bbmInstances[type].load(); // MODIFIKASI: Panggil load untuk setiap instance
}


const bbmSections = document.getElementById('bbm-sections');
function renderBBMSections() {
    bbmSections.innerHTML = '';
    for (const type of bbmTypes) {
        const bbm = bbmInstances[type];
        const card = document.createElement('div');
        card.classList.add('bbm-card');
        card.innerHTML = `
            <h3>${bbm.nama}</h3>
            <p class="stok-info">Sisa Stok ${bbm.nama}: <span id="sisa-stok-${type}">${bbm.getSisaStok()}</span> Liter</p>
        `;
        bbmSections.appendChild(card);
    }
    // Fungsi renderRiwayat() tidak perlu diubah karena sudah terpisah.
    renderRiwayat();
}

// Fungsi-fungsi handler (tambahStokHandler, setInputStok, kurangiStokHandler)
// ini masih ada karena mungkin masih dipanggil dari tempat lain atau untuk tujuan debugging,
// tetapi elemen-elemen input yang memanggilnya sudah dihapus dari HTML.
// Jika Anda yakin tidak ada lagi fungsi yang memanggil ini, bisa dihapus juga.
function tambahStokHandler(type) {
    const inputElement = document.getElementById(`tambah-stok-${type}`);
    const jumlah = parseFloat(inputElement.value);
    const bbm = bbmInstances[type];

    if (isNaN(jumlah) || jumlah <= 0) {
        alert('Jumlah penambahan stok harus angka positif.');
        return;
    }

    if (bbm.tambahStok(jumlah)) {
        document.getElementById(`sisa-stok-${type}`).textContent = bbm.getSisaStok();
        inputElement.value = '';
        renderRiwayat();
        alert(`Stok ${type} berhasil ditambahkan sebanyak ${jumlah} Liter. Sisa: ${bbm.getSisaStok()} Liter.`);
    } else {
        alert(`Terjadi kesalahan saat menambahkan stok ${type}.`);
    }
}


function setInputStok(type) {
    const inputElement = document.getElementById(`stok-awal-${type}`);
    const jumlah = parseFloat(inputElement.value);
    const bbm = bbmInstances[type];
    if (bbm.setInputStokAwal(jumlah)) {
        document.getElementById(`sisa-stok-${type}`).textContent = bbm.getSisaStok();
        inputElement.value = bbm.stokAwal;
        renderBBMSections();
        renderRiwayat();
        alert(`Stok awal ${type} berhasil diatur ke ${jumlah} Liter. Meter akan direset.`);
    } else {
        alert('Stok awal harus angka positif.');
    }
}

function kurangiStokHandler(type) {
    const inputPenggunaan = document.getElementById(`penggunaan-${type}`);
    const selectTipePenggunaan = document.getElementById(`tipe-penggunaan-${type}`);
    const initialMeterInput = document.getElementById(`initial-meter-${type}`);

    const inputPenggunaanText = inputPenggunaan.value.trim();
    const tipePenggunaan = selectTipePenggunaan.value;

    const bbm = bbmInstances[type];

    let jumlahLiterUntukStok = 0;
    
    const match = inputPenggunaanText.match(/(\d+(\.\d+)?)/);
    jumlahLiterUntukStok = match ? parseFloat(match[1]) : 0;

    if (isNaN(jumlahLiterUntukStok) || jumlahLiterUntukStok <= 0) {
        alert('Jumlah penggunaan (Liter) harus lebih dari 0.');
        return;
    }

    if (bbm.lastMeterReading === null) {
        const initialMeterValue = initialMeterInput ? parseFloat(initialMeterInput.value) : NaN;
        if (isNaN(initialMeterValue) || initialMeterValue < 0) {
            alert('Masukkan nilai meter awal yang valid untuk pertama kali.');
            return;
        }
        bbm.lastMeterReading = initialMeterValue;
        bbm.save();
    }


    if (bbm.stokSaatIni < jumlahLiterUntukStok) {
        alert(`Stok ${type} tidak mencukupi (${jumlahLiterUntukStok} Liter). Sisa: ${bbm.getSisaStok()} Liter.`);
        return;
    }

    if (bbm.kurangiStok(jumlahLiterUntukStok, tipePenggunaan, inputPenggunaanText)) {
        document.getElementById(`sisa-stok-${type}`).textContent = bbm.getSisaStok();
        inputPenggunaan.value = '';
        selectTipePenggunaan.value = 'Penjualan Kontan';
        renderBBMSections();
        renderRiwayat();
        alert(`Penggunaan ${type} sebanyak ${jumlahLiterUntukStok} Liter (${tipePenggunaan}). Sisa: ${bbm.getSisaStok()} Liter.`);
    } else {
        alert(`Terjadi kesalahan saat mengurangi stok ${type}. Sisa: ${bbm.getSisaStok()} Liter.`);
    }
}


const riwayatContainer = document.getElementById('riwayat-container');
function renderRiwayat() {
    riwayatContainer.innerHTML = '<h2>Rekapitulasi Harian Stok BBM</h2>';

    for (const type of bbmTypes) {
        const bbm = bbmInstances[type];
        // Hanya render tabel jika ada riwayat atau stok awal yang diatur
        if (bbm.riwayatPenggunaan.length > 0 || bbm.stokAwal > 0) {
            const sectionHeader = document.createElement('h3');
            sectionHeader.textContent = `Rekapitulasi Harian ${bbm.nama}`;
            riwayatContainer.appendChild(sectionHeader);

            const table = document.createElement('table');
            table.classList.add('riwayat-table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Jenis BBM</th>
                        <th>Keterangan</th>
                        <th>Catatan</th>
                        <th>Saldo Masuk</th>
                        <th>Saldo Keluar</th>
                        <th>Saldo Akhir</th>
                    </tr>
                </thead>
                <tbody></tbody>
                <tfoot></tfoot>
            `;
            const tbody = table.querySelector('tbody');
            const tfoot = table.querySelector('tfoot');

            // Tambahkan baris Saldo Awal di bagian paling atas tabel ini
            const initialRow = document.createElement('tr');
            initialRow.classList.add('initial-balance-row');
            const firstInputStokAwal = bbm.riwayatPenggunaan.find(item => item.tipeTransaksi === 'Input Stok Awal');
            const tanggalAwal = firstInputStokAwal ? firstInputStokAwal.tanggal : 'Awal Sistem';

            initialRow.innerHTML = `
                <td>${tanggalAwal}</td>
                <td>${bbm.nama}</td>
                <td>Saldo Awal</td>
                <td></td> <td></td> <td></td> <td>${bbm.stokAwal.toFixed(2)}</td>
            `;
            tbody.appendChild(initialRow);

            // --- Mulai Logika Agregasi Harian Baru ---
            const groupedTransactionsByDate = {};
            bbm.riwayatPenggunaan.forEach(item => {
                const dateKey = item.tanggal;
                if (!groupedTransactionsByDate[dateKey]) {
                    groupedTransactionsByDate[dateKey] = [];
                }
                groupedTransactionsByDate[dateKey].push(item);
            });

            const sortedDates = Object.keys(groupedTransactionsByDate).sort((a, b) => {
                // Parse dates for correct chronological sorting (DD/MM/YYYY)
                const [dayA, monthA, yearA] = a.split('/').map(Number);
                const [dayB, monthB, yearB] = b.split('/').map(Number);
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);
                return dateA - dateB;
            });

            const dailySummaries = {};
            let runningStokAtEndOfPreviousDay = bbm.stokAwal; // Mulai dengan stok awal keseluruhan BBM

            sortedDates.forEach(dateKey => {
                const transactionsOnThisDay = groupedTransactionsByDate[dateKey];
                let totalMasuk = 0;
                let totalKeluar = 0;
                // Stok akhir untuk hari ini akan dihitung dari stok awal hari ini + masuk - keluar
                // atau diambil dari stokSetelah transaksi terakhir hari itu.
                let stokAkhirForThisDay = runningStokAtEndOfPreviousDay; // Default jika tidak ada transaksi yang mengubah stok

                transactionsOnThisDay.forEach(item => {
                    if (item.tipeTransaksi === 'Tambah Stok') {
                        totalMasuk += item.jumlah;
                    } else if (item.tipeTransaksi === 'Penggunaan') {
                        totalKeluar += item.jumlah;
                    }
                    // Update stokAkhirForThisDay dengan stokSetelah dari transaksi terakhir di hari itu
                    stokAkhirForThisDay = item.stokSetelah;
                });

                dailySummaries[dateKey] = {
                    stokAwalHarian: runningStokAtEndOfPreviousDay, // Stok awal hari ini adalah stok akhir hari sebelumnya
                    totalMasukHarian: totalMasuk,
                    totalKeluarHarian: totalKeluar,
                    stokAkhirHarian: stokAkhirForThisDay // Stok akhir hari ini
                };

                runningStokAtEndOfPreviousDay = stokAkhirForThisDay; // Siapkan stok akhir hari ini untuk perhitungan hari berikutnya
            });
            // --- Akhir Logika Agregasi Harian Baru ---


            sortedDates.forEach(dateKey => {
                const summary = dailySummaries[dateKey];
                // Hanya tampilkan jika ada transaksi masuk atau keluar pada hari tersebut
                if (summary.totalMasukHarian > 0 || summary.totalKeluarHarian > 0) {
                    const row = document.createElement('tr');
                    
                    let keterangan = '';
                    let catatan = ''; // Variabel untuk catatan

                    // Logika untuk kolom Keterangan
                    // Ini tetap berdasarkan keberadaan transaksi penerimaan/penjualan
                    const hasPenerimaan = summary.totalMasukHarian > 0;
                    const hasPenjualan = summary.totalKeluarHarian > 0;

                    if (hasPenerimaan && hasPenjualan) {
                        keterangan = 'Penerimaan/Penjualan';
                    } else if (hasPenerimaan) {
                        keterangan = 'Penerimaan';
                    } else if (hasPenjualan) {
                        keterangan = 'Penjualan';
                    }

                    // Logika untuk kolom Catatan (rumus baru: (stok awal harian + saldo masuk harian) vs pengeluaran harian)
                    const nilaiPerbandingan = summary.stokAwalHarian + summary.totalMasukHarian;

                    if (nilaiPerbandingan < summary.totalKeluarHarian) {
                        catatan = 'Minus';
                    } else if (nilaiPerbandingan > summary.totalKeluarHarian) {
                        catatan = 'Plus';
                    } else if (nilaiPerbandingan === summary.totalKeluarHarian && (summary.totalMasukHarian > 0 || summary.totalKeluarHarian > 0)) {
                        catatan = 'Seimbang'; // Jika jumlah masuk dan keluar sama dan ada transaksi
                    }


                    row.innerHTML = `
                        <td>${dateKey}</td>
                        <td>${bbm.nama}</td>
                        <td>${keterangan}</td>
                        <td>${catatan}</td> <td>${summary.totalMasukHarian.toFixed(2)}</td>
                        <td>${summary.totalKeluarHarian.toFixed(2)}</td>
                        <td>${summary.stokAkhirHarian.toFixed(2)}</td>
                    `;
                    tbody.appendChild(row);
                }
            });

            // Tambahkan baris ringkasan stok terkini untuk jenis BBM ini
            const finalSummaryRow = document.createElement('tr');
            finalSummaryRow.classList.add('summary-row', 'final-saldo-row');
            finalSummaryRow.innerHTML = `
                <td colspan="6" style="text-align: right; font-weight: bold;">Stok Terkini ${bbm.nama}:</td>
                <td style="font-weight: bold;">${bbm.getSisaStok().toFixed(2)}</td>
            `;
            tfoot.appendChild(finalSummaryRow);

            riwayatContainer.appendChild(table);
            riwayatContainer.appendChild(document.createElement('hr')); // Tambahkan garis pemisah antar tabel
        }
    }
}


document.getElementById('download-excel').addEventListener('click', () => {
    const dataForExcel = [];

    // Header baris
    const headerRow = [
        'Tanggal',
        'Jenis BBM',
        'Keterangan',
        'Catatan', // Kolom Catatan di Excel
        'Saldo Masuk',
        'Saldo Keluar',
        'Saldo Akhir'
    ];
    dataForExcel.push(headerRow);

    for (const type of bbmTypes) {
        const bbm = bbmInstances[type];
        if (bbm.riwayatPenggunaan.length > 0 || bbm.stokAwal > 0) {
            // Tambahkan baris Saldo Awal ke data Excel
            const firstInputStokAwal = bbm.riwayatPenggunaan.find(item => item.tipeTransaksi === 'Input Stok Awal');
            const tanggalAwal = firstInputStokAwal ? firstInputStokAwal.tanggal : 'Awal Sistem';
            dataForExcel.push([
                tanggalAwal,
                bbm.nama,
                'Saldo Awal',
                '', // Kosong untuk Saldo Awal di Excel
                '', // Kosongkan kolom Saldo Masuk untuk saldo awal
                '', // Kosongkan kolom Saldo Keluar untuk saldo awal
                bbm.stokAwal.toFixed(2)
            ]);


            // --- Mulai Logika Agregasi Harian Baru untuk Excel ---
            const groupedTransactionsByDate = {};
            bbm.riwayatPenggunaan.forEach(item => {
                const dateKey = item.tanggal;
                if (!groupedTransactionsByDate[dateKey]) {
                    groupedTransactionsByDate[dateKey] = [];
                }
                groupedTransactionsByDate[dateKey].push(item);
            });

            const sortedDates = Object.keys(groupedTransactionsByDate).sort((a, b) => {
                const [dayA, monthA, yearA] = a.split('/').map(Number);
                const [dayB, monthB, yearB] = b.split('/').map(Number);
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);
                return dateA - dateB;
            });

            const dailySummaries = {};
            let runningStokAtEndOfPreviousDay = bbm.stokAwal;

            sortedDates.forEach(dateKey => {
                const transactionsOnThisDay = groupedTransactionsByDate[dateKey];
                let totalMasuk = 0;
                let totalKeluar = 0;
                let stokAkhirForThisDay = runningStokAtEndOfPreviousDay;

                transactionsOnThisDay.forEach(item => {
                    if (item.tipeTransaksi === 'Tambah Stok') {
                        totalMasuk += item.jumlah;
                    } else if (item.tipeTransaksi === 'Penggunaan') {
                        totalKeluar += item.jumlah;
                    }
                    stokAkhirForThisDay = item.stokSetelah;
                });

                dailySummaries[dateKey] = {
                    stokAwalHarian: runningStokAtEndOfPreviousDay,
                    totalMasukHarian: totalMasuk,
                    totalKeluarHarian: totalKeluar,
                    stokAkhirHarian: stokAkhirForThisDay
                };

                runningStokAtEndOfPreviousDay = stokAkhirForThisDay;
            });
            // --- Akhir Logika Agregasi Harian Baru untuk Excel ---


            sortedDates.forEach(dateKey => {
                const summary = dailySummaries[dateKey];
                if (summary.totalMasukHarian > 0 || summary.totalKeluarHarian > 0) {
                    let keterangan = '';
                    let catatan = ''; // Variabel untuk catatan di Excel

                    // Logika untuk kolom Keterangan
                    const hasPenerimaan = summary.totalMasukHarian > 0;
                    const hasPenjualan = summary.totalKeluarHarian > 0;

                    if (hasPenerimaan && hasPenjualan) {
                        keterangan = 'Penerimaan/Penjualan';
                    } else if (hasPenerimaan) {
                        keterangan = 'Penerimaan';
                    } else if (hasPenjualan) {
                        keterangan = 'Penjualan';
                    }

                    // Logika untuk kolom Catatan (rumus baru)
                    const nilaiPerbandingan = summary.stokAwalHarian + summary.totalMasukHarian;

                    if (nilaiPerbandingan < summary.totalKeluarHarian) {
                        catatan = 'Minus';
                    } else if (nilaiPerbandingan > summary.totalKeluarHarian) {
                        catatan = 'Plus';
                    } else if (nilaiPerbandingan === summary.totalKeluarHarian && (summary.totalMasukHarian > 0 || summary.totalKeluarHarian > 0)) {
                        catatan = 'Seimbang';
                    }

                    dataForExcel.push([
                        dateKey,
                        bbm.nama,
                        keterangan,
                        catatan, // Kolom Catatan di Excel
                        summary.totalMasukHarian.toFixed(2),
                        summary.totalKeluarHarian.toFixed(2),
                        summary.stokAkhirHarian.toFixed(2)
                    ]);
                }
            });

            // Add final stock summary for Excel for this BBM type
            dataForExcel.push([
                `Stok Terkini ${bbm.nama}:`, '', '', '', '', '', bbm.getSisaStok().toFixed(2)
            ]);
            dataForExcel.push(['', '', '', '', '', '', '']); // Baris kosong sebagai pemisah antar jenis BBM
        }
    }


    const ws = XLSX.utils.aoa_to_sheet(dataForExcel);

    // Apply basic styling (borders, width, alignment)
    const range = XLSX.utils.decode_range(ws['!ref']);
    const borderStyle = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
    };
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) { ws[cellAddress] = { t: 's', v: '' }; }
            if (!ws[cellAddress].s) { ws[cellAddress].s = {}; }
            ws[cellAddress].s.border = borderStyle;
        }
    }

    const headerCellsToCenter = [
        'A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'
    ];
    headerCellsToCenter.forEach(cellAddress => {
        if (!ws[cellAddress]) { ws[cellAddress] = { t: 's', v: '' }; }
        if (!ws[cellAddress].s) { ws[cellAddress].s = {}; }
        ws[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
    });

    const max_width = dataForExcel.reduce((w, r) => Math.max(w, r.length), 0);
    ws['!cols'] = [];
    for(let i = 0; i < max_width; i++) {
        let maxLength = 0;
        for (let rIdx = 0; rIdx < dataForExcel.length; rIdx++) {
            const cellValue = dataForExcel[rIdx][i];
            if (cellValue !== null && cellValue !== undefined) {
                maxLength = Math.max(maxLength, cellValue.toString().length);
            }
        }
        ws['!cols'][i] = { width: maxLength + 2 };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Stok BBM Harian");

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');

    const fileName = `Buku_Stok_BBM_${year}-${month}.xlsx`;

    XLSX.writeFile(wb, fileName);
});

document.getElementById('hapus-data').addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data stok BBM dan riwayatnya? Tindakan ini tidak dapat dibatalkan.')) {
        // MODIFIKASI: Hapus semua data per instance BBM
        for (const type of bbmTypes) {
            localStorage.removeItem(`bbm_${type}`); // Hapus data per BBM di localStorage
            bbmInstances[type].resetData(); // Panggil resetData yang sudah diubah
        }
        renderBBMSections();
        alert('Semua data stok BBM dan riwayatnya telah dihapus.');
    }
});

renderBBMSections();