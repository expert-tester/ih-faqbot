const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("searchfaq")
        .setDescription("Search through all FAQs"),

    async execute(interaction) {
        await this.showSearchModal(interaction);
    },

    async showSearchModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("faqsearch_modal")
            .setTitle("Search FAQs");

        const searchInput = new TextInputBuilder()
            .setCustomId("searchQuery")
            .setLabel("Enter your search term")
            .setPlaceholder("e.g. registration, schedule, submission")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(2)
            .setMaxLength(100);

        const firstActionRow = new ActionRowBuilder().addComponents(searchInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);

        // Wait for modal to be submitted
        const filter = (interaction) => interaction.customId === "faqsearch_modal";

        interaction
            .awaitModalSubmit({ filter, time: 30_000 })
            .then(async (modalInteraction) => {
                const searchQuery = modalInteraction.fields.getTextInputValue("searchQuery").toLowerCase();

                // Perform the search
                const searchResults = await this.searchFAQs(searchQuery);

                if (searchResults.length === 0) {
                    // No results found
                    await modalInteraction.reply({
                        content: "No FAQ entries found matching your search. Try different keywords or check our complete FAQ list.",
                        ephemeral: true
                    });
                } else {
                    // Display search results
                    await this.displaySearchResults(modalInteraction, searchQuery, searchResults);
                }
            })
            .catch(error => {
                console.error("Error with modal submission:", error);
            });
    },

    /**
     * Load FAQ database from JSON file
     * @returns {Object} Object containing flattened FAQ array and category mapping
     */
    loadFAQDatabase() {
        try {
            const filePath = path.join(__dirname, 'faq_database/faq_database.json');
            const data = fs.readFileSync(filePath, 'utf8');
            const faqDb = JSON.parse(data);

            // Create a flattened array of all FAQs across categories
            const allFaqs = [];
            // Also create a mapping of FAQ ID to category
            const faqCategoryMap = {};

            // Iterate through each category
            Object.keys(faqDb.categories).forEach(categoryId => {
                const categoryFaqs = faqDb.categories[categoryId];

                // Add each FAQ to the flattened array with its category
                categoryFaqs.forEach(faq => {
                    allFaqs.push({
                        ...faq,
                        categoryId: categoryId
                    });

                    // Map this FAQ ID to its category
                    faqCategoryMap[faq.id] = categoryId;
                });
            });

            return {
                faqs: allFaqs,
                categoryMap: faqCategoryMap,
                nextId: faqDb.nextId
            };
        } catch (error) {
            console.error("Error loading FAQ database:", error);
            return { faqs: [], categoryMap: {}, nextId: 0 };
        }
    },

    /**
     * Search through FAQs based on a query string
     * @param {string} query - The search query
     * @returns {Array} Array of matching FAQ objects with relevance scores
     */
    async searchFAQs(query) {
        const { faqs, categoryMap } = this.loadFAQDatabase();
        const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 1);

        if (!faqs || !faqs.length || !queryWords.length) return [];

        // Calculate relevance for each FAQ
        const results = faqs.map(faq => {
            const question = faq.question.toLowerCase();
            const answer = faq.answer.toLowerCase();
            const categoryId = faq.categoryId;

            // Calculate relevance score
            let score = 0;

            // Direct match in the question gets a high score
            if (question.includes(query)) {
                score += 10;
            }

            // Direct match in the answer gets a medium score
            if (answer.includes(query)) {
                score += 5;
            }

            // Check for category match - if the query contains the category number
            if (query.includes(categoryId)) {
                score += 3;
            }

            // Individual word matching
            queryWords.forEach(word => {
                if (question.includes(word)) {
                    score += 3;
                }
                if (answer.includes(word)) {
                    score += 1;
                }

                // Match on FAQ ID as string
                if (faq.id.toString() === word) {
                    score += 5;
                }
            });

            return {
                ...faq,
                relevanceScore: score
            };
        });

        // Filter out zero-relevance results and sort by score
        return results
            .filter(result => result.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
    },

    /**
     * Display search results to the user
     * @param {Interaction} interaction - The Discord interaction
     * @param {string} query - The search query
     * @param {Array} results - Array of search results
     */
    async displaySearchResults(interaction, query, results) {
        // Create embed for search results
        const embed = new EmbedBuilder()
            .setTitle(`FAQ Search Results: "${query}"`)
            .setColor(0x0099FF)
            .setDescription(`Found ${results.length} result${results.length === 1 ? '' : 's'} matching your search.`)
            .setTimestamp();

        // Add each result to the embed
        results.forEach((result, index) => {
            embed.addFields({
                name: `${index + 1}. ${result.question}`,
                value: result.answer.length > 200
                    ? `${result.answer.substring(0, 200)}... (Use /faq ${result.id || index + 1} for full answer)`
                    : result.answer
            });
        });

        // Add footer with instruction
        embed.setFooter({
            text: "Press 'Dismiss message' to close the search result."
        });

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral
        });
    }
};