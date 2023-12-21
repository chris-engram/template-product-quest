// Global variables
let contacts = [];
let title = '';

// Called once the page has loaded
document.addEventListener('DOMContentLoaded', () => {
    loadContactsAlternative();
});

const loadContactsAlternative = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const blobId = urlParams.get('blobId');

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
    });
}

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

const drawContacts = (contacts) => {
    // Get the container element where contacts will be displayed
    const container = document.getElementById('contacts-container');

    // Compile the Handlebars template
    const templateScript = document.getElementById('contacts-template').innerHTML;
    const template = Handlebars.compile(templateScript);

    // Create an object with the title and contacts properties
    const data = {
        title: "Contacts", // or use a dynamic title if needed
        contacts: contacts
    };

    // Use the template to generate HTML for the contacts
    const html = template(data);

    // Insert the HTML into the container
    container.innerHTML = html;

    // Add event listeners to the newly created elements
    contacts.forEach(contact => {
        const contactElement = document.getElementById('contact-' + contact.id);
        contactElement.addEventListener('click', () => {
            openContactProfile(contact);
        });
    });
};


// Function to open and populate the contact profile sidebar
function openContactProfile(contact) {
    document.getElementById('contactProfilePhoto').src = contact.data.profilePhotoUrl || 'https://via.placeholder.com/50';
    document.getElementById('contactProfileName').textContent = contact.data.fullName;
    document.getElementById('contactProfileTitle').textContent = contact.data.title;
    document.getElementById('contactProfileLinkedIn').href = contact.data.linkedinUrl || '#';
    document.getElementById('contactProfileWebsite').href = contact.data.websiteUrl || '#';
    new bootstrap.Offcanvas(document.getElementById('contactProfile')).show();
}

const showAllContacts = () => {
    title = "All Contacts";
    drawContacts(contacts);
}
