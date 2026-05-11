// --- 1級邏輯變數 ---
const angles = [30, 45, 60];
const funcs = ['sin', 'cos', 'tan'];
const standardAnswers = {
    'cos0': ['1'], 'sin0': ['0'], 'tan0': ['0'],
    'sin30': ['1/2'], 'sin45': ['1/√2', '√2/2'], 'sin60': ['√3/2'],
    'cos30': ['√3/2'], 'cos45': ['1/√2', '√2/2'], 'cos60': ['1/2'],
    'tan30': ['1/√3', '√3/3'], 'tan45': ['1'], 'tan60': ['√3']
};
const lvlqnum = { '1': '9', '2': '46', '3': '0' };
let temp = get('trig_pool');
if (temp != null && temp.length > 0) {
    /*renderQuestion();
    document.getElementById("btn-lvl"+get('lvl')).classList = "lvlbtn w-full py-3 bg-blue-500 text-white rounded-xl font-bold active:scale-95 transition shadow-md";*/
} else {
    localStorage.setItem('trig_pool', '[]');
}
if (get('wrong_pool') == null) { localStorage.setItem('wrong_pool', '[]'); }
if (get('lvl') == null) { localStorage.setItem('lvl', '1'); }
//init timer
let timerInterval;
let timeLimit = 10;//一題10秒
let ticksPerSec;
let totalTicks; 
let tick;
//document.getElementById("timerBar").classList.add(`duration-${Math.floor(tick)}`);
let remainingTicks = totalTicks; // 剩餘tick

// --- 核心功能：存取 localStorage ---
function get(a) {
    return JSON.parse(localStorage.getItem(a));
}
async function loadLevels() {
    try {
        // 1. 使用 fetch 抓取資料
        const lvlResponse = await fetch("lvltext.json");
        const lvlText = await lvlResponse.json();

        // 這裡先抓取模板（假設你一定要用 JSON 存模板）
        const tempResp = await fetch("templates/lvlElementTemplate.json");
        const normalTemplateArray = await tempResp.json();
        const normalTemplate = normalTemplateArray.join("");

        const dispResp = await fetch("templates/lvlElementTemplateDisabled.json");
        const disabledTemplateArray = await dispResp.json();
        const disabledTemplate = disabledTemplateArray.join("");

        const chooseLvlBox = document.getElementById("chooseLvlBox");
        let toInsert = '<div class="grid grid-cols-6 gap-2 justify-center mx-auto h-full">';

        for (let i = 0; i < lvlText.length; ++i) {
            let currentLvlHtml = ""; // 每次重置

            if (lvlText[i].length > 0) {
                // 替換 ${n} 並建立基礎 HTML
                currentLvlHtml = normalTemplate.replace(/\${n}/g, i + 1);
                currentLvlHtml += "<ul class=\"list-disc ml-4 space-y-1 text-gray-300\">";

                lvlText[i].forEach(str => {
                    currentLvlHtml+="<li>";
                    currentLvlHtml+=str.replaceAll(/M\{(.*)\}/g,"<span class='math-font'>$1</span>")
                    currentLvlHtml+="</li>"
                });
                currentLvlHtml += "</ul></div></div>"; // 關閉 popover 的 div
            } else {
                currentLvlHtml = disabledTemplate;
            }
            toInsert += currentLvlHtml;
        }
        toInsert+="<div class='col-span-3 w-full h-full py-3 bg-white text-gray-400 border border-gray-200 rounded-xl font-bold transition shadow-md'></div>";
        toInsert+="<div class='col-span-3 w-full h-full py-3 bg-white text-gray-400 border border-gray-200 rounded-xl font-bold transition shadow-md'></div>";

        toInsert += "</div>";
        chooseLvlBox.innerHTML = toInsert;

    } catch (error) {
        console.error("載入失敗:", error);
    }
}

