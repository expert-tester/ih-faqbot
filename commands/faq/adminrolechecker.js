const fs = require('fs');
const path = require('path');

// Path to admin role configuration
const configPath = path.join(__dirname, 'faq_database/admin_role.json');

/**
 * Check if a user has the admin role for the bot
 * @param {Object} interaction - Discord interaction object
 * @returns {boolean} - True if the user has the admin role, false otherwise
 */
function hasAdminRole(interaction) {
    try {
        // Get the guild ID
        const guildId = interaction.guild?.id;
        if (!guildId) return false;
        
        // Get the member
        const member = interaction.member;
        if (!member) return false;
        
        // Check if the user is a server admin (alternative permission)
        if (member.permissions.has('Administrator')) return true;
        
        // Load admin role config
        if (!fs.existsSync(configPath)) return false;
        
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(fileContent);
        
        // Get admin role for this guild
        const adminRoleId = config[guildId];
        if (!adminRoleId) return false;
        
        // Check if the user has the admin role
        return member.roles.cache.has(adminRoleId);
    } catch (error) {
        console.error('Error checking admin role:', error);
        return false;
    }
}

/**
 * Get the admin role ID for a guild
 * @param {string} guildId - Discord guild ID
 * @returns {string|null} - Admin role ID or null if not set
 */
function getAdminRoleId(guildId) {
    try {
        if (!fs.existsSync(configPath)) return null;
        
        const fileContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(fileContent);
        
        return config[guildId] || null;
    } catch (error) {
        console.error('Error getting admin role ID:', error);
        return null;
    }
}

module.exports = {
    hasAdminRole,
    getAdminRoleId
};