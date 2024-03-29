const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const sqliteConnection = require("../database/sqlite");
const UserRepository = require("../repositories/UserRepository");
const UserCreateService = require("../services/UserCreateService");

class UsersController {
  //criação do user
  async create(request, response) {
    const { name, email, password } = request.body;

    const userRepository = new UserRepository();
    const userCreateService = new UserCreateService(userRepository);
    await userCreateService.execute({ name, email, password });

    //está linha retorna um 201 falando que o usuário foi criado com sucesso
    return response.status(201).json();
  }

  // atualização do user
  async update(request, response) {
    const { name, email, password, old_password } = request.body;
    const user_id = request.user.id;

    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id])
    // selecione todos os campos da tabela de usuário onde o id é igual, procura se o usuário existe

    // esse if faz um tratamento de erro, caso não exista o id informado
    if (!user) {
      throw new AppError("Usuário não encontrado");
    }

    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);
    //pega os emails dos usuários usando o get

    //vê se o usuário não está querendo trocar o email antigo por um email já existente
    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este e-mail já está em uso.")
    }


    user.name = name ?? user.name; // declara novo nome que o usuário escolheu
    user.email = email ?? user.email; // declara novo email que o usuário escolheu


    // verifica se o usuário está informando a senha antiga
    if (password && !old_password) {
      throw new AppError("Você precisa informar a senha antiga para definir a nova senha");
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      // verifica se colocou a senha antiga correta
      if (!checkOldPassword) {
        throw new AppError("A senha antiga não confere")
      }

      // passa a senha nova e criptografada
      user.password = await hash(password, 8)
    }

    await database.run(`
    UPDATE users SET
    name = ?,
    email = ?,
    password = ?,
    updated_at = DATETIME('now')
    WHERE id = ?`,
      [user.name, user.email, user.password, user_id]
    )

    return response.json();
  }
}

module.exports = UsersController;