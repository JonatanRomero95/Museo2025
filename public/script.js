const searchBtn = document.getElementById("searchBtn");
const departmentInput = document.getElementById("department");
const keywordInput = document.getElementById("keyword");
const locationInput = document.getElementById("location");
const gallery = document.getElementById("gallery");
const pagination = document.getElementById("pagination");
const infoPage = document.getElementById("information-page");
const nextBtn = document.getElementById("next");
const previousBtn = document.getElementById("back");
var pageIndex = 1;

async function fetchObjects() {
    try {
        let department = departmentInput.value;
        let keyword = keywordInput.value;
        let location = locationInput.value;

        if(location)
        {
            location = location.charAt(0).toUpperCase() + location.slice(1);
        }

        const url = `/api/objects?department=${department}&keyword=${keyword}&location=${location}&page=${pageIndex}`;
        const response = await fetch(url);
        const responseJSON = await response.json();

        const objects = responseJSON.objects;

        pageIndex = responseJSON.page;
        infoPage.textContent = `${responseJSON.page}/${responseJSON.totalPage}`;
        manageButtons(responseJSON);

        gallery.innerHTML = "";
        objects.forEach(obj => {

            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
            <img src="${obj.image}" alt="${obj.title}" class="imageNissan">
            <h3>${obj.title}</h3>
            <p><strong>Cultura:</strong> ${obj.culture}</p>
            <p><strong>Dinastía:</strong> ${obj.dynasty || 'N/A'}</p>
            <p><strong>Fecha:</strong> ${obj.date}</p>`;
            gallery.appendChild(card);
        });

    } catch (error) {
        console.log(error);
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

async function manageButtons(obj) {

    if (pageIndex === 1) {
        previousBtn.disabled = true;
    } else {
        previousBtn.disabled = false;
    }

    if (pageIndex === obj.totalPage) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

function advancePage(obj) {
    pageIndex++;
    fetchObjects();
}

function goBack(obj) {
    pageIndex--;
    fetchObjects();
}

searchBtn.onclick = () => {
    pageIndex = 1;
    fetchObjects();
};

fillOutDepartment();

nextBtn.addEventListener("click", advancePage);
previousBtn.addEventListener("click", goBack);


//fetchObjects();