// 執行
loadLevels();
// --- 出題邏輯 ---
async function initLevel(lvl) {
    if (get(`trig_pool`).length > 0) {const confirmed = await my_confirm(`確定要開新的${lvl}級練習嗎？進度將會重置。`);if(!confirmed)return;};
    let questionPool = [];
    localStorage.setItem(`wrong_pool`, `[]`);
    const funcs = [`sin`, `cos`, `tan`];
    const allLvlBtn = document.querySelectorAll('.lvlbtn');
    allLvlBtn.forEach(btn=>{
        
        if(btn.innerText == "敬請期待") return;
        let num = btn.id.slice(7);
        let txt = "lvlbtn w-full py-3 bg-white text-gray-400 border border-gray-200 rounded-xl font-bold active:scale-95 transition shadow-md"
        if (num == lvl.toString()){
            txt = "lvlbtn w-full py-3 bg-blue-500 text-white rounded-xl font-bold active:scale-95 transition shadow-md";
        }
        document.getElementById("btn-lvl"+num).classList = txt;
    });
    
    switch (lvl) {
        case 1:
            {
                let angles = [30, 45, 60];
                funcs.forEach(f => {
                    angles.forEach(a => {
                        questionPool.push({ display: `${f}${a}°`, key: `${f}${a}`, answer: standardAnswers[`${f}${a}`] });
                    });
                });
                break;
            }
        case 2:
            {
                let angles = [0, 30, 45, 60];
                funcs.forEach(f => {
                    angles.forEach(a => {
                        //original
                        questionPool.push({ display: `${f}${a}°`, key: `${f}${a}`, answer: standardAnswers[`${f}${a}`] });
                        //push 90
                        switch (f) {
                            case `sin`:
                                questionPool.push({ display: `${f}${a + 90}°`, key: `${f}${a + 90}`, answer: standardAnswers[`cos${a}`] });
                                break;
                            case `cos`:
                                if (a == 0) questionPool.push({ display: `${f}${a + 90}°`, key: `${f}${a + 90}`, answer: [`0`] });
                                else questionPool.push({ display: `${f}${a + 90}°`, key: `${f}${a + 90}`, answer: standardAnswers[`sin${a}`] .map(e => `-` + e)});
                                break;
                            case `tan`:
                                if (a == 0) break;
                                else questionPool.push({ display: `${f}${a + 90}°`, key: `${f}${a + 90}`, answer: standardAnswers[`tan${90-a}`] .map(e => `-` + e)});
                                break;
                        }
                        //push180
                        switch (f) {
                            case `tan`:
                                questionPool.push({ display: `${f}${a + 180}°`, key: `${f}${a + 180}`, answer: standardAnswers[`${f}${a}`] });
                                break;
                            default:
                                questionPool.push({ display: `${f}${a + 180}°`, key: `${f}${a + 180}`, answer: standardAnswers[`${f}${a}`] .map(e => (e === `0` ? `0` : `-` + e))});
                                break;
                        }
                        //push 270
                        switch (f) {
                            case `sin`:
                                questionPool.push({ display: `${f}${a + 270}°`, key: `${f}${a + 270}`, answer: standardAnswers[`cos${a}`].map(e => (e === `0` ? `0` : `-` + e)) });
                                break;
                            case `cos`:
                                questionPool.push({ display: `${f}${a + 270}°`, key: `${f}${a + 270}`, answer: standardAnswers[`sin${a}`] });
                                break;
                            case `tan`:
                                if (a == 0) break;
                                else questionPool.push({ display: `${f}${a + 270}°`, key: `${f}${a + 270}`, answer: standardAnswers[`tan${90-a}`] .map(e => `-` + e)});
                                break;
                        }
                    });
                });
                break;
            }
        default: return;
    }

    shuffle(questionPool);
    localStorage.setItem('lvl',lvl.toString());
    localStorage.setItem('trig_pool', JSON.stringify(questionPool));
    renderQuestion();
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));

        // Swap elements array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function renderQuestion() {
    document.getElementById('resultArea').classList.add('hidden');
    document.getElementById('ansUIBox').classList.remove('hidden');
    document.getElementById('chooseLvlBox').classList.add('hidden');
    document.getElementById('detailImageArea').classList.add("hidden");
    document.getElementById('nextBtn').classList.add("hidden");
    document.getElementById('answerInput').value = "";
    document.getElementById('resultBox').classList.add('hidden');
    let questionPool = get('trig_pool');
    let wrong_pool = get('wrong_pool');
    if (questionPool.length > 0) {
        startTimer();
        document.getElementById('questionTextAdd').classList.add('hidden');
        document.getElementById('answerBox').classList.remove('hidden');
        document.getElementById('keyboard').classList.remove('hidden');
        document.getElementById('progressCounter').innerText = '題目' + (parseInt(lvlqnum[get('lvl')], 10) - questionPool.length + 1).toString() + '/' + lvlqnum[get('lvl')];
        document.getElementById('questionText').innerText = questionPool[0].display;
        document.getElementById('timerContainer').classList.remove('hidden');
    }
    else {
        document.getElementById('questionTextAdd').classList.remove('hidden');
        document.getElementById('keyboard').classList.add('hidden');
        document.getElementById('timerContainer').classList.add('hidden');
        document.getElementById('answerBox').classList.add('hidden');
        if (wrong_pool.length>0){
            document.getElementById('questionTextAdd').innerText = "繼續複習？";
            document.getElementById('questionText').innerText = "⚠️ 還有錯題";
        }else{
            document.getElementById('questionTextAdd').innerText = "全對！💯";
            document.getElementById('questionText').innerText = "🎉 放鞭炮囉！";
        }
    }
}
function checkAnswer() {
    if (get('trig_pool').length = 0) return;
    clearInterval(timerInterval);
    const userInput = document.getElementById('answerInput').value.replaceAll(' ', '');
    const resultArea = document.getElementById('resultArea');
    const resultBox = document.getElementById('resultBox');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    const answerBox = document.getElementById('answerBox');
    resultArea.classList.remove('hidden');
    answerBox.classList.add('hidden');
    resultBox.classList.remove('hidden');
    let questionPool = get('trig_pool');
    let currentQuestion = questionPool[0];
    document.getElementById('keyboard').classList.add('hidden');
    if (currentQuestion.answer.includes(userInput)) {
        // 正確
        resultBox.className = "flex items-center justify-between p-4 bg-green-50 border-green-200 text-green-700 rounded-xl mb-3 border shadow-sm";
        resultIcon.className = "fa-solid fa-circle-check text-green-500 text-xl";
        resultText.innerText = '正確！自動進入下一題';
        questionPool.splice(0, 1);
        localStorage.setItem('trig_pool', JSON.stringify(questionPool));
        setTimeout(renderQuestion, 600);
    } else {
        // 錯誤：移至末尾
        let wrong_pool = get("wrong_pool");
        questionPool.push(currentQuestion);
        questionPool.splice(0, 1)[0]
        if (!wrong_pool.includes(currentQuestion)) wrong_pool.push(currentQuestion);
        let key = currentQuestion.key.slice(-2);
        //localStorage.setItem('key',key);
        if (key == "45") {
            document.getElementById('explanationImg').src = "454590.png";
        } else if (key == "30") {
            document.getElementById('explanationImg').src = "306090.png";
        } else if (key == "60"){
            document.getElementById('explanationImg').src = "603090.png";
        } else {

        }
        localStorage.setItem('wrong_pool', JSON.stringify(wrong_pool));
        localStorage.setItem('trig_pool', JSON.stringify(questionPool));
        resultBox.className = "flex items-center justify-between p-4 bg-red-50 border-red-200 text-red-700 rounded-xl mb-3 border shadow-sm";
        resultIcon.className = "fa-solid fa-circle-xmark text-red-500 text-xl";
        resultText.innerText = `錯誤，正解：${currentQuestion.answer[0]}`;
        document.getElementById('detailImageArea').classList.remove("hidden");
        document.getElementById('nextBtn').classList.remove("hidden");
    }
}

