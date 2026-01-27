'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
    /**
     * Array of application names.
     */
    app_name: [process.env.NEW_RELIC_APP_NAME || 'TingleTalk'],
    /**
     * Your New Relic license key.
     */
    license_key: process.env.NEW_RELIC_LICENSE_KEY,
    /**
     * This setting controls distributed tracing.
     * Distributed tracing lets you see the path that a request takes through your
     * distributed system.
     */
    distributed_tracing: {
        /**
         * Enables/disables distributed tracing.
         */
        enabled: true,
    },
    logging: {
        /**
         * Level at which to log. 'trace' is most useful to New Relic when diagnosing
         * issues with the agent, 'info' and higher will impose the least overhead on
         * production applications.
         */
        level: 'info',
    },
    /**
     * When true, all request headers except for those listed in attributes.exclude
     * will be captured for all traces, unless otherwise specified in a destination's
     * attributes include/exclude lists.
     */
    allow_all_headers: true,
    application_logging: {
        forwarding: {
            enabled: true,
        },
    },
    audit_log: {
        enabled: false,
    },
    proto: {
        enabled: true,
    },
};
