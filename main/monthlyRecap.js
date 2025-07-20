// js/monthlyRecap.js

// This script assumes script.js has already loaded and populated bbmInstances and bbmTypes.
// bbmInstances and bbmTypes are expected to be globally accessible from script.js.

/**
 * Renders the monthly recap table by processing daily transaction history.
 * It calculates the opening, first incoming, last outgoing, and closing stock for each BBM type on a daily basis.
 */
function renderMonthlyRecap() {
    console.log('renderMonthlyRecap called (Updated for specific daily movements).');
    const monthlyRecapTableContainer = document.getElementById('monthly-recap-table-container');
    if (!monthlyRecapTableContainer) {
        console.error('Monthly recap container not found. Ensure ID "monthly-recap-table-container" is correct in index.html.');
        return;
    }

    monthlyRecapTableContainer.innerHTML = '<p>Sedang memuat data perputaran saldo harian...</p>';

    if (!window.bbmInstances || Object.keys(window.bbmInstances).length === 0) {
        monthlyRecapTableContainer.innerHTML = '<p>Tidak ada data stok BBM yang tersedia. Mohon masukkan data di Rekap Harian Stok BBM terlebih dahulu.</p>';
        console.warn('bbmInstances is empty or not available. Please ensure script.js loads correctly and data is saved.');
        return;
    }
    console.log('bbmInstances found:', window.bbmInstances);


    const monthlyData = {}; // Stores daily summaries for each BBM type and date
    let hasDataForTable = false;

    for (const type of bbmTypes) {
        const bbm = bbmInstances[type];
        if (!bbm || !bbm.riwayatPenggunaan || bbm.riwayatPenggunaan.length === 0) {
            console.log(`No history found for BBM type: ${type}.`);
            continue;
        }

        let lastKnownStock = 0; // Represents the closing stock of the previous day

        // Sort history by date to ensure chronological processing
        const sortedHistory = [...bbm.riwayatPenggunaan].sort((a, b) => {
            const [dA, mA, yA] = a.tanggal.split('/').map(Number);
            const [dB, mB, yB] = b.tanggal.split('/').map(Number);
            const dateA = new Date(yA, mA - 1, dA);
            const dateB = new Date(yB, mB - 1, dB);
            // If dates are the same, sort by the inherent order (assuming chronological adding)
            // For more precision, a timestamp would be needed if multiple operations happen in rapid succession on the same date.
            return dateA - dateB;
        });

        const dailyRecords = new Map(); // Map<YYYY-MM-DD, { openingStock, firstIncoming, lastOutgoing, closingStock }>

        sortedHistory.forEach(item => {
            const [d, m, y] = item.tanggal.split('/').map(Number);
            const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            if (!dailyRecords.has(dateKey)) {
                dailyRecords.set(dateKey, {
                    openingStock: lastKnownStock,
                    firstIncoming: 0, // Sum of first "Input Stok Awal" or "Tambah Stok"
                    lastOutgoing: 0,  // Last "Penggunaan" amount
                    closingStock: lastKnownStock, // Will be updated by transactions
                    transactions: [] // Keep all transactions for detailed processing
                });
            }

            const record = dailyRecords.get(dateKey);
            record.transactions.push(item);

            // Update closing stock with the latest transaction's stokSetelah
            record.closingStock = item.stokSetelah;
            lastKnownStock = item.stokSetelah; // Update for the next day's opening
        });

        // Now process daily records to find specific movements (first incoming, last outgoing)
        monthlyData[type] = Array.from(dailyRecords.entries()).map(([dateKey, record]) => {
            let firstIncomingAmount = 0;
            let lastOutgoingAmount = 0;

            // Sort transactions within the day to correctly identify first/last
            const sortedDailyTransactions = record.transactions.sort((a, b) => {
                // If you have a timestamp for each transaction, use that here for precise ordering
                // For now, relying on array order for items within the same day, which might not be perfectly chronological if not added instantly.
                // A timestamp property in `riwayatPenggunaan` would be ideal here.
                return 0; // Assume already sorted or order doesn't matter for this.
            });

            // Find first incoming
            for (const trans of sortedDailyTransactions) {
                if (trans.tipeTransaksi === 'Input Stok Awal' || trans.tipeTransaksi === 'Tambah Stok') {
                    firstIncomingAmount = trans.jumlah;
                    break; // Take the first one for the day
                }
            }

            // Find last outgoing
            for (let i = sortedDailyTransactions.length - 1; i >= 0; i--) {
                const trans = sortedDailyTransactions[i];
                if (trans.tipeTransaksi === 'Penggunaan') {
                    lastOutgoingAmount = trans.jumlah;
                    break; // Take the last one for the day
                }
            }

            return {
                date: dateKey,
                openingStock: record.openingStock,
                firstIncoming: firstIncomingAmount,
                lastOutgoing: lastOutgoingAmount,
                closingStock: record.closingStock
            };
        }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Ensure sorted by date again

        if (monthlyData[type].length > 0) {
            hasDataForTable = true;
        }
    }

    if (!hasDataForTable) {
        monthlyRecapTableContainer.innerHTML = '<p>Tidak ada riwayat transaksi yang cukup untuk membuat rekap perputaran saldo bulanan. Mohon masukkan data di Rekap Harian Stok BBM terlebih dahulu.</p>';
        console.log('No sufficient historical data found for any BBM type to generate the table.');
        return;
    }

    const table = document.createElement('table');
    table.classList.add('riwayat-table'); // Reuse existing style
    table.innerHTML = `
        <thead>
            <tr>
                <th rowspan="2">Tanggal</th>
                ${bbmTypes.map(type => `<th colspan="4">${type}</th>`).join('')}
            </tr>
            <tr>
                ${bbmTypes.map(type => `
                    <th>Saldo Awal</th>
                    <th>Masuk (Pertama)</th>
                    <th>Keluar (Terakhir)</th>
                    <th>Saldo Akhir</th>
                `).join('')}
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    const allDates = new Set();
    for (const type of bbmTypes) {
        if (monthlyData[type]) {
            monthlyData[type].forEach(entry => allDates.add(entry.date));
        }
    }
    const sortedAllDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

    sortedAllDates.forEach(date => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${new Date(date).toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'})}</td>`;

        for (const type of bbmTypes) {
            const dailyEntry = monthlyData[type] ? monthlyData[type].find(d => d.date === date) : null;
            const openingStock = dailyEntry ? dailyEntry.openingStock : '-';
            const firstIncoming = dailyEntry && dailyEntry.firstIncoming > 0 ? dailyEntry.firstIncoming : '-';
            const lastOutgoing = dailyEntry && dailyEntry.lastOutgoing > 0 ? dailyEntry.lastOutgoing : '-';
            const closingStock = dailyEntry ? dailyEntry.closingStock : '-';
            row.innerHTML += `
                <td>${openingStock}</td>
                <td>${firstIncoming}</td>
                <td>${lastOutgoing}</td>
                <td>${closingStock}</td>
            `;
        }
        tbody.appendChild(row);
    });

    monthlyRecapTableContainer.innerHTML = ''; // Clear temporary message
    monthlyRecapTableContainer.appendChild(table);
    console.log('Monthly recap table (with perputaran saldo) rendered successfully.');
}

document.addEventListener('DOMContentLoaded', () => {
    const showBulananLink = document.getElementById('show-bulanan');
    if (showBulananLink) {
        console.log('show-bulanan link found, attaching event listener.');
        showBulananLink.addEventListener('click', (event) => {
            event.preventDefault();
            if (typeof showPage === 'function') {
                console.log('Calling showPage("bulanan").');
                showPage('bulanan');
            } else {
                console.error('showPage function not found. Ensure script.js loads before monthlyRecap.js.');
            }
            renderMonthlyRecap(); // Render the updated monthly data
        });
    } else {
        console.error('show-bulanan link not found. Ensure ID is correct in index.html.');
    }
});