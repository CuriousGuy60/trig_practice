const editor = document.querySelector('[role="textbox"]');
//const info = document.getElementById("info");
const N = 10000;
let fractionCount = 0;
let textBoxCount = 0;
let sqrtCount = 0;

/*getRangeAt(index): Retrieves the Range object at the specified index.
addRange(range): Adds a Range to the current selection.
removeRange(range): Removes a specific Range from the current selection.
removeAllRanges(): Clears all ranges from the selection.
collapse(node, offset): Collapses the selection to a single point at the specified node and offset.
extend(node, offset): */
function myBackspace(){
    const cursor = document.getElementsByClassName("virtual-cursor")[0];
    const sel = window.getSelection();
    if (sel.isCollapsed){
        let nodeToBeDeleted = cursor.previousSibling;
        if (nodeToBeDeleted === null){
            nodeToBeDeleted = cursor.parentElement;
            if (nodeToBeDeleted.id === "mathInput") return;
            else if (nodeToBeDeleted.getAttribute('data-chain')==="true"){//denominator or numerator
                if (nodeToBeDeleted.previousSibling === null){//numerator
                    nodeToBeDeleted = nodeToBeDeleted.parentElement;//to fraction
                    console.log(`Backspace: data-id=${nodeToBeDeleted.getAttribute('data-id')}`);
                    const nodelist = [];
                    nodeToBeDeleted.childNodes.forEach(a=>{
                        a.childNodes.forEach(b=>{
                            nodelist.push(b);
                        });
                    });
                    nodelist.reverse().forEach(a=>{
                        nodeToBeDeleted.after(a);
                    });
                    nodeToBeDeleted.after(cursor);
                    nodeToBeDeleted.remove();
                }else{//denominator
                    nodeToBeDeleted = nodeToBeDeleted.parentElement;//to fraction
                    console.log(`Backspace: data-id=${nodeToBeDeleted.getAttribute('data-id')}`);
                    const nodelist2 = [];
                    nodeToBeDeleted.childNodes[0].childNodes.forEach(a=>{
                            nodeToBeDeleted.before(a);
                    });
                    nodeToBeDeleted.childNodes[1].childNodes.forEach(a=>{
                            nodelist2.push(a);
                    });
                    nodelist2.reverse().forEach(a=>{
                        nodeToBeDeleted.after(a);
                    });
                    nodeToBeDeleted.after(cursor);
                    nodeToBeDeleted.remove();

                }
                
            }else if (nodeToBeDeleted.classList.contains('sqrt')){
                console.log('Backspace:sqrt');
                nodeToBeDeleted= nodeToBeDeleted.parentElement.parentElement;
                nodeToBeDeleted.before(cursor);
                nodeToBeDeleted.remove();
            }else{
                nodeToBeDeleted.before(cursor);
                nodeToBeDeleted.remove();
            }
            
        }else{
            nodeToBeDeleted.remove();
        }
    }else{
        sel.getRangeAt(0).deleteContents();
    }
    
    const ansinput = document.getElementById("answerInput");
    console.log("meBack");
    if (editor.childNodes.length === 2 && editor.firstChild === cursor){
        console.log("enter if");
        ansinput.innerText = "請用下方鍵盤輸入答案";
    ansinput.classList.add("text-gray-400");
    ansinput.classList.remove("text-white");
    }
    hightlightBox();
    
}
function myArrowLeft(){
    const cursor = document.getElementsByClassName("virtual-cursor")[0];
    let prev = cursor.previousElementSibling;
    if (prev === null){
        prev = cursor.parentElement;
        if(prev.id==="mathInput") {}
        else if (prev.getAttribute('data-chain')==="true"){//either denominator or numerator
            if (prev.previousElementSibling === null){prev = prev.parentElement;prev.before(cursor);}//numerator
            else {prev = prev.previousElementSibling; prev.appendChild(cursor);}//denominator
        }else if (prev.getAttribute('data-id').startsWith("sqrt-")){
                prev.parentElement.parentElement.before(cursor);
            }
    }else{
        const prevId = prev.getAttribute('data-id');
        if (prev.className === "digit"){//digit node
            prev.before(cursor);
        }else if (prevId.startsWith('textbox-')){
            if (prev.getAttribute('data-chain')==="true"){//either denominator or numerator
                if (prev.previousElementSibling === null){prev.parentElement.before(cursor);}//numerator
                else {prev = prev.previousElementSibling; prev.appendChild(cursor);}//denominator
            }
            prev.before(cursor);
            

        }else if (prevId.startsWith('fraction-')){//fraction
            if(prev.lastChild.firstChild === null){
                prev.lastChild.appendChild(cursor);

            }else{
                prev.lastChild.lastChild.after(cursor);
            }
        }else if (prevId.startsWith("sqrtbx-")){
            console.log('entered sqrt');
            prev.lastChild.lastChild.appendChild(cursor);
        }
    }
    hightlightBox();
}
function myArrowRight(){
    const cursor = document.getElementsByClassName("virtual-cursor")[0];
    let nxt = cursor.nextElementSibling;
    if (nxt === null){
        nxt = cursor.parentElement;
        if(nxt.id==="mathInput") {}
        else if (nxt.getAttribute('data-chain')==="true"){//either denominator or numerator
            if (nxt.nextElementSibling === null){nxt = nxt.parentElement;nxt.after(cursor);}//denominator
            else {nxt = nxt.nextElementSibling; if(nxt.firstChild === null){nxt.appendChild(cursor);}else{nxt.firstChild.before(cursor);}}//numerator
        }else if(nxt.getAttribute('data-id').startsWith('sqrt')){
            nxt=nxt.parentElement.parentElement;
            nxt.after(cursor);
        }
    }else{
        const nxtId = nxt.getAttribute('data-id');
        for (let i=0;i<N;++i){
            if (nxt.className === "digit"){//digit node
                nxt.after(cursor);
                
            }else if (nxtId.startsWith('textbox-')){
                if (nxt.getAttribute('data-chain')==="true"){//either denominator or numerator
                    if (nxt.nextElementSibling === null){nxt.parentElement.appendChild(cursor);}//numerator
                    else {nxt = nxt.nextElementSibling; nxt.appendChild(cursor);}//denominator
                }
                nxt.before(cursor);
                

            }else if (nxtId.startsWith('fraction-')){//fraction
                if(nxt.firstChild.firstChild === null){
                    nxt.firstChild.appendChild(cursor);
                }else{
                    nxt.firstChild.firstChild.before(cursor);
                }
            }else if (nxtId.startsWith("sqrtbx-")){
                if(nxt.lastChild.firstChild === null){
                    nxt.lastChild.appendChild(cursor);
                    
                }else{
                    nxt.lastChild.firstChild.firstChild.before(cursor);
                    
                }
            }
        }
    }
    hightlightBox();    
}
function addFraction(){
    const cursor = document.getElementsByClassName("virtual-cursor")[0];
    const fraction = document.createElement('span');
    fraction.setAttribute('data-id',`fraction-${fractionCount++}`);
    fraction.className = "fraction";
    const bx1 = document.createElement('span');
    bx1.setAttribute('data-id',`textbox-${textBoxCount++}`);
    bx1.setAttribute('data-chain','true');
    bx1.setAttribute('onclick','cursorIn(this)');
    bx1.className = "textbox";
    const bx2 = document.createElement('span');
    bx2.setAttribute('data-id',`textbox-${textBoxCount++}`);
    bx2.setAttribute('data-chain','true');
    bx2.setAttribute('onclick','cursorIn(this)');
    bx2.classList = "textbox den";
    fraction.append(bx1,bx2);
    const bef = cursor.previousElementSibling;
    console.log(`bef: ${bef}  ${bef.className}`);
    cursor.after(fraction);
    if (bef === null) {
        console.log('befnull!');
        bx1.append(cursor);
    }else if (bef.className === 'digit'){
        const tmplist = [bef];
        let tmp = bef.previousElementSibling;
        while (tmp !== null && tmp.className === 'digit'){
            tmplist.push(tmp);
            tmp=tmp.previousElementSibling;
        }
        tmplist.reverse().forEach(a=>{bx1.append(a);});
        bx2.append(cursor);
    }else{
        bx1.append(bef);
        bx2.append(cursor);
    }
    hightlightBox();
}
function addSqrt(){
    const cursor = document.getElementsByClassName("virtual-cursor")[0];
    const sqrtbx = document.createElement('span');
    sqrtbx.setAttribute('data-id',`sqrtbx-${sqrtCount++}`);
    sqrtbx.setAttribute('style','white-space:nowrap;display: inline-flex;');
    const sqrt = document.createElement('span');
    sqrt.setAttribute('data-id',`sqrt-${sqrtCount}`);
    sqrt.setAttribute('onclick','cursorIn(this)');
    sqrt.className = "sqrt";
    const sqrtout = document.createElement('span');
    sqrtout.setAttribute('data-id',`sqrt-${sqrtCount}`);
    sqrtout.className = "sqrtout";
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList = "sqrtpic";
    svg.setAttribute("width","0.8em");
    svg.setAttribute("height","1.2em");
    svg.setAttribute('viewBox','0 0 100 100');
    svg.setAttribute('preserveAspectRatio','none');
    svg.setAttribute('data-id','sqpic');
    svg.setAttribute('style','vertical-align: middle; overflow:visible;');
    svg.innerHTML=`<polyline points="10,50 30,45 45,90 95,0"  fill="none" stroke="black" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />`;
    sqrtout.appendChild(sqrt);
    sqrtbx.append(svg,sqrtout);
    cursor.after(sqrtbx);
    sqrt.appendChild(cursor);
    hightlightBox();
}
function cursorIn(a){
    const cursor = document.getElementsByClassName("virtual-cursor")[0];
    if (a.firstChild === null){
        a.appendChild(cursor);
    }
    hightlightBox();
}

