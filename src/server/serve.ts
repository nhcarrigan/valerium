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
    });

    server.get("/", (_req, res) => {
      res.header("Content-Type", "text/html");
      res.send(`
        <!DOCTYPE html>
<html>
  <head>
    <title>Valerium</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="A bot to remove special roles when someone stops boosting a server." />
    <script src="https://cdn.nhcarrigan.com/headers/index.js" async defer></script>
  </head>
  <body>
    <main>
    <h1>Valerium</h1>
    <section>
    <img src="https://cdn.nhcarrigan.com/new-avatars/valerium-full.png" width="250" alt="Valerium" />
      <p>A bot to remove special roles when someone stops boosting a server.</p>
    </section>
    <section>
        <h2>Links</h2>
        <p>
            <a href="https://git.nhcarrigan.com/nhcarrigan/valerium">
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
        content: "Fastify server live on port 3443~!",
        username: bot.user?.username ?? "Valerium",
      });
    });
  } catch (err) {
    await errorHandler("instantiate server", err);
  }
};
