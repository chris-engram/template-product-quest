/********************** UTILITIES **********************/

/**
 * Converts an object to a markdown string.
 * @param {Object} obj - The object to convert.
 * @returns {string} The markdown string representation of the object.
 */
function convertToHTML(obj) {
    let html = '';
    for (let key in obj) {
        // Check if the value is a URL
        if (isValidURL(obj[key])) {
            html += `<a href="${obj[key]}" target="_blank"><b>${key}</b></a><br>`;
        } else {
            html += `<b>${key}</b>: ${obj[key]}<br>`;
        }
    }
    return html;
}

/**
 * Checks if a given string is a valid URL.
 * @param {string} string - The string to be checked.
 * @returns {boolean} - Returns true if the string is a valid URL, otherwise returns false.
 */
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;  
    }
}


/********************** MANAGE CONTACTS **********************/

/**
 * Loads contacts to table.
 */
const loadContacts = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let blobId = urlParams.get('blobId');

    // Check if 'blobId' contains commas and convert it into an array if it does
    if (blobId.includes(',')) {
        blobId = blobId.split(',');
    }
    console.log(`Loading contacts from blobId: ${blobId}`);

    const url = "https://leads-search.engram-7ab.workers.dev/manageSearchBlobs/get-main-records";
    const body = {"id": blobId};

    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then(json => {
        contacts = json.data.profiles.sort((a, b) => a.id < b.id).map(contact => ({
            id: contact.id,
            ...contact.data,
            profilePhotoUrl: contact.data.profilePhotoUrl ? contact.data.profilePhotoUrl : 'images/default_contact_profile.png',
            searchResults: contact.searchResults
        }));

        // Render the contacts on the page
        showAllContacts();

        // Update the title of the webpage
        document.querySelector('.table__header h1').textContent = `Pitch Black Contacts (${contacts.length})`;

        // Select the H3 element and set its text content to the 'title' variable
        const headerTitle = document.getElementById('header-title');
        headerTitle.textContent = title;
    });
}

// Load contacts when the DOM is loaded
document.addEventListener('DOMContentLoaded', loadContacts);

/**
 * Renders all contacts in the table.
 * 
 * @param {Array} contacts - The array of contacts to be rendered.
 * @returns {void}
 */
const drawContacts = (contacts) => {
    const templateScript = document.getElementById('contacts-template').innerHTML;
    const template = Handlebars.compile(templateScript);
    const html = template({ contacts: contacts });

    // Update only the tbody of the table
    document.querySelector('table tbody').innerHTML = html;
};

/**
 * Displays all contacts.
 * @function
 * @name showAllContacts
 * @returns {void}
 */
const showAllContacts = () => {
    drawContacts(contacts);

    // Get all the contact rows
    const contactRows = document.querySelectorAll('tbody tr');

    // Update contact rows
    contactRows.forEach(row => {

        // Add a click event listener to each contact row
        row.addEventListener('click', () => {

            // Contact details
            const contact = contacts.find(contact => contact.id === row.id);
            console.log('contact: ', contact);
            
            // Update the placeholders in the side panel
            document.getElementById('contactProfilePhoto').src = contact.profilePhotoUrl || 'images/default_contact_profile.png';
            document.getElementById('contactProfileName').textContent = contact.fullName;
            document.getElementById('contactProfileTitle').textContent = contact.title;
            document.getElementById('contactProfileMobilePhone').textContent = contact.phoneMobile;
            document.getElementById('contactProfileWorkPhone').textContent = contact.phoneWork;
            
            // LinkedIn
            if (contact.linkedinUrl) {
                document.getElementById('contactProfileLinkedIn').href = contact.linkedinUrl;
                document.getElementById('contactProfileLinkedIn').style.color = 'black';
            } else {
                document.getElementById('contactProfileLinkedIn').color = 'gray'
            };
            
            // Facebook
            if (contact.facebookUrl) {
                document.getElementById('contactProfileFacebook').href = contact.facebookUrl;
                document.getElementById('contactProfileFacebook').style.color = 'black';
            } else {
                document.getElementById('contactProfileFacebook').style.color = 'gray';
            }

            // Twitter
            if (contact.twitterUrl) {
                document.getElementById('contactProfileTwitter').href = contact.twitterUrl;
                document.getElementById('contactProfileTwitter').style.color = 'black';
            } else {
                document.getElementById('contactProfileTwitter').style.color = 'gray';
            }

            // Github
            if (contact.githubUrl) {
                document.getElementById('contactProfileGithub').href = contact.githubUrl;
                document.getElementById('contactProfileGithub').style.color = 'black';
            } else {
                document.getElementById('contactProfileGithub').style.color = 'gray';
            }

            // Sources
            displaySearchResults(contact);

            // Open the side panel
            document.querySelector(".wrapper").classList.add("side-panel-open");
        });
    });
}

