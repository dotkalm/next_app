import * as graphql from 'graphql'
import {
	mutationWithClientMutationId,
	connectionArgs,
	connectionDefinitions,
	connectionFromArray,
	nodeDefinitions,
	globalIdField,
	fromGlobalId
} from 'graphql-relay'
const {
	GraphQLBoolean,
	GraphQLString,
	GraphQLNonNull,
	GraphQLInt,
	GraphQLID,
	GraphQLObjectType,
	GraphQLFloat,
	GraphQLList,
	GraphQLInputObjectType,
} = graphql
export const { nodeInterface, nodeField } = nodeDefinitions(
	globalId => {
		const { type, id } = fromGlobalId(globalId)
	},
)
export const updateSession = new GraphQLInputObjectType({ 
	name: 'updateSession',
	fields: () => ({
		hmac: { type: new GraphQLNonNull(GraphQLString) },
		name: { type: new GraphQLNonNull(GraphQLString) },
		timestamp: { type: new GraphQLNonNull(GraphQLFloat) },
		session: { type: GraphQLString },
		state: { type: GraphQLString },
		host: { type: GraphQLString },
		code: { type: GraphQLString },
	})
})
export const addShopType = new GraphQLInputObjectType({
	name: 'AddShopType',
	fields: () => ({
		hmac: { type: new GraphQLNonNull(GraphQLString) },
		name: { type: new GraphQLNonNull(GraphQLString) },
		timestamp: { type: new GraphQLNonNull(GraphQLFloat) },
		session: { type: GraphQLString },
		state: { type: GraphQLString },
		host: { type: GraphQLString },
		code: { type: GraphQLString },
	})
})

export const VerifyHmacInput = new GraphQLInputObjectType({
	name: 'VerifyHmacType',
	fields: () => ({
		name			: { type: new GraphQLNonNull(GraphQLString) },
		hmac			: { type: new GraphQLNonNull(GraphQLString) },
		timestamp	: { type: new GraphQLNonNull(GraphQLFloat)  },
	})
})
export const SessionInput = new GraphQLInputObjectType({
	name: 'ShopSessionType',
	fields: () => ({
		name								: { type: new GraphQLNonNull(GraphQLString) },
		hmac								: { type: new GraphQLNonNull(GraphQLString) },
		session 						: {	type: new GraphQLNonNull(GraphQLString)	},
		timestamp						: { type: new GraphQLNonNull(GraphQLFloat)  },
		host							  : {	type: new GraphQLNonNull(GraphQLString)	},
		locale						  : {	type: new GraphQLNonNull(GraphQLString)	},
		new_design_language : {	type: new GraphQLNonNull(GraphQLBoolean)} 
	})
})
