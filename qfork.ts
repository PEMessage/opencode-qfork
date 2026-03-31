/**
 * Quick Fork Plugin for OpenCode
 *
 * A lightweight plugin that adds the /qfork command to quickly fork the current
 * session without creating a git worktree or copying any context.
 *
 * Usage:
 *   /qfork [reason]  - Fork current session with optional reason
 *
 * @module qfork-plugin
 */

import type { Plugin, PluginInput } from "@opencode-ai/plugin"

/**
 * Fork session and switch to it - simple and fast
 */
async function quickFork(
	client: any,
	sessionID: string,
	reason?: string,
): Promise<{ success: boolean; message: string; newSessionId?: string }> {
	try {
		// Fork the session
		const forkResponse = await client.session.fork({
			path: { id: sessionID },
			body: {},
		})

		const forkedSession = forkResponse.data
		if (!forkedSession?.id) {
			return { success: false, message: "Failed to fork session: no session data returned" }
		}

		// Log the fork action
		await client.app
			.log({
				body: {
					service: "qfork",
					level: "info",
					message: `Session forked${reason ? `: ${reason}` : ""}`,
					metadata: {
						originalSession: sessionID,
						newSession: forkedSession.id,
						reason,
					},
				},
			})
			.catch(() => {}) // Ignore logging errors

		// Switch to the new session using TUI publish API
		try {
			await client.tui.publish({
				body: {
					type: "tui.session.select",
					properties: {
						sessionID: forkedSession.id,
					},
				},
			})
		} catch (switchError) {
			// If switch fails, just log it - user can manually switch
			await client.app
				.log({
					body: {
						service: "qfork",
						level: "warn",
						message: `Failed to auto-switch to new session: ${switchError}`,
					},
				})
				.catch(() => {})
		}

		return {
			success: true,
			message: `Session forked and switched to: ${forkedSession.id}`,
			newSessionId: forkedSession.id,
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		return { success: false, message: `Fork failed: ${errorMessage}` }
	}
}

/**
 * Quick Fork Plugin
 *
 * Provides the /qfork command for rapid session forking.
 */
const QuickForkPlugin: Plugin = async (ctx: PluginInput) => {
	const { client } = ctx

	return {
		// Register /qfork command
		config: async (opencodeConfig) => {
			opencodeConfig.command ??= {}
			opencodeConfig.command["qfork"] = {
				template: "[reason]",
				description: "Quickly fork the current session and switch to it",
			}
		},

		// Handle /qfork command execution
		"command.execute.before": async (input, output) => {
			if (input.command !== "qfork") return

			// Extract optional reason from arguments
			const reason = (input.arguments || "").trim() || undefined

			// Fork the session and switch to it
			const result = await quickFork(client, input.sessionID, reason)

			// Send response to user
			output.parts.push({
				type: "text",
				text: result.success
					? `✅ ${result.message}`
					: `❌ ${result.message}`,
			} as any)

			// Mark command as handled
			throw new Error("__QFORK_HANDLED__")
		},
	}
}

export default QuickForkPlugin
