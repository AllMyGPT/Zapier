const BASE_URL = 'https://api.trello.com/1';

export class TrelloClient {
  constructor(apiKey, token) {
    this.apiKey = apiKey;
    this.token = token;
  }

  async request(method, path, params = {}, body = null) {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('token', this.token);

    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    }

    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Trello API ${response.status}: ${error}`);
    }
    return response.json();
  }

  getBoards() {
    return this.request('GET', '/members/me/boards', {
      fields: 'id,name,desc,url,closed',
    });
  }

  getBoard(boardId) {
    return this.request('GET', `/boards/${boardId}`, {
      fields: 'id,name,desc,url,closed',
    });
  }

  getLists(boardId) {
    return this.request('GET', `/boards/${boardId}/lists`, {
      fields: 'id,name,closed,pos',
    });
  }

  createList(boardId, name, pos = 'bottom') {
    return this.request('POST', '/lists', {}, { idBoard: boardId, name, pos });
  }

  getBoardCards(boardId) {
    return this.request('GET', `/boards/${boardId}/cards`, {
      fields: 'id,name,desc,idList,due,dueComplete,url,labels,idMembers',
    });
  }

  getListCards(listId) {
    return this.request('GET', `/lists/${listId}/cards`, {
      fields: 'id,name,desc,idList,due,dueComplete,url,labels,idMembers',
    });
  }

  getCard(cardId) {
    return this.request('GET', `/cards/${cardId}`, {
      fields: 'id,name,desc,idList,idBoard,due,dueComplete,url,labels,idMembers,closed',
    });
  }

  createCard(listId, name, desc, due) {
    const body = { idList: listId, name };
    if (desc) body.desc = desc;
    if (due) body.due = due;
    return this.request('POST', '/cards', {}, body);
  }

  updateCard(cardId, fields) {
    return this.request('PUT', `/cards/${cardId}`, {}, fields);
  }

  archiveCard(cardId) {
    return this.request('PUT', `/cards/${cardId}`, {}, { closed: true });
  }

  addComment(cardId, text) {
    return this.request('POST', `/cards/${cardId}/actions/comments`, {}, { text });
  }

  getCardComments(cardId) {
    return this.request('GET', `/cards/${cardId}/actions`, { filter: 'commentCard' });
  }

  getBoardMembers(boardId) {
    return this.request('GET', `/boards/${boardId}/members`);
  }

  search(query, modelTypes = 'all') {
    return this.request('GET', '/search', {
      query,
      modelTypes,
      cards_limit: 10,
      boards_limit: 5,
      lists_limit: 5,
    });
  }
}
