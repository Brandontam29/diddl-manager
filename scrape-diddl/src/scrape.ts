import puppeteer, { Frame, Page } from "puppeteer";
import fs from "fs";
import path from "path";
import { URL } from "url";
import { mkdir } from "fs/promises";

async function scrapeImagesFromFrames(
    url: string,
    destinationDirectory: string
): Promise<void> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await mkdir(destinationDirectory);
    } catch (err) {
        console.error("Directory already exists");
    }

    try {
        await page.goto(url, { waitUntil: "networkidle0" });

        const navFrame = await findFrameBySrc(
            page,
            "http://diddlfriends.org/DIDDLFRIENDS/Diddlfriends_de/fr_Navigation.html"
        );

        const aTags = await navFrame?.$$eval("a", (anchors: Element[]) =>
            anchors.map((a: Element) => {
                return { link: (a as HTMLAnchorElement).href, name: a.textContent };
            })
        );

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

            for (let imageUrl of images) {
                const imageName = getFilename(imageUrl, ".jpg");
                if (path.extname(imageName) === ".gif") continue;

                // const imagePage = await browser.newPage();
                try {
                    // STRUCTURE

                    console.log(imageName);

                    // const imageResponse = await imagePage.goto(imageUrl);

                    // if (!imageResponse) {
                    //     console.error("No image response ", imageUrl);
                    //     await imagePage.close();
                    //     continue;
                    // }

                    // const buffer = await imageResponse.buffer();

                    // fs.writeFileSync(
                    //     path.join(destinationDirectory, formatedATagName, imageName),
                    //     buffer
                    // );
                    structure[formatedATagName].push(imageName);
                    console.log(`Downloaded: ${imageName}`);
                } catch (e) {
                    console.error("Cannot Download: " + imageName);
                } finally {
                    // await imagePage?.close();
                }
            }
            index += 1;
        }

        writeJsonToFile("structure-2.json", structure);
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await browser.close();
    }
}

async function findFrameBySrc(page: Page, srcPattern: string): Promise<Frame | null> {
    const frames = page.frames();
    for (const frame of frames) {
        const src = await frame.evaluate(() => window.location.href);
        if (src.includes(srcPattern)) {
            return frame;
        }
    }
    return null;
}

function getFilename(imageUrl: string, extname: string) {
    const urlObject = new URL(imageUrl);
    const originalFilename = path.basename(urlObject.pathname);
    if (path.extname(originalFilename).length === 0)
        return `${originalFilename}${extname}`;
    return originalFilename;
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

function writeJsonToFile(filePath: string, data: Record<any, any>) {
    // Convert the JavaScript object to a JSON string
    const jsonData = JSON.stringify(data);

    // Write the JSON data to the specified file
    fs.writeFile(filePath, jsonData, (err) => {
        if (err) {
            console.error("Error writing to file:", err);
            return;
        }
        console.log(`
┌────────────────────────────────────────┐
│                                        │
│        DATA WRITTEN SUCCESSFULLY       │
│                                        │
└────────────────────────────────────────┘
`);
    });
}
/**
 * Usage
 */
scrapeImagesFromFrames("http://diddlfriends.org/", "classify1").catch(console.error);
/**
 * Cannot Download: quardiddl_cards_2A.jpg
quardiddl_cards_2B.jpg
Cannot Download: quardiddl_cards_2B.jpg
quardiddl_cards_2C.jpg
Cannot Download: quardiddl_cards_2C.jpg
quardiddl_cards_2D.jpg
Cannot Download: quardiddl_cards_2D.jpg
 */
