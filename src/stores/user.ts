import { makeAutoObservable, reaction } from "mobx";

class UserStore {

  token = "";
  cookies = '';
  key = '';
  name = '';
  userId = 1;

  constructor() {
    makeAutoObservable(this);
    this.cookies = document.cookie;
    this.key = this.cookies.split('=')[0]
    this.token = localStorage.getItem(this.key) || '';
    this.loadFromLocalStorage();

    // 自动保存到 localStorage
    reaction(
      () => JSON.stringify(this),
      () => {
        this.saveToLocalStorage();
      }
    );
  }

  saveToLocalStorage() {
    const data = {
      cookies: this.cookies,
      key: this.key,
      token: this.token,
      name: this.name,
      userId: this.userId
    };
    localStorage.setItem('userStore', JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem('userStore');
    if (data) {
      const parsedData = JSON.parse(data);
      this.cookies = parsedData.cookies;
      this.key = parsedData.key || this.cookies.split('=')[0];
      this.token = parsedData.token || localStorage.getItem(this.key) || '';
      this.name = parsedData.name;
      this.userId = parsedData.userId;
    }
  }

  resetLocalStorage() {
    localStorage.removeItem('userStore');
  }

  login(cookie: string): void {
    this.cookies = cookie;
    this.token = this.cookies.split('=')[1];
    this.key = this.cookies.split('=')[0];
    localStorage.setItem(this.key, this.token);
  }

  logout() {
    localStorage.setItem(this.key, '');
    this.token = '';
    console.log("logout finished!");
  }

  setName(name: string) {
    this.name = name;
  }

  setUserId(id: number) {
    this.userId = id;
  }
}
export default new UserStore();