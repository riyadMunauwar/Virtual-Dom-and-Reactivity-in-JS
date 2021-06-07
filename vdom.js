// Create Element

function createElement(tagName, { attrs = {}, children = [] } = {}){

    return {
        tagName,
        attrs,
        children
    }
}

// Render Element

function render({ tagName, attrs = {}, children = [] }){
    let element = document.createElement(tagName);
        // insert all children elements
        children.forEach( child =>  {
            if (typeof child === 'string'){
               // if the children is a kind of string create a text Node object
                element.appendChild(document.createTextNode(child));
            }
            else {
                // repeat the process with the children elements
                element.appendChild(render(child));
                }
            });
      // if it has attributes it adds them to the element
    if (Object.keys(attrs).length){
        for (const [key, value] of Object.entries(attrs)) {
            element.setAttribute(key, value);
        }
    }

    return element;
};


// Insert Element

function insertElement(element, domElement){
    domElement.replaceWith(element);
    return element;
}

// Concelation Algorithom

const zip = (xs, ys) => {
  const zipped = [];
  for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
    zipped.push([xs[i], ys[i]]);
  }
  return zipped;
};

const diffAttrs = (oldAttrs, newAttrs) => {
  const patches = [];

  // set new attributes
  for (const [k, v] of Object.entries(newAttrs)) {
    patches.push($node => {
      $node.setAttribute(k, v);
      return $node;
    });
  }

  // remove old attributes
  for (const k in oldAttrs) {
    if (!(k in newAttrs)) {
      patches.push($node => {
        $node.removeAttribute(k);
        return $node;
      });
    }
  }

  return $node => {
    for (const patch of patches) {
      patch($node);
    }
  };
};

const diffChildren = (oldVChildren, newVChildren) => {
  const childPatches = [];
  oldVChildren.forEach((oldVChild, i) => {
    childPatches.push(diff(oldVChild, newVChildren[i]));
  });

  const additionalPatches = [];
  for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
    additionalPatches.push($node => {
      $node.appendChild(render(additionalVChild));
      return $node;
    });
  }

  return $parent => {
    for (const [patch, child] of zip(childPatches, $parent.childNodes)) {
      patch(child);
    }

    for (const patch of additionalPatches) {
      patch($parent);
    }

    return $parent;
  };
};

const diff = (vOldNode, vNewNode) => {
  if (vNewNode === undefined) {
    return $node => {
      $node.remove();
      return undefined;
    };
  }

  if (typeof vOldNode === 'string' || typeof vNewNode === 'string') {
    if (vOldNode !== vNewNode) {
      return $node => {
        const $newNode = render(vNewNode);
        $node.replaceWith($newNode);
        return $newNode;
      };
    } else {
      return $node => undefined;
    }
  }

  if (vOldNode.tagName !== vNewNode.tagName) {
    return $node => {
      const $newNode = render(vNewNode);
      $node.replaceWith($newNode);
      return $newNode;
    };
  }

  const patchAttrs = diffAttrs(vOldNode.attrs, vNewNode.attrs);
  const patchChildren = diffChildren(vOldNode.children, vNewNode.children);

  return $node => {
    patchAttrs($node);
    patchChildren($node);
    return $node;
  };
};


// Main JS

let myElement = createElement('div', {
    attrs: { class: 'container'},
    children: [createElement('img', {
        attrs: { id: 'img', src: 'https://i.picsum.photos/id/1/200/300.jpg' },
        children: []
    })]
})


let element = render(myElement);
let rootElemet = insertElement(element, document.querySelector('#root'));

let count = 0;

setInterval(()=> {
    count += 1;
    let myVirtualElemet = createElement('div', {
        attrs: { class: 'img'},
        children: [createElement('img', {
            attrs: { id: 'img', src: `https://picsum.photos/${count * 1}/${count * 1}` },
            children: []
        })]
    })

    const patch = diff(myElement, myVirtualElemet);

    rootElemet = patch(rootElemet);


    myElement = myVirtualElemet;

}, 1000);
