'use strict';

let allWebsites = [];
let uniqueTags = [];

const gallery = document.getElementById('gallery');
const menu = document.getElementById('menu');
const addWebsite = document.getElementById('add-website');
const websiteDetail = document.getElementById('website-detail');
const signupWrapper = document.getElementById('signup-wrapper');
const logoutButton = document.getElementById('logout');
const notification = document.getElementById('notification');
const authForms = document.getElementById('auth-forms');
document.getElementById('loader').style.display = 'none';

menu.style.display = 'none';
gallery.style.display = 'none';
addWebsite.style.display = 'none';
websiteDetail.style.display = 'none';
signupWrapper.style.display = 'none';
logoutButton.style.display = 'none';

document.getElementById('signup-link').addEventListener('click', function(e){
  document.getElementById('login-wrapper').style.display = 'none';
  document.getElementById('signup-wrapper').style.display = 'block';
});

document.getElementById('login-form').addEventListener('submit', function(e){
  e.preventDefault();
  notification.innerHTML = '';
  let user = {};
  user.username = document.getElementById('username').value;
  user.password = document.getElementById('password').value;
  return fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json'
    } 
  })
  .then(res => res.json())
  .then(token => {
    localStorage.setItem('authToken', token.authToken);
    localStorage.setItem('username', user.username);
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    console.log('Logged in');
    getDataFromApi();
  })
  .catch((err) => {
    notification.innerHTML = 'Login failed. Try again or click below to sign up';
  })
});

