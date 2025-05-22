const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { hasAdminRole } = require('./adminrolechecker');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updatefaq')
        .setDescription('Update an existing FAQ entry')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the FAQ to update')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The updated question (optional)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('answer')
                .setDescription('The updated answer (optional)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('category')
                .setDescription('The updated category (optional)')
                .setRequired(false)),

    async execute(interaction) {
        const client = interaction.client;
        const id = interaction.options.getInteger('id');
        const newQuestion = interaction.options.getString('question');
        const newAnswer = interaction.options.getString('answer');
        const newCategory = interaction.options.getString('category');

        const { entry, category } = client.findFaqEntry(id);

        // Check if the user has admin role
        if (!hasAdminRole(interaction)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command. Only admins can use this command.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (!entry) {
            await interaction.reply({ content: `❌ FAQ with ID ${id} not found.`, flags: MessageFlags.Ephemeral });
            return;
        }

        // Update the fields if provided
        if (newQuestion) entry.question = newQuestion;
        if (newAnswer) entry.answer = newAnswer;

        // Update category if needed
        if (newCategory && newCategory !== category) {
            // Remove from old category
            client.faqDatabase.categories[category] = client.faqDatabase.categories[category].filter(faq => faq.id !== id);

            // Add to new category
            if (!client.faqDatabase.categories[newCategory]) {
                client.faqDatabase.categories[newCategory] = [];
            }
            client.faqDatabase.categories[newCategory].push(entry);

            // Clean up empty categories
            if (client.faqDatabase.categories[category].length === 0) {
                delete client.faqDatabase.categories[category];
            }
        }

        client.saveDatabase();

        await interaction.reply({
            content: `✅ FAQ updated successfully!\n**ID:** ${id}\n**Category:** ${newCategory || category}\n**Question:** ${entry.question}`,
            flags: MessageFlags.Ephemeral
        });
    },
};