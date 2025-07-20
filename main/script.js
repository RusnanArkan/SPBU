// script.js
class BBM {
    constructor(nama, stokAwal = 0) {
        this.nama = nama;
        this.stokSaatIni = stokAwal;
        this.riwayatPenggunaan = [];
        this.lastMeterReading = null;
    }

    load() {
        const data = localStorage.getItem(`bbm_${this.nama}`);
        if (data) {
            const parsedData = JSON.parse(data);
            this.stokAwal = parsedData.stokAwal;
            this.stokSaatIni = parsedData.stokSaatIni;
            this.riwayatPenggunaan = Array.isArray(parsedData.riwayatPenggunaan) ? parsedData.riwayatPenggunaan : [];
            this.lastMeterReading = parsedData.lastMeterReading !== undefined ? parsedData.lastMeterReading : null;
        }
    }

    save() {
        const dataToSave = {
            stokAwal: this.stokAwal,
            stokSaatIni: this.stokSaatIni,
            riwayatPenggunaan: this.riwayatPenggunaan,
            lastMeterReading: this.lastMeterReading
        };
        localStorage.setItem(`bbm_${this.nama}`, JSON.stringify(dataToSave));
    }

    setInputStokAwal(jumlah) {
        if (jumlah >= 0) {
            this.stokAwal = jumlah;
            this.stokSaatIni = jumlah;
            this.riwayatPenggunaan = [];
            this.lastMeterReading = null;
            this.tambahRiwayat('Input Stok Awal', 'Input Stok Awal', jumlah, this.stokSaatIni, `Stok Awal: ${jumlah} Liter`, null, null, null);
            this.save();
            return true;
        }
        return false;
    }

    tambahStok(jumlah) {
        if (jumlah > 0) {
            this.stokSaatIni += jumlah;
            this.tambahRiwayat('Tambah Stok', 'Penambahan', jumlah, this.stokSaatIni, `${jumlah} Liter`, null, null, null);
            this.save();
            return true;
        }
        return false;
    }

    // MODIFIKASI: Method kurangiStok tidak lagi memeriksa ketersediaan stok
    kurangiStok(jumlah, tipePenggunaan, deskripsiTampilan) {
        if (jumlah > 0) {
            if (this.lastMeterReading === null) {
                // Ini seharusnya dihandle di kurangiStokHandler sebelum memanggil ini
                // Tetapi sebagai fallback, jika meter awal belum diset, tidak bisa mengurangi stok
                alert("Meter awal belum diatur. Mohon set meter awal terlebih dahulu.");
                return false;
            }

            const meterAwal = this.lastMeterReading;
            const meterAkhir = meterAwal + jumlah;

            this.stokSaatIni -= jumlah; // Stok akan berkurang meskipun menjadi negatif
            this.tambahRiwayat('Penggunaan', tipePenggunaan, jumlah, this.stokSaatIni, deskripsiTampilan, meterAwal, meterAkhir);
            this.lastMeterReading = meterAkhir;
            this.save();
            return true;
        }
        return false;
    }

    getSisaStok() {
        return this.stokSaatIni;
    }

    tambahRiwayat(tipeTransaksi, tipePenggunaan, jumlahLiter, stokSetelah, deskripsiTampilan = '', meterAwal = null, meterAkhir = null) {
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
        });
    }

    resetData() {
        this.stokAwal = 0;
        this.stokSaatIni = 0;
        this.riwayatPenggunaan = [];
        this.lastMeterReading = null;
        this.save();
    }
}

const bbmTypes = ['Pertamax', 'Pertalite', 'Solar', 'Pertaminadex'];
const bbmInstances = {};

