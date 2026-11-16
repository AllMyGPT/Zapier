import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TrelloClient } from './trello-client.js';

const { TRELLO_API_KEY, TRELLO_TOKEN } = process.env;

if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
  console.error('Error: se requieren las variables TRELLO_API_KEY y TRELLO_TOKEN');
  process.exit(1);
}

const trello = new TrelloClient(TRELLO_API_KEY, TRELLO_TOKEN);

const server = new Server(
  { name: 'trello-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const TOOLS = [
  {
    name: 'get_boards',
    description: 'Obtiene todos los tableros de Trello accesibles por el usuario autenticado.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_lists',
    description: 'Obtiene todas las listas de un tablero de Trello.',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: { type: 'string', description: 'ID del tablero' },
      },
      required: ['board_id'],
    },
  },
  {
    name: 'get_cards',
    description: 'Obtiene las tarjetas de un tablero o de una lista específica.',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: { type: 'string', description: 'ID del tablero (usa este O list_id)' },
        list_id: { type: 'string', description: 'ID de una lista (usa este O board_id)' },
      },
    },
  },
  {
    name: 'get_card',
    description: 'Obtiene el detalle de una tarjeta específica.',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: { type: 'string', description: 'ID de la tarjeta' },
      },
      required: ['card_id'],
    },
  },
  {
    name: 'create_card',
    description: 'Crea una nueva tarjeta en una lista de Trello.',
    inputSchema: {
      type: 'object',
      properties: {
        list_id: { type: 'string', description: 'ID de la lista destino' },
        name: { type: 'string', description: 'Título de la tarjeta' },
        desc: { type: 'string', description: 'Descripción (opcional)' },
        due: { type: 'string', description: 'Fecha de vencimiento en formato ISO 8601 (opcional)' },
      },
      required: ['list_id', 'name'],
    },
  },
  {
    name: 'update_card',
    description: 'Actualiza el nombre, descripción o fecha de vencimiento de una tarjeta.',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: { type: 'string', description: 'ID de la tarjeta' },
        name: { type: 'string', description: 'Nuevo nombre (opcional)' },
        desc: { type: 'string', description: 'Nueva descripción (opcional)' },
        due: { type: 'string', description: 'Nueva fecha de vencimiento ISO 8601 (opcional)' },
        due_complete: { type: 'boolean', description: 'Marcar vencimiento como completado (opcional)' },
      },
      required: ['card_id'],
    },
  },
  {
    name: 'move_card',
    description: 'Mueve una tarjeta a otra lista.',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: { type: 'string', description: 'ID de la tarjeta a mover' },
        list_id: { type: 'string', description: 'ID de la lista destino' },
      },
      required: ['card_id', 'list_id'],
    },
  },
  {
    name: 'archive_card',
    description: 'Archiva (cierra) una tarjeta de Trello.',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: { type: 'string', description: 'ID de la tarjeta a archivar' },
      },
      required: ['card_id'],
    },
  },
  {
    name: 'create_list',
    description: 'Crea una nueva lista en un tablero de Trello.',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: { type: 'string', description: 'ID del tablero' },
        name: { type: 'string', description: 'Nombre de la nueva lista' },
        pos: {
          type: 'string',
          description: 'Posición: "top", "bottom" o un número (por defecto: "bottom")',
        },
      },
      required: ['board_id', 'name'],
    },
  },
  {
    name: 'add_comment',
    description: 'Agrega un comentario a una tarjeta de Trello.',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: { type: 'string', description: 'ID de la tarjeta' },
        text: { type: 'string', description: 'Texto del comentario' },
      },
      required: ['card_id', 'text'],
    },
  },
  {
    name: 'get_card_comments',
    description: 'Obtiene todos los comentarios de una tarjeta.',
    inputSchema: {
      type: 'object',
      properties: {
        card_id: { type: 'string', description: 'ID de la tarjeta' },
      },
      required: ['card_id'],
    },
  },
  {
    name: 'get_board_members',
    description: 'Obtiene todos los miembros de un tablero.',
    inputSchema: {
      type: 'object',
      properties: {
        board_id: { type: 'string', description: 'ID del tablero' },
      },
      required: ['board_id'],
    },
  },
  {
    name: 'search',
    description: 'Busca tarjetas, tableros y listas en Trello.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texto de búsqueda' },
        model_types: {
          type: 'string',
          description: 'Tipos separados por coma: "cards", "boards", "lists" o "all" (por defecto: "all")',
        },
      },
      required: ['query'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'get_boards':
        result = await trello.getBoards();
        break;

      case 'get_lists':
        result = await trello.getLists(args.board_id);
        break;

      case 'get_cards':
        if (args.list_id) {
          result = await trello.getListCards(args.list_id);
        } else if (args.board_id) {
          result = await trello.getBoardCards(args.board_id);
        } else {
          throw new Error('Se requiere board_id o list_id');
        }
        break;

      case 'get_card':
        result = await trello.getCard(args.card_id);
        break;

      case 'create_card':
        result = await trello.createCard(args.list_id, args.name, args.desc, args.due);
        break;

      case 'update_card': {
        const fields = {};
        if (args.name !== undefined) fields.name = args.name;
        if (args.desc !== undefined) fields.desc = args.desc;
        if (args.due !== undefined) fields.due = args.due;
        if (args.due_complete !== undefined) fields.dueComplete = args.due_complete;
        result = await trello.updateCard(args.card_id, fields);
        break;
      }

      case 'move_card':
        result = await trello.updateCard(args.card_id, { idList: args.list_id });
        break;

      case 'archive_card':
        result = await trello.archiveCard(args.card_id);
        break;

      case 'create_list':
        result = await trello.createList(args.board_id, args.name, args.pos);
        break;

      case 'add_comment':
        result = await trello.addComment(args.card_id, args.text);
        break;

      case 'get_card_comments':
        result = await trello.getCardComments(args.card_id);
        break;

      case 'get_board_members':
        result = await trello.getBoardMembers(args.board_id);
        break;

      case 'search':
        result = await trello.search(args.query, args.model_types);
        break;

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Servidor MCP de Trello iniciado en stdio');
