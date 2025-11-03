document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements
    const form = document.getElementById('contact-form');
    const contactList = document.getElementById('contact-list');
    const exportBtn = document.getElementById('export-btn');
    const searchInput = document.getElementById('search');
    const editIndexInput = document.getElementById('edit-index');
    const saveBtn = document.getElementById('save-btn');
    const phoneInput = document.getElementById('phone')

    // Function to restore contacts in localStorage or initialize an empty array
    let contacts = JSON.parse(localStorage.getItem('contacts')) || [];

    // Function to save contacts in localStorage
    function saveContacts(){
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }

    // Function to edit a contact
    function editContact(index){
        const contact = contacts[index];
        console.log(contact);
        document.getElementById('name').value = contact.name;
        phoneInput.value = contact.phone;
        document.getElementById('email').value = contact.email;
        editIndexInput.value = index;
        saveBtn.textContent = 'Salvar Alterações';
    }

    // Function to render list of contacts in table
    function renderContacts(filter=''){
        contactList.innerHTML = '';
        contacts.forEach((contact, index) => {
            if(
                contact.name.toLowerCase().includes(filter.toLowerCase()) ||
                contact.phone.includes(filter) ||
                contact.email.toLowerCase().includes(filter.toLowerCase())
            ){
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${contact.name}</td>
                <td>${contact.phone}</td>
                <td>${contact.email}</td>
                <td>
                    <button id="btn-edit-${index}" class="edit-btn action-button">Editar</button><br>
                    <button id="btn-del-${index}" class="delete-btn action-button">Deletar</button>
                </td>
                `;
                contactList.appendChild(row);
                document.getElementById(`btn-edit-${index}`).addEventListener('click', () => {
                    editContact(index);
                });
                document.getElementById(`btn-del-${index}`).addEventListener('click', () => {
                    deleteContact(index)
                });
            }
        })
    }

    // Function to delete a contact
    function deleteContact(index){
        contacts.splice(index, 1);
        saveContacts();
        searchInput.value = '';
        renderContacts();
        form.reset();
    }

    // Function to export contacts to xlsx
    function exportToExcel(){
        const workhsheet = XLSX.utils.json_to_sheet(contacts);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, workhsheet, 'Contatos');
        XLSX.utils.sheet_add_aoa(workhsheet, [['Nome', 'Telefone', 'E-mail']], {origin: 'A1'})
        XLSX.writeFile(workbook, 'agenda_contatos.xlsx');
    }

    // Render all the contacts saved
    renderContacts();

    // Input event listener for search input
    searchInput.addEventListener('input', () => renderContacts(searchInput.value));

    // Event handler to apply mask to phone field
    phoneInput.addEventListener('input', (e) => {
        // Getting phone field
        const target = e.target;
        let updatedValue = '';

        // Getting phone field value (just digits)
        const value = target.value.replace(/\D/g, '');

        if(value.length > 0){
            // Just DDD or less
            if(value.length <= 2){
                updatedValue = `(${value}`;
            }
            // DDD + prefix
            else if(value.length <=7){
                updatedValue = `(${value.substring(0, 2)}) ${value.substring(2)}`;
            }
            // Whole phone number
            else{
                updatedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
            }

            target.value = updatedValue;
        }

    })

    // Function to validate phone number
    async function validatePhoneNumber(phone){
        const apiKey = '3303b295c4bbec58c0c0a0e4fe7276c3';
        const formattedPhone = phone.replace(/\D/g, '');
        
        try {
            const response = await fetch(`http://apilayer.net/api/validate?access_key=${apiKey}&number=55${formattedPhone}`);
            const data = await response.json();
            
            if(!data.valid){
                alert('Número de telefone inválido');
                return false;
            }else{
                return true;
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao validar o número de telefone');
            return false;
        }
    }

    // Add/Edit contact (event handler form)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const phone = phoneInput.value;
        const email = document.getElementById('email').value;
        const editIndex = editIndexInput.value;

        const isValidPhone = validatePhoneNumber(phone);

        if(!isValidPhone) return;

        // Nothing to edit. Adding new contact...
        if(editIndex === ''){
            contacts.push({name, phone, email});
        }
        // Editing contact...
        else{
            contacts[editIndex] = {name, phone, email};
            editIndexInput.value = '';
            saveBtn.textContent = 'Adicionar Cliente';
        }

        saveContacts();
        renderContacts();
        form.reset();
    })

    // Adding event listener click to 'Export to Excel' button
    exportBtn.addEventListener('click', exportToExcel);

});