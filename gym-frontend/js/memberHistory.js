// Member History & Renewal Functions

async function viewMemberHistory(memberId) {
  try {
    const response = await fetch(`${API_BASE_URL}/members/${memberId}/history`, {
      headers: { 'Authorization': `Bearer ${StorageManager.getToken()}` }
    });
    const data = await response.json();
    const member = data.member;
    const payments = data.payments || [];

    const remaining = Math.max(0, member.totalFees - member.amountPaid);
    const daysLeft = Math.ceil((new Date(member.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

    let historyHTML = `
      <div class="member-history">
        <h3>${member.name}</h3>
        <div class="history-summary">
          <p><strong>Phone:</strong> ${member.phone}</p>
          <p><strong>Plan:</strong> ${member.plan || 'N/A'}</p>
          <p><strong>Total Fees:</strong> ₹${member.totalFees}</p>
          <p><strong>Paid:</strong> ₹${member.amountPaid}</p>
          <p><strong>Remaining Due:</strong> ₹${remaining}</p>
          <p><strong>Expiry:</strong> ${new Date(member.expiryDate).toLocaleDateString('en-IN')} (${daysLeft > 0 ? daysLeft + ' days left' : 'Expired'})</p>
        </div>
        <h4>Payment History</h4>
    `;

    if (payments.length === 0) {
      historyHTML += '<p>No payments recorded</p>';
    } else {
      historyHTML += '<table><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Billing Month</th></tr></thead><tbody>';
      payments.forEach(p => {
        historyHTML += `<tr><td>${new Date(p.date).toLocaleDateString('en-IN')}</td><td>₹${p.amount}</td><td>${p.paymentMethod}</td><td>${p.billingMonth}</td></tr>`;
      });
      historyHTML += '</tbody></table>';
    }

    historyHTML += `
      <div class="action-buttons" style="margin-top: 20px;">
        <button class="btn btn-primary" onclick="openRenewalModal('${memberId}')">Renew Membership</button>
      </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'memberHistoryModal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <span class="close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
        ${historyHTML}
      </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function openRenewalModal(memberId) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'renewalModal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <span class="close" onclick="this.closest('.modal-overlay').remove()">&times;</span>
      <h3>Renew Membership</h3>
      <form onsubmit="handleRenewal(event, '${memberId}')">
        <label>Months to Add:
          <input type="number" id="renewMonths" min="1" value="1" required>
        </label>
        <label>Payment Amount:
          <input type="number" id="renewAmount" step="0.01" value="0">
        </label>
        <label>Payment Method:
          <select id="renewMethod">
            <option>cash</option>
            <option>upi</option>
            <option>card</option>
            <option>bank</option>
          </select>
        </label>
        <button type="submit" class="btn btn-success">Renew</button>
      </form>
      <div id="renewalAlert"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
}

async function handleRenewal(event, memberId) {
  event.preventDefault();
  try {
    const data = {
      months: parseInt(document.getElementById('renewMonths').value),
      paymentAmount: parseFloat(document.getElementById('renewAmount').value) || 0,
      paymentMethod: document.getElementById('renewMethod').value,
      billingMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    };
    const response = await fetch(`${API_BASE_URL}/members/${memberId}/renew`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${StorageManager.getToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error((await response.json()).message);
    document.getElementById('renewalAlert').innerHTML = '<p style="color: green;">Member renewed successfully!</p>';
    setTimeout(() => {
      document.getElementById('renewalModal').remove();
      loadMembers();
    }, 1500);
  } catch (error) {
    document.getElementById('renewalAlert').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
}