// --- 工具功能 ---
function press(a) {
    const input = document.getElementById('answerInput');
    input.value += a;
}
function backspace() {
    const input = document.getElementById('answerInput');
    const val = input.value;

    if (val) {
        // 刪除游標前的一個字
        input.value = val.slice(0, -1);
    }
}
function mytogglePopover(e, id) { //togglePopover與原生函數撞名
    // 阻止事件冒泡，避免觸發 window 的點擊事件
    e.stopPropagation();
    localStorage.setItem('popppp', '1');
    const targetPopover = document.getElementById(id);
    const allPopovers = document.querySelectorAll('.popover');

    // 關閉所有其他的 popover
    allPopovers.forEach(p => {
        if (p.id !== id) {
            p.classList.remove('show');
            document.getElementById("lvl"+p.id.slice(1)+"info").classList.add("text-gray-300");
            document.getElementById("lvl"+p.id.slice(1)+"info").classList.remove("text-blue-400");
        }else{
            document.getElementById("lvl"+p.id.slice(1)+"info").classList.remove("text-gray-300");
            document.getElementById("lvl"+p.id.slice(1)+"info").classList.add("text-blue-400");
        }
    });

    // 切換當前的 popover
    targetPopover.classList.add('show');
}
//start of timer
function startTimer() {
    ticksPerSec = 100;
    totalTicks = timeLimit*ticksPerSec; // 假設一題 a = 10 秒
    tick = 1000/ticksPerSec;
    remainingTicks = totalTicks;
    updateTimerUI();

    document.getElementById('timerContainer').classList.remove('hidden');

    timerInterval = setInterval(() => {
        remainingTicks--;
        localStorage.setItem("remainingTicks",remainingTicks.toString());
        updateTimerUI();

        if (remainingTicks <= 0) {
            clearInterval(timerInterval);
            onTimeUp(); // 時間到的處理函數
        }
    }, tick);
}

