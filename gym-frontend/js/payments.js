// Payments Functions
async function loadPayments() {
  try {
    const data = await PaymentsAPI.getAll();
    const payments = data.payments || [];
    
    renderPaymentsTable(payments);
  } catch (error) {
    console.error('Error loading payments:', error);
    document.getElementById('paymentsTable').innerHTML = 
      `<div class="empty-state"><h3>Error loading payments</h3><p>${error.message}</p></div>`;
  }
}

function renderPaymentsTable(payments) {
  const paymentsTable = document.getElementById('paymentsTable');
  
  if (payments.length === 0) {
    paymentsTable.innerHTML = '<div class="empty-state"><h3>No payments yet</h3><p>Record your first payment to get started!</p></div>';
    return;
  }

  const tableHTML = `
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map(payment => `
            <tr>
              <td>${payment.memberId.name}</td>
              <td>₹${payment.amount}</td>
              <td>${payment.paymentMethod}</td>
              <td>${payment.transactionId || '-'}</td>
              <td>${new Date(payment.paymentDate).toLocaleDateString('en-IN')}</td>
              <td><span class="badge badge-${payment.status === 'completed' ? 'completed' : 'pending'}">${payment.status}</span></td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-primary btn-small" onclick="viewPaymentDetails('${payment._id}')">View</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  paymentsTable.innerHTML = tableHTML;
}

function openAddPaymentModal() {
  document.getElementById('paymentAlert').innerHTML = '';
  document.getElementById('paymentMemberId').value = '';
  document.getElementById('paymentAmount').value = '';
  document.getElementById('paymentMethod').value = '';
  document.getElementById('paymentTransactionId').value = '';
  
  // Load members if not already loaded
  if (allMembers.length === 0) {
    loadMembers();
  }
  
  openModal('addPaymentModal');
}

async function handleAddPayment(event) {
  event.preventDefault();

  const now = new Date();
  const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const data = {
    memberId: document.getElementById('paymentMemberId').value,
    amount: parseInt(document.getElementById('paymentAmount').value),
    paymentMethod: document.getElementById('paymentMethod').value,
    transactionId: document.getElementById('paymentTransactionId').value || null,
    billingMonth: billingMonth,
    date: new Date().toISOString(),
  };

  try {
    showAlert('paymentAlert', 'Recording payment...', 'info');
    await PaymentsAPI.create(data);
    
    showAlert('paymentAlert', 'Payment recorded successfully!', 'success');
    setTimeout(() => {
      closeModal('addPaymentModal');
      loadPayments();
    }, 1000);
  } catch (error) {
    showAlert('paymentAlert', error.message || 'Failed to record payment', 'danger');
  }
}

async function viewPaymentDetails(paymentId) {
  try {
    const data = await PaymentsAPI.getById(paymentId);
    const payment = data.payment;
    
    const details = `
      <strong>Member:</strong> ${payment.memberId.name}<br>
      <strong>Amount:</strong> ₹${payment.amount}<br>
      <strong>Method:</strong> ${payment.paymentMethod}<br>
      <strong>Transaction ID:</strong> ${payment.transactionId || '-'}<br>
      <strong>Status:</strong> ${payment.status}<br>
      <strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleString('en-IN')}<br>
      <strong>Notes:</strong> ${payment.notes || '-'}
    `;
    
    alert('Payment Details\n\n' + details.replace(/<br>/g, '\n'));
  } catch (error) {
    alert('Error loading payment details: ' + error.message);
  }
}