editor.addEventListener('mouseup',()=>{
    const cursor = document.getElementsByClassName("virtual-cursor")[0];
    console.log("mousup");
    const sel = window.getSelection();
    const target = sel.anchorNode.parentElement;
    if (sel.isCollapsed && editor.contains(sel.anchorNode)) {
        if (target.classList.contains('sqrtout')){
            target.parentElement.after(cursor);
        }else if (target.classList.contains('sqrt')){
            target.appendChild(cursor);
        }
        else if (target.id!=="mathInput" && target.id!=="answerInput"){
            console.log(`cursor, data-id=${target.getAttribute('data-id')}, class=${target.classList}`)
            target.after(cursor);
        }
    }
    hightlightBox();
});
function clearEditor(){
    const cursor = document.getElementsByClassName("virtual-cursor")[0];
    const ansinput = document.getElementById("answerInput");
    editor.after(cursor);
    editor.after(ansinput);
    editor.innerHTML="";
    editor.append(cursor,ansinput);
    ansinput.innerText = "請用下方鍵盤輸入答案";
    ansinput.classList.add("text-gray-400");
    ansinput.classList.remove("text-white");
}
function hightlightBox(){
    const cursor = document.getElementsByClassName("virtual-cursor")[0];
    const rmvlist = document.querySelectorAll(".contain_cursor");
    let rmv = null;
    if (rmvlist.length === 0) rmv = null;
    else rmv = rmvlist[0];
    console.log(`rmv: ${JSON.stringify(rmv)}`)
    if (rmv !== null) rmv.classList.remove("contain_cursor");
    if(cursor.parentElement.id === 'mathInput') return;
    const id = cursor.parentElement.getAttribute('data-id')
    if (id.startsWith('textbox-')){
        cursor.parentElement.classList.add("contain_cursor");
    }else if (id.startsWith('sqrt-')){
        cursor.parentElement.classList.add("contain_cursor");
    }
}