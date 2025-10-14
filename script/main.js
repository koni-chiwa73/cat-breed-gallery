//API & DOM Elements
const API_URL = 'https://api.thecatapi.com/v1/breeds';
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const toast = document.getElementById('toast');
const loader = document.getElementById('loader');

let allBreeds = [];

//Calculate the average life span
function getAverageLifeSpan(lifeSpan) {
    if (!lifeSpan) return 0;
    const parts = lifeSpan.split(" - ").map(num => parseInt(num.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return (parts[0] + parts[1]) / 2;
    }
    return !isNaN(parts[0]) ? parts[0] : 0;
}

//Display Toast 
function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 400);
}

//Core App Logic
//Fetch Breeds
async function fetchBreeds(){
    loader.classList.remove('hidden');
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allBreeds = data;
        displayBreeds(allBreeds);
        enableSearch();
        enableSort();
    } catch (error) {
        console.error('Failed to fetch breeds:', error);
        gallery.innerHTML = '<p>Oops! Something went wrong while fetching cat breeds.</p>';
    } finally {
        loader.classList.add('hidden');
    }
}

//Breeds Cards
function displayBreeds(breeds) {
    gallery.innerHTML ='';
    breeds.forEach(breed => {
        const card = document.createElement('div');
        card.classList.add('card');

        const img = document.createElement('img');
        if (breed.reference_image_id) {
            img.src = `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`;
        } else {
            img.src = 'https://placehold.co/300x200?text=No+Image';
        }
        img.alt = breed.name;
        img.onerror = () => {
            img.src = 'https://placehold.co/300x200?text=No+Image';
        };
        
        card.innerHTML = `
        <h2>${breed.name}</h2>
        <p><strong>Origin:</strong> ${breed.origin}</p>
        <p><strong>Temperament:</strong> ${breed.temperament}</p>
        <p><strong>Life Span:</strong> ${breed.life_span} years</p>
        <p><strong>Weight:</strong> ${breed.weight.metric} kg</p>
        ${breed.wikipedia_url ? `<a href="${breed.wikipedia_url}" target="_blank">More on Wikipedia</a>` : ''}
        <button class="adopt-btn">Adopt Me</button>
        `;

        card.prepend(img);

        const adoptBtn = card.querySelector('.adopt-btn');
        adoptBtn.addEventListener('click', () => handleAdopt(breed, adoptBtn));

        gallery.appendChild(card);
    });
}

//Adopt Me Button - Feedback
function handleAdopt(breed,adoptBtn){
    adoptBtn.disabled=true;
    adoptBtn.textContent="Sending...";

    fetch('https://jsonplaceholder.typicode.com/posts',{
        method:'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ breedId: breed.id, name:breed.name})
    })
        .then(() => {
            adoptBtn.textContent = "Adopted!";
            showToast('Adoption request sent!');
        })
        .catch(() => {
            adoptBtn.textContent = "Try Again";
            showToast('Something went wrong...');
        })
        .finally(() => {
            setTimeout(() => {
                adoptBtn.textContent = "Adopt Me";
                adoptBtn.disabled = false;
            }, 3000);
        });
}

//Search and Sort Features
//Filters cat breeds based on search input
function enableSearch() {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filtered = allBreeds.filter(b =>
            b.name.toLowerCase().includes(query) 
        );
        displayBreeds(filtered);
    });
}

//Sort breeds by Life Span
function enableSort() {
    sortSelect.addEventListener('change', () => {
        const value = sortSelect.value;
        let sorted = [...allBreeds];
        if (value === 'asc') {
            sorted.sort((a, b) => parseFloat(a.life_span) - parseFloat(b.life_span));
        } else if (value === 'desc') {
            sorted.sort((a, b) => parseFloat(b.life_span) - parseFloat(a.life_span));
        }
        displayBreeds(sorted);
    });
}

//Dark Mode
document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'd') {
        document.body.classList.toggle('dark');
        document.querySelectorAll('.card').forEach(c => c.classList.toggle('dark'));
    }
});

fetchBreeds();