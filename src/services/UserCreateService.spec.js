const UserCreateService = require("./UserCreateService");
const UserRepositoryInMemory = require("../repositories/UserRepositoryInMemory");
const AppError = require("../utils/AppError");

describe("serviço de criação de usuários", () => {
  let userRepositoryInMemory = null;
  let userCreateService = null;

  beforeEach(() => {
    userRepositoryInMemory = new UserRepositoryInMemory();
    userCreateService = new UserCreateService(userRepositoryInMemory);
  })

  it("verificar se o usuário é criado com sucesso", async () => {
    const user = {
      name: "user test",
      email: "user@test.com",
      password: "123"
    };

    const userCreated = await userCreateService.execute(user);

    expect(userCreated).toHaveProperty("id");
  });

  it("verificar se é possível criar usuário com e-mail já existente", async () => {
    const userOne = {
      name: "user one",
      email: "user@test.com",
      password: "123"
    };

    const userTwo = {
      name: "user two",
      email: "user@test.com",
      password: "321"
    };

    await userCreateService.execute(userOne);
    await expect(userCreateService.execute(userTwo)).rejects.toEqual(new AppError("Este e-mail já está em uso."));
  });
});