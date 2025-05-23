const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { hasAdminRole } = require('./adminrolechecker');
const { logFAQCommand } = require('../../events/faqlogger');

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

        // Check if the user has admin role
        if (!hasAdminRole(interaction)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command. Only admins can use this command.',
                flags: MessageFlags.Ephemeral
            });
        }

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

        // Get added values for logging
        const addedEntry = {
            question: question,
            answer: answer,
            category: category,
            id: client.faqDatabase.nextId - 1
        };

        client.faqDatabase.categories[category].push(newEntry);
        client.saveDatabase();

        // Logs the command usage
        await logFAQCommand(interaction, 'addfaq', {
            addedEntry: addedEntry
        });

        await interaction.reply({
            content: `✅ FAQ added successfully!\n**Category:** ${category}\n**Question:** ${question}\n**ID:** ${newEntry.id}`,
            flags: MessageFlags.Ephemeral
        });
    },
};