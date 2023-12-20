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
    const template = Handlebars.compile(document.getElementById("contacts-template").innerHTML);
    document.getElementById('contacts-container').innerHTML = template({
        title: this.title,
        contacts: contacts    
    });
}

const showAllContacts = () => {
    this.title = "All Contacts";
    drawContacts(this.contacts);
}