document.getElementById('signup-form').addEventListener('submit', function(e){
  e.preventDefault();
  notification.innerHTML = '';
  let user = {};
  user.username = document.getElementById('signup-username').value;
  user.password = document.getElementById('signup-password').value;
  return fetch('/api/users', {
    method: 'POST',      
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .catch(error => console.error('Error:', error))
  .then(res => {
    if (res.message) {
      notification.innerHTML = res.message
    }
    else {
      notification.innerHTML = 'Account created! Log in below.';
    }
  })
  .then(function() {
    document.getElementById('login-wrapper').style.display = 'block';
    document.getElementById('signup-wrapper').style.display = 'none';
  })
});

function getDataFromApi() {
  gallery.innerHTML = '';
  let token = localStorage.getItem('authToken');
  let username = localStorage.getItem('username');
  return fetch(`/websites/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    allWebsites = data;
    renderGallery(allWebsites);
    renderMenu(allWebsites);
  })
  .catch(function() {
    console.log('API request error');
  })
};


function renderGallery(allWebsites) {
  authForms.style.display = 'none';
  menu.style.display = 'block';
  gallery.style.display = 'block';
  addWebsite.style.display = 'none';
  websiteDetail.style.display = 'none';
  logoutButton.style.display = 'block';
  gallery.innerHTML = '';
  notification.innerHTML = '';
  for (let i = allWebsites.length - 1; i >= 0; i--) {
    let tagDisplay = (allWebsites[i].tags).sort().join(' | ');
    let eachWebsite = `
      <div class='each-website' onclick='renderDetailScreen(${[i]})'>
        <img src='https://res.cloudinary.com/dgdn7zsw8/image/upload/v1526873950/${allWebsites[i]._id}.png' class='website-image' alt='screenshot of website' />
        <div class='overlay'>
          <p class='text website-title'>${allWebsites[i].title}</p><br />
          <p class='text website-tags label-margin'>${tagDisplay}</p><br />
          <p class='text website-notes label-margin'>${allWebsites[i].notes}</p>
        </div>
      </div>
    `;
    $('#gallery').append(eachWebsite);
  }
};

function renderMenu(data) {
  for (let i = 0; i < allWebsites.length; i++) {
    uniqueTags.push.apply(uniqueTags, allWebsites[i].tags);
  }
  uniqueTags = ([...new Set(uniqueTags)]).sort();

  if (allWebsites.length == 0) {
    document.getElementById('empty-gallery').style.display = 'block';
    document.getElementById('populated-gallery').style.display = 'none';
  }
  else {
    document.getElementById('empty-gallery').style.display = 'none';
    document.getElementById('populated-gallery').style.display = 'block';
    document.getElementById('filters').innerHTML = '';
    for (let i = 0; i < uniqueTags.length; i++) {
      $('#filters').append(`
        <div>
          <input type='checkbox' value='${uniqueTags[i]}' id='menu-${uniqueTags[i]}' class='checkbox' onclick='handleFilterClick()' />
          <label for='menu-${uniqueTags[i]}'>${uniqueTags[i]}</label>
          <br>
        </div>
      `);
    };
  }
};

function handleFilterClick() {
  let clickedFilters = [];
  let checkbox = document.forms[2];
  for (let i = 0; i < checkbox.length; i++) {
    if (checkbox[i].checked) {
      clickedFilters.push(checkbox[i].value);
    }
  };
  gallery.innerHTML = '';
  notification.innerHTML = '';
  for (let i = allWebsites.length - 1; i >= 0; i--) {
    let tagDisplay = (allWebsites[i].tags).sort().join(' | ');
    if (clickedFilters.every(val => (allWebsites[i].tags).indexOf(val) >= 0)) {
      let eachWebsite = `
      <div class='each-website' onclick='renderDetailScreen(${[i]})'>
        <img src='https://res.cloudinary.com/dgdn7zsw8/image/upload/v1526873950/${allWebsites[i]._id}.png' class='website-image' alt='screenshot of website' />
        <div class='overlay'>
          <h1 class='text website-title'>${allWebsites[i].title}</h1><br />
          <h2 class='text website-tags'>${tagDisplay}</h2><br />
          <p class='text website-notes label-margin'>${allWebsites[i].notes}</p>
        </div>
      </div>
    `;
      $('#gallery').append(eachWebsite);
    }
  };
  if (gallery.innerHTML === '') {
    notification.innerHTML = 'No results. Try deselecting a filter.'
  }
};

// Render checkboxes for new website
document.getElementById('add-link').addEventListener('click', function(e){
  e.preventDefault();
  menu.style.display = 'none';
  addWebsite.style.display = 'block';
  websiteDetail.style.display = 'none';
  logoutButton.style.display = 'block';
  document.getElementById('url-input').value = '';
  document.getElementById('custom-tag').value = '';
  document.getElementById('notes').value = '';
  document.getElementById('tag-checkboxes').innerHTML = '';
  let tagArr = ['images', 'layout', 'typography'];
  for (let i = 0; i < uniqueTags.length; i++) {
    tagArr.push.apply(tagArr, [uniqueTags[i]]);
  }
  tagArr = ([...new Set(tagArr)]).sort();
  for (let i = 0; i < tagArr.length; i++) {
    $('#tag-checkboxes').append(`
      <input type='checkbox' value='${tagArr[i]}' id='new-${tagArr[i]}' class='checkbox' name='new-tags'  />
      <label for='new-${tagArr[i]}'>${tagArr[i]}</label>
      <br>
  `)};
});

// POST a new website
document.getElementById('new-website').addEventListener('submit', function(e){
  e.preventDefault();
  let newWebsite = {};
  newWebsite.username = localStorage.getItem('username');
  newWebsite.url = document.getElementById('url-input').value;
  //if (newWebsite.url.includes('https://') == false) {
  //  newWebsite.url = 'https://' + newWebsite.url
  //};
  newWebsite.notes = document.getElementById('notes').value;
  let tags = [];
  let checkbox = document.getElementsByName('new-tags');
  for (let i = 0; i < checkbox.length; i++) {
    if (checkbox[i].checked) {
      tags.push(checkbox[i].value)
    }
  };
  if (document.getElementById('custom-tag').value) {
    tags.push(document.getElementById('custom-tag').value)
  };
  let newTags = ([...new Set(tags)]).sort();
  newWebsite.tags = newTags;
  let token = localStorage.getItem('authToken');
  document.getElementById('loader').style.display = 'block';
  return fetch('/websites', {
    method: 'POST',
    body: JSON.stringify(newWebsite),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
   })
  .then(res => res.json())
  .then(res => {
    notification.innerHTML = res.message
  })
  .then(() => {
    getDataFromApi();
    document.getElementById('loader').style.display = 'none';
  })
});


function renderDetailScreen(i) {
  menu.style.display = 'none';
  addWebsite.style.display = 'none';
  websiteDetail.style.display = 'block';
  logoutButton.style.display = 'block';
  gallery.innerHTML = '';
  websiteDetail.innerHTML = '';
  let tagDisplay = (allWebsites[i].tags).sort().join(' | ');
  $('#gallery').append(`
    <div class='website-detail'>
      <span title='Click to visit website'> 
        <a href='${allWebsites[i].url}' target='_blank'>  
          <img src='https://res.cloudinary.com/dgdn7zsw8/image/upload/v1526873950/${allWebsites[i]._id}.png' alt='screenshot of website' class='detail-image website-image'/>
        </a>
      </span>
    </div>
  `);
  $('#website-detail').append(`
      <div class='detail-wrapper'>
        <p class='website-title'>${allWebsites[i].title}</p>
        <p class='website-tags label-margin'>${tagDisplay}</p>
        <p class='website-notes label-margin'>${allWebsites[i].notes}</p>
      </div>
      <button onclick='renderWebsiteEditor(${i})'>Edit website</button>
      <p class='or'>or</p>
      <button onclick='renderGallery(allWebsites)'>Go back</button>
  `);
};

function renderWebsiteEditor(i) {
  websiteDetail.innerHTML = '';
  $('#website-detail').append(`
    <form role='form'>
      <fieldset>
        <div class='padding-div'>
          <fieldset>
            <legend>Edit tags:</legend>
            <div id='edit-tags' class='checkbox-wrapper'></div>
          </fieldset>
          <label for='edit-custom-tag' class='label-margin'>Add a custom tag:</label>
          <div class="cursor">
            <input type='text' id='edit-custom-tag' class='text-input' />
            <i></i>
          </div>
          <label for='edit-notes' class='label-margin'>Edit notes:</label>
          <div class="cursor">
            <textarea id='edit-notes' class='text-input text-area' name='notes'>${allWebsites[i].notes}</textarea>
            <i></i>
          </div>
        </div>
        <a onclick='editWebsite(${[i]})' class='anchor-button'>Save changes</a>
      </fieldset>
    </form>
    <button onclick='deleteWebsite(${[i]})' class='delete'>Delete website</button>
    <p class='or'>or</p>
    <button onclick='renderDetailScreen(${i})'>Go back</button>
  `);
  for (let t = 0; t < uniqueTags.length; t++) {
    $('#edit-tags').append(`
      <input type='checkbox' id='edit-${uniqueTags[t]}' value='${uniqueTags[t]}' name='edit-tags' class='checkbox' />
      <label for='edit-${uniqueTags[t]}'>${uniqueTags[t]}</label>
      <br>
    `);
    if ((`${allWebsites[i].tags}`).includes(`${uniqueTags[t]}`)) {
      document.getElementById(`edit-${uniqueTags[t]}`).checked = true
    }
  }
};

function editWebsite(i) {
  let tags = [];
  let editedWebsite = {};
  editedWebsite.id = allWebsites[i]._id;

  let checkbox = document.getElementsByName('edit-tags');
  for (let i = 0; i < checkbox.length; i++) {
    if (checkbox[i].checked) {
      tags.push(checkbox[i].value)
    }
  };
  let customTag = document.getElementById('edit-custom-tag').value;
  if (customTag) {
    tags.push(customTag)
  };
  let editedTags = ([...new Set(tags)]).sort();
  editedWebsite.tags = editedTags;

  let editedNotes = document.getElementById('edit-notes').value;
  if (editedNotes) {
    editedWebsite.notes = editedNotes
  };
  
  let token = localStorage.getItem('authToken');
  return fetch(`/websites/${editedWebsite.id}`, {
    method: 'PUT',
    body: JSON.stringify(editedWebsite),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .then(getDataFromApi())
};

function deleteWebsite(i) {
  let token = localStorage.getItem('authToken');
  return fetch(`/websites/${allWebsites[i]._id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(getDataFromApi())
};

document.getElementById('gallery-link').addEventListener('click', function(e){
  e.preventDefault();
  getDataFromApi()
});

document.getElementById('close-link').addEventListener('click', function(e){
  e.preventDefault();
  renderGallery(allWebsites)
});

logoutButton.addEventListener('click', function(e){
  e.preventDefault();
  localStorage.setItem('authToken', '');
  localStorage.setItem('username', '');
  menu.style.display = 'none';
  gallery.style.display = 'none';
  addWebsite.style.display = 'none';
  websiteDetail.style.display = 'none';
  authForms.style.display = 'block';
  logoutButton.style.display = 'none';
});
