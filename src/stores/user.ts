import { makeAutoObservable} from "mobx";

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
        this.token =  localStorage.getItem(this.key) || '';
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