const searchBtn = document.getElementById("searchBtn");
const departamentInput = document.getElementById("departament");
const keywordInput = document.getElementById("keyword");
const locationInput = document.getElementById("location");
const gallery = document.getElementById("gallery");
const pagination = document.getElementById("pagination");

let currentPage = 1;
let totalPage = 1;

async function fetchObjects() {
    const departament = departamentInput.value;
    const keyword = keywordInput.value;
    const location = locationInput.value;

    const url = `/api/objects?department=${department}&keyword=${keyword}&location=${location}&page=${currentPage}`;
    const response = await fetch(url);
    const objects = await response.json();

    gallery.innerHTML = "";
    objects.forEach(obj => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <img src="${obj.image}" alt="${obj.title}">
            <h3>${obj.title}</h3>
            <p><strong>Cultura:</strong> ${obj.culture}</p>
            <p><strong>Dinastía:</strong> ${obj.dynasty || 'N/A'}</p>
            <p><strong>Fecha:</strong> ${obj.date}</p>
        `;
        gallery.appendChild(card);
    });

    totalPages = Math.ceil(objects.length / 20);
    updatePagination();
}

function updatePagination() {
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.addEventListener("click", () => {
            currentPage = i;
            fetchObjects();
        });
        pagination.appendChild(page);
    }
}

searchBtn.onclick = () => {
    currentPage = 1;
    fetchObjects();
};

fetchObjects();