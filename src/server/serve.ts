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
      res.send("Health check~!");
    });

    server.listen({ port: 1443 }, (err) => {
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
