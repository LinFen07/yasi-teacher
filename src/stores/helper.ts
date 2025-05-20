import { makeAutoObservable, reaction} from "mobx";

type noteTextArrType = {
  title: string;
  content: string;
}

class helperStore {

  isNoteView = false;
  noteText: Array<noteTextArrType> = [];

  constructor() {
    makeAutoObservable(this);
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
      isNoteView: this.isNoteView,
      noteText: this.noteText
    };
    localStorage.setItem('helperStore', JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem('helperStore');
    if (data) {
      const parsedData = JSON.parse(data);
      this.isNoteView = parsedData.isNoteView;
      this.noteText = parsedData.noteText || [];
    }
  }

  resetLocalStorage() {
    localStorage.removeItem('userStore');
  }

  changerNoteView = () => {
    this.isNoteView = !this.isNoteView;
  }

  changeNoteText = (title: string, text: string) => {
    const index = this.noteText.findIndex(item => item.title === title);
    if (index !== -1) {
      this.noteText[index].content = text;
    } else {
      this.noteText.push({ title, content: text });
    }
  }
    
}
export default new helperStore();