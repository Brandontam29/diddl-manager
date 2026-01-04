import puppeteer, { Frame, Page } from "puppeteer";
import path from "path";
import { URL } from "url";
import { mkdir } from "fs/promises";
import writeJsonToFile from "./utils/writeJsonToFile";
import { projectRoot } from "./pathing";
import { ensureDirExists } from "./utils/ensureFileExists";
import fs from "node:fs";

async function scrapeImagesFromFrames(
    aTags: any[],
    destinationDirectory: string,
    fileName: string
): Promise<void> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        ensureDirExists(destinationDirectory);
    } catch (err) {
        console.error("Directory already exists", err);
    }

    try {
        const visitedLinks: Record<string, true> = {};
        if (!aTags) return console.error("no aTags found");

        console.log("aTags", aTags);

        const structure: Record<string, string[]> = {}; // STRUCTURE

        let index = 0;
        for (let aTag of aTags) {
            if (visitedLinks[aTag.link]) continue;
            visitedLinks[aTag.link] = true;
            if (index > 49) {
                index += 1;
                continue;
            }

            const formatedATagName = `${formatNumber(index)}_${replaceSpecialChars(
                aTag.name || "no-name",
                "-"
            )}`;

            mkdir(path.join(destinationDirectory, formatedATagName));
            structure[formatedATagName] = []; // STRUCTURE
            console.log("Visiting: ", aTag);

            await page.goto(aTag.link, { waitUntil: "networkidle0" });

            const images = await page.$$eval("img", (imgs: Element[]): string[] =>
                imgs.map((img: Element) => (img as HTMLImageElement).src)
            );

            images.forEach((imageUrl) => {
                const imageName = getFilename(imageUrl, ".jpg");
                if (path.extname(imageName) === ".gif") return;

                downloadImage(imageUrl);
                structure[formatedATagName].push(imageName);
                console.log(`Downloaded: ${imageName}`);
            });
        }

        writeJsonToFile(path.join(destinationDirectory, fileName), structure);
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await browser.close();
    }
}

function getFilename(imageUrl: string, extname: string) {
    const urlObject = new URL(imageUrl);
    const originalFilename = path.basename(urlObject.pathname);
    if (path.extname(originalFilename).length === 0)
        return `${originalFilename}${extname}`;
    return originalFilename;
}

async function downloadImage(url: string, destination: string) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const bytesWritten = await Bun.write(destination, response);

        console.log(`Downloaded ${bytesWritten} bytes to ${destination}`);
    } catch (error) {
        console.error("Download failed:", error);
    }
}

function formatNumber(num: number) {
    num = Number(num);

    if (num < 10) return "00" + num.toString();
    if (num < 100) return "0" + num.toString();

    return num.toString();
}

function replaceSpecialChars(str: string, replacer: string) {
    let result = "";
    for (let i = 0, len = str.length; i < len; i++) {
        const char = str.charCodeAt(i);

        if (
            (char >= 48 && char <= 57) ||
            (char >= 97 && char <= 122) ||
            (char >= 65 && char <= 90) ||
            char === 45 ||
            char === 95
        ) {
            result += str[i];
        } else {
            result += replacer;
        }
    }

    return result;
}

/**
 * Usage
 */

const alinks = await Bun.file(
    path.join(projectRoot(), "complete-raw-static-files", "alinks.json")
).json();
// const structure = await Bun.file(
//     path.join(projectRoot(), "complete-raw-static-files", "alinks.json")
// ).json();
scrapeImagesFromFrames(
    alinks,
    path.join(projectRoot(), "complete-raw-static-files"),
    "structure-3.json"
).catch(console.error);

/**
 * Cannot Download: quardiddl_cards_2A.jpg
quardiddl_cards_2B.jpg
Cannot Download: quardiddl_cards_2B.jpg
quardiddl_cards_2C.jpg
Cannot Download: quardiddl_cards_2C.jpg
quardiddl_cards_2D.jpg
Cannot Download: quardiddl_cards_2D.jpg
 */
