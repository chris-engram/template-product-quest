var products = null;
var categories = null;
var title = null;

// Called once the page has loaded
document.addEventListener('DOMContentLoaded', function(event) {
	//loadContacts();
    loadContactsAlternative();
	//loadCategories();
});

document.querySelectorAll('.media').forEach(function(media) {
    media.addEventListener('click', function() {
        var contactId = this.id.split('-')[1];
        var contact = contacts.find(function(contact) {
            return contact.id === contactId;
        });

        document.getElementById('contactProfilePhoto').src = contact.data.profilePhotoUrl || 'https://via.placeholder.com/50';
        document.getElementById('contactProfileName').textContent = contact.data.fullName;
        document.getElementById('contactProfileTitle').textContent = contact.data.title;
        document.getElementById('contactProfileLinkedIn').href = contact.data.linkedinUrl;
        document.getElementById('contactProfileWebsite').href = contact.data.websiteUrl;

        var contactProfile = new bootstrap.Offcanvas(document.getElementById('contactProfile'));
        contactProfile.show();
    });
});

function loadContactsAlternative() {
    var urlParams = new URLSearchParams(window.location.search);
    var blobId = urlParams.get('blobId');

    var url = "https://leads-search.engram-7ab.workers.dev/manageSearchBlobs/get-main-records";
    var body = {
        "id": blobId
    };

    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then(json => {
        this.contacts = json.data.profiles.sort((a, b) => {
            return a.votes < b.votes;
        })
        showAllContacts();
    });
}

// Replace this with your Sheety URL
// Make sure NOT to include the sheet name in the URL (just the project name!)
var projectUrl = 'https://api.sheety.co/717be535cbdc62b32a74693105db3bd4/exportConnector%20(1)';

function loadContacts() {
    fetch(projectUrl + '/contacts')
    .then((response) => response.json())
    .then(json => {
        this.contacts = json.contacts.sort((a, b) => {
            return a.votes < b.votes;
        })
        showAllContacts();
    });
}

function loadCategories() {
    fetch(projectUrl + '/categories')
    .then((response) => response.json())
    .then(json => {
        this.categories = json.categories;
        drawCategories();
    })
}

function drawContacts(contacts) {
    var template = Handlebars.compile(document.getElementById("contacts-template").innerHTML);
    document.getElementById('contacts-container').innerHTML = template({
        title: this.title,
        contacts: contacts    
    });
}

function drawCategories() {
    var template = Handlebars.compile(document.getElementById("menu-template").innerHTML);
    console.log('draw ', this.contacts);
    document.getElementById('menu-container').innerHTML = template(this.categories);
}

function showAllContacts() {
	this.title = "All Contacts";
	drawContacts(this.contacts);
}

function showCategory(category) {
	this.title = category;
	let filteredProducts = this.products.filter(product => {
		return product.category == category;
	});
	drawProducts(filteredProducts);
}

function upvoteProduct(id) {
	let product = this.products.find(product => {
		return product.id == id;
	});
	product.votes = product.votes + 1;
	product.hasVoted = true;
	
	let headers = new Headers();
	headers.set('content-type', 'application/json');
	fetch(projectUrl + '/products/' + id, {
		method: 'PUT',
		body: JSON.stringify({ product: product }),
		headers: headers
	});
	
	showAllProducts();
}
