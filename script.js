document.addEventListener('DOMContentLoaded', function() {
    const employeeForm = document.getElementById('employeeForm');
    const employeeList = document.getElementById('employeeList');
    const submitBtn = document.querySelector('#employeeForm button[type="submit"]');
    
    // Load employees from localStorage when page loads
    loadEmployees();
    
    // Form submission handler
    employeeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const email = document.getElementById('email').value.trim();
    const position = document.getElementById('position').value.trim();
    
    if (!validateForm(lastName, firstName, email, position)) {
        return;
    }
    
    const employee = {
        id: submitBtn.dataset.editingId || Date.now(), // Use existing ID if editing
        lastName,
        firstName,
        email,
        position
    };
    
    if (submitBtn.dataset.editingId) {
            updateEmployee(employee);
            submitBtn.textContent = 'Add Employee';
            delete submitBtn.dataset.editingId;
    } else {
        addEmployee(employee);
    }
    
    employeeForm.reset();
});
    
    // Form validation
    function validateForm(lastName, firstName, email, position) {
        let isValid = true;
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        if (!lastName) {
            document.getElementById('lastNameError').textContent = 'Last name is required';
            isValid = false;
        }
        
        if (!firstName) {
            document.getElementById('firstNameError').textContent = 'First name is required';
            isValid = false;
        }
        
        if (!email) {
            document.getElementById('emailError').textContent = 'Email is required';
            isValid = false;
        } else if (!validateEmail(email)) {
            document.getElementById('emailError').textContent = 'Invalid email format';
            isValid = false;
        }
        
        if (!position) {
            document.getElementById('positionError').textContent = 'Position is required';
            isValid = false;
        }
        
        return isValid;
    }
    
    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Add employee to list and localStorage
    function addEmployee(employee) {
        let employees = JSON.parse(localStorage.getItem('employees')) || [];
        employees.push(employee);
        localStorage.setItem('employees', JSON.stringify(employees));
        displayEmployees();
    }
    
    // Update employee in localStorage
    function updateEmployee(updatedEmployee) {
    let employees = JSON.parse(localStorage.getItem('employees')) || [];
    const index = employees.findIndex(emp => emp.id == updatedEmployee.id);
    
    if (index !== -1) {
        employees[index] = updatedEmployee;
        localStorage.setItem('employees', JSON.stringify(employees));
        displayEmployees();
        
        // Reset editing state only after successful update
        submitBtn.textContent = 'Add Employee';
        delete submitBtn.dataset.editingId;
    }
    }

    // Load employees from localStorage
    function loadEmployees() {
        displayEmployees();
    }
    
    // Display all employees
    function displayEmployees() {
        const employees = JSON.parse(localStorage.getItem('employees')) || [];
        
        if (employees.length === 0) {
            employeeList.innerHTML = '<p>No employees registered</p>';
            return;
        }
        
        employeeList.innerHTML = '';
        
        // Create table for desktop view
        const table = document.createElement('table');
        table.className = 'employee-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Position</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        
        // Create cards container for mobile view
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'employee-cards';
        
        employees.forEach(employee => {
            // Add row to table
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.firstName} ${employee.lastName}</td>
                <td>${employee.email}</td>
                <td>${employee.position}</td>
                <td class="actions">
                    <button class="edit-btn" data-id="${employee.id}">Edit</button>
                    <button class="delete-btn" data-id="${employee.id}">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
            
            // Add card for mobile
            const card = document.createElement('div');
            card.className = 'employee-card';
            card.innerHTML = `
                <div class="employee-info">
                    <div class="employee-name">${employee.firstName} ${employee.lastName}</div>
                    <div class="employee-email">${employee.email}</div>
                    <div class="employee-position">${employee.position}</div>
                </div>
                <div class="employee-actions">
                    <button class="edit-btn" data-id="${employee.id}">Edit</button>
                    <button class="delete-btn" data-id="${employee.id}">Delete</button>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
        
        // Add both views to the DOM
        employeeList.appendChild(table);
        employeeList.appendChild(cardsContainer);
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                deleteEmployee(parseInt(this.getAttribute('data-id')));
            });
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                editEmployee(parseInt(this.getAttribute('data-id')));
            });
        });
    }
    
    // Delete employee
    function deleteEmployee(id) {
        let employees = JSON.parse(localStorage.getItem('employees')) || [];
        // Convert both IDs to numbers for comparison
        employees = employees.filter(employee => parseInt(employee.id) !== parseInt(id));
        localStorage.setItem('employees', JSON.stringify(employees));
        displayEmployees();
        
        // Reset form if we were editing the deleted employee
        if (submitBtn.dataset.editingId && parseInt(submitBtn.dataset.editingId) === parseInt(id)) {
            submitBtn.textContent = 'Add Employee';
            delete submitBtn.dataset.editingId;
            employeeForm.reset();
        }
    }
    
    // Edit employee (populate form)
    function editEmployee(id) {
        const employees = JSON.parse(localStorage.getItem('employees')) || [];
        // Find employee using parsed ID
        const employee = employees.find(emp => parseInt(emp.id) === parseInt(id));
        
        if (employee) {
            document.getElementById('lastName').value = employee.lastName;
            document.getElementById('firstName').value = employee.firstName;
            document.getElementById('email').value = employee.email;
            document.getElementById('position').value = employee.position;
            
            submitBtn.textContent = 'Update Employee';
            submitBtn.dataset.editingId = employee.id.toString(); // Ensure consistent type
            
            document.querySelector('.form-container').scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
});