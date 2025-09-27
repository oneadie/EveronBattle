document.addEventListener('DOMContentLoaded', () => {
    const everonTableBody = document.querySelector('#everon-table tbody');
    const seykaTableBody = document.querySelector('#seyka-table tbody');
    const everonTotalSpan = document.querySelector('#everon-total');
    const seykaTotalSpan = document.querySelector('#seyka-total');
    const winnerNameSpan = document.querySelector('#winner-name');
    const addSlotButtons = document.querySelectorAll('.add-slot');

    let everonCount = 0;
    let seykaCount = 0;
    let everonTotal = 0;
    let seykaTotal = 0;

    // Load saved data from localStorage
    function loadData() {
        const everonData = JSON.parse(localStorage.getItem('everonData') || '[]');
        const seykaData = JSON.parse(localStorage.getItem('seykaData') || '[]');
        everonCount = everonData.length;
        seykaCount = seykaData.length;

        everonData.forEach((row, index) => {
            addSlot('everon', row.bonus, row.price, row.payout, index + 1);
        });
        seykaData.forEach((row, index) => {
            addSlot('seyka', row.bonus, row.price, row.payout, index + 1);
        });

        updateTotals('everon');
        updateTotals('seyka');
    }

    // Save data to localStorage
    function saveData(section) {
        const tableBody = section === 'everon' ? everonTableBody : seykaTableBody;
        const data = Array.from(tableBody.querySelectorAll('tr')).map(row => ({
            bonus: row.cells[1].textContent,
            price: row.cells[2].textContent,
            payout: row.cells[3].textContent
        }));
        localStorage.setItem(section === 'everon' ? 'everonData' : 'seykaData', JSON.stringify(data));
    }

    function updateWinner() {
        if (everonTotal > seykaTotal) {
            winnerNameSpan.textContent = 'Everon';
        } else if (seykaTotal > everonTotal) {
            winnerNameSpan.textContent = 'Seyka';
        } else {
            winnerNameSpan.textContent = 'Ничья';
        }
    }

    function updateRow(row, priceCell, payoutCell, multiplierCell) {
        const price = parseFloat(priceCell.textContent) || 0;
        const payout = parseFloat(payoutCell.textContent) || 0;
        const multiplier = price > 0 ? Math.floor(payout / (price / 100)) : 0;
        multiplierCell.textContent = multiplier + 'x';
        if (payout > price) {
            row.classList.add('green-row');
        } else {
            row.classList.remove('green-row');
        }
    }

    function updateTotals(section) {
        const tableBody = section === 'everon' ? everonTableBody : seykaTableBody;
        const totalSpan = section === 'everon' ? everonTotalSpan : seykaTotalSpan;
        let total = 0;
        tableBody.querySelectorAll('tr').forEach(row => {
            const payout = parseFloat(row.cells[3].textContent) || 0;
            total += payout;
        });
        if (section === 'everon') {
            everonTotal = total;
            everonTotalSpan.textContent = total.toFixed(2);
        } else {
            seykaTotal = total;
            seykaTotalSpan.textContent = total.toFixed(2);
        }
        updateWinner();
    }

    function addSlot(section, bonus = '', price = '0', payout = '0', countOverride = null) {
        const tableBody = section === 'everon' ? everonTableBody : seykaTableBody;
        const count = countOverride !== null ? countOverride : (section === 'everon' ? ++everonCount : ++seykaCount);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${count}</td>
            <td contenteditable="true">${bonus}</td>
            <td contenteditable="true">${price}</td>
            <td contenteditable="true">${payout}</td>
            <td>${price > 0 ? Math.floor(parseFloat(payout) / (parseFloat(price) / 100)) : 0}x</td>
        `;
        tableBody.appendChild(row);

        const bonusCell = row.cells[1];
        const priceCell = row.cells[2];
        const payoutCell = row.cells[3];
        const multiplierCell = row.cells[4];

        // Prevent pasting styles and links
        [bonusCell, priceCell, payoutCell].forEach(cell => {
            cell.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            });

            cell.addEventListener('input', () => {
                if (cell === priceCell || cell === payoutCell) {
                    updateRow(row, priceCell, payoutCell, multiplierCell);
                    updateTotals(section);
                    saveData(section);
                } else if (cell === bonusCell) {
                    saveData(section);
                }
            });
        });

        if (bonus || price !== '0' || payout !== '0') {
            updateRow(row, priceCell, payoutCell, multiplierCell);
            updateTotals(section);
        }
    }

    addSlotButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            addSlot(section);
            saveData(section);
        });
    });

    // Load data on page load
    loadData();
});