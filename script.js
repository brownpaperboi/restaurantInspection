let map = L.map('map').setView([40.7128, -74.0060], 12);
let markers = [];
let restaurantData = [];
let activeRestaurant = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch and render data
fetch('restaurants.json')
  .then(res => res.json())
  .then(data => {
    restaurantData = data;
    populateCuisineOptions(data);
    renderMarkers(data);
  });

// Render markers (no zoom-fit)
function renderMarkers(data) {
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  data.forEach(r => {
    const marker = L.marker([r.latitude, r.longitude])
      .addTo(map)
      .bindTooltip(r.dba, { permanent: false });

    marker.on("click", () => setActiveRestaurant(r));
    marker.on("mouseover", () => marker.openTooltip());
    marker.on("mouseout", () => marker.closeTooltip());

    markers.push(marker);
  });
}

function setActiveRestaurant(r) {
  activeRestaurant = r;

  document.getElementById('restaurantDetails').innerHTML = `
    <strong>${r.dba}</strong><br>
    Cuisine: ${r.cuisine_description}<br>
    Grade: ${r.grade || 'Not graded'}<br>
    Date: ${r.inspection_date}<br>
    Borough: ${r.borough}<br>
    Violation: ${r.violation_description || 'None'}
  `;

  document.getElementById('saveBtn').disabled = false;
}

// Save from info panel
document.getElementById('saveBtn').addEventListener('click', () => {
  if (!activeRestaurant) return;
  saveRestaurant(activeRestaurant);
});

// Filter logic
function applyFilters() {
  const name = document.getElementById('searchName').value.toLowerCase();
  const cuisine = document.getElementById('cuisineFilter').value;
  const borough = document.getElementById('boroughFilter').value.toUpperCase();
  const grade = document.getElementById('gradeFilter').value;

  const filtered = restaurantData.filter(r => {
    const rBorough = (r.borough || "").toUpperCase();
    return (
      (!name || r.dba.toLowerCase().includes(name)) &&
      (!cuisine || r.cuisine_description === cuisine) &&
      (!borough || rBorough === borough) &&
      (!grade || r.grade === grade)
    );
  });

  renderMarkers(filtered);
}

// Populate cuisine dropdown
function populateCuisineOptions(data) {
  const cuisineSet = new Set(data.map(r => r.cuisine_description).filter(Boolean));
  const cuisineFilter = document.getElementById('cuisineFilter');
  [...cuisineSet].sort().forEach(cuisine => {
    const opt = document.createElement('option');
    opt.value = cuisine;
    opt.textContent = cuisine;
    cuisineFilter.appendChild(opt);
  });
}

// Save logic
function saveRestaurant(r) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const exists = favorites.some(f => f.dba === r.dba && f.latitude === r.latitude);
  if (!exists) {
    favorites.push(r);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`Saved "${r.dba}"`);
    updateSavedList();
  } else {
    alert("Already saved.");
  }
}

// Show saved restaurants on map
function showSaved() {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favorites.length === 0) {
    alert("No saved restaurants yet!");
    return;
  }
  renderMarkers(favorites);
}

// Clear saved list
function clearSaved() {
  localStorage.removeItem('favorites');
  updateSavedList();
  alert("Favorites cleared.");
}

// Display saved list
function updateSavedList() {
  const list = document.getElementById('savedList');
  list.innerHTML = '';
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  favorites.forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.dba} (${r.cuisine_description})`;
    list.appendChild(li);
  });
}

updateSavedList();
