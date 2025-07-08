let map = L.map('map').setView([40.7128, -74.0060], 12);
let markers = [];
let restaurantData = [];

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch restaurant data
fetch('restaurants.json')
  .then(res => res.json())
  .then(data => {
    restaurantData = data;
    populateCuisineOptions(data);
    renderMarkers(data);
  });

// Render markers based on filtered data
function renderMarkers(data) {
  // Clear old markers
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  if (data.length === 0) {
    alert("No matching restaurants found for selected filter.");
  }
  

  data.forEach(r => {
    const popup = `
      <strong>${r.dba}</strong><br>
      Cuisine: ${r.cuisine_description}<br>
      Grade: ${r.grade || 'Not graded'}<br>
      Date: ${r.inspection_date}<br>
      Borough: ${r.borough}<br>
      Violation: ${r.violation_description || 'None'}
    `;
    const marker = L.marker([r.latitude, r.longitude]).addTo(map).bindPopup(popup);
    markers.push(marker);
  });
}

// Populate cuisine dropdown dynamically
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
function applyFilters() {
    const name = document.getElementById('searchName').value.toLowerCase();
    const cuisine = document.getElementById('cuisineFilter').value;
    const borough = document.getElementById('boroughFilter').value.toUpperCase();  // normalize casing
    const grade = document.getElementById('gradeFilter').value;
  
    const filtered = restaurantData.filter(r => {
      const rBorough = r.borough ? r.borough.toUpperCase() : "";
  
      return (
        (!name || r.dba.toLowerCase().includes(name)) &&
        (!cuisine || r.cuisine_description === cuisine) &&
        (!borough || rBorough === borough) &&
        (!grade || r.grade === grade)
      );
    });
  
    console.log("Selected borough:", borough);
    console.log("Filtered count:", filtered.length);
    if (filtered.length > 0) {
      console.log("Sample match:", filtered[0]);
    }
  
    renderMarkers(filtered);
  }
  
console.log("Selected borough:", borough);