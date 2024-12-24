const express = require("express");
const axios = require("axios");
const translate = require("node-google-translate-skidz");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/api/departments", async (req, res) => {
    try {
        const response = await axios.get("https://collectionapi.metmuseum.org/public/collection/v1/departments");
        const departments = response.data.departments;
        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "error fetching data from the museum API" });
    }
});

app.get("/api/objects", async (req, res) => {
    const { department, keyword, location, page = 1 } = req.query;
    const pageSize = 20;
    const offset = (page - 1) * pageSize;
    let departmentObjectsIds = [];
    let keyWordLocationObjectsIds = [];
    let filter = [];


    try {

        if (department) {
            let url = `https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${department}`;
            const response = await axios.get(url);
            response.data.objectIDs.forEach(id => departmentObjectsIds.push(id));
        }

        if (keyword || location) {
            const isLocation = location ? `geoLocation=${location}` : "";
            const isKeyword = keyword ? `q=${keyword}` : 'q=""';
            let url = `https://collectionapi.metmuseum.org/public/collection/v1/search?${isLocation}&${isKeyword}`;
            const response = await axios.get(url);
            response.data.objectIDs.forEach(id => keyWordLocationObjectsIds.push(id));
        }

        if (department && (keyword || location)) {
            filter = departmentObjectsIds.filter(id => keyWordLocationObjectsIds.includes(id));
        } else if (department) {
            filter = departmentObjectsIds;
        } else if (keyword || location) {
            filter = keyWordLocationObjectsIds;
        }


        console.log(departmentObjectsIds);

        const objectDetails = await Promise.all(
            filter.map(async (id) => {
                try {
                const objectData = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
                const data = objectData.data;
                const titleTranslated = data.title ? (await translate(data.title, 'es')).translatedText : null;
                const cultureTranslated = data.culture ? (await translate(data.culture, 'es')).translatedText : null;
                const dynastyTranslated = data.dynasty ? (await translate(data.dynasty, 'es')).translatedText : null;

                return {
                    id,
                    title: titleTranslated,
                    culture: cultureTranslated,
                    dynasty: dynastyTranslated,
                    image: data.primaryImage,
                    date: data.objectDate,
                    additionalImages: data.additionalImages || []
                }
            } catch (error) {
                console.error(`Error fetching object ID ${id}:`, error.message);
                return null;
            }
            })
        );

        const validObjects = objectDetails.filter(obj => obj !== null);

        res.json(validObjects);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching data from the museum API' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})