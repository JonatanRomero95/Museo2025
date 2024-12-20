const express = require("express");
const axios = require("axios");
const translate = require("node-google-translate-skidz");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/api/objects", async (req, res) => {
    const { departament, keyword, location, page = 1 } = req.query;
    const pageSize = 20;
    const offset = (page - 1) = pageSize;

    try {
        let url = `https://collectionapi.metmuseum.org/public/collection/v1/objects?`;
        if (departament) url += `departmentId=${department}&`;
        if (keyword) url += `q=${keyword}&`;
        if (location) url += `geography=${location}&`;
        url += `start=${offset}&rows=${pageSize}`;

        const response = await axios.get(url);
        const objects = response.data.objectsIDs;

        const objectDetails = await Promise.all(
            objects.slice(0, pageSize).map(async (id) => {
                const objectData = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
                const data = objectData.data;

                const titleTranslated = await translate(data.title, { to: "es" });
                const cultureTranslated = await translate(data.culture, { to: "es" });
                const dynastyTranslated = data.dynasty ? await translate(data - dynasty, { to: "es" }) : null;

                return {
                    id,
                    title: titleTranslated,
                    culture: cultureTranslated,
                    dynasty: dynastyTranslated,
                    image: data.primaryImage,
                    date: data.objectDate,
                    additionalImages: data.additionalImages || []
                }
            })
        );

        res.json(objectDetails);

    } catch (error) {
        res.status(500).json({ error: 'Error fetching data from the museum API' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})