/**
 * Displays the search results for a contact.
 * 
 * @param {Object} contact - The contact object containing search results.
 * @param {Array} contact.searchResults - The array of search results.
 * @param {string} contact.searchResults[].sourceType - The source type of the search result.
 * @param {string} contact.searchResults[].data - The data of the search result.
 */
function displaySearchResults(contact) {
    // Create a DocumentFragment to batch append the elements
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < contact.searchResults.length; i++) {
        // Create a div for the drawer
        const drawer = document.createElement('div');

        // Create h4 element for the sourceType
        const h4 = document.createElement('h4');
        h4.textContent = contact.searchResults[i].sourceType;

        // Add the 'keyboard_arrow_right' icon to the header
        const icon = document.createElement('span');
        icon.classList.add('material-icons');
        icon.textContent = 'keyboard_arrow_right';
        h4.prepend(icon);

        // Create p element for the data
        const p = document.createElement('p');
        p.innerHTML = convertToHTML(contact.searchResults[i].data);

        // Append h4 and p to the drawer
        drawer.appendChild(h4);
        drawer.appendChild(p);

        // Add a click event listener to the header
        h4.addEventListener('click', function() {
            // Toggle the 'open' class on the drawer
            drawer.classList.toggle('open');

            // Change the icon
            const icon = this.querySelector('.material-icons');
            if (drawer.classList.contains('open')) {
                icon.textContent = 'keyboard_arrow_down';
            } else {
                icon.textContent = 'keyboard_arrow_right';
            }
        });

        // Append the drawer to the fragment
        fragment.appendChild(drawer);
    }

    // Select the div with the id 'contactProfileSearchResults' and append the fragment to it
    const resultsDiv = document.getElementById('contactProfileSearchResults');
    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(fragment);
}


/********************** SIDE PANEL **********************/

// Side Panel button
document.querySelector(".side-panel-toggle").addEventListener("click", () => {
    document.querySelector(".wrapper").classList.toggle("side-panel-open");
  });


/********************** SEARCH CONTACTS **********************/

const search = document.querySelector('.input-group input'),
    table_rows = document.querySelectorAll('tbody tr'),
    table_headings = document.querySelectorAll('thead th');

// Search for specific data in HTML table
search.addEventListener('input', searchTable);

/**
 * Performs a search on a table and updates the visibility and styling of the table rows based on the search input.
 */
function searchTable() {
    table_rows.forEach((row, i) => {
        let table_data = row.textContent.toLowerCase(),
            search_data = search.value.toLowerCase();

        row.classList.toggle('hide', table_data.indexOf(search_data) < 0);
        row.style.setProperty('--delay', i / 25 + 's');
    })

    document.querySelectorAll('tbody tr:not(.hide)').forEach((visible_row, i) => {
        visible_row.style.backgroundColor = (i % 2 == 0) ? 'transparent' : '#0000000b';
    });
}

// Sorting | Order data in HTML table
table_headings.forEach((head, i) => {
    let sort_asc = true;
    head.onclick = () => {
        table_headings.forEach(head => head.classList.remove('active'));
        head.classList.add('active');

        document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
        table_rows.forEach(row => {
            row.querySelectorAll('td')[i].classList.add('active');
        })

        head.classList.toggle('asc', sort_asc);
        sort_asc = head.classList.contains('asc') ? false : true;

        sortTable(i, sort_asc);
    }
})

/**
 * Sorts the table rows based on the specified column.
 * 
 * @param {number} column - The index of the column to sort by.
 * @param {boolean} sort_asc - Indicates whether to sort in ascending order (true) or descending order (false).
 */
function sortTable(column, sort_asc) {
    [...table_rows].sort((a, b) => {
        let first_row = a.querySelectorAll('td')[column].textContent.toLowerCase(),
            second_row = b.querySelectorAll('td')[column].textContent.toLowerCase();

        return sort_asc ? (first_row < second_row ? 1 : -1) : (first_row < second_row ? -1 : 1);
    })
        .map(sorted_row => document.querySelector('tbody').appendChild(sorted_row));
}


/********************** EXPORT CONTACTS **********************/

// Converting HTML table to PDF
const pdf_btn = document.querySelector('#toPDF');
const customers_table = document.querySelector('#customers_table');

/**
 * Converts the given customers table to a PDF and prints it.
 * 
 * @param {HTMLElement} customers_table - The HTML element representing the customers table.
 */
const toPDF = function (customers_table) {
    const html_code = `
    <!DOCTYPE html>
    <link rel="stylesheet" type="text/css" href="style.css">
    <main class="table" id="customers_table">${customers_table.innerHTML}</main>`;

    const new_window = window.open();
     new_window.document.write(html_code);

    setTimeout(() => {
        new_window.print();
        new_window.close();
    }, 400);
}

