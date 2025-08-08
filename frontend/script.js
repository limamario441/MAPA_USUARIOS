const API = 'http://localhost:3000/usuarios';
const form = document.getElementById('form');
const lista = document.getElementById('lista');

// inicializa mapa
const map = L.map('map').setView([-15.7801, -47.9292], 4); // Brasil central
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markersGroup = L.layerGroup().addTo(map);

async function fetchUsuarios(){
  const res = await fetch(API);
  const users = await res.json();
  renderList(users);
  renderMarkers(users);
}

function renderList(users){
  lista.innerHTML = users.map(u => `
    <li data-id="${u.id}">
      <img class="avatar" src="${u.gravatar || 'https://www.gravatar.com/avatar?d=mp&s=200'}" />
      <div>
        <div style="font-weight:600">${u.nome}</div>
        <div style="font-size:12px;color:#cbd5e1">${u.email} • ${u.cidade || '—'}</div>
      </div>
    </li>
  `).join('');
}

function renderMarkers(users){
  markersGroup.clearLayers();
  users.forEach(u => {
    if (u.lat && u.lon) {
      const marker = L.marker([u.lat, u.lon]);
      const popupHtml = `
        <div style="text-align:center">
          <img src="${u.gravatar}" style="width:80px;height:80px;border-radius:50%;display:block;margin:0 auto 8px" />
          <strong>${u.nome}</strong><br/>
          <small>${u.email}</small><br/>
          <small>${u.cidade || ''}</small>
        </div>
      `;
      marker.bindPopup(popupHtml);
      markersGroup.addLayer(marker);
    }
  });

  // ajusta view para mostrar todos (se houver marcadores)
  const all = markersGroup.getLayers().map(m => m.getLatLng());
  if (all.length) {
    const bounds = L.latLngBounds(all);
    map.fitBounds(bounds, {padding: [50,50]});
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const cidade = document.getElementById('cidade').value.trim();

  if(!nome || !email) return;

  const res = await fetch(API, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ nome, email, cidade })
  });

  if(res.ok){
    form.reset();
    fetchUsuarios();
  } else {
    const err = await res.json();
    alert(err.error || 'Erro');
  }
});

// carregamento inicial
fetchUsuarios();
