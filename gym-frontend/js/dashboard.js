// Dashboard Functions
async function loadDashboard() {
  try {
    const data = await DashboardAPI.getStats();
    
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = `
      <div class="stat-box">
        <h3>${data.totalMembers}</h3>
        <p>Total Members</p>
      </div>
      <div class="stat-box success">
        <h3>₹${data.totalRevenue.toLocaleString('en-IN')}</h3>
        <p>Total Revenue</p>
      </div>
      <div class="stat-box danger">
        <h3>${data.expiredMembers}</h3>
        <p>Expired Memberships</p>
      </div>
      <div class="stat-box warning">
        <h3>${data.dueSoonMembers}</h3>
        <p>Expiring Soon (7 days)</p>
      </div>
    `;

    // Load recent payments
    const payments = await PaymentsAPI.getAll();
    const recentPayments = payments.payments.slice(0, 5);
    
    let tableHTML = '';
    if (recentPayments.length > 0) {
      tableHTML = `
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${recentPayments.map(payment => `
                <tr>
                  <td>${payment.memberId.name}</td>
                  <td>₹${payment.amount}</td>
                  <td>${payment.paymentMethod}</td>
                  <td>${new Date(payment.paymentDate).toLocaleDateString('en-IN')}</td>
                  <td><span class="badge badge-${payment.status === 'completed' ? 'completed' : 'pending'}">${payment.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      tableHTML = '<div class="empty-state"><p>No payments yet</p></div>';
    }
    
    document.getElementById('recentPaymentsTable').innerHTML = tableHTML;
  } catch (error) {
    console.error('Error loading dashboard:', error);
    document.getElementById('dashboardContent').innerHTML = 
      `<div class="empty-state"><h3>Error loading dashboard</h3><p>${error.message}</p></div>`;
  }
}
