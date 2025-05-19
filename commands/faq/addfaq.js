const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addfaq')
        .setDescription('Add a new FAQ entry')
        .addStringOption(option => 
            option.setName('category')
                .setDescription('The category for this FAQ')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('question')
                .setDescription('The FAQ question')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('answer')
                .setDescription('The answer to the FAQ question')
                .setRequired(true)),
    
    async execute(interaction) {
        const client = interaction.client;
        const category = interaction.options.getString('category');
        const question = interaction.options.getString('question');
        const answer = interaction.options.getString('answer');

        // Initialize category if it doesn't exist
        if (!client.faqDatabase.categories[category]) {
            client.faqDatabase.categories[category] = [];
        }

        // Add new FAQ entry
        const newEntry = {
            id: client.faqDatabase.nextId++,
            question,
            answer
        };

        client.faqDatabase.categories[category].push(newEntry);
        client.saveDatabase();

        await interaction.reply({
            content: `✅ FAQ added successfully!\n**Category:** ${category}\n**Question:** ${question}\n**ID:** ${newEntry.id}`,
            ephemeral: true
        });
    },
};