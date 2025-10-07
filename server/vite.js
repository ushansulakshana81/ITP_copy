import express from "express";
import fs from "fs";
import path from "path";
import {createServer as createViteServer, createLogger} from "vite";
import viteConfig from "../vite.config.js";
import {nanoid} from "nanoid";

const viteLogger = createLogger();

export function log(message, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app, server) {
    const vite = await createViteServer({
        ...viteConfig,
        configFile: false,
        customLogger: {
            ...viteLogger,
            error: (msg, options) => {
                viteLogger.error(msg, options);
                process.exit(1);
            },
        },
        server: {
            middlewareMode: true,
            hmr: {server},
        },
        appType: "custom",
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    // Only handle non-asset requests for HTML
    app.use((req, res, next) => {
        // Skip API routes and static assets
        if (req.path.startsWith('/api') ||
            req.path.startsWith('/@') ||
            req.path.startsWith('/node_modules') ||
            req.path.includes('.')) {
            return next();
        }

        // Handle SPA routes by serving index.html
        (async () => {
            try {
                const url = req.originalUrl;
                const clientTemplate = path.resolve(
                    import.meta.dirname,
                    "..",
                    "client",
                    "index.html",
                );

                let template = await fs.promises.readFile(clientTemplate, "utf-8");
                template = template.replace(
                    `src="/src/main.jsx"`,
                    `src="/src/main.jsx?v=${nanoid()}"`,
                );

                const page = await vite.transformIndexHtml(url, template);
                res.status(200).set({"Content-Type": "text/html"}).end(page);
            } catch (e) {
                vite.ssrFixStacktrace(e);
                next(e);
            }
        })();
    });
}

export function serveStatic(app) {
    const distPath = path.resolve(import.meta.dirname, "public");
    if (!fs.existsSync(distPath)) {
        throw new Error(
            `Could not find the build directory: ${distPath}, make sure to build the client first`,
        );
    }
    app.use(express.static(distPath));

    app.use((req, res, next) => {
        if (req.path.startsWith('/api') || res.headersSent) {
            return next();
        }

        res.sendFile(path.resolve(distPath, "index.html"));
    });
}