const sqliteConnection = require("../database/sqlite");

class UserRepository {
  async findByEmail(email) {
    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE email = (?)", [email]);
    //user verifica se o e-mail está sendo atualizado por alguém

    return user;
  }

  async create({ name, email, password }) {
    const database = await sqliteConnection();

    const userId = await database.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]);
    // podemos ver que nesta linha passamos a variável com a senha já criptografada
    //está linha fala onde os dados acima deve ser inserido, assim cadastrando o usuário, OBS: o id é gerado automaticamente

    return { id: userId };
  }
}

module.exports = UserRepository;