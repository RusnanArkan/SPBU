document.addEventListener('DOMContentLoaded', () => {
    const jenisBBMSelect = document.getElementById('jenisBBM');
    const hargaJualSekarangInput = document.getElementById('hargaJualSekarang');
    const literTerjualInput = document.getElementById('literTerjual');
    const hitungBtn = document.getElementById('hitungBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const clearAllDataBtn = document.getElementById('clearAllDataBtn');
    const riwayatTableBody = document.querySelector('#riwayatTable tbody');

    let riwayatPenjualan = JSON.parse(localStorage.getItem('riwayatPenjualan')) || [];
    renderRiwayatTable();

    hitungBtn.addEventListener('click', () => {
        const jenisBBM = jenisBBMSelect.value;
        const hargaJualSekarang = parseFloat(hargaJualSekarangInput.value);
        const literTerjual = parseFloat(literTerjualInput.value);

        if (isNaN(hargaJualSekarang) || isNaN(literTerjual) || hargaJualSekarang <= 0 || literTerjual <= 0) {
            alert('Mohon masukkan angka yang valid dan lebih besar dari nol untuk harga jual dan liter terjual.');
            return;
        }

        const nilaiJual = hargaJualSekarang * literTerjual;
        
        const timestamp = new Date().toLocaleString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const newEntry = {
            waktu: timestamp,
            jenisBBM: jenisBBM,
            hargaJual: hargaJualSekarang,
            literTerjual: literTerjual,
            nilaiJual: nilaiJual
        };

        riwayatPenjualan.push(newEntry);
        localStorage.setItem('riwayatPenjualan', JSON.stringify(riwayatPenjualan));
        renderRiwayatTable();

        hargaJualSekarangInput.value = '';
        literTerjualInput.value = '';
    });

    exportExcelBtn.addEventListener('click', () => {
        if (typeof XLSX === 'undefined') {
            alert('Pustaka ekspor Excel belum dimuat. Mohon refresh halaman atau periksa koneksi internet Anda.');
            console.error('XLSX library is not loaded.');
            return;
        }

        if (riwayatPenjualan.length === 0) {
            alert('Tidak ada data untuk diekspor.');
            return;
        }

        const dataForExport = [
            ["No.", "Waktu", "Jenis BBM", "Harga Jual (per Liter)", "Liter Terjual", "Nilai Jual"]
        ];

        const sortedRiwayat = [...riwayatPenjualan].sort((a, b) => new Date(a.waktu.split('/').reverse().join('-')) - new Date(b.waktu.split('/').reverse().join('-')));

        let currentGroupNumber = 0;
        let lastDate = null;

        sortedRiwayat.forEach((item, index) => {
            if (item.waktu !== lastDate) {
                currentGroupNumber++;
                if (index > 0) {
                    dataForExport.push(["", "", "", "", "", ""]);
                }
            }
            lastDate = item.waktu;

            dataForExport.push([
                currentGroupNumber,
                index === 0 || item.waktu !== sortedRiwayat[index - 1]?.waktu ? item.waktu : "",
                item.jenisBBM,
                item.hargaJual,
                item.literTerjual,
                item.nilaiJual
            ]);
        });

        // Calculate summaries for export
        const summary = calculateSummary(riwayatPenjualan);
        const grandTotal = calculateGrandTotal(riwayatPenjualan);

        // Add summary header
        dataForExport.push(["", "", "", "", "", ""]); // Empty row for separation
        dataForExport.push(["Ringkasan Total Penjualan per Jenis BBM", "", "", "", "", ""]);
        dataForExport.push(["Jenis BBM", "Total Liter Terjual", "Total Nilai Jual", "", "", ""]);

        // Add summary data
        for (const jenis in summary) {
            dataForExport.push([
                jenis,
                summary[jenis].totalLiter,
                summary[jenis].totalNilai,
                "", "", ""
            ]);
        }

        // Add grand total
        dataForExport.push(["", "", "", "", "", ""]); // Empty row for separation
        dataForExport.push(["Total Keseluruhan Nilai Jual", "", grandTotal, "", "", ""]); // Grand total row in Excel


        const ws = XLSX.utils.aoa_to_sheet(dataForExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Riwayat Penjualan BBM");

        XLSX.writeFile(wb, `Buku_Jual_Kontan_${new Date().toISOString().slice(0, 10)}.xlsx`);
    });

    clearAllDataBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua data penjualan? Tindakan ini tidak dapat dibatalkan.')) {
            localStorage.removeItem('riwayatPenjualan');
            riwayatPenjualan = [];
            renderRiwayatTable();
            alert('Semua data penjualan telah dihapus.');
        }
    });

    function calculateSummary(data) {
        const summary = {};
        data.forEach(entry => {
            if (!summary[entry.jenisBBM]) {
                summary[entry.jenisBBM] = { totalLiter: 0, totalNilai: 0 };
            }
            summary[entry.jenisBBM].totalLiter += entry.literTerjual;
            summary[entry.jenisBBM].totalNilai += entry.nilaiJual;
        });
        return summary;
    }

    function calculateGrandTotal(data) {
        return data.reduce((total, entry) => total + entry.nilaiJual, 0);
    }

    function renderRiwayatTable() {
        riwayatTableBody.innerHTML = '';
        
        const sortedRiwayat = [...riwayatPenjualan].sort((a, b) => {
            const dateA = new Date(a.waktu.split('/').reverse().join('-'));
            const dateB = new Date(b.waktu.split('/').reverse().join('-'));
            return dateA - dateB;
        });

        let currentGroupNumber = 0;
        let lastDate = null;

        sortedRiwayat.forEach((entry, index) => {
            const row = riwayatTableBody.insertRow();
            
            if (entry.waktu !== lastDate) {
                currentGroupNumber++;
                row.insertCell().textContent = currentGroupNumber;
                row.insertCell().textContent = entry.waktu;
            } else {
                row.insertCell().textContent = "";
                row.insertCell().textContent = "";
            }
            
            lastDate = entry.waktu;

            row.insertCell().textContent = entry.jenisBBM;
            row.insertCell().textContent = `Rp ${entry.hargaJual.toLocaleString('id-ID')}`;
            row.insertCell().textContent = `${entry.literTerjual.toLocaleString('id-ID')} L`;
            row.insertCell().textContent = `Rp ${entry.nilaiJual.toLocaleString('id-ID')}`;
        });

        // Add summary row(s)
        if (riwayatPenjualan.length > 0) {
            const summary = calculateSummary(riwayatPenjualan);
            const grandTotal = calculateGrandTotal(riwayatPenjualan);

            // Add a separator row
            const separatorRow = riwayatTableBody.insertRow();
            const separatorCell = separatorRow.insertCell();
            separatorCell.colSpan = 6;
            separatorCell.style.height = '20px';
            separatorCell.style.backgroundColor = '#f0f0f0';

            // Add summary header row
            const summaryHeaderRow = riwayatTableBody.insertRow();
            const summaryHeaderCell = summaryHeaderRow.insertCell();
            summaryHeaderCell.colSpan = 6;
            summaryHeaderCell.innerHTML = '<strong>Ringkasan Total Penjualan per Jenis BBM</strong>';
            summaryHeaderCell.style.textAlign = 'center';
            summaryHeaderCell.style.fontWeight = 'bold';
            summaryHeaderCell.style.padding = '10px';
            summaryHeaderCell.style.backgroundColor = '#e9ecef';

            // Add table header for summary
            const summaryTableHeaders = riwayatTableBody.insertRow();
            summaryTableHeaders.insertCell().textContent = "Jenis BBM";
            summaryTableHeaders.insertCell().textContent = "Total Liter Terjual";
            summaryTableHeaders.insertCell().textContent = "Total Nilai Jual";
            summaryTableHeaders.insertCell().textContent = ""; // empty cell
            summaryTableHeaders.insertCell().textContent = ""; // empty cell
            summaryTableHeaders.insertCell().textContent = ""; // empty cell
            summaryTableHeaders.style.fontWeight = 'bold';
            summaryTableHeaders.style.backgroundColor = '#f8f9fa';

            for (const jenis in summary) {
                const summaryRow = riwayatTableBody.insertRow();
                summaryRow.insertCell().textContent = jenis;
                summaryRow.insertCell().textContent = `${summary[jenis].totalLiter.toLocaleString('id-ID')} L`;
                summaryRow.insertCell().textContent = `Rp ${summary[jenis].totalNilai.toLocaleString('id-ID')}`;
                summaryRow.insertCell().textContent = ""; // empty cell
                summaryRow.insertCell().textContent = ""; // empty cell
                summaryRow.insertCell().textContent = ""; // empty cell
            }

            // Add Grand Total row
            const grandTotalRow = riwayatTableBody.insertRow();
            const grandTotalLabelCell = grandTotalRow.insertCell();
            grandTotalLabelCell.colSpan = 5; // Span across first 5 columns
            grandTotalLabelCell.textContent = "TOTAL KESELURUHAN NILAI JUAL";
            grandTotalLabelCell.style.textAlign = 'right';
            grandTotalLabelCell.style.fontWeight = 'bold';
            grandTotalLabelCell.style.padding = '8px';
            grandTotalLabelCell.style.backgroundColor = '#d1e7dd'; // Light green background

            const grandTotalValueCell = grandTotalRow.insertCell();
            grandTotalValueCell.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
            grandTotalValueCell.style.fontWeight = 'bold';
            grandTotalValueCell.style.backgroundColor = '#d1e7dd';
            grandTotalValueCell.style.padding = '8px';
            grandTotalValueCell.style.textAlign = 'right';
        }
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/xlsx/dist/xlsx.full.min.js';
    script.onload = () => console.log('XLSX library loaded successfully!');
    script.onerror = () => {
        console.error('Failed to load XLSX library. Check your internet connection or the CDN link.');
        alert('Gagal memuat fungsi ekspor Excel. Mohon periksa koneksi internet Anda.');
    };
    document.head.appendChild(script);
});