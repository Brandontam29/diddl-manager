import puppeteer, { Browser } from "puppeteer";
import { projectRoot } from "./pathing";
import path from "node:path";
import writeJsonToFile from "./utils/writeJsonToFile";

export const getAllImages = async (url: string, puppeteerBrowser?: Browser) => {
    const browser = puppeteerBrowser || (await puppeteer.launch());
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle2" });

        const imageUrls = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll("img"));
            return images.map((img) => img.src);
        });

        console.log(`Found ${imageUrls.length} images:`);
        console.log(imageUrls);

        return imageUrls;
    } catch (error) {
        console.error("Error fetching images:", error);
    } finally {
        page.close();
    }
};

const pages = (await Bun.file(
    path.join(projectRoot(), "json-files", "pages.json")
).json()) as { link: string; name: string }[];

const data: Record<string, string[]> = {};

const browser = await puppeteer.launch({ headless: true });

try {
    const promises = pages.map(async (currentPage) => {
        const allImageSrc = await getAllImages(currentPage.link, browser);
        data[currentPage.link] = allImageSrc || [];
    });

    await Promise.allSettled(promises);
} finally {
    await browser.close();
}

writeJsonToFile(path.join(projectRoot(), "json-files", "image-urls-2.json"), data);
