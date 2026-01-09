// Members Functions
let allMembers = [];

async function loadMembers() {
  try {
    const data = await MembersAPI.getAll();
    allMembers = data.members || [];
    
    renderMembersTable();
    populateMemberSelect();
  } catch (error) {
    console.error('Error loading members:', error);
    document.getElementById('membersTable').innerHTML = 
      `<div class="empty-state"><h3>Error loading members</h3><p>${error.message}</p></div>`;
  }
}

function renderMembersTable() {
  const membersTable = document.getElementById('membersTable');
  
  if (allMembers.length === 0) {
    membersTable.innerHTML = '<div class="empty-state"><h3>No members yet</h3><p>Add your first member to get started!</p></div>';
    return;
  }

  const tableHTML = `
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Plan</th>
            <th>Join Date</th>
            <th>Expiry Date</th>
            <th>Fee</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${allMembers.map(member => {
            const isExpired = new Date(member.expiryDate) < new Date();
            const status = isExpired ? 'expired' : 'active';
            
            return `
              <tr>
                <td>${member.name}</td>
                <td>${member.phone}</td>
                <td>${member.email || '-'}</td>
                <td>${member.plan || '-'}</td>
                <td>${new Date(member.joinDate).toLocaleDateString('en-IN')}</td>
                <td>${new Date(member.expiryDate).toLocaleDateString('en-IN')}</td>
                <td>₹${member.totalFees}</td>
                <td><span class="badge badge-${status}">${status}</span></td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-primary btn-small" onclick="openEditMemberModal('${member._id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteMember('${member._id}')">Delete</button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  membersTable.innerHTML = tableHTML;
}

function populateMemberSelect() {
  const select = document.getElementById('paymentMemberId');
  select.innerHTML = '<option value="">Select Member</option>';
  
  allMembers.forEach(member => {
    const option = document.createElement('option');
    option.value = member._id;
    option.textContent = member.name;
    select.appendChild(option);
  });
}

function openAddMemberModal() {
  document.getElementById('memberAlert').innerHTML = '';
  document.getElementById('memberName').value = '';
  document.getElementById('memberPhone').value = '';
  document.getElementById('memberEmail').value = '';
  document.getElementById('membershipType').value = '';
  document.getElementById('membershipDuration').value = '1';
  openModal('addMemberModal');
}

async function handleAddMember(event) {
  event.preventDefault();

  const data = {
    name: document.getElementById('memberName').value,
    phone: document.getElementById('memberPhone').value,
    email: document.getElementById('memberEmail').value,
    plan: document.getElementById('membershipType').value,
    months: parseInt(document.getElementById('membershipDuration').value),
  };

  try {
    showAlert('memberAlert', 'Adding member...', 'info');
    await MembersAPI.create(data);
    
    showAlert('memberAlert', 'Member added successfully!', 'success');
    setTimeout(() => {
      closeModal('addMemberModal');
      loadMembers();
    }, 1000);
  } catch (error) {
    showAlert('memberAlert', error.message || 'Failed to add member', 'danger');
  }
}

function openEditMemberModal(memberId) {
  const member = allMembers.find(m => m._id === memberId);
  if (!member) return;

  alert('Edit functionality coming soon!');
  // TODO: Implement edit modal
}

async function deleteMember(memberId) {
  if (!confirm('Are you sure you want to delete this member?')) return;

  try {
    await MembersAPI.delete(memberId);
    showAlert('membersTable', 'Member deleted successfully!', 'success');
    loadMembers();
  } catch (error) {
    alert('Error deleting member: ' + error.message);
  }
}
