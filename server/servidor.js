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
    const { department, keyword, location, page } = req.query;
    let filter = [];
    const rows = 20;

    if (!page) {
        page = 1;
    }

    try {
        const isDepartment = department ? `departmentIds=${department};` : "";
        const isLocation = location ? `geoLocation=${location};` : "";
        const isKeyword = keyword ? `q=${keyword};` : 'q=""';
        let url = `https://collectionapi.metmuseum.org/public/collection/v1/search?${isDepartment}"&${isLocation}&${isKeyword}`;
        const response = await axios.get(url);
        response.data.objectIDs.forEach(id => filter.push(id));

        const totalPage = Math.ceil(filter.length / rows);

        const chunkRes = chunkResponse(filter, page);

        const objectDetails = await Promise.all(
            chunkRes.map(async (id) => {
                try {
                    const objectData = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
                    const data = objectData.data;
                    const titleTranslated = data.title ? (await translate(data.title, 'es')).translation : null;
                    const cultureTranslated = data.culture ? (await translate(data.culture, 'es')).translation : "Sin cultura";
                    const dynastyTranslated = data.dynasty ? (await translate(data.dynasty, 'es')).translation : "Sin dinastía";

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

        const filterObjsNull = objectDetails.filter(obj => obj !== null);

        res.json({
            objects: filterObjsNull,
            totalPage: totalPage,
            page: page
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching data from the museum API' });
    }
});

function chunkResponse(filter, page = 1, rows = 20) {
    const start = (page - 1) * rows;
    const end = start + rows;
    return filter.slice(start, end);
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});