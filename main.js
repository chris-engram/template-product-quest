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
 * Opens a contact profile in a modal.
 * 
 * @param {Object} contact - The contact object containing the profile information.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.description - The description of the contact.
 * @returns {void}
 */
function openContactProfile(contact) {
    console.log('contact', contact);
    
    // Select the modal and its elements
    const modal = document.getElementById('profile-modal');
    const nameElement = document.getElementById('profile-name');
    const descriptionElement = document.getElementById('profile-description');

    // Populate the modal with the contact's profile
    nameElement.textContent = contact.fullName;
    descriptionElement.textContent = contact.title;

    // Display the modal
    modal.style.display = 'block';

    // Add an event listener to close the modal when the close button is clicked
    const closeModalButton = document.getElementById('close-modal');
    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
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
