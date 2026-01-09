// Reports Functions
async function loadReports() {
  try {
    // Load revenue report
    const revenueData = await apiCall('/owner/reports/revenue', 'GET');
    renderRevenueReport(revenueData);

    // Load member report
    const memberData = await apiCall('/owner/reports/members', 'GET');
    renderMemberReport(memberData);
  } catch (error) {
    console.error('Error loading reports:', error);
  }
}

function renderRevenueReport(data) {
  const revenueReport = document.getElementById('revenueReport');
  
  let html = '<table><thead><tr><th>Metric</th><th>Amount</th></tr></thead><tbody>';
  
  if (data.monthly) {
    Object.entries(data.monthly).forEach(([month, amount]) => {
      html += `<tr><td>${month}</td><td>₹${amount.toLocaleString('en-IN')}</td></tr>`;
    });
  }
  
  html += '</tbody></table>';
  
  // Payment method breakdown
  if (data.byMethod) {
    html += '<h4 style="margin-top: 1.5rem;">Payment Method Breakdown</h4>';
    html += '<table><thead><tr><th>Method</th><th>Amount</th></tr></thead><tbody>';
    Object.entries(data.byMethod).forEach(([method, amount]) => {
      html += `<tr><td>${method.toUpperCase()}</td><td>₹${amount.toLocaleString('en-IN')}</td></tr>`;
    });
    html += '</tbody></table>';
  }
  
  revenueReport.innerHTML = html;
}

function renderMemberReport(data) {
  const memberReport = document.getElementById('memberReport');
  
  let html = `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
      <div style="background-color: #d1ecf1; padding: 1rem; border-radius: 8px; text-align: center;">
        <strong>${data.total}</strong><br>
        Total Members
      </div>
      <div style="background-color: #d4edda; padding: 1rem; border-radius: 8px; text-align: center;">
        <strong>${data.active}</strong><br>
        Active Members
      </div>
      <div style="background-color: #f8d7da; padding: 1rem; border-radius: 8px; text-align: center;">
        <strong>${data.expired}</strong><br>
        Expired Members
      </div>
    </div>
  `;

  // Plan-wise breakdown
  if (data.byPlan) {
    html += '<h4>Plan Distribution</h4>';
    html += '<table><thead><tr><th>Plan</th><th>Count</th></tr></thead><tbody>';
    Object.entries(data.byPlan).forEach(([plan, count]) => {
      html += `<tr><td>${plan.toUpperCase()}</td><td>${count}</td></tr>`;
    });
    html += '</tbody></table>';
  }

  memberReport.innerHTML = html;
}
