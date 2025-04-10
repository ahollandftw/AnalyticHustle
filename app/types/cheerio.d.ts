declare module 'cheerio' {
    interface CheerioStatic {
        load(html: string): CheerioAPI;
    }

    interface CheerioAPI {
        (selector: string): Cheerio;
        find(selector: string): Cheerio;
        text(): string;
        trim(): string;
    }

    interface Cheerio {
        length: number;
        find(selector: string): Cheerio;
        each(func: (index: number, element: any) => void): Cheerio;
        text(): string;
    }

    const cheerio: CheerioStatic;
    export = cheerio;
} 