const searchBtn = document.getElementById("searchBtn");
const departmentInput = document.getElementById("department");
const keywordInput = document.getElementById("keyword");
const locationInput = document.getElementById("location");
const gallery = document.getElementById("gallery");
const pagination = document.getElementById("pagination");

let currentPage = 1;
let totalPage = 1;

async function fetchObjects() {
    try {
        const department = departmentInput.value;
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
            <p><strong>Fecha:</strong> ${obj.date}</p>`;
            gallery.appendChild(card);
        });

        totalPage = Math.ceil(objects.length / 20);
        updatePagination();
    } catch (error) {
        console.log(error);
    }
}

function updatePagination() {
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.addEventListener("click", () => {
            currentPage = i;
            fetchObjects();
        });
        pagination.appendChild(pageBtn);
    }
}

async function fillOutDepartment() {
    try {
        const url = "/api/departments";
        const response = await fetch(url);
        const departments = await response.json();

        const departmentSelect = document.getElementById("department");
        departments.forEach(department => {
            const option = document.createElement("option");
            option.value = department.departmentId;
            option.textContent = department.displayName;
            departmentSelect.appendChild(option);
        })
    } catch (error) {
        console.log(error);
    }
}

searchBtn.onclick = () => {
    currentPage = 1;
    fetchObjects();
};

fillOutDepartment();

//fetchObjects();