for (const type of bbmTypes) {
    bbmInstances[type] = new BBM(type);
    bbmInstances[type].load();
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

            <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 15px; background-color: #f9f9f9; border-radius: 5px;">
                <h4>Manajemen Stok</h4>
                <label for="stok-awal-${type}">Input Stok Awal (Liter):</label>
                <input type="number" id="stok-awal-${type}" value="${bbm.stokAwal}" min="0">
                <button onclick="setInputStok('${type}')">Set Stok Awal</button>

                <br><br>

                <label for="tambah-stok-${type}">Tambah Stok (Liter):</label>
                <input type="number" id="tambah-stok-${type}" min="0">
                <button onclick="tambahStokHandler('${type}')">Tambah Stok</button>
            </div>

            <div style="border: 1px solid #ccc; padding: 10px; background-color: #e9e9e9; border-radius: 5px;">
                <h4>Penggunaan BBM</h4>
                <label for="penggunaan-${type}">Input Penggunaan (Liter):</label>
                <input type="text" id="penggunaan-${type}" placeholder="Cth: 20 atau 20 Pak Aslam">

                <label for="tipe-penggunaan-${type}">Tipe Penggunaan:</label>
                <select id="tipe-penggunaan-${type}">
                    <option value="Penjualan Kontan">Penjualan Kontan</option>
                    <option value="TERA">TERA</option>
                    <option value="Pakai Pribadi">Pakai Pribadi</option>
                    <option value="Pakai Polisi">Pakai Polisi</option>
                </select>

                <div id="meter-inputs-${type}" style="display: block;">
                    <p>Meter Awal Terakhir: <span id="last-meter-${type}">${bbm.lastMeterReading !== null ? bbm.lastMeterReading : 'Belum Ada'}</span></p>
                    ${bbm.lastMeterReading === null ? `<label for="initial-meter-${type}">Set Meter Awal Pertama Kali:</label><input type="number" id="initial-meter-${type}" min="0" step="any">` : ''}
                </div>

                <button onclick="kurangiStokHandler('${type}')">Kurangi Stok</button>
            </div>

            <p class="stok-info">Sisa Stok ${bbm.nama}: <span id="sisa-stok-${type}">${bbm.stokSaatIni}</span> Liter</p>
        `;
        bbmSections.appendChild(card);
    }
    renderRiwayat();
}

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

    // MODIFIKASI: Hapus pengecekan if (bbm.stokSaatIni < jumlahLiterUntukStok)
    // Sekarang, kurangiStok akan selalu berhasil jika jumlah > 0, bahkan jika stok menjadi negatif.
    
    if (bbm.kurangiStok(jumlahLiterUntukStok, tipePenggunaan, inputPenggunaanText)) {
        document.getElementById(`sisa-stok-${type}`).textContent = bbm.getSisaStok();
        inputPenggunaan.value = '';
        selectTipePenggunaan.value = 'Penjualan Kontan';
        renderBBMSections();
        renderRiwayat();
        alert(`Penggunaan ${type} sebanyak ${jumlahLiterUntukStok} Liter (${tipePenggunaan}). Sisa: ${bbm.getSisaStok()} Liter.`);
    } else {
        // Alert ini hanya akan muncul jika jumlah <= 0 atau meter awal belum diset (internal di BBM class)
        alert(`Terjadi kesalahan saat mengurangi stok ${type}. Sisa: ${bbm.getSisaStok()} Liter.`);
    }
}


const riwayatContainer = document.getElementById('riwayat-container');
function renderRiwayat() {
    riwayatContainer.innerHTML = '<h2>Riwayat Perhitungan & Penggunaan</h2>';
    const table = document.createElement('table');
    table.classList.add('riwayat-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th rowspan="2">Jenis BBM</th>
                <th rowspan="2">Tanggal</th>
                <th rowspan="2">Keterangan</th>
                <th rowspan="2">Saldo Masuk (Liter)</th>
                <th rowspan="2">Tambah Saldo (Liter)</th>
                <th colspan="2">Meter</th>
                <th colspan="4">Saldo Keluar (Liter)</th>
                <th rowspan="2">Stok Setelah (Liter)</th>
            </tr>
            <tr>
                <th>Awal</th>
                <th>Akhir</th>
                <th>Penjualan Kontan</th>
                <th>TERA</th>
                <th>Pakai Pribadi</th>
                <th>Pakai Polisi</th>
                <th></th> </tr>
        </thead>
        <tbody></tbody>
        <tfoot></tfoot>
    `;
    const tbody = table.querySelector('tbody');
    const tfoot = table.querySelector('tfoot');

    for (const type of bbmTypes) {
        const bbm = bbmInstances[type];
        if (bbm.riwayatPenggunaan.length > 0) {
            const groupHeader = document.createElement('tr');
            groupHeader.innerHTML = `<td colspan="12" class="riwayat-group-header">${bbm.nama}</td>`; // Ini perlu disesuaikan jika jumlah kolom berubah
            tbody.appendChild(groupHeader);

            let totalSaldoMasukBBM = 0;
            let totalTambahSaldoBBM = 0;
            let totalSaldoKeluarBBM = 0;
            let saldoAwalDihitungBBM = 0;

            if (bbm.riwayatPenggunaan.length > 0 && bbm.riwayatPenggunaan[0].tipeTransaksi === 'Input Stok Awal') {
                saldoAwalDihitungBBM = bbm.riwayatPenggunaan[0].jumlah;
            }

            bbm.riwayatPenggunaan.forEach(item => {
                let saldoMasukDisplay = '';
                let tambahSaldoDisplay = '';
                let penjualanKontanLiterDisplay = '';
                let meterAwalDisplay = item.meterAwal !== null ? item.meterAwal : '';
                let meterAkhirDisplay = item.meterAkhir !== null ? item.meterAkhir : '';
                let teraAmount = '';
                let pakaiPribadiAmount = '';
                let pakaiPolisiAmount = '';
                let tipeTransaksiDisplay = item.tipeTransaksi;


                if (item.tipeTransaksi === 'Input Stok Awal') {
                    saldoMasukDisplay = item.jumlah;
                    tipeTransaksiDisplay = `Input Stok Awal`;
                } else if (item.tipeTransaksi === 'Tambah Stok') {
                    tambahSaldoDisplay = item.jumlah;
                    totalTambahSaldoBBM += item.jumlah;
                    tipeTransaksiDisplay = `Tambah Stok`;
                } else if (item.tipeTransaksi === 'Penggunaan') {
                    if (item.tipePenggunaan === 'Penjualan Kontan') {
                        penjualanKontanLiterDisplay = item.deskripsiTampilan;
                        totalSaldoKeluarBBM += item.jumlah;
                    } else if (item.tipePenggunaan === 'TERA') {
                        teraAmount = item.deskripsiTampilan || item.jumlah.toString();
                        totalSaldoKeluarBBM += item.jumlah;
                    } else if (item.tipePenggunaan === 'Pakai Pribadi') {
                        pakaiPribadiAmount = item.deskripsiTampilan || item.jumlah.toString();
                        totalSaldoKeluarBBM += item.jumlah;
                    } else if (item.tipePenggunaan === 'Pakai Polisi') {
                        pakaiPolisiAmount = item.deskripsiTampilan || item.jumlah.toString();
                        totalSaldoKeluarBBM += item.jumlah;
                    }
                    tipeTransaksiDisplay = item.tipeTransaksi;
                }


                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${bbm.nama}</td>
                    <td>${item.tanggal}</td>
                    <td>${tipeTransaksiDisplay}</td>
                    <td>${saldoMasukDisplay}</td>
                    <td>${tambahSaldoDisplay}</td>
                    <td>${meterAwalDisplay}</td>
                    <td>${meterAkhirDisplay}</td>
                    <td>${penjualanKontanLiterDisplay}</td>
                    <td>${teraAmount}</td>
                    <td>${pakaiPribadiAmount}</td>
                    <td>${pakaiPolisiAmount}</td>
                    <td>${item.stokSetelah}</td>
                `;
                tbody.appendChild(row);
            });

            const summaryRowAwal = document.createElement('tr');
            summaryRowAwal.classList.add('summary-row');
            summaryRowAwal.innerHTML = `
                <td colspan="11" style="text-align: right; font-weight: bold;">Saldo Awal ${bbm.nama}:</td>
                <td style="font-weight: bold;">${saldoAwalDihitungBBM}</td>
            `;
            tfoot.appendChild(summaryRowAwal);

            const summaryRowTambah = document.createElement('tr');
            summaryRowTambah.classList.add('summary-row');
            summaryRowTambah.innerHTML = `
                <td colspan="11" style="text-align: right; font-weight: bold;">Total Saldo Masuk ${bbm.nama}:</td>
                <td style="font-weight: bold;">${totalTambahSaldoBBM}</td>
            `;
            tfoot.appendChild(summaryRowTambah);

            const summaryRowKeluar = document.createElement('tr');
            summaryRowKeluar.classList.add('summary-row');
            summaryRowKeluar.innerHTML = `
                <td colspan="11" style="text-align: right; font-weight: bold;">Total Saldo Keluar ${bbm.nama}:</td>
                <td style="font-weight: bold;">${totalSaldoKeluarBBM}</td>
            `;
            tfoot.appendChild(summaryRowKeluar);

            const summaryRowAkhir = document.createElement('tr');
            summaryRowAkhir.classList.add('summary-row', 'final-saldo-row');
            summaryRowAkhir.innerHTML = `
                <td colspan="11" style="text-align: right; font-weight: bold;">Saldo Akhir ${bbm.nama}:</td>
                <td style="font-weight: bold;">${bbm.getSisaStok()}</td>
            `;
            tfoot.appendChild(summaryRowAkhir);

            const separatorRow = document.createElement('tr');
            separatorRow.innerHTML = `<td colspan="13" style="height: 20px;"></td>`; // Ini juga perlu disesuaikan
            tfoot.appendChild(separatorRow);
        }
    }
    riwayatContainer.appendChild(table);
}


document.getElementById('download-excel').addEventListener('click', () => {
    const dataForExcel = [];

    const headerRow1 = [
        'Jenis BBM',
        'Tanggal',
        'Keterangan',
        'Saldo Masuk (Liter)',
        'Tambah Saldo (Liter)',
        'Meter', '', // Meter gabung F, G
        'Saldo Keluar (Liter)', '', '', '', // Saldo Keluar gabung H, I, J, K
        'Stok Setelah (Liter)' // KOLOM L
    ];
    dataForExcel.push(headerRow1);

    const headerRow2 = [
        '', '', '', '', '',
        'Awal', 'Akhir', // Sub-kolom untuk Meter (F, G)
        'Penjualan Kontan', 'TERA', 'Pakai Pribadi', 'Pakai Polisi', // Sub-kolom untuk Saldo Keluar (H, I, J, K)
        '' // Sel kosong di bawah 'Stok Setelah (Liter)' (L)
    ];
    dataForExcel.push(headerRow2);

    for (const type of bbmTypes) {
        const bbm = bbmInstances[type];
        if (bbm.riwayatPenggunaan.length > 0) {
            dataForExcel.push([bbm.nama, '', '', '', '', '', '', '', '', '', '', '']); // Baris nama BBM, sekarang 12 kolom
            
            let totalSaldoMasukExcel = 0;
            let totalTambahSaldoExcel = 0;
            let totalSaldoKeluarExcel = 0;
            let saldoAwalDihitungExcel = 0;

            if (bbm.riwayatPenggunaan.length > 0 && bbm.riwayatPenggunaan[0].tipeTransaksi === 'Input Stok Awal') {
                saldoAwalDihitungExcel = bbm.riwayatPenggunaan[0].jumlah;
            }

            bbm.riwayatPenggunaan.forEach(item => {
                let saldoMasukExcel = '';
                let tambahSaldoExcel = '';
                let penjualanKontanLiterExcel = '';
                let meterAwalExcel = item.meterAwal !== null ? item.meterAwal : '';
                let meterAkhirExcel = item.meterAkhir !== null ? item.meterAkhir : '';
                let teraAmountExcel = '';
                let pakaiPribadiAmountExcel = '';
                let pakaiPolisiAmountExcel = '';
                let tipeTransaksiExcel = item.tipeTransaksi;

                if (item.tipeTransaksi === 'Input Stok Awal') {
                    saldoMasukExcel = item.jumlah;
                    tipeTransaksiExcel = item.deskripsiTampilan;
                } else if (item.tipeTransaksi === 'Tambah Stok') {
                    tambahSaldoExcel = item.jumlah;
                    totalTambahSaldoExcel += item.jumlah;
                    tipeTransaksiExcel = `${item.tipeTransaksi}: ${item.deskripsiTampilan}`;
                } else if (item.tipeTransaksi === 'Penggunaan') {
                    if (item.tipePenggunaan === 'Penjualan Kontan') {
                        penjualanKontanLiterExcel = item.deskripsiTampilan;
                        totalSaldoKeluarExcel += item.jumlah;
                    } else if (item.tipePenggunaan === 'TERA') {
                        teraAmountExcel = item.deskripsiTampilan || item.jumlah.toString();
                        totalSaldoKeluarExcel += item.jumlah;
                    } else if (item.tipePenggunaan === 'Pakai Pribadi') {
                        pakaiPribadiAmountExcel = item.deskripsiTampilan || item.jumlah.toString();
                        totalSaldoKeluarExcel += item.jumlah;
                    } else if (item.tipePenggunaan === 'Pakai Polisi') {
                        pakaiPolisiAmountExcel = item.deskripsiTampilan || item.jumlah.toString();
                        totalSaldoKeluarExcel += item.jumlah;
                    }
                    tipeTransaksiExcel = item.tipeTransaksi;
                }

                dataForExcel.push([
                    bbm.nama,
                    item.tanggal,
                    tipeTransaksiExcel,
                    saldoMasukExcel,
                    tambahSaldoExcel,
                    meterAwalExcel,
                    meterAkhirExcel,
                    penjualanKontanLiterExcel,
                    teraAmountExcel,
                    pakaiPribadiAmountExcel,
                    pakaiPolisiAmountExcel,
                    item.stokSetelah // Ini sekarang di indeks 11 (kolom L)
                ]);
            });

            // --- PERUBAHAN DI SINI UNTUK RINGKASAN ---
            // Buat array kosong dengan panjang yang sesuai untuk mengisi sel sebelum kolom L (indeks 11)
            // Ada 11 kolom sebelum kolom L (indeks 10), dan nilai ditempatkan di indeks 11.
            const emptyCellsBeforeStock = Array(11).fill(''); // Sekarang 11 elemen kosong
            dataForExcel.push([
                `Saldo Awal ${bbm.nama}:`, ...emptyCellsBeforeStock, saldoAwalDihitungExcel
            ]);
            dataForExcel.push([
                `Total Saldo Masuk ${bbm.nama}:`, ...emptyCellsBeforeStock, totalTambahSaldoExcel
            ]);
            dataForExcel.push([
                `Total Saldo Keluar ${bbm.nama}:`, ...emptyCellsBeforeStock, totalSaldoKeluarExcel
            ]);
            dataForExcel.push([
                `Saldo Akhir ${bbm.nama}:`, ...emptyCellsBeforeStock, bbm.getSisaStok()
            ]);
            // --- AKHIR PERUBAHAN ---

            dataForExcel.push(['', '', '', '', '', '', '', '', '', '', '', '']); // Baris kosong untuk pemisah
        }
    }

    const ws = XLSX.utils.aoa_to_sheet(dataForExcel);

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
        { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
        { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
        { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
        { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } }, // Meter: digabung dari kolom F ke G (c:5 ke c:6)
        { s: { r: 0, c: 7 }, e: { r: 0, c: 10 } }, // Saldo Keluar (Liter): digabung dari kolom H ke K (c:7 ke c:10)
        { s: { r: 0, c: 11 }, e: { r: 1, c: 11 } } // Stok Setelah (Liter): digabung di kolom L (c:11)
    ];

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

    // NEW: Add blue background to headerRow1
    // Perhatikan bahwa panjang headerRow1 akan berubah
    for (let C = 0; C <= headerRow1.length - 1; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C }); // Row 0 is headerRow1
        if (!ws[cellAddress]) { ws[cellAddress] = { t: 's', v: '' }; }
        if (!ws[cellAddress].s) { ws[cellAddress].s = {}; }
        if (!ws[cellAddress].s.fill) { ws[cellAddress].s.fill = {}; }
        ws[cellAddress].s.fill.fgColor = { rgb: "FFADD8E6" }; // Light Blue color (ARGB format)
    }

    const headerCellsToCenter = [
        'A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'H1', 'L1'
    ];
    headerCellsToCenter.forEach(cellAddress => {
        if (!ws[cellAddress]) { ws[cellAddress] = { t: 's', v: '' }; }
        if (!ws[cellAddress].s) { ws[cellAddress].s = {}; }
        ws[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
    });

    const subHeaderCellsToCenter = [
        'F2', 'G2', // Meter: Awal, Akhir
        'H2', 'I2', 'J2', 'K2' // Saldo Keluar: Penjualan Kontan, TERA, Pakai Pribadi, Pakai Polisi
    ];
    subHeaderCellsToCenter.forEach(cellAddress => {
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
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Stok BBM");

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');

    const fileName = `Rekap_Stok_BBM_${year}-${month}-${day}_${hours}${minutes}.xlsx`;

    XLSX.writeFile(wb, fileName);
});

document.getElementById('hapus-data').addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data stok BBM dan riwayatnya? Tindakan ini tidak dapat dibatalkan.')) {
        for (const type of bbmTypes) {
            localStorage.removeItem(`bbm_${type}`);
            bbmInstances[type].resetData();
        }
        renderBBMSections();
        alert('Semua data stok BBM dan riwayatnya telah dihapus.');
    }
});

renderBBMSections();