function updateTimerUI() {
    const timerBar = document.getElementById('timerBar');
    const timerText = document.getElementById('timerText');
    
    // 計算圓周長：2 * π * r = 2 * 3.14 * 21.5
    const circumference = 2 * Math.PI * 21.5;
    
    // 計算偏移量 (逆時針倒扣)
    // b/a 弧度對應：offset = circumference * (1 - b/a)
    const offset = circumference * ((remainingTicks / totalTicks));
    
    timerBar.style.strokeDashoffset = offset;
    timerText.innerText = Math.max(0, Math.ceil(remainingTicks/ticksPerSec));
}

function onTimeUp() {
    // 這裡放時間到之後的邏輯，例如自動跳下一題或顯示「時間到」
    const userInput = document.getElementById('answerInput').value.replaceAll(' ', '');
    const resultArea = document.getElementById('resultArea');
    const resultBox = document.getElementById('resultBox');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    const answerBox = document.getElementById('answerBox');
    resultArea.classList.remove('hidden');
    answerBox.classList.add('hidden');
    resultBox.classList.remove('hidden');
    let questionPool = get('trig_pool');
    let currentQuestion = questionPool[0];
    document.getElementById('keyboard').classList.add('hidden');
    // 錯誤：移至末尾
        let wrong_pool = get("wrong_pool");
        questionPool.push(currentQuestion);
        questionPool.splice(0, 1)[0]
        if (!wrong_pool.includes(currentQuestion)) wrong_pool.push(currentQuestion);
        let key = currentQuestion.key.slice(-2);
        //localStorage.setItem('key',key);
        if (key == "45") {
            document.getElementById('explanationImg').src = "454590.png";
        } else if (key == "30") {
            document.getElementById('explanationImg').src = "306090.png";
        } else if (key == "60"){
            document.getElementById('explanationImg').src = "603090.png";
        } else {

        }
        localStorage.setItem('wrong_pool', JSON.stringify(wrong_pool));
        localStorage.setItem('trig_pool', JSON.stringify(questionPool));
        resultBox.className = "flex items-center justify-between p-4 bg-red-50 border-red-200 text-red-700 rounded-xl mb-3 border shadow-sm";
        resultIcon.className = "fa-solid fa-circle-xmark text-red-500 text-xl";
        resultText.innerText = `逾時，正解：${currentQuestion.answer[0]}`;
        document.getElementById('detailImageArea').classList.remove("hidden");
        document.getElementById('nextBtn').classList.remove("hidden");
}
//endoftimer
function my_confirm(str) {
    const modal = document.getElementById('customConfirm');
    const content = document.getElementById('confirmContent');
    const message = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');

    message.innerText = str;

    // 顯示彈窗
    modal.classList.remove('hidden');
    // 小延遲觸發動畫
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);

    return new Promise((resolve) => {
        const handleOk = () => {
            closeModal();
            resolve(true);
        };

        const handleCancel = () => {
            closeModal();
            resolve(false);
        };

        function closeModal() {
            content.classList.replace('scale-100', 'scale-95');
            content.classList.replace('opacity-100', 'opacity-0');
            setTimeout(() => modal.classList.add('hidden'), 200);
            
            // 移除監聽器避免記憶體洩漏
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
        }

        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
    });
}

// 使用範例
async function test() {
    const result = await my_confirm("你確定要刪除這個關卡嗎？");
    if (result) {
        console.log("使用者點了確定");
    } else {
        console.log("使用者點了取消");
    }
}
// 當點擊頁面其他地方時，關閉所有 popover
window.onclick = function () {
    const allPopovers = document.querySelectorAll('.popover');
    allPopovers.forEach(p => {p.classList.remove('show');
            document.getElementById("lvl"+p.id.slice(1)+"info").classList.add("text-gray-300");
            document.getElementById("lvl"+p.id.slice(1)+"info").classList.remove("text-blue-400");});
};

// 支援 Enter 鍵輸入
document.getElementById('answerInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') checkAnswer();
});
function toggleFullScreen() {
    const icon = document.getElementById('fullScreenIcon');
    
    if (!document.fullscreenElement) {
        // 進入全螢幕 (通常讓 document.documentElement 即整個網頁全螢幕)
        document.documentElement.requestFullscreen().then(() => {
            icon.classList.replace('fa-expand', 'fa-compress');
        }).catch(err => {
            alert(`無法切換全螢幕: ${err.message}`);
        });
    } else {
        // 退出全螢幕
        if (document.exitFullscreen) {
            document.exitFullscreen();
            icon.classList.replace('fa-compress', 'fa-expand');
        }
    }
}

// 監聽 ESC 鍵切換回原本圖示
document.addEventListener('fullscreenchange', () => {
    const icon = document.getElementById('fullScreenIcon');
    if (!document.fullscreenElement) {
        icon.classList.replace('fa-compress', 'fa-expand');
    }
});
