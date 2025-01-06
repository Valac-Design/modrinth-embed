const { EmbedBuilder } = require("discord.js");

const MODRINTH_GREEN = "#28a745"; // Green color from the image

module.exports = {
  name: "modrinthScanner",
  init(client) {
    client.on("messageCreate", async (message) => {
      if (message.author.bot) return;

      const modrinthRegex = /https:\/\/modrinth\.com\/\w+\/([\w-]+)/;
      const match = message.content.match(modrinthRegex);

      if (!match) {
        console.log(`[MODRINTH SCANNER]: No valid Modrinth URL found in message: "${message.content}"`);
        return;
      }

      const projectId = match[1];
      console.log(`[MODRINTH SCANNER]: Detected project ID: ${projectId}`);

      const apiUrl = `https://api.modrinth.com/v2/project/${projectId}`;

      try {
        const fetch = (await import("node-fetch")).default;

        console.log(`[MODRINTH SCANNER]: Fetching data from: ${apiUrl}`);
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`API returned status ${response.status}`);

        const data = await response.json();
        console.log(`[MODRINTH SCANNER]: Fetched data:`, data);

        const title = data.title.length > 15 ? `${data.title.slice(0, 15)}...` : data.title;
        const description = data.description || "No description available.";
        const downloads = data.downloads.toLocaleString();
        const categories = data.categories?.join(", ") || "No categories listed.";
        const license = data.license?.name || "No license specified";

        // Create an embed with project details
        const embed = new EmbedBuilder()
          .setColor(MODRINTH_GREEN)
          .setTitle(`${title} | Modrinth`)
          .setURL(`https://modrinth.com/project/${projectId}`) // Add the link to the title
          .setDescription(description)
          .addFields(
            { name: "Downloads", value: downloads, inline: true },
            { name: "Categories", value: categories, inline: true },
            { name: "License", value: license, inline: true }
          )
          .setThumbnail(data.icon_url || null); // Use the project icon if available

        // Send the embed and delete the original message
        await message.channel.send({ embeds: [embed] });
        console.log(`[MODRINTH SCANNER]: Embed sent successfully for project ID: ${projectId}`);

        await message.delete();
        console.log(`[MODRINTH SCANNER]: Deleted original message.`);
      } catch (error) {
        console.error(`[MODRINTH ERROR]: ${error.message}`);
        await message.channel.send("Failed to fetch Modrinth project details. Please try again later.");
      }
    });
  },
};
