const knex = require("../database/knex")

class NotesController {
  async create(request, response) {
    const { title, description, rating, tags } = request.body;
    const user_id = request.user.id;

    // pega as notas no banco de dados e insere
    const [note_id] = await knex("movie_notes").insert({
      title,
      description,
      rating,
      user_id
    });

    const tagsInsert = tags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    });

    // pega as tags no banco de dados e insere
    await knex("movie_tags").insert(tagsInsert);

    return response.json();
  }

  async show(request, response) {
    const { id } = request.params;

    // busca os ids da nota
    const note = await knex("movie_notes").where({ id }).first();
    //busca os ids da nota e transforma em id
    const tags = await knex("movie_tags").where({ note_id: id }).orderBy("name")

    return response.json({
      ...note,
      tags
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    // busca o movie_notes no banco de dados e apaga as notas do id inserido pelo usuário
    await knex("movie_notes").where({ id }).delete();

    return response.json()
  }

  async index(request, response) {
    const { title, tags } = request.query;
    const user_id = request.user.id;

    let notes;

    if (tags) {
      const filterTags = tags.split(',').map(tag => tag.trim());

      notes = await knex("movie_tags")
        .select([
          "movie_notes.id",
          "movie_notes.title",
          "movie_notes.user_id",
        ])
        .where("movie_notes.user_id", user_id)
        .whereLike("movie_notes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("movie_notes", "movie_notes.id", "movie_tags.note_id")
        .orderBy("movie_notes.title")

    } else {
      notes = await knex("movie_notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`) // whereLike busca valores dentro de uma palavra, o percentual diz pro banco de dados verificar tanto antes quando depois, em qualquer parte da palavra se existir oque foi pesquisado vai ser exibido
        .orderBy("title");
    }

    const userTags = await knex("movie_tags").where({ user_id });
    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id);

      return {
        ...note,
        noteTags
      }
    })

    return response.json(notesWithTags);
  }
}

module.exports = NotesController;