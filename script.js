// script.js
let map = L.map('map').setView([40.7128, -74.0060], 12);
let markers = [];
let restaurantData = [];
let activeRestaurant = null;

// add base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// remove all markers from map
function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

// fetch & prepare, but do NOT auto-render
fetch('restaurants.json')
  .then(res => res.json())
  .then(data => {
    restaurantData = data;
    populateCuisineOptions(data);
    // <-- no renderMarkers(data) here
  });

// plot a batch of markers
function renderMarkers(data) {
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

// fill cuisine dropdown
function populateCuisineOptions(data) {
  const select = document.getElementById('cuisineFilter');
  select.innerHTML = '<option value="">🍽️ Filter by cuisine</option>';
  [...new Set(data.map(r => r.cuisine_description))]
    .sort()
    .forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });
}

// when user clicks "Apply Filters"
function applyFilters() {
  const name    = document.getElementById('searchName').value.toLowerCase();
  const cuisine = document.getElementById('cuisineFilter').value;
  const borough = document.getElementById('boroughFilter').value;
  const grade   = document.getElementById('gradeFilter').value;

  clearMarkers();

  const filtered = restaurantData.filter(r =>
    (!name    || r.dba.toLowerCase().includes(name)) &&
    (!cuisine || r.cuisine_description === cuisine)     &&
    (!borough || r.borough === borough)                 &&
    (!grade   || r.grade === grade)
  );

  if (filtered.length) {
    renderMarkers(filtered);
    // zoom to fit
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds(), { maxZoom: 14 });
  } else {
    // you could display a "no results" message here
  }
}

// clear filters & map
function resetFilters() {
  clearMarkers();
  document.getElementById('searchName').value    = '';
  document.getElementById('cuisineFilter').value = '';
  document.getElementById('boroughFilter').value = '';
  document.getElementById('gradeFilter').value   = '';
  populateCuisineOptions(restaurantData);
}

// below here keep your existing save/showSaved/clearSaved/setActiveRestaurant code,
// unchanged from what you already have (it will continue to work exactly as before).

// e.g.:
//
// function setActiveRestaurant(r) { … }
// function showSaved() { … }
// function clearSaved() { … }
// function updateSavedList() { … }
// updateSavedList();
