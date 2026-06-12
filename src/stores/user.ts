import { makeAutoObservable, reaction } from "mobx";

class UserStore {

  token = "";
  tokenType = "";
  expiresIn = 0;
  cookies = '';
  key = '';
  name = '';
  userId = 1;
  role = 1;
  userName = '';

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
      userId: this.userId,
      role: this.role,
      userName: this.userName,
      tokenType: this.tokenType,
      expiresIn: this.expiresIn
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
      this.role = parsedData.role;
      this.userName = parsedData.userName;
      this.tokenType = parsedData.tokenType;
      this.expiresIn = parsedData.expiresIn;
    }
  }

  resetLocalStorage() {
    localStorage.removeItem('userStore');
  }

  login(loginData: {
    token: string;
    tokenType: string;
    expiresIn: number;
    user: {
      realName: string;
      role: number;
      id: number;
      userName: string;
    }
  }): void {
    this.token = loginData.token;
    this.tokenType = loginData.tokenType;
    this.expiresIn = loginData.expiresIn;
    this.name = loginData.user.realName;
    this.userId = loginData.user.id;
    this.role = loginData.user.role;
    this.userName = loginData.user.userName;
    this.cookies = `token=${this.token}`;
    this.key = 'token';
    localStorage.setItem(this.key, this.token);
  }

  logout() {
    localStorage.setItem(this.key, '');
    this.token = '';
    this.tokenType = '';
    this.expiresIn = 0;
    this.name = '';
    this.userId = 1;
    this.role = 1;
    this.userName = '';
    console.log("logout finished!");
  }

  setName(name: string) {
    this.name = name;
  }

  setUserId(id: number) {
    this.userId = id;
  }

  setRole(role: number) {
    this.role = role;
  }

  setUserName(userName: string) {
    this.userName = userName;
  }
}
export default new UserStore();