pdf_btn.onclick = () => {
    toPDF(customers_table);
}

// Convert HTML table to JSON
const json_btn = document.querySelector('#toJSON');

/**
 * Converts an HTML table into a JSON string.
 * @param {HTMLTableElement} table - The HTML table to convert.
 * @returns {string} - The JSON string representation of the table data.
 */
const toJSON = function (table) {
    let table_data = [],
        t_head = [],

        t_headings = table.querySelectorAll('th'),
        t_rows = table.querySelectorAll('tbody tr');

    for (let t_heading of t_headings) {
        let actual_head = t_heading.textContent.trim().split(' ');

        t_head.push(actual_head.splice(0, actual_head.length - 1).join(' ').toLowerCase());
    }

    t_rows.forEach(row => {
        const row_object = {},
            t_cells = row.querySelectorAll('td');

        t_cells.forEach((t_cell, cell_index) => {
            const img = t_cell.querySelector('img');
            if (img) {
                row_object['customer image'] = decodeURIComponent(img.src);
            }
            row_object[t_head[cell_index]] = t_cell.textContent.trim();
        })
        table_data.push(row_object);
    })

    return JSON.stringify(table_data, null, 4);
}

json_btn.onclick = () => {
    const json = toJSON(customers_table);
    downloadFile(json, 'json')
}

// Convert HTML table to CSV File
const csv_btn = document.querySelector('#toCSV');

/**
 * Converts an HTML table to a CSV string.
 * @param {HTMLTableElement} table - The HTML table element to convert.
 * @returns {string} - The CSV string representation of the table.
 */
const toCSV = function (table) {
    // Code For SIMPLE TABLE
    // const t_rows = table.querySelectorAll('tr');
    // return [...t_rows].map(row => {
    //     const cells = row.querySelectorAll('th, td');
    //     return [...cells].map(cell => cell.textContent.trim()).join(',');
    // }).join('\n');

    const t_heads = table.querySelectorAll('th'),
        tbody_rows = table.querySelectorAll('tbody tr');

    const headings = [...t_heads].map(head => {
        let actual_head = head.textContent.trim().split(' ');
        return actual_head.splice(0, actual_head.length - 1).join(' ').toLowerCase();
    }).join(',') + ',' + 'image name';

    const table_data = [...tbody_rows].map(row => {
        const cells = row.querySelectorAll('td'),
            img = decodeURIComponent(row.querySelector('img').src),
            data_without_img = [...cells].map(cell => cell.textContent.replace(/,/g, ".").trim()).join(',');

        return data_without_img + ',' + img;
    }).join('\n');

    return headings + '\n' + table_data;
}

csv_btn.onclick = () => {
    const csv = toCSV(customers_table);
    downloadFile(csv, 'csv', 'customer orders');
}

// Convert HTML table to EXCEL File
const excel_btn = document.querySelector('#toEXCEL');

/**
 * Converts an HTML table to an Excel-compatible format.
 * 
 * @param {HTMLTableElement} table - The HTML table to convert.
 * @returns {string} - The table data in Excel format.
 */
const toExcel = function (table) {
    // Code For SIMPLE TABLE
    // const t_rows = table.querySelectorAll('tr');
    // return [...t_rows].map(row => {
    //     const cells = row.querySelectorAll('th, td');
    //     return [...cells].map(cell => cell.textContent.trim()).join('\t');
    // }).join('\n');

    const t_heads = table.querySelectorAll('th'),
        tbody_rows = table.querySelectorAll('tbody tr');

    const headings = [...t_heads].map(head => {
        let actual_head = head.textContent.trim().split(' ');
        return actual_head.splice(0, actual_head.length - 1).join(' ').toLowerCase();
    }).join('\t') + '\t' + 'image name';

    const table_data = [...tbody_rows].map(row => {
        const cells = row.querySelectorAll('td'),
            img = decodeURIComponent(row.querySelector('img').src),
            data_without_img = [...cells].map(cell => cell.textContent.trim()).join('\t');

        return data_without_img + '\t' + img;
    }).join('\n');

    return headings + '\n' + table_data;
}

excel_btn.onclick = () => {
    const excel = toExcel(customers_table);
    downloadFile(excel, 'excel');
}

/**
 * Downloads a file with the given data, file type, and optional file name.
 * 
 * @param {string} data - The data to be downloaded.
 * @param {string} fileType - The type of the file to be downloaded.
 * @param {string} [fileName=''] - The name of the file to be downloaded (optional).
 */
const downloadFile = function (data, fileType, fileName = '') {
    const a = document.createElement('a');
    a.download = fileName;
    const mime_types = {
        'json': 'application/json',
        'csv': 'text/csv',
        'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    a.href = `
        data:${mime_types[fileType]};charset=utf-8,${encodeURIComponent(data)}
    `;
    document.body.appendChild(a);
    a.click();
    a.remove();
}