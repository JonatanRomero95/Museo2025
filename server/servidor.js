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
            res.status(500).json({ error: "error fetching data from the museum API"});
        }
    });

app.get("/api/objects", async (req, res) => {
    const { department, keyword, country, page = 1 } = req.query;
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    try {
        let url = `https://collectionapi.metmuseum.org/public/collection/v1/departments`;
        //if (department) url += `department=${department}&`;
        //if (keyword) url += `q=${keyword}&`;
        //if (location) url += `country=${location}&`;
        //url += `start=${offset}&rows=${pageSize}`;

        const response = await axios.get(url);
        const objects = response.data.departments;
        console.log(objects);

        /*

        const objectDetails = await Promise.all(
            objects.map(async (id) => {
                const objectData = await axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
                const data = objectData.data;
                const titleTranslated = (await translate(data.title, { to: "es" })).translatedText;
                const cultureTranslated = (await translate(data.culture, { to: "es" })).translatedText;
                const dynastyTranslated = data.dynasty ? await translate(data.dynasty, { to: "es" }) : null;

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
*/
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching data from the museum API' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})