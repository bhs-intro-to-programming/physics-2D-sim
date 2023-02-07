//https://stackoverflow.com/questions/4602141/variable-name-as-a-string-in-javascript
const varToString = (varObj) => Object.keys(varObj)[0];

class Menu {
  constructor(options, menuHolder, hidden) {
    this.childs = [];
    this.currentWindows = [];
    this.elArray = [];
    this.options = options;
    this.menuHolder = menuHolder;
    this.headbar, this.window, this.windowObject;
    this.optionsHidden, (this.hidden = hidden);
  }
  #createButton(displayTxt) {
    const div = document.createElement('div');
    div.setAttribute('id', displayTxt);
    div.setAttribute('class', 'menu-option');
    div.append(document.createTextNode(displayTxt));
    this.hidden ? (div.style.visibility = 'hidden') : (div.style.visibility = 'visible');
    div.onmousedown = (e) => {
      this.onClick(div);
      e.stopPropagation();
    };
    div.onmouseup = (e) => {
      this.refresh(div);
      e.stopPropagation();
    };
    div.onmousemove = (e) => {
      this.onHover(div);
      e.stopPropagation();
    };
    div.onmouseleave = (e) => {
      this.refresh(div);
      e.stopPropagation();
    };
    this.elArray.push(div);
    this.headbar.append(div);
  }
  createElements() {
    //create button/option elements as divs
    for (let i = 0; i < this.options.length; i++) {
      this.#createButton(this.options[i].text);
    }
  }
  createHeadbar() {
    this.headbar = document.createElement('div');
    this.headbar.setAttribute('id', 'headbar');
    this.hidden
      ? (this.headbar.style.visibility = 'hidden')
      : (this.headbar.style.visibility = 'visible');
    this.headbar.onclick = (e) => {
      if (e.target === this.headbar && dragDone) {
        this.optionsHidden ? this.showAllEl() : this.hideAllEl();
      }
    };

    const whileDragging = (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX; //this math was sampled from chatgpt drag functions, but I had to
        currentY = e.clientY - initialY; //scrap the rest cause it didnt work with what I wanted to do
        xOffset = currentX;
        yOffset = currentY;
        this.#setTranslate(currentX, currentY, this.headbar);
        dragDone = false;
      } else {
        dragDone = true;
      }
    };
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    let xOffset = 0;
    let yOffset = 0;
    let dragDone = true;

    this.headbar.onmousedown = (e) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      document.onmousemove = whileDragging;
      document.onmouseup = (e) => {
        isDragging = false;
        document.onmousemove = null;
      };
      isDragging = true;
    };
    this.headbar.onmouseup = (e) => {
      isDragging = false;
    };

    this.headbar.onmousemove = whileDragging;
    this.menuHolder.append(this.headbar);
  }
  createWindow(objects, width, height) {
    for (let i = 0; i < objects.length; i++) {
      const div = document.createElement('div');
      div.setAttribute('id', objects[i].name);
      div.setAttribute('class', 'var-display');

      div.append(
        document.createTextNode(objects[i].name + ': ' + JSON.stringify(objects[i].value)),
      );

      this.elArray.push(div);
      this.headbar.append(div);
    }
  }
  updateWindow(objects) {
    const divs = this.headbar.children;
    for (let i = 0; i < divs.length; i++) {
      divs[i].setAttribute('class', 'window');
      const object = objects.find((e) => e.name === divs[i].id);
      const textNode = divs[i].firstChild;
      textNode.nodeValue = object.name + ': ' + JSON.stringify(object.value);
    }
  }
  updateMenu() {
    for (let i = 0; i < this.options.length; i++) {
      try {
        this.elArray[i].firstChild.nodeValue = this.options[i].text;
      } catch {
        this.#createButton(this.options[i].text);
      }
    }
  }
  #setTranslate(xPos, yPos, el) {
    el.style.transform = 'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)';
  }
  hideMenu() {
    this.headbar.style.visibility = 'hidden';
    this.hideAllEl();
  }
  showMenu() {
    this.headbar.style.visibility = 'visible';
    this.showAllEl();
  }
  showAllEl() {
    this.elArray.forEach((e) => (e.style.visibility = 'visible'));
    this.optionsHidden = false;
  }
  hideAllEl() {
    this.elArray.forEach((e) => (e.style.visibility = 'hidden'));
    this.optionsHidden = true;
  }
  onClick(el) {
    el.style.backgroundColor = 'rgb(105, 102, 102)';
    const child = this.childs.find((e) => e.button === el);
    if (child.el.hidden) {
      child.el.showMenu();
      child.el.hidden = false;
    } else {
      child.el.hideMenu();
      child.el.hidden = true;
    }
  }
  onHover(el) {
    el.style.backgroundColor = 'rgb(155, 151, 151)';
  }
  refresh(el) {
    el.style.backgroundColor = 'rgb(200, 192, 192)';
  }
}

const baseMenu = new Menu(
  [
    { text: 'Perfect Shapes' },
    { text: 'Shapes' },
    { text: 'World Settings' },
    { text: 'Debugging' },
  ], //menu text

  document.getElementById('menuHolder'), //
  false, //hidden?
);
baseMenu.createHeadbar();
baseMenu.createElements();
const perfShapesMenu = new Menu(
  [{ text: 'Square' }, { text: 'Circle' }, { text: 'Rect' }, { text: 'Triangle' }], //menu text
  document.getElementById('menuHolder'), //
  true, //hidden?
);

perfShapesMenu.createHeadbar();
perfShapesMenu.createElements();

const shapeMenu = new Menu(
  [], //menu text
  document.getElementById('menuHolder'),
  true, //hidden?
);

shapeMenu.createHeadbar();
shapeMenu.createElements();
baseMenu.childs.push(
  { el: perfShapesMenu, button: baseMenu.elArray.find((e) => e.id === 'Perfect Shapes') },
  { el: shapeMenu, button: baseMenu.elArray.find((e) => e.id === 'Shapes') },
);

export { Menu, shapeMenu };
