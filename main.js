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
        this.contacts = json.data.profiles.sort((a, b) => a.votes < b.votes);
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
    const container = document.getElementById('contacts-container');
    container.innerHTML = ''; // Clear existing content

    contacts.forEach(contact => {
        const contactElement = document.createElement('div');
        contactElement.className = 'media border-bottom p-3';
        contactElement.id = 'contact-' + contact.id;
        contactElement.innerHTML = `
            <img src="${contact.data.profilePhotoUrl || 'https://via.placeholder.com/50'}" width="50" class="mr-3">
            <div class="media-body">
                <h6 class="m-0">${contact.data.fullName}</h6>
                <p class="m-0">${contact.data.title || ''}</p>
                <!-- ... (other contact details) ... -->
            </div>
        `;

        contactElement.addEventListener('click', () => {
            openContactProfile(contact);
        });

        container.appendChild(contactElement);
    });
}

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
    this.title = "All Contacts";
    drawContacts(this.contacts);
}
