// Global variables
let contacts = [];
let title = '';

// Called once the page has loaded
document.addEventListener('DOMContentLoaded', () => {
    loadContactsAlternative();
});

/**
 * Loads contacts using an alternative method.
 */
const loadContactsAlternative = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let blobId = urlParams.get('blobId');

    // Check if 'blobId' contains commas and convert it into an array if it does
    if (blobId.includes(',')) {
        blobId = blobId.split(',');
    }

    const url = "https://leads-search.engram-7ab.workers.dev/manageSearchBlobs/get-main-records";
    const body = {
        "id": blobId
    };

    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then(json => {
        contacts = json.data.profiles.sort((a, b) => a.votes < b.votes);
        showAllContacts();
        addClickEventToMedia();

        // Update the title of the webpage
        title = `Contacts (${contacts.length})`;

        // Select the H3 element and set its text content to the 'title' variable
        const headerTitle = document.getElementById('header-title');
        headerTitle.textContent = title;
    });
}

/**
 * Adds a click event listener to each media element.
 */
const addClickEventToMedia = () => {
    document.querySelectorAll('.media').forEach(media => {
        media.addEventListener('click', () => {
            const contactId = media.id.split('-')[1];
            const contact = contacts.find(contact => contact.id === contactId);

            document.getElementById('contactProfilePhoto').src = contact.data.profilePhotoUrl || 'https://via.placeholder.com/50';
            document.getElementById('contactProfileName').textContent = contact.data.fullName;
            document.getElementById('contactProfileTitle').textContent = contact.data.title;
            document.getElementById('contactProfileLinkedIn').href = contact.data.linkedinUrl;
            document.getElementById('contactProfileWebsite').href = contact.data.websiteUrl;

            const contactProfile = new bootstrap.Offcanvas(document.getElementById('contactProfile'));
            contactProfile.show();
        });
    });
}

/**
 * Renders the contacts on the page.
 * 
 * @param {Array} contacts - The array of contacts to be rendered.
 * @returns {void}
 */
const drawContacts = (contacts) => {
    const container = document.getElementById('contacts-container');
    const templateScript = document.getElementById('contacts-template').innerHTML;
    const template = Handlebars.compile(templateScript);

    const data = {
        contacts: contacts
    };

    container.innerHTML = template(data);

    // Attach event listeners to each contact item
    contacts.forEach(contact => {
        const contactElement = document.getElementById('contact-' + contact.id);
        if (contactElement) {
            contactElement.addEventListener('click', () => {
                openContactProfile(contact);
            });
        }
    });
};

/**
 * Opens a contact profile in a new window.
 * 
 * @param {Object} contact - The contact object containing the profile information.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.description - The description of the contact.
 * @returns {void}
 */
function openContactProfile(contact) {
    // Create a new window
    const profileWindow = window.open('', '_blank');

    // Populate the new window with the contact's profile
    profileWindow.document.write(`<h1>${contact.name}</h1>`);
    profileWindow.document.write(`<p>${contact.description}</p>`);
    // Add more details as needed...
}

/**
 * Displays all contacts.
 * @function
 * @name showAllContacts
 * @returns {void}
 */
const showAllContacts = () => {
    drawContacts(contacts);
}
