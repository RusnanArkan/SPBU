document.addEventListener('DOMContentLoaded', () => {
    const fuelTypeSelect = document.getElementById('fuelType');
    const fuelTables = {
        solar: document.getElementById('solarTable'),
        pertalite: document.getElementById('pertaliteTable'),
        pertamax: document.getElementById('pertamaxTable'),
        pertaminadex: document.getElementById('pertaminadexTable'),
    };
    const tableBodies = {
        solar: document.getElementById('solarTableBody'),
        pertalite: document.getElementById('pertaliteTableBody'),
        pertamax: document.getElementById('pertamaxTableBody'),
        pertaminadex: document.getElementById('pertaminadexTableBody'),
    };

    let fuelData = {
        solar: { history: [], lastBalance: { liter: 0, rupiah: 0, hasat: 0 } },
        pertalite: { history: [], lastBalance: { liter: 0, rupiah: 0, hasat: 0 } },
        pertamax: { history: [], lastBalance: { liter: 0, rupiah: 0, hasat: 0 } },
        pertaminadex: { history: [], lastBalance: { liter: 0, rupiah: 0, hasat: 0 } },
    };

    function saveToLocalStorage() {
        localStorage.setItem('fuelData', JSON.stringify(fuelData));
    }

    function loadFromLocalStorage() {
        const storedData = localStorage.getItem('fuelData');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData.premium && !parsedData.solar) {
                parsedData.solar = parsedData.premium;
                delete parsedData.premium;
            }
            for (const type in fuelData) {
                if (fuelData.hasOwnProperty(type) && !parsedData.hasOwnProperty(type)) {
                    parsedData[type] = { history: [], lastBalance: { liter: 0, rupiah: 0, hasat: 0 } };
                }
            }
            fuelData = parsedData;
        }
    }

    loadFromLocalStorage();

    function renderTable(fuelType) {
        const tbody = tableBodies[fuelType];
        tbody.innerHTML = '';

        if (!fuelData[fuelType] || !Array.isArray(fuelData[fuelType].history)) {
            fuelData[fuelType] = { history: [], lastBalance: { liter: 0, rupiah: 0, hasat: 0 } };
        }

        let totalSetoran = { liter: 0, rupiah: 0, hasat: 0 };
        let totalTerima = { liter: 0, rupiah: 0, hasat: 0 };
        let currentSaldo = { liter: 0, rupiah: 0, hasat: 0 }; 

        // Untuk melacak hasat setoran/terima terakhir
        let lastSetoranHasat = 0;
        let lastTerimaHasat = 0;

        if (fuelData[fuelType].history.length > 0) {
            currentSaldo = { ...fuelData[fuelType].history[0].saldo }; 
        } else {
            currentSaldo = { ...fuelData[fuelType].lastBalance }; 
        }

        fuelData[fuelType].history.forEach((entry) => {
            const row = tbody.insertRow();
            row.insertCell().textContent = entry.tanggal;
            row.insertCell().textContent = entry.keterangan;

            row.insertCell().textContent = entry.setoran.liter ? entry.setoran.liter.toLocaleString('id-ID') : '';
            row.insertCell().textContent = entry.setoran.rupiah ? entry.setoran.rupiah.toLocaleString('id-ID') : '';
            row.insertCell().textContent = entry.setoran.hasat ? entry.setoran.hasat.toLocaleString('id-ID') : '';
            totalSetoran.liter += parseFloat(entry.setoran.liter) || 0;
            totalSetoran.rupiah += parseFloat(entry.setoran.rupiah) || 0;
            if (entry.setoran.hasat) {
                lastSetoranHasat = parseFloat(entry.setoran.hasat); // Update hasat setoran terakhir
            }

            row.insertCell().textContent = entry.terima.liter ? entry.terima.liter.toLocaleString('id-ID') : '';
            row.insertCell().textContent = entry.terima.rupiah ? entry.terima.rupiah.toLocaleString('id-ID') : '';
            row.insertCell().textContent = entry.terima.hasat ? entry.terima.hasat.toLocaleString('id-ID') : '';
            totalTerima.liter += parseFloat(entry.terima.liter) || 0;
            totalTerima.rupiah += parseFloat(entry.terima.rupiah) || 0;
            if (entry.terima.hasat) {
                lastTerimaHasat = parseFloat(entry.terima.hasat); // Update hasat terima terakhir
            }

            currentSaldo = { ...entry.saldo };

            row.insertCell().textContent = currentSaldo.liter.toLocaleString('id-ID');
            row.insertCell().textContent = currentSaldo.rupiah.toLocaleString('id-ID');
            row.insertCell().textContent = currentSaldo.hasat.toLocaleString('id-ID'); 
        });

        // ROW: Jumlah
        const totalRow = tbody.insertRow();
        totalRow.style.fontWeight = 'bold';
        totalRow.style.backgroundColor = '#e3e3e3';

        totalRow.insertCell().textContent = 'Jumlah';
        totalRow.insertCell().textContent = '';

        totalRow.insertCell().textContent = totalSetoran.liter.toLocaleString('id-ID');
        totalRow.insertCell().textContent = totalSetoran.rupiah.toLocaleString('id-ID');
        totalRow.insertCell().textContent = lastSetoranHasat.toLocaleString('id-ID'); // Gunakan hasat setoran terakhir

        totalRow.insertCell().textContent = totalTerima.liter.toLocaleString('id-ID');
        totalRow.insertCell().textContent = totalTerima.rupiah.toLocaleString('id-ID');
        totalRow.insertCell().textContent = lastTerimaHasat.toLocaleString('id-ID'); // Gunakan hasat terima terakhir

        totalRow.insertCell().textContent = currentSaldo.liter.toLocaleString('id-ID');
        totalRow.insertCell().textContent = currentSaldo.rupiah.toLocaleString('id-ID');
        totalRow.insertCell().textContent = currentSaldo.hasat.toLocaleString('id-ID');

        // ROW: Saldo Akhir
        const akhirRow = tbody.insertRow();
        akhirRow.style.fontWeight = 'bold';
        akhirRow.style.backgroundColor = '#d0ffd0';

        akhirRow.insertCell().textContent = 'Saldo Akhir';
        akhirRow.insertCell().textContent = '';

        akhirRow.insertCell().textContent = '';
        akhirRow.insertCell().textContent = '';
        akhirRow.insertCell().textContent = '';

        akhirRow.insertCell().textContent = '';
        akhirRow.insertCell().textContent = '';
        akhirRow.insertCell().textContent = ''; 

        akhirRow.insertCell().textContent = currentSaldo.liter.toLocaleString('id-ID');
        akhirRow.insertCell().textContent = currentSaldo.rupiah.toLocaleString('id-ID');
        akhirRow.insertCell().textContent = currentSaldo.hasat.toLocaleString('id-ID');
    }

    function renderAllTables() {
        for (const type in fuelData) {
            if (fuelData.hasOwnProperty(type)) {
                renderTable(type);
            }
        }
    }

    fuelTypeSelect.addEventListener('change', () => {
        console.log(`Jenis BBM terpilih untuk input: ${fuelTypeSelect.value}`);
    });

    renderAllTables();

    function getCurrentDate() {
        const now = new Date();
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return now.toLocaleDateString('id-ID', options);
    }

    // --- FUNGSI BARU: KALKULATOR OTOMATIS UNTUK INPUT DATA ---
    function calculateRupiah(literInputId, hargaSatuanInputId, rupiahOutputId) {
        const liter = parseFloat(document.getElementById(literInputId).value) || 0;
        const hargaSatuan = parseFloat(document.getElementById(hargaSatuanInputId).value) || 0;
        const rupiahResult = liter * hargaSatuan;
        document.getElementById(rupiahOutputId).value = rupiahResult.toFixed(2);
    }

    // --- PENAMBAHAN EVENT LISTENER UNTUK MASING-MASING INPUT ---

    // Saldo Awal
    const initialLiter = document.getElementById('initialLiter');
    const initialHargaSatuan = document.getElementById('initialHargaSatuan');
    const initialRupiah = document.getElementById('initialRupiah');

    if (initialLiter && initialHargaSatuan && initialRupiah) {
        initialLiter.addEventListener('input', () => calculateRupiah('initialLiter', 'initialHargaSatuan', 'initialRupiah'));
        initialHargaSatuan.addEventListener('input', () => calculateRupiah('initialLiter', 'initialHargaSatuan', 'initialRupiah'));
    }

    // Data Terima
    const receiveLiter = document.getElementById('receiveLiter');
    const receiveHargaSatuan = document.getElementById('receiveHargaSatuan');
    const receiveRupiah = document.getElementById('receiveRupiah');

    if (receiveLiter && receiveHargaSatuan && receiveRupiah) {
        receiveLiter.addEventListener('input', () => calculateRupiah('receiveLiter', 'receiveHargaSatuan', 'receiveRupiah'));
        receiveHargaSatuan.addEventListener('input', () => calculateRupiah('receiveLiter', 'receiveHargaSatuan', 'receiveRupiah'));
    }

    // Data Setoran
    const setorLiter = document.getElementById('setorLiter');
    const setorHargaSatuan = document.getElementById('setorHargaSatuan');
    const setorRupiah = document.getElementById('setorRupiah');

    if (setorLiter && setorHargaSatuan && setorRupiah) {
        setorLiter.addEventListener('input', () => calculateRupiah('setorLiter', 'setorHargaSatuan', 'setorRupiah'));
        setorHargaSatuan.addEventListener('input', () => calculateRupiah('setorLiter', 'setorHargaSatuan', 'setorRupiah'));
    }
    // --- AKHIR PENAMBAHAN FUNGSI KALKULATOR OTOMATIS ---


    window.addInitialBalance = function () {
        const selectedFuelType = fuelTypeSelect.value;
        const liter = parseFloat(document.getElementById('initialLiter').value) || 0;
        const rupiah = parseFloat(document.getElementById('initialRupiah').value) || 0;
        const hasatInput = parseFloat(document.getElementById('initialHargaSatuan').value) || 0; 

        if (liter === 0 && rupiah === 0 && hasatInput === 0) {
            alert('Harap masukkan nilai untuk saldo awal.');
            return;
        }

        const newBalance = { liter: liter, rupiah: rupiah, hasat: hasatInput };
        fuelData[selectedFuelType].lastBalance = newBalance;

        fuelData[selectedFuelType].history.push({
            tanggal: getCurrentDate(),
            keterangan: 'Saldo Awal',
            setoran: { liter: '', rupiah: '', hasat: '' },
            terima: { liter: '', rupiah: '', hasat: '' },
            saldo: { ...newBalance },
        });

        saveToLocalStorage();
        renderTable(selectedFuelType);
        alert('Saldo awal berhasil ditambahkan!');
        clearInitialInputs(); 
    };

    window.addReceiveEntry = function () {
        const selectedFuelType = fuelTypeSelect.value;
        const literTerima = parseFloat(document.getElementById('receiveLiter').value) || 0;
        const rupiahTerima = parseFloat(document.getElementById('receiveRupiah').value) || 0;
        const hasatTerima = parseFloat(document.getElementById('receiveHargaSatuan').value) || 0; 

        if (literTerima === 0 && rupiahTerima === 0 && hasatTerima === 0) {
            alert('Harap masukkan nilai untuk data terima.');
            return;
        }

        const previousBalanceLiter = fuelData[selectedFuelType].history.length > 0
            ? fuelData[selectedFuelType].history[fuelData[selectedFuelType].history.length - 1].saldo.liter
            : fuelData[selectedFuelType].lastBalance.liter;

        const previousBalanceRupiah = fuelData[selectedFuelType].history.length > 0
            ? fuelData[selectedFuelType].history[fuelData[selectedFuelType].history.length - 1].saldo.rupiah
            : fuelData[selectedFuelType].lastBalance.rupiah;
        
        const newLiterBalance = previousBalanceLiter - literTerima;
        const newRupiahBalance = previousBalanceRupiah - rupiahTerima;
        const newHasatBalance = hasatTerima; 

        fuelData[selectedFuelType].lastBalance.liter = newLiterBalance;
        fuelData[selectedFuelType].lastBalance.rupiah = newRupiahBalance;
        fuelData[selectedFuelType].lastBalance.hasat = newHasatBalance; 

        fuelData[selectedFuelType].history.push({
            tanggal: getCurrentDate(),
            keterangan: 'Terima',
            setoran: { liter: '', rupiah: '', hasat: '' },
            terima: { liter: literTerima, rupiah: rupiahTerima, hasat: hasatTerima },
            saldo: { ...fuelData[selectedFuelType].lastBalance },
        });

        saveToLocalStorage();
        renderTable(selectedFuelType);
        alert('Data terima berhasil ditambahkan!');
        clearReceiveInputs(); 
    };

    window.addSetorEntry = function () {
        const selectedFuelType = fuelTypeSelect.value;
        const literSetor = parseFloat(document.getElementById('setorLiter').value) || 0;
        const rupiahSetor = parseFloat(document.getElementById('setorRupiah').value) || 0;
        const hasatSetor = parseFloat(document.getElementById('setorHargaSatuan').value) || 0; 

        if (literSetor === 0 && rupiahSetor === 0 && hasatSetor === 0) {
            alert('Harap masukkan nilai untuk data setoran.');
            return;
        }

        const previousBalanceLiter = fuelData[selectedFuelType].history.length > 0
            ? fuelData[selectedFuelType].history[fuelData[selectedFuelType].history.length - 1].saldo.liter
            : fuelData[selectedFuelType].lastBalance.liter;

        const previousBalanceRupiah = fuelData[selectedFuelType].history.length > 0
            ? fuelData[selectedFuelType].history[fuelData[selectedFuelType].history.length - 1].saldo.rupiah
            : fuelData[selectedFuelType].lastBalance.rupiah;

        const newLiterBalance = previousBalanceLiter + literSetor;
        const newRupiahBalance = previousBalanceRupiah + rupiahSetor;
        const newHasatBalance = hasatSetor; 

        fuelData[selectedFuelType].lastBalance.liter = newLiterBalance;
        fuelData[selectedFuelType].lastBalance.rupiah = newRupiahBalance;
        fuelData[selectedFuelType].lastBalance.hasat = newHasatBalance; 

        fuelData[selectedFuelType].history.push({
            tanggal: getCurrentDate(),
            keterangan: 'Setoran',
            setoran: { liter: literSetor, rupiah: rupiahSetor, hasat: hasatSetor },
            terima: { liter: '', rupiah: '', hasat: '' },
            saldo: { ...fuelData[selectedFuelType].lastBalance },
        });

        saveToLocalStorage();
        renderTable(selectedFuelType);
        alert('Data setoran berhasil ditambahkan!');
        clearSetorInputs(); 
    };

    // --- FUNGSI CLEAR INPUT ---
    function clearInitialInputs() {
        document.getElementById('initialLiter').value = '';
        document.getElementById('initialRupiah').value = '';
        document.getElementById('initialHargaSatuan').value = '';
    }

    function clearReceiveInputs() {
        document.getElementById('receiveLiter').value = '';
        document.getElementById('receiveRupiah').value = '';
        document.getElementById('receiveHargaSatuan').value = '';
    }

    function clearSetorInputs() {
        document.getElementById('setorLiter').value = '';
        document.getElementById('setorRupiah').value = '';
        document.getElementById('setorHargaSatuan').value = '';
    }
    // --- AKHIR FUNGSI CLEAR INPUT ---


    // --- FUNGSI UNTUK EKSPOR MENYAMPING ---

    window.exportAllFuelsSideBySideToExcel = function () {
        if (typeof XLSX === 'undefined') {
            alert('Pustaka ekspor Excel belum dimuat. Mohon refresh halaman atau periksa koneksi internet Anda.');
            console.error('XLSX library is not loaded.');
            return;
        }

        const fuelTypesInOrder = ['solar', 'pertalite', 'pertamax', 'pertaminadex'];
        const fuelTypeDisplayNames = {
            solar: 'Solar',
            pertalite: 'Pertalite',
            pertamax: 'Pertamax',
            pertaminadex: 'Pertamina Dex',
        };

        const allHistory = {};
        let maxRows = 0; 

        const fuelTotals = {}; 

        for (const fuelType of fuelTypesInOrder) {
            allHistory[fuelType] = fuelData[fuelType].history;
            if (allHistory[fuelType].length > maxRows) {
                maxRows = allHistory[fuelType].length;
            } 

            let totalSetoranLiter = 0;
            let totalSetoranRupiah = 0;
            let lastSetoranHasatForExport = 0; // Untuk hasat setoran terakhir di ekspor

            let totalTerimaLiter = 0;
            let totalTerimaRupiah = 0;
            let lastTerimaHasatForExport = 0; // Untuk hasat terima terakhir di ekspor
            
            let finalSaldo = { liter: 0, rupiah: 0, hasat: 0 }; 

            if (allHistory[fuelType].length > 0) {
                finalSaldo = { ...allHistory[fuelType][0].saldo };
            } else {
                finalSaldo = { ...fuelData[fuelType].lastBalance };
            }


            allHistory[fuelType].forEach((entry) => {
                totalSetoranLiter += parseFloat(entry.setoran.liter) || 0;
                totalSetoranRupiah += parseFloat(entry.setoran.rupiah) || 0;
                if (entry.setoran.hasat) {
                    lastSetoranHasatForExport = parseFloat(entry.setoran.hasat); // Update hasat setoran terakhir
                }

                totalTerimaLiter += parseFloat(entry.terima.liter) || 0;
                totalTerimaRupiah += parseFloat(entry.terima.rupiah) || 0;
                if (entry.terima.hasat) {
                    lastTerimaHasatForExport = parseFloat(entry.terima.hasat); // Update hasat terima terakhir
                }
                
                finalSaldo = { ...entry.saldo }; 
            });

            fuelTotals[fuelType] = {
                totalSetoranLiter: totalSetoranLiter,
                totalSetoranRupiah: totalSetoranRupiah,
                lastSetoranHasat: lastSetoranHasatForExport,
                totalTerimaLiter: totalTerimaLiter,
                totalTerimaRupiah: totalTerimaRupiah,
                lastTerimaHasat: lastTerimaHasatForExport,
                finalSaldo: finalSaldo, 
            };
        }

        if (maxRows === 0 && Object.values(fuelData).every((f) => f.lastBalance.liter === 0 && f.lastBalance.rupiah === 0 && f.lastBalance.hasat === 0)) {
            alert('Tidak ada data untuk diekspor!');
            return;
        }

        const totalRowsForExport = maxRows + 3 + 2;

        const dataForExport = [];
        const headerRow0 = []; 
        const headerRow1 = []; 
        const headerRow2 = []; 
        const merges = [];
        const cols = [];

        const columnsPerFuelType = 11; 
        const separatorColumns = 2; 
        const totalColumnsPerBlock = columnsPerFuelType + separatorColumns; 

        const headerFillColor = 'FFADD8E6'; 
        const sumRowFillColor = 'FFE3E3E3'; 
        const finalBalanceRowFillColor = 'FFD0FFD0'; 

        const borderStyle = {
            top: { style: 'thin', color: { auto: 1 } },
            bottom: { style: 'thin', color: { auto: 1 } },
            left: { style: 'thin', color: { auto: 1 } },
            right: { style: 'thin', color: { auto: 1 } },
        };
        const headerStyle = {
            font: { bold: true },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderStyle,
            fill: { fgColor: { rgb: headerFillColor } },
        };
        const subHeaderStyle = {
            font: { bold: true },
            alignment: { horizontal: 'center' },
            border: borderStyle,
            fill: { fgColor: { rgb: headerFillColor } },
        };

        let currentColumnOffset = 0;

        fuelTypesInOrder.forEach((fuelType, index) => {
            headerRow0[currentColumnOffset] = fuelTypeDisplayNames[fuelType];
            merges.push({
                s: { r: 0, c: currentColumnOffset },
                e: { r: 0, c: currentColumnOffset + columnsPerFuelType - 1 },
            });

            headerRow1[currentColumnOffset] = 'Tanggal'; 
            headerRow1[currentColumnOffset + 1] = 'Keterangan'; 

            headerRow1[currentColumnOffset + 2] = 'Setoran'; 
            headerRow1[currentColumnOffset + 5] = 'Terima'; 
            headerRow1[currentColumnOffset + 8] = 'Saldo'; 

            headerRow2[currentColumnOffset] = 'Tanggal';
            headerRow2[currentColumnOffset + 1] = 'Keterangan';
            headerRow2[currentColumnOffset + 2] = 'Qty (Ltr)';
            headerRow2[currentColumnOffset + 3] = 'Rupiah';
            headerRow2[currentColumnOffset + 4] = 'Hasat';
            headerRow2[currentColumnOffset + 5] = 'Qty (Ltr)';
            headerRow2[currentColumnOffset + 6] = 'Rupiah';
            headerRow2[currentColumnOffset + 7] = 'Hasat';
            headerRow2[currentColumnOffset + 8] = 'Qty (Ltr)';
            headerRow2[currentColumnOffset + 9] = 'Rupiah';
            headerRow2[currentColumnOffset + 10] = 'Hasat';

            cols.push(
                { wch: 12 }, { wch: 15 }, 
                { wch: 12 }, { wch: 15 }, { wch: 12 }, 
                { wch: 12 }, { wch: 15 }, { wch: 12 }, 
                { wch: 12 }, { wch: 15 }, { wch: 12 }  
            );

            if (index < fuelTypesInOrder.length - 1) {
                for (let s = 0; s < separatorColumns; s++) {
                    headerRow0[currentColumnOffset + columnsPerFuelType + s] = '';
                    headerRow1[currentColumnOffset + columnsPerFuelType + s] = '';
                    headerRow2[currentColumnOffset + columnsPerFuelType + s] = '';
                    cols.push({ wch: 3 });
                }
            }

            currentColumnOffset += totalColumnsPerBlock;
        });

        dataForExport.push(headerRow0);
        dataForExport.push(headerRow1);
        dataForExport.push(headerRow2);


        for (let i = 0; i < maxRows; i++) {
            const rowData = [];
            let currentCellOffset = 0;
            for (const fuelType of fuelTypesInOrder) {
                const entry = allHistory[fuelType][i];
                if (entry) {
                    rowData[currentCellOffset] = entry.tanggal;
                    rowData[currentCellOffset + 1] = entry.keterangan;
                    rowData[currentCellOffset + 2] = entry.setoran.liter ? entry.setoran.liter : '';
                    rowData[currentCellOffset + 3] = entry.setoran.rupiah ? entry.setoran.rupiah : '';
                    rowData[currentCellOffset + 4] = entry.setoran.hasat ? entry.setoran.hasat : '';
                    rowData[currentCellOffset + 5] = entry.terima.liter ? entry.terima.liter : '';
                    rowData[currentCellOffset + 6] = entry.terima.rupiah ? entry.terima.rupiah : '';
                    rowData[currentCellOffset + 7] = entry.terima.hasat ? entry.terima.hasat : '';
                    rowData[currentCellOffset + 8] = entry.saldo.liter;
                    rowData[currentCellOffset + 9] = entry.saldo.rupiah;
                    rowData[currentCellOffset + 10] = entry.saldo.hasat;
                } else {
                    for (let k = 0; k < columnsPerFuelType; k++) {
                        rowData[currentCellOffset + k] = '';
                    }
                }
                if (fuelType !== fuelTypesInOrder[fuelTypesInOrder.length - 1]) {
                    for (let s = 0; s < separatorColumns; s++) {
                        rowData[currentCellOffset + columnsPerFuelType + s] = '';
                    }
                }
                currentCellOffset += totalColumnsPerBlock;
            }
            dataForExport.push(rowData);
        }

        // ROW: "Jumlah" for all fuel types
        const totalSumRow = [];
        currentColumnOffset = 0;
        fuelTypesInOrder.forEach((fuelType, index) => {
            totalSumRow[currentColumnOffset] = 'Jumlah';
            totalSumRow[currentColumnOffset + 1] = '';
            totalSumRow[currentColumnOffset + 2] = fuelTotals[fuelType].totalSetoranLiter; // Akumulasi
            totalSumRow[currentColumnOffset + 3] = fuelTotals[fuelType].totalSetoranRupiah; // Akumulasi
            totalSumRow[currentColumnOffset + 4] = fuelTotals[fuelType].lastSetoranHasat; // Hasat setoran terakhir
            totalSumRow[currentColumnOffset + 5] = fuelTotals[fuelType].totalTerimaLiter; // Akumulasi
            totalSumRow[currentColumnOffset + 6] = fuelTotals[fuelType].totalTerimaRupiah; // Akumulasi
            totalSumRow[currentColumnOffset + 7] = fuelTotals[fuelType].lastTerimaHasat; // Hasat terima terakhir
            
            totalSumRow[currentColumnOffset + 8] = fuelTotals[fuelType].finalSaldo.liter;
            totalSumRow[currentColumnOffset + 9] = fuelTotals[fuelType].finalSaldo.rupiah;
            totalSumRow[currentColumnOffset + 10] = fuelTotals[fuelType].finalSaldo.hasat;
            if (index < fuelTypesInOrder.length - 1) {
                for (let s = 0; s < separatorColumns; s++) {
                    totalSumRow[currentColumnOffset + columnsPerFuelType + s] = '';
                }
            }
            currentColumnOffset += totalColumnsPerBlock;
        });
        dataForExport.push(totalSumRow);

        // ROW: "Saldo Akhir" for all fuel types
        const finalBalanceRow = [];
        currentColumnOffset = 0;
        fuelTypesInOrder.forEach((fuelType, index) => {
            finalBalanceRow[currentColumnOffset] = 'Saldo Akhir';
            finalBalanceRow[currentColumnOffset + 1] = '';
            for (let k = 0; k < 6; k++) {
                finalBalanceRow[currentColumnOffset + 2 + k] = '';
            }
            finalBalanceRow[currentColumnOffset + 8] = fuelTotals[fuelType].finalSaldo.liter;
            finalBalanceRow[currentColumnOffset + 9] = fuelTotals[fuelType].finalSaldo.rupiah;
            finalBalanceRow[currentColumnOffset + 10] = fuelTotals[fuelType].finalSaldo.hasat;
            if (index < fuelTypesInOrder.length - 1) {
                for (let s = 0; s < separatorColumns; s++) {
                    finalBalanceRow[currentColumnOffset + columnsPerFuelType + s] = '';
                }
            }
            currentColumnOffset += totalColumnsPerBlock;
        });
        dataForExport.push(finalBalanceRow);

        const ws = XLSX.utils.aoa_to_sheet(dataForExport);

        ws['!cols'] = cols;

        let colIndex = 0; 
        fuelTypesInOrder.forEach((fuelType, index) => {
            merges.push({
                s: { r: 0, c: colIndex },
                e: { r: 0, c: colIndex + columnsPerFuelType - 1 },
            });

            merges.push({ s: { r: 1, c: colIndex }, e: { r: 2, c: colIndex } }); 
            merges.push({ s: { r: 1, c: colIndex + 1 }, e: { r: 2, c: colIndex + 1 } }); 

            merges.push({ s: { r: 1, c: colIndex + 2 }, e: { r: 1, c: colIndex + 4 } }); 
            merges.push({ s: { r: 1, c: colIndex + 5 }, e: { r: 1, c: colIndex + 7 } }); 
            merges.push({ s: { r: 1, c: colIndex + 8 }, e: { r: 1, c: colIndex + 10 } }); 

            colIndex += totalColumnsPerBlock;
        });

        colIndex = 0;
        for (let i = 0; i < fuelTypesInOrder.length; i++) {
            const sumRowIndex = maxRows + 3; 
            merges.push({
                s: { r: sumRowIndex, c: colIndex },
                e: { r: sumRowIndex, c: colIndex + 1 } 
            });
            const finalBalanceRowIndex = maxRows + 4; 
            merges.push({
                s: { r: finalBalanceRowIndex, c: colIndex },
                e: { r: finalBalanceRowIndex, c: colIndex + 7 } 
            });
            colIndex += totalColumnsPerBlock;
        }

        ws['!merges'] = merges;

        const newRange = XLSX.utils.decode_range(ws['!ref'] || "A1"); 
        newRange.e.r = maxRows + 4; 
        ws['!ref'] = XLSX.utils.encode_range(newRange); 

        for (let R = 0; R <= newRange.e.r; ++R) {
            for (let C = 0; C <= newRange.e.c; ++C) {
                const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cell_address]) {
                    ws[cell_address] = { v: undefined };
                }
                if (!ws[cell_address].s) {
                    ws[cell_address].s = { border: borderStyle };
                } else if (!ws[cell_address].s.border) {
                    ws[cell_address].s.border = borderStyle;
                }
            }
        }

        colIndex = 0; 
        fuelTypesInOrder.forEach((fuelType, index) => {
            const cellFuelTypeHeader = ws[XLSX.utils.encode_cell({ r: 0, c: colIndex })];
            if (cellFuelTypeHeader) cellFuelTypeHeader.s = { ...headerStyle, alignment: { horizontal: 'center', vertical: 'center' } };

            const tanggalHeaderCell1 = ws[XLSX.utils.encode_cell({ r: 1, c: colIndex })];
            if (tanggalHeaderCell1) tanggalHeaderCell1.s = { ...subHeaderStyle, border: borderStyle, alignment: { horizontal: 'center', vertical: 'center' } };
            const keteranganHeaderCell1 = ws[XLSX.utils.encode_cell({ r: 1, c: colIndex + 1 })];
            if (keteranganHeaderCell1) keteranganHeaderCell1.s = { ...subHeaderStyle, border: borderStyle, alignment: { horizontal: 'center', vertical: 'center' } };

            const setoranHeaderCell = ws[XLSX.utils.encode_cell({ r: 1, c: colIndex + 2 })];
            if (setoranHeaderCell) setoranHeaderCell.s = { ...subHeaderStyle, border: borderStyle };
            const terimaHeaderCell = ws[XLSX.utils.encode_cell({ r: 1, c: colIndex + 5 })];
            if (terimaHeaderCell) terimaHeaderCell.s = { ...subHeaderStyle, border: borderStyle };
            const saldoHeaderCell = ws[XLSX.utils.encode_cell({ r: 1, c: colIndex + 8 })];
            if (saldoHeaderCell) saldoHeaderCell.s = { ...subHeaderStyle, border: borderStyle };

            for (let C = 0; C < columnsPerFuelType; ++C) {
                if (C === 0 || C === 1) continue;
                const cell_address = XLSX.utils.encode_cell({ r: 2, c: colIndex + C });
                if (!ws[cell_address]) {
                    ws[cell_address] = { v: undefined };
                }
                ws[cell_address].s = { ...subHeaderStyle, border: borderStyle };
            }

            colIndex += totalColumnsPerBlock;
        });

        colIndex = 0;
        for (let i = 0; i < fuelTypesInOrder.length; i++) {
            const sumRowIndex = maxRows + 3; 
            const sumRowStartCell = ws[XLSX.utils.encode_cell({ r: sumRowIndex, c: colIndex })];
            if (sumRowStartCell) {
                sumRowStartCell.s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: sumRowFillColor } },
                    border: borderStyle,
                    alignment: { horizontal: 'center', vertical: 'center' }
                };
            }
            for (let C = colIndex + 2; C < colIndex + columnsPerFuelType; ++C) {
                const cell_address = XLSX.utils.encode_cell({ r: sumRowIndex, c: C });
                if (!ws[cell_address]) ws[cell_address] = { v: undefined };
                ws[cell_address].s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: sumRowFillColor } },
                    border: borderStyle,
                    alignment: { horizontal: 'center' }
                };
            }

            const finalBalanceRowIndex = maxRows + 4; 
            const finalBalanceRowStartCell = ws[XLSX.utils.encode_cell({ r: finalBalanceRowIndex, c: colIndex })];
            if (finalBalanceRowStartCell) {
                finalBalanceRowStartCell.s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: finalBalanceRowFillColor } },
                    border: borderStyle,
                    alignment: { horizontal: 'center', vertical: 'center' }
                };
            }
            for (let C = colIndex + 8; C < colIndex + columnsPerFuelType; ++C) { 
                const cell_address = XLSX.utils.encode_cell({ r: finalBalanceRowIndex, c: C });
                if (!ws[cell_address]) ws[cell_address] = { v: undefined };
                ws[cell_address].s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: finalBalanceRowFillColor } },
                    border: borderStyle,
                    alignment: { horizontal: 'center' }
                };
            }

            colIndex += totalColumnsPerBlock;
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rekap BBM');
        XLSX.writeFile(wb, 'Rekap_BBM_Side_by_Side.xlsx');
    };
});