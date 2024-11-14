export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`;

    return fetch(endpoint)
      .then(data => data.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers,
      }));
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@gitfav:')) || [];
  }

  save() {
    localStorage.setItem('@gitfav:', JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const user = await GithubUser.search(username);
      
      if (user.login === undefined) {
        throw new Error('Usuário não encontrado');
      }

      const userExists = this.entries.some(entry => entry.login === user.login);
      
      if (userExists) {
        throw new Error("Usuário já adicionado aos favoritos");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();

    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    this.entries = this.entries.filter(entry => entry.login !== user.login);
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector('table tbody');
    this.update();
    this.onAdd();
  }

  onAdd() {
    const addButton = this.root.querySelector('.search button');
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input');
      
      if (value.trim() === "") {
        alert("Digite um nome de usuário para pesquisar.");
        return;
      }
      
      this.add(value.trim());
      this.root.querySelector('.search input').value = "";
    };
  }

  update() {
    this.removeAllTr();

    this.entries.forEach(user => {
      const row = this.createRow();

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
      row.querySelector('.user img').alt = `Imagem de ${user.name}`;
      row.querySelector('.user a').href = `https://github.com/${user.login}`;
      row.querySelector('.user p').textContent = user.name;
      row.querySelector('.user span').textContent = user.login;
      row.querySelector('.repositories').textContent = user.public_repos;
      row.querySelector('.followers').textContent = user.followers;

      row.querySelector('.remove').onclick = () => {
        const confirmDelete = confirm('Tem certeza que deseja deletar essa linha?');
        if (confirmDelete) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="user">
        <img src="" alt="">
        <a href="" target="_blank">
          <p></p>
          <span></span>
        </a>
      </td>
      <td class="repositories">00</td>
      <td class="followers">1m</td>
      <td><button class="remove">Remover</button></td>
    `;
    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove();
    });
  }
}
