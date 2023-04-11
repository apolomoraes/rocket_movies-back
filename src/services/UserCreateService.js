const { hash } = require("bcryptjs");
const AppError = require("../utils/AppError");


class UserCreateService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ name, email, password }) {
    const checkUserExists = await this.userRepository.findByEmail(email);

    // este if verifica se o email é existente
    if (checkUserExists) {
      throw new AppError("Este e-mail já está em uso.");
    }

    const hashedPassword = await hash(password, 8);
    // nesta linha usamos a função do bcrypt, a hash, você passa a senha e a complexidade em que essa senha vai ser criptografada

    const userCreated = await this.userRepository.create({ name, email, password: hashedPassword });

    return userCreated;
  }
}

module.exports = UserCreateService;