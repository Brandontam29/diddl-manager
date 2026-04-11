// Admin queries/mutations: same as authed but additionally verify the user has admin role.
// Admin role is set via Clerk publicMetadata: { role: "admin" }
// The Clerk JWT template must include publicMetadata for this to work.

import { customMutation, customQuery } from 'convex-helpers/server/customFunctions';
import type { UserIdentity } from 'convex/server';
import { mutation, query } from '../_generated/server';

function assertAdmin(identity: UserIdentity) {
	// Clerk custom JWT claims: role is set via Clerk publicMetadata and mapped to JWT template
	if (identity.role !== 'admin') {
		throw new Error('Forbidden: admin access required');
	}
}

export const adminQuery = customQuery(query, {
	args: {},
	input: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (identity === null) {
			throw new Error('Unauthorized');
		}
		assertAdmin(identity);
		return { ctx: { ...ctx, identity }, args: {} };
	}
});

export const adminMutation = customMutation(mutation, {
	args: {},
	input: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();
		if (identity === null) {
			throw new Error('Unauthorized');
		}
		assertAdmin(identity);
		return { ctx: { ...ctx, identity }, args: {} };
	}
});
