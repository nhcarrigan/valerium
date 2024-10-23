import { readFile } from "fs/promises";

import { type Client, WebhookClient } from "discord.js";
import fastify from "fastify";

import { errorHandler } from "../utils/errorHandler";

/**
 * Starts up a web server for health monitoring.
 *
 * @param {Client} bot The bot's Discord instance.
 */
export const instantiateServer = async (bot: Client) => {
  try {
    const server = fastify({
      logger: false,
      https: {
        cert: await readFile(
          "/etc/letsencrypt/live/oogie.nhcarrigan.com/cert.pem"
        ),
        key: await readFile(
          "/etc/letsencrypt/live/oogie.nhcarrigan.com/privkey.pem"
        ),
      },
    });

    server.get("/", (_req, res) => {
      res.send(`
        <!DOCTYPE html>
<html>
  <head>
    <title>Boost Monitor</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="A bot to remove special roles when someone stops boosting a server." />
    <script
      src="https://kit.fontawesome.com/f949111719.js"
      crossorigin="anonymous"
    ></script>
    <script src="https://widgets.tree-nation.com/js/widgets/v1/widgets.min.js?v=1.0"></script>
    <style>
      :root {
        --foreground: #04624f;
        --background: #abfcecdd;
      }
      body {
        margin: 0;
      }
      body::before {
        background: url(https://cdn.nhcarrigan.com/background.png);
        background-size: cover;
        background-position: center;
        width: 100%;
        height: 100%;
        z-index: -1;
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 1;
        pointer-events: none;
      }
      main {
        color: var(--foreground);
        background-color: var(--background);
        font-family: "JetBrains Mono", monospace;
        text-align: center;
        border-radius: 10px;
        width: 95%;
        max-width: 1080px;
        margin: auto;
      }
      footer {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--foreground);
        background-color: var(--background);
        position: fixed;
        bottom: 0;
      }
      a {
        color: unset;
      }
    </style>
  </head>
  <body>
    <main>
    <h1>Boost Monitor</h1>
    <section>
      <p>A bot to remove special roles when someone stops boosting a server.</p>
    </section>
    <section>
        <h2>Links</h2>
        <p>
            <a href="https://codeberg.org/nhcarrigan/boost-monitor">
                <i class="fa-solid fa-code"></i> Source Code
            </a>
        </p>
        <p>
            <a href="https://docs.nhcarrigan.com">
                <i class="fa-solid fa-book"></i> Documentation
            </a>
        </p>
        <p>
            <a href="https://chat.nhcarrigan.com">
                <i class="fa-solid fa-circle-info"></i> Support
            </a>
        </p>
    </section>
    </main>
    <footer>
      <p>&copy; Naomi Carrigan</p>
      <a href="https://chat.nhcarrigan.com" target="_blank" rel="noreferrer">
        <i class="fa-solid fa-comments"></i>
      </a>
      <div className="h-4/5" id="tree-nation-offset-website"></div>
      <script id="tree-nation">
        TreeNationOffsetWebsite({
          code: "a17464e0cd351220",
          lang: "en",
          theme: "dark",
        }).render("#tree-nation-offset-website");
      </script>
    </footer>
  </body>
</html>`);
    });

    server.listen({ port: 3443 }, (err) => {
      if (err) {
        void errorHandler("start server", err);
        return;
      }
      const hook = new WebhookClient({ url: process.env.DEBUG_HOOK as string });
      void hook.send({
        avatarURL:
          bot.user?.displayAvatarURL() ??
          "https://cdn.nhcarrigan.com/profile.png",
        content: "Fastify server live on port 1443~!",
        username: bot.user?.username ?? "Boost Monitor",
      });
    });
  } catch (err) {
    await errorHandler("instantiate server", err);